const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { isAuthenticated } = require('../middleware/auth');

// Get submission statistics
router.get('/submissions/stats', isAuthenticated, async (req, res) => {
    try {
        const newSubmissions = await Contact.countDocuments({ status: 'new' });
        res.json({ newSubmissions });
    } catch (error) {
        console.error('Error fetching submission stats:', error);
        res.status(500).json({ error: 'Failed to fetch submission statistics' });
    }
});

// List all submissions with pagination and filtering
router.get('/submissions', isAuthenticated, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const type = req.query.type; // 'contact' or 'suggestion'
        const status = req.query.status;
        const search = req.query.search;

        const query = {};
        if (type) query.type = type;
        if (status) query.status = status;
        if (search) {
            query.$text = { $search: search };
        }

        const [submissions, total] = await Promise.all([
            Contact.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Contact.countDocuments(query)
        ]);

        res.render('admin/submissions', {
            submissions,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            type,
            status,
            search
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

// Get single submission details
router.get('/submissions/:id', isAuthenticated, async (req, res) => {
    try {
        const submission = await Contact.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        res.render('admin/submission-detail', { submission });
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
});

// Update submission status
router.put('/submissions/:id/status', isAuthenticated, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['new', 'in-review', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const submission = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        res.json({ message: 'Status updated successfully', submission });
    } catch (error) {
        console.error('Error updating submission status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Delete submission
router.delete('/submissions/:id', isAuthenticated, async (req, res) => {
    try {
        const submission = await Contact.findByIdAndDelete(req.params.id);
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        res.json({ message: 'Submission deleted successfully' });
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({ error: 'Failed to delete submission' });
    }
});

module.exports = router; 