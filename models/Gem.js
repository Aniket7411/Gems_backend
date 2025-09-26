const mongoose = require('mongoose');

const gemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Gem name is required'],
        trim: true,
        maxlength: [255, 'Name cannot be more than 255 characters']
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        maxlength: [100, 'Category cannot be more than 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative']
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    sizeWeight: {
        type: Number,
        required: [true, 'Size/Weight is required'],
        min: [0, 'Size/Weight cannot be negative']
    },
    sizeUnit: {
        type: String,
        required: [true, 'Size unit is required'],
        trim: true,
        maxlength: [20, 'Size unit cannot be more than 20 characters']
    },
    images: {
        type: [String],
        default: []
    },
    uploadedImages: {
        type: [String],
        default: []
    },
    allImages: {
        type: [String],
        default: []
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    availability: {
        type: Boolean,
        default: true
    },
    certification: {
        type: String,
        trim: true,
        maxlength: [255, 'Certification cannot be more than 255 characters']
    },
    origin: {
        type: String,
        trim: true,
        maxlength: [255, 'Origin cannot be more than 255 characters']
    },
    whomToUse: {
        type: [String],
        default: []
    },
    benefits: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

// Index for better search performance
gemSchema.index({ name: 'text', description: 'text', category: 'text' });
gemSchema.index({ category: 1 });
gemSchema.index({ price: 1 });
gemSchema.index({ availability: 1 });

module.exports = mongoose.model('Gem', gemSchema);
