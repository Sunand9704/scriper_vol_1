const dbStore = require('../storage/dbStore');

const userController = {
  // Get list of all users/employees
  async getUsers(req, res) {
    try {
      const users = await dbStore.getUsers();
      return res.json({ success: true, count: users.length, data: users });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Create new user / employee
  async createUser(req, res) {
    try {
      const { name, email, role = 'EMPLOYEE', avatar } = req.body;
      if (!name || !email) {
        return res.status(400).json({ success: false, error: 'Both "name" and "email" are required.' });
      }

      const newUser = await dbStore.createUser({ name, email, role, avatar });
      return res.json({ success: true, message: 'User created successfully', data: newUser });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = userController;
