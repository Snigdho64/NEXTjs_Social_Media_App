const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Notification = require('../models/NotificationModel');
const User = require('../models/UserModel');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const { userId } = req;
  try {
    const user = await Notification.findOne({ user: userId })
      .populate('notifications.user')
      .populate('notifications.post');

    if (!user) return res.status(401).send('User notifications not found');
    return res.status(200).json(user.notifications);
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);

    if (!user) return res.status(401).send('User  not found');

    if (user.unreadNotification) {
      user.unreadNotification = false;
      await user.save();
    }
    return res.status(200).json('Unread notifications set to false');
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
