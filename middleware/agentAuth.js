const keys = require('../config/keys');

const agentAuth = (req, res, next) => {
    const apiKey = req.header('X-API-Key');

    if (!apiKey || apiKey !== keys.AGENT_API_KEY) {
        return res.status(401).json({
            error: 'Unauthorized - Invalid API Key'
        });
    }

    next();
};

module.exports = agentAuth; 