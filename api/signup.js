const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/UserModel');
const { validateUsername } = require('../utils/inputValidators');
const isEmail = require('validator/lib/isEmail');
const Profile = require('../models/ProfileModel');
const Follower = require('../models/FollowerModel');
const Notification = require('../models/NotificationModel');
const Chat = require('../models/ChatModel');

const userPng =
  'https://res.cloudinary.com/indersingh/image/upload/v1593464618/App/user_mklcpl.png';

router.get('/:username', async (req, res) => {
  const { username } = req.params;
  try {
    if (username.length < 1) return res.status(401).send('Invalid');
    if (!validateUsername(username)) return res.status(401).send('Invalid');
    const user = await User.findOne({ username: username.toLowerCase() });

    if (user) return res.status(401).send('Username already taken');

    return res.status(200).send('Available');
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

router.post('/', async (req, res) => {
  const {
    name,
    email,
    username,
    password,
    bio,
    facebook,
    twitter,
    instagram,
    youtube,
  } = req.body.user;

  if (!isEmail(email)) return res.status(401).send('Invalid email');

  if (password.length < 6) {
    return res.status(401).send('Passwords must be atleast 6 characters long');
  }
  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(200).send('User already exists');
    const user = new User({
      name,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
      profilePicUrl: req.body.profilePicUrl || userPng,
    });
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    const userProfile = {};
    userProfile.user = user._id;
    userProfile.bio = bio;

    userProfile.social = {};
    if (facebook) userProfile.social.facebook = facebook;
    if (twitter) userProfile.social.twitter = twitter;
    if (instagram) userProfile.social.instagram = instagram;
    if (youtube) userProfile.social.youtube = youtube;

    await new Profile(userProfile).save();
    await new Follower({ user: user._id, followers: [], following: [] }).save();
    await new Notification({ user: user._id, notifications: [] }).save();
    await new Chat({ user: user._id, chats: [] }).save();
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
