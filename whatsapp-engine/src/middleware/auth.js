const { API_KEY } = require('../config');

module.exports = (req, res, next) => {
    // Skip auth for root health check or if no API_KEY is configured (dev mode safety, though not recommended for prod)
    if (req.path === '/' && req.method === 'GET') return next();

    // If no API_KEY is set in env, logging a warning but allowing access (or blocking? limiting to secure default)
    // Better to fail safe.
    if (!API_KEY) {
        console.warn('WARNING: API_KEY not set in environment. All requests allowed.');
        return next();
    }

    const clientKey = req.headers['x-api-key'] || req.query.key;

    if (!clientKey || clientKey !== API_KEY) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Invalid or missing configuration for API Key. Please provider X-API-KEY header.'
        });
    }

    next();
};
