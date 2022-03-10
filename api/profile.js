const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');
const Profile = require('../models/ProfileModel');
const Post = require('../models/PostModel');
const User = require('../models/UserModel');
const Follower = require('../models/FollowerModel');
const {
  newFollowerNotification,
  removeFollowerNotification,
} = require('../utilsServer/notificationActions');

const router = express.Router();

// GET USER PROFILE
router.get('/:username', authMiddleware, async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(404).send('User not found');
    const profile = await Profile.findOne({ user: user._id }).populate('user');
    if (!profile) return res.status(404).send('Profile not found');
    const followStats = await Follower.findOne({ user: user._id });
    if (!followStats)
      return res.status(401).send('Could not load Follow stats');

    return res.status(200).json({
      profile,
      followers: followStats.followers,
      following: followStats.following,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server Error');
  }
});

// GET USER POSTS
router.get('/:username/posts', authMiddleware, async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(404).send('User not found');
    const posts = await Post.find({ user: user._id })
      .populate('user')
      .populate('comments.user')
      .sort({ createdAt: -1 });

    if (!posts || posts.length === 0)
      return res.status(404).send('Nothing Posted yet!');
    return res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;

// GET FOLLOWERS
router.get('/followers/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await Follower.findOne({ user: userId })
      .populate('user')
      .populate('followers.user');
    if (!user) return res.status(404).send('Could not load Followers');
    return res.status(200).json(user.followers);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server Error');
  }
});

// GET FOLLOWING
router.get('/following/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await Follower.findOne({ user: userId })
      .populate('user')
      .populate('following.user');
    if (!user) return res.status(404).send('Could not load Following');
    console.log(user);
    return res.status(200).json(user.following);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server Error');
  }
});

// Follow A User
router.post('/follow/:userToFollowId/', authMiddleware, async (req, res) => {
  const { userToFollowId } = req.params;
  const { userId } = req;
  console.log(userToFollowId, userId);
  try {
    const user = await Follower.findOne({ user: userId });
    const userToFollow = await Follower.findOne({ user: userToFollowId });
    if (!user || !userToFollow) return res.status(404).send('User not found');
    const isFollowing =
      user.following.length > 0 &&
      user.following
        .map((following) => following.user.toString())
        .indexOf(userToFollowId) > -1;
    if (isFollowing) return res.status(401).send('User already followed');

    await user.following.unshift({ user: userToFollowId });
    await user.save();
    await userToFollow.followers.unshift({ user: userId });
    await userToFollow.save();

    await newFollowerNotification(userId, userToFollowId);

    return res.status(200).send('Follow success');
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server Error');
  }
});

// UnFollow A User
router.post(
  '/unfollow/:userToUnfollowId/',
  authMiddleware,
  async (req, res) => {
    const { userToUnfollowId } = req.params;
    const { userId } = req;
    console.log(userToUnfollowId, userId);
    try {
      const user = await Follower.findOne({ user: userId });
      const userToUnfollow = await Follower.findOne({ user: userToUnfollowId });
      if (!user || !userToUnfollow)
        return res.status(404).send('User not found');

      const followingIdx = user.following
        .map((following) => following.user.toString())
        .indexOf(userToUnfollowId);

      const followerIdx = userToUnfollow.followers
        .map((follower) => follower.user.toString())
        .indexOf(userId);

      if (followingIdx < 0 || followerIdx < 0)
        return res.status(401).send('User not followed before');

      await user.following.splice(followingIdx, 1);
      await user.save();
      await userToUnfollow.followers.splice(followerIdx, 1);
      await userToUnfollow.save();

      await removeFollowerNotification(userId, userToUnfollowId);

      return res.status(200).send('Unfollow success');
    } catch (err) {
      console.log(err);
      return res.status(500).send('Server Error');
    }
  }
);

// UPDATE USER PROFILE
router.post('/update', authMiddleware, async (req, res) => {
  const { userId } = req;
  const { bio, facebook, twitter, instagram, youtube, profilePicUrl } =
    req.body;
  try {
    if (profilePicUrl) {
      const user = await User.findOne({ _id: userId });
      if (!user) return res.status(404).send('User not found');
      user.profilePicUrl = profilePicUrl;
      user.save();
      return res.status(201).send('Profile Pic Updated');
    }
    let profileFields = {};
    profileFields.user = userId;
    profileFields.bio = bio;
    profileFields.social = {};
    if (facebook) profileFields.social.facebook = facebook;
    if (youtube) profileFields.social.youtube = youtube;
    if (instagram) profileFields.social.instagram = instagram;
    if (twitter) profileFields.social.twitter = twitter;
    const profile = await Profile.findOneAndUpdate(
      {
        user: userId,
      },
      { $set: profileFields },
      { new: true }
    );
    if (!profile) return res.status(404).send('User profile not available');
    return res.status(201).send('Profile updated successfully');
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server Error');
  }
});

// UPDATE USER PASSWORD
router.post('/settings/password', authMiddleware, async (req, res) => {
  const { userId } = req;
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).send('User not found');

    const isPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isPassword) return res.status(403).send('Password is invalid');

    if (newPassword.trim().length < 6)
      return res
        .status(403)
        .send('Password must be at least 6 characters long');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return res.status(201).send('password updated');
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server Error');
  }
});

// UPDATE MESSAGE POPUP SETTINGS
router.post('/settings/messagePopup', authMiddleware, async (req, res) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');
    if (user.newMessagePopup) {
      user.newMessagePopup = false;
    } else {
      user.newMessagePopup = true;
    }
    await user.save();
    return res.status(201).send('messagePopup updated');
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server Error');
  }
});
