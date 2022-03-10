const express = require('express');
const router = express.Router();
const baseUrl = require('../utils/baseUrl');
const isEmail = require('validator/lib/isEmail');
const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../utilsServer/sendEmail');

router.post('/', async (req, res) => {
  const { email } = req.body;
  try {
    if (!isEmail(email)) return res.status(401).send('email not valid');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).send('User Does Not Exist');

    const token = crypto.randomBytes(32).toString('hex');

    user.resetToken = token;
    user.expireToken = Date.now() + 3600000;

    await user.save();

    const { data, success, error } = await sendEmail(
      user,
      `${baseUrl}/reset/${token}`
    );
    if (error) return res.status(401).send('Failed to send email');
    console.log(data);
    if (success && data) return res.status(201).send('Email sent successfully');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
});

router.post('/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({ resetToken: token });
    if (!user) return res.status(404).send('Unauthorized');
    if (user.expireToken < Date.now())
      return res.status(401).send('Token expired');
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(201).send('Password reset successful');
  } catch (e) {}
});

module.exports = router;
