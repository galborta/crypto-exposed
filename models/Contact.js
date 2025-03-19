// Contact model
// This is a placeholder for future database integration

class Contact {
    constructor(name, email, subject, message) {
        this.name = name;
        this.email = email;
        this.subject = subject;
        this.message = message;
        this.createdAt = new Date();
    }

    // Example method: validate contact data
    validate() {
        return !!(this.name && this.email && this.subject && this.message);
    }

    // Example method: convert to JSON
    toJSON() {
        return {
            name: this.name,
            email: this.email,
            subject: this.subject,
            message: this.message,
            createdAt: this.createdAt
        };
    }
}

module.exports = Contact; 