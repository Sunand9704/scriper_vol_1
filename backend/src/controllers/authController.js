const jwt = require('jsonwebtoken');
const dbStore = require('../storage/dbStore');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const authController = {
  // Register user
  async register(req, res) {
    try {
      const { name, email, password, role = 'EMPLOYEE' } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
      }

      const newUser = await dbStore.registerUser({ name, email, password, role });

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.userId, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password: _, ...userPayload } = newUser;

      return res.json({
        success: true,
        message: 'Account registered successfully!',
        data: {
          token,
          user: userPayload
        }
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  },

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Please provide both email and password.' });
      }

      const user = await dbStore.authenticateUser(email, password);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.userId, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Logged in successfully!',
        data: {
          token,
          user
        }
      });
    } catch (error) {
      return res.status(401).json({ success: false, error: error.message });
    }
  },

  // Get current logged-in user details
  async getMe(req, res) {
    try {
      return res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = authController;
