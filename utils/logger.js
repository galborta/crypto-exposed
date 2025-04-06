const DEBUG = process.env.DEBUG === 'true';

// Colors for console output
const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warn: '\x1b[33m',    // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
};

// List of paths to ignore in logs
const ignorePaths = [
    '/.identity',
    '/favicon.ico'
];

// List of messages to ignore
const ignoreMessages = [
    '[CSRF]',
    'Skipping CSRF'
];

const logger = {
    info: (message) => {
        if (shouldLog(message)) {
            console.log(`${colors.info}[INFO]${colors.reset} ${message}`);
        }
    },

    success: (message) => {
        if (shouldLog(message)) {
            console.log(`${colors.success}[SUCCESS]${colors.reset} ${message}`);
        }
    },

    warn: (message) => {
        if (shouldLog(message)) {
            console.log(`${colors.warn}[WARNING]${colors.reset} ${message}`);
        }
    },

    error: (message) => {
        // Always log errors
        console.error(`${colors.error}[ERROR]${colors.reset} ${message}`);
    },

    request: (req) => {
        if (shouldLogRequest(req)) {
            console.log(`${colors.info}[REQUEST]${colors.reset} ${req.method} ${req.originalUrl}`);
        }
    },

    debug: (message) => {
        if (DEBUG && shouldLog(message)) {
            console.log(`${colors.info}[DEBUG]${colors.reset} ${message}`);
        }
    }
};

function shouldLog(message) {
    if (!message) return false;
    return !ignoreMessages.some(ignore => message.includes(ignore));
}

function shouldLogRequest(req) {
    if (!req || !req.originalUrl) return false;
    return !ignorePaths.some(path => req.originalUrl.includes(path));
}

module.exports = logger; 
 
 
 
 
 
 
 