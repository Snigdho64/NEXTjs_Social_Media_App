const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const isEmail = require('validator/lib/isEmail');
const User = require('../models/UserModel');
const authMiddleware = require('../middleware/authMiddleware');
const Follower = require('../models/FollowerModel');
const Notification = require('../models/NotificationModel');
const Chat = require('../models/ChatModel');

router.get('/', authMiddleware, async (req, res) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    const userFollowStats = await Follower.findOne({ user: userId });

    return res.status(200).json({ user, userFollowStats });
  } catch (error) {
    return res.status(500).send('Server Error');
  }
});

router.post('/', async (req, res) => {
  const { email, password } = req.body.user;

  if (!isEmail(email)) return res.status(401).send('Invalid email');

  if (password.length < 6) {
    return res.status(401).send('Passwords must be atleast 6 characters long');
  }
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) return res.status(401).send('User does not exists');
    const pwdMatched = await bcrypt.compare(password, user.password);

    if (!pwdMatched) return res.status(401).send('Invalid Password');

    const chats = await Chat.findOne({
      user: user._id,
    });

    if (!chats) {
      await new Chat({ user: user._id, chats: [] }).save();
    }

    const payload = { userId: user._id };
    jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).send(token);
      }
    );
  } catch (e) {
    console.log(e);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
