const express = require('express');
const { body, validationResult } = require('express-validator');
const Gem = require('../models/Gem');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/gems
// @desc    Add a new gem
// @access  Private
router.post('/', protect, [
    body('name')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Name is required and must be less than 255 characters'),
    body('category')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Category is required and must be less than 100 characters'),
    body('price')
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('sizeWeight')
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Size/Weight must be a positive number'),
    body('sizeUnit')
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Size unit is required and must be less than 20 characters'),
    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),
    body('discount')
        .optional()
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Discount must be a non-negative number'),
    body('discountType')
        .optional()
        .isIn(['percentage', 'fixed'])
        .withMessage('Discount type must be either percentage or fixed')
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

        const gemData = req.body;

        // Combine all images
        if (gemData.images && gemData.uploadedImages) {
            gemData.allImages = [...gemData.images, ...gemData.uploadedImages];
        }

        const gem = new Gem(gemData);
        await gem.save();

        res.status(201).json({
            success: true,
            message: 'Gem added successfully',
            data: {
                id: gem._id,
                name: gem.name,
                createdAt: gem.createdAt
            }
        });

    } catch (error) {
        console.error('Add gem error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gem creation'
        });
    }
});

// @route   GET /api/gems
// @desc    Get all gems with optional filtering
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            minPrice,
            maxPrice,
            zodiac,
            availability
        } = req.query;

        // Build filter object
        const filter = {};

        if (category) filter.category = category;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        if (zodiac) filter.whomToUse = { $in: [zodiac] };
        if (availability !== undefined) filter.availability = availability === 'true';

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get gems with pagination
        const gems = await Gem.find(filter)
            .select('-description -benefits -whomToUse -certification -origin')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // Get total count for pagination
        const totalItems = await Gem.countDocuments(filter);
        const totalPages = Math.ceil(totalItems / parseInt(limit));

        res.json({
            success: true,
            data: {
                gems,
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
        console.error('Get gems error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gems retrieval'
        });
    }
});

// @route   GET /api/gems/:id
// @desc    Get gem by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const gem = await Gem.findById(req.params.id);

        if (!gem) {
            return res.status(404).json({
                success: false,
                message: 'Gem not found'
            });
        }

        res.json({
            success: true,
            data: gem
        });

    } catch (error) {
        console.error('Get gem error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gem retrieval'
        });
    }
});

// @route   PUT /api/gems/:id
// @desc    Update gem
// @access  Private
router.put('/:id', protect, [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Name must be less than 255 characters'),
    body('price')
        .optional()
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer')
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

        const gem = await Gem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!gem) {
            return res.status(404).json({
                success: false,
                message: 'Gem not found'
            });
        }

        res.json({
            success: true,
            message: 'Gem updated successfully',
            data: {
                id: gem._id,
                updatedAt: gem.updatedAt
            }
        });

    } catch (error) {
        console.error('Update gem error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gem update'
        });
    }
});

// @route   DELETE /api/gems/:id
// @desc    Delete gem
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const gem = await Gem.findByIdAndDelete(req.params.id);

        if (!gem) {
            return res.status(404).json({
                success: false,
                message: 'Gem not found'
            });
        }

        res.json({
            success: true,
            message: 'Gem deleted successfully'
        });

    } catch (error) {
        console.error('Delete gem error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gem deletion'
        });
    }
});

// @route   POST /api/gems/search
// @desc    Search gems with advanced filters
// @access  Public
router.post('/search', async (req, res) => {
    try {
        const {
            query,
            category,
            minPrice,
            maxPrice,
            zodiac,
            benefits,
            availability,
            page = 1,
            limit = 10
        } = req.body;

        // Build filter object
        const filter = {};

        if (query) {
            filter.$text = { $search: query };
        }
        if (category) filter.category = category;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        if (zodiac) filter.whomToUse = { $in: [zodiac] };
        if (benefits && benefits.length > 0) {
            filter.benefits = { $in: benefits };
        }
        if (availability !== undefined) filter.availability = availability;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get gems with pagination
        const gems = await Gem.find(filter)
            .select('-description -benefits -whomToUse -certification -origin')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // Get total count for pagination
        const totalItems = await Gem.countDocuments(filter);
        const totalPages = Math.ceil(totalItems / parseInt(limit));

        res.json({
            success: true,
            data: {
                gems,
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
        console.error('Search gems error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gems search'
        });
    }
});

// @route   GET /api/gems/categories
// @desc    Get all gem categories
// @access  Public
router.get('/categories', async (req, res) => {
    try {
        const categories = await Gem.distinct('category');

        res.json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during categories retrieval'
        });
    }
});

// @route   GET /api/gems/category/:category
// @desc    Get gems by category
// @access  Public
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const gems = await Gem.find({ category })
            .select('-description -benefits -whomToUse -certification -origin')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const totalItems = await Gem.countDocuments({ category });
        const totalPages = Math.ceil(totalItems / parseInt(limit));

        res.json({
            success: true,
            data: {
                gems,
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
        console.error('Get gems by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gems retrieval'
        });
    }
});

// @route   GET /api/gems/zodiac/:zodiacSign
// @desc    Get gems by zodiac sign
// @access  Public
router.get('/zodiac/:zodiacSign', async (req, res) => {
    try {
        const { zodiacSign } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const gems = await Gem.find({ whomToUse: { $in: [zodiacSign] } })
            .select('-description -benefits -whomToUse -certification -origin')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const totalItems = await Gem.countDocuments({ whomToUse: { $in: [zodiacSign] } });
        const totalPages = Math.ceil(totalItems / parseInt(limit));

        res.json({
            success: true,
            data: {
                gems,
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
        console.error('Get gems by zodiac error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gems retrieval'
        });
    }
});

module.exports = router;
