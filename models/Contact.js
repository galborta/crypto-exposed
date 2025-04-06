// Contact model
// This is a placeholder for future database integration

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['contact', 'suggestion'],
        required: true
    },
    name: {
        type: String,
        required: function() { return this.type === 'contact'; }
    },
    contact: {
        type: String,
        required: function() { return this.type === 'contact'; }
    },
    subject: String,
    message: {
        type: String,
        required: function() { return this.type === 'contact'; }
    },
    // Fields specific to entry submissions
    suggestionSubject: {
        type: String,
        required: function() { return this.type === 'suggestion'; }
    },
    suggestionTwitter: String,
    suggestionWallets: String,
    suggestionMessage: String,
    attachments: [{
        filename: String,
        originalname: String,
        path: String,
        mimetype: String,
        size: Number
    }],
    status: {
        type: String,
        enum: ['new', 'in-review', 'approved', 'rejected'],
        default: 'new'
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add text indexes for search functionality
contactSchema.index({
    name: 'text',
    contact: 'text',
    subject: 'text',
    message: 'text',
    suggestionSubject: 'text',
    suggestionTwitter: 'text',
    suggestionWallets: 'text',
    suggestionMessage: 'text'
});

module.exports = mongoose.model('Contact', contactSchema); 