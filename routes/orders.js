const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const CartItem = require('../models/CartItem');
const Gem = require('../models/Gem');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, [
    body('items')
        .isArray({ min: 1 })
        .withMessage('At least one item is required'),
    body('items.*.gemId')
        .isMongoId()
        .withMessage('Valid gem ID is required'),
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
    body('items.*.price')
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('shippingAddress.firstName')
        .trim()
        .isLength({ min: 1 })
        .withMessage('First name is required'),
    body('shippingAddress.lastName')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Last name is required'),
    body('shippingAddress.email')
        .isEmail()
        .withMessage('Valid email is required'),
    body('shippingAddress.phone')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Phone number is required'),
    body('shippingAddress.address')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Address is required'),
    body('shippingAddress.city')
        .trim()
        .isLength({ min: 1 })
        .withMessage('City is required'),
    body('shippingAddress.state')
        .trim()
        .isLength({ min: 1 })
        .withMessage('State is required'),
    body('shippingAddress.pincode')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Pincode is required'),
    body('paymentMethod')
        .isIn(['cod', 'online', 'card', 'upi'])
        .withMessage('Valid payment method is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { items, shippingAddress, paymentMethod, orderNotes } = req.body;
        const userId = req.user._id;

        // Validate all gems exist and are available
        const gemIds = items.map(item => item.gemId);
        const gems = await Gem.find({ _id: { $in: gemIds } });

        if (gems.length !== items.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more gems not found'
            });
        }

        // Check stock availability
        for (const item of items) {
            const gem = gems.find(g => g._id.toString() === item.gemId);
            if (!gem.availability || gem.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${gem.name}`
                });
            }
        }

        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create order
        const order = new Order({
            userId,
            total,
            shippingAddress,
            paymentMethod,
            orderNotes
        });

        await order.save();

        // Create order items
        const orderItems = items.map(item => ({
            orderId: order._id,
            gemId: item.gemId,
            quantity: item.quantity,
            price: item.price
        }));

        await OrderItem.insertMany(orderItems);

        // Update gem stock
        for (const item of items) {
            await Gem.findByIdAndUpdate(
                item.gemId,
                { $inc: { stock: -item.quantity } }
            );
        }

        // Clear user's cart
        await CartItem.deleteMany({ userId });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                orderId: order.orderId,
                status: order.status,
                total: order.total,
                createdAt: order.createdAt
            }
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during order creation'
        });
    }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, status } = req.query;

        // Build filter
        const filter = { userId };
        if (status) filter.status = status;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const orders = await Order.find(filter)
            .populate({
                path: 'items',
                populate: {
                    path: 'gemId',
                    select: 'name price images'
                }
            })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // Get total count
        const totalItems = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalItems / parseInt(limit));

        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const orderItems = await OrderItem.find({ orderId: order._id })
                    .populate('gemId', 'name price images');

                return {
                    id: order._id,
                    orderId: order.orderId,
                    status: order.status,
                    total: order.total,
                    items: orderItems,
                    shippingAddress: order.shippingAddress,
                    createdAt: order.createdAt
                };
            })
        );

        res.json({
            success: true,
            data: {
                orders: ordersWithItems,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during orders retrieval'
        });
    }
});

// @route   GET /api/orders/:orderId
// @desc    Get order by ID
// @access  Private
router.get('/:orderId', protect, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ orderId, userId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const orderItems = await OrderItem.find({ orderId: order._id })
            .populate('gemId', 'name price images description');

        res.json({
            success: true,
            data: {
                id: order._id,
                orderId: order.orderId,
                status: order.status,
                total: order.total,
                items: orderItems,
                shippingAddress: order.shippingAddress,
                paymentMethod: order.paymentMethod,
                trackingNumber: order.trackingNumber,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during order retrieval'
        });
    }
});

// @route   PUT /api/orders/:orderId/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:orderId/cancel', protect, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ orderId, userId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Order is already cancelled'
            });
        }

        if (['shipped', 'delivered'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel order that has been shipped or delivered'
            });
        }

        // Update order status
        order.status = 'cancelled';
        await order.save();

        // Restore stock
        const orderItems = await OrderItem.find({ orderId: order._id });

        for (const item of orderItems) {
            await Gem.findByIdAndUpdate(
                item.gemId,
                { $inc: { stock: item.quantity } }
            );
        }

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });

    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during order cancellation'
        });
    }
});

module.exports = router;
