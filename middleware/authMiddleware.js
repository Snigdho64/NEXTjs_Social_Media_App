const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send('Unauthorized');
    }
    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET_KEY
    );
    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).send('Unauthorized');
  }
};

module.exports = authMiddleware;
