// Contact form controller

// Handle contact form submission
exports.submitContactForm = (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validate input
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }
        
        // Here we would typically save to database or send email
        console.log('Form submission:', { name, email, subject, message });
        
        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Form submitted successfully!'
        });
    } catch (error) {
        console.error('Error in contact form submission:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request'
        });
    }
}; 