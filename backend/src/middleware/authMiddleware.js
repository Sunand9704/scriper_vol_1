const jwt = require('jsonwebtoken');
const dbStore = require('../storage/dbStore');

const JWT_SECRET = process.env.JWT_SECRET || 'scriper_secret_jwt_key_2026';

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Access denied. Authorization token required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await dbStore.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Authentication failed: ' + error.message });
  }
}

module.exports = {
  authMiddleware,
  JWT_SECRET
};
