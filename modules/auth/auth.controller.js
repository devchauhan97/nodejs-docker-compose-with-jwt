
const jwt = require('jsonwebtoken');
module.exports = {
  auth: async (req, res, next) => {
    try {
      const { user_name, password } = req.body;
      const user = await User.findOne({ where: { user_name } });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.json({ token });
    } catch (error) {
      next(error);
    }
  },
};