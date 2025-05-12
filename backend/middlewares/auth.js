const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.cookies.token;
  logger.info(`Auth middleware: Token received: ${token ? 'present' : 'missing'}`);

  if (!token) {
    logger.warn('Auth failed: No token provided');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info(`Token verified for user: ${decoded.username}`);
    req.user = decoded;
    return next();
  } catch (err) {
    logger.error(`Token verification failed: ${err.message}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = auth;