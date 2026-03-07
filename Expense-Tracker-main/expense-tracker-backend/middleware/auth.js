const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const header = req.header('Authorization') || '';
  const token = header.replace(/Bearer\s?/i, '');
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const payload = jwt.verify(token, 'secretkey');
    // payload should contain the user id under `id` or `userId`
    req.userId = payload.id || payload.userId;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};