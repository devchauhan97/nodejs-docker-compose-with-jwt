const User = require("../../models/user");
const bcrypt = require("bcrypt")  
const utf8 = require('utf8');
module.exports = {
  getUser: async (req, res, next) => {
    console.log("Fetching all users");
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      next(error);
    }

  },
  getUserById: async (req, res, next) => {
    try {
      const userId = req.params.id;
      // if user urd 5 and 6 keep delay of 10 seconds for userId 5 and 6
      if (userId === '5' || userId === '6') {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Delay for 10 seconds
      }
      const user = await User.findByPk(userId);
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      next(error);
    }

  },
  createUser: async (req, res, next) => {
    try {
      const { username, password } = req.body;
      console.log(username, password);
      const existingUser = await User.findOne({ where: { user_name: username } });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      // Encode a string to UTF-8
      const encodedString = utf8.encode(password);
      const hashedPassword = await bcrypt.hash(encodedString, 10);
      const user = await User.create({ user_name: username, password: hashedPassword });
      res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
      console.error(error);
      next(error);
    }

  },
  
};