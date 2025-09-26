const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    total: {
        type: Number,
        required: true,
        min: [0, 'Total cannot be negative']
    },
    shippingAddress: {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        pincode: {
            type: String,
            required: true,
            trim: true
        }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cod', 'online', 'card', 'upi']
    },
    orderNotes: {
        type: String,
        trim: true
    },
    trackingNumber: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Generate order ID before saving
orderSchema.pre('save', function (next) {
    if (!this.orderId) {
        this.orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
