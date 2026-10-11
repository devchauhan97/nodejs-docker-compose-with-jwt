const jwt = require('jsonwebtoken');
const authenticateToken = (req, res, next) => {
    const authorization = req.headers.authorization;
    const headerToken = authorization && authorization.startsWith('Bearer ')
        ? authorization.slice(7)
        : null;
    const cookieToken = req.headers.cookie
        ?.split(';')
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith('access_token='))
        ?.slice('access_token='.length);
    const token = headerToken || cookieToken;

    if (!token) {
        return res.status(401).json({ error: 'Access token is required' });
    }

    jwt.verify(token, 'secretkey', (error, user) => {
        if (error) {
            return res.status(401).json({ 
                error: 'Invalid or expired access token',
                token: token 
            });
        }

        req.user = user;
        next();
    });
};

module.exports = authenticateToken;