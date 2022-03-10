const Post = require('../models/PostModel');
const User = require('../models/UserModel');
const { newLikeNotification } = require('./notificationActions');

const likeUnlikePost = async (postId, userId, action) => {
  try {
    const user = await User.findById(userId);
    const post = await Post.findById(postId);
    if (!user || !post) return { error: 'User/Post not found' };
    console.log(post.likes);
    const isLiked = post.likes.some((like) => like.user.toString() === userId);

    switch (action) {
      default:
      case 'like': {
        if (isLiked) {
          throw new Error('Post already Liked');
        } else {
          await post.likes.unshift({ user: user._id });
        }
        if (post.user !== user._id) {
          await newLikeNotification(userId, postId, post.user.toString());
        }
        break;
      }
      case 'unlike': {
        if (!isLiked) {
          throw new Error('Post not liked before');
        } else {
          await post.likes.filter((like) => like.user === user._id);
        }
        break;
      }
    }
    await post.save();

    const { name, profilePicUrl, username } = user;
    return {
      success: true,
      name,
      profilePicUrl,
      username,
      userToNotifyId: post.user.toString(),
    };
  } catch (error) {
    console.log(error);
    return { error: error?.message || 'Server Error' };
  }
};

module.exports = { likeUnlikePost };
