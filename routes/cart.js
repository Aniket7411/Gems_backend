const express = require('express');
const { body, validationResult } = require('express-validator');
const CartItem = require('../models/CartItem');
const Gem = require('../models/Gem');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', protect, [
    body('gemId')
        .isMongoId()
        .withMessage('Valid gem ID is required'),
    body('quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1')
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

        const { gemId, quantity } = req.body;
        const userId = req.user._id;

        // Check if gem exists
        const gem = await Gem.findById(gemId);
        if (!gem) {
            return res.status(404).json({
                success: false,
                message: 'Gem not found'
            });
        }

        // Check if gem is available
        if (!gem.availability || gem.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Gem is not available or insufficient stock'
            });
        }

        // Check if item already exists in cart
        let cartItem = await CartItem.findOne({ userId, gemId });

        if (cartItem) {
            // Update quantity
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            // Create new cart item
            cartItem = new CartItem({
                userId,
                gemId,
                quantity
            });
            await cartItem.save();
        }

        res.status(201).json({
            success: true,
            message: 'Item added to cart',
            data: {
                cartItem: {
                    id: cartItem._id,
                    gemId: cartItem.gemId,
                    quantity: cartItem.quantity,
                    addedAt: cartItem.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during adding to cart'
        });
    }
});

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        const cartItems = await CartItem.find({ userId })
            .populate('gemId', 'name price images discount discountType')
            .sort({ createdAt: -1 });

        // Calculate total and item count
        let total = 0;
        let itemCount = 0;

        const items = cartItems.map(item => {
            const gem = item.gemId;
            let itemPrice = gem.price;

            // Apply discount
            if (gem.discount > 0) {
                if (gem.discountType === 'percentage') {
                    itemPrice = itemPrice * (1 - gem.discount / 100);
                } else {
                    itemPrice = itemPrice - gem.discount;
                }
            }

            const itemTotal = itemPrice * item.quantity;
            total += itemTotal;
            itemCount += item.quantity;

            return {
                id: item._id,
                gem: {
                    id: gem._id,
                    name: gem.name,
                    price: gem.price,
                    discount: gem.discount,
                    discountType: gem.discountType,
                    images: gem.images
                },
                quantity: item.quantity,
                addedAt: item.createdAt
            };
        });

        res.json({
            success: true,
            data: {
                items,
                total: Math.round(total * 100) / 100, // Round to 2 decimal places
                itemCount
            }
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during cart retrieval'
        });
    }
});

// @route   PUT /api/cart/update/:gemId
// @desc    Update cart item quantity
// @access  Private
router.put('/update/:gemId', protect, [
    body('quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1')
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

        const { gemId } = req.params;
        const { quantity } = req.body;
        const userId = req.user._id;

        // Check if gem exists
        const gem = await Gem.findById(gemId);
        if (!gem) {
            return res.status(404).json({
                success: false,
                message: 'Gem not found'
            });
        }

        // Check stock availability
        if (!gem.availability || gem.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock available'
            });
        }

        const cartItem = await CartItem.findOneAndUpdate(
            { userId, gemId },
            { quantity },
            { new: true }
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        res.json({
            success: true,
            message: 'Cart item updated'
        });

    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during cart update'
        });
    }
});

// @route   DELETE /api/cart/remove/:gemId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:gemId', protect, async (req, res) => {
    try {
        const { gemId } = req.params;
        const userId = req.user._id;

        const cartItem = await CartItem.findOneAndDelete({ userId, gemId });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        res.json({
            success: true,
            message: 'Item removed from cart'
        });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during cart item removal'
        });
    }
});

// @route   DELETE /api/cart/clear
// @desc    Clear all items from cart
// @access  Private
router.delete('/clear', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        await CartItem.deleteMany({ userId });

        res.json({
            success: true,
            message: 'Cart cleared'
        });

    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during cart clearing'
        });
    }
});

module.exports = router;
