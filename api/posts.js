const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/UserModel');
const Post = require('../models/PostModel');
const uuid = require('uuid').v4;
const Follower = require('../models/FollowerModel');
const {
  newLikeNotification,
  removeLikeNotification,
  newCommentNotification,
  removeCommentNotification,
} = require('../utilsServer/notificationActions');

// Create a Post
router.post('/', authMiddleware, async (req, res) => {
  const { text, location, picUrl } = req.body;
  const userId = req.userId;
  const post = new Post({ user: userId, text });
  if (location) post.location = location;
  if (picUrl) post.picUrl = picUrl;
  try {
    const savedPost = await post.save();
    const createdPost = await Post.findById(savedPost._id).populate('user');
    console.log(createdPost);
    return res.status(200).json(createdPost);
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
});

// Get All Posts
router.get('/', authMiddleware, async (req, res) => {
  const { userId } = req;
  const pageNumber = +req.query?.pageNumber || 1;
  const size = 8;
  try {
    const userFollowStats = await Follower.findOne({ user: userId });
    let posts;
    if (!userFollowStats) return res.status(401).send('Could not find User');
    const skips = size * (pageNumber - 1);
    if (userFollowStats.following.length > 0) {
      posts = await Post.find({
        user: {
          $in: [
            userFollowStats.user,
            ...userFollowStats.following.map((f) => f.user),
          ],
        },
      })
        .skip(skips)
        .limit(size)
        .sort({ createdAt: -1 })
        .populate('user')
        .populate('comments.user');
    } else {
      posts = await Post.find({ user: userFollowStats.user })
        .skip(skips)
        .limit(size)
        .sort({ createdAt: -1 })
        .populate('user')
        .populate('comments.user');
    }

    if (!posts || posts.length === 0) return res.status(200).send([]);
    return res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
});

//Get a Post
router.get('/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId)
      .populate('user')
      .populate('comments.user');
    if (!post) return res.send('Post not found');
    return res.status(200).json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
});

// Delete a Post
router.delete('/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = req;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.send('Post not found');
    const user = await User.findById(userId);
    if (post.user.toString() !== user._id.toString()) {
      if (user.role === 'root') {
        await post.remove();
        return res.status(200).send('Post deleted');
      }
      return res.status(200).send('Not Authorized');
    }
    await post.remove();
    return res.status(200).send('Post deleted');
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
});

// Like a Post
router.post('/like/:postId', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);

    if (!post) return res.send('Post not found');
    const isLiked =
      post.likes.filter((like) => like.user.toString() === userId).length > 0;

    if (isLiked) {
      return res.status(401).send('Post Already Liked');
    }

    post.likes.unshift({ user: userId });
    await post.save();

    if (post.user.toString() !== userId) {
      await newLikeNotification(userId, postId, post.user.toString());
    }

    return res.status(200).send('Post Liked');
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
});

// Unlike a Post
router.put('/unlike/:postId', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.send('Post not found');
    const { likes } = post;
    const isLiked =
      likes.filter((like) => like.user.toString() === userId).length > 0;
    if (!isLiked) {
      return res.status(401).send('Post Not Liked before');
    }
    const index = likes.map((like) => like.user.toString()).indexOf(userId);

    likes.splice(index, 1);

    post.likes = likes;

    await post.save();

    if (post.user.toString() !== userId) {
      await removeLikeNotification(userId, postId, post.user.toString());
    }

    return res.status(200).send('Post Unliked');
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
});

// Get All Likes
router.get('/like/:postId', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId).populate('likes.user');
    if (!post) return res.send('Post not found');
    return res.status(200).json(post.likes);
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
});

// Add a Comment
router.post('/comment/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = req;
  const { text } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.send('Post not found');
    const comment = {
      _id: uuid(),
      text: text,
      user: userId,
      date: Date.now(),
    };

    await post.comments.unshift(comment);
    await post.save();

    if (post.user.toString() !== userId) {
      await newCommentNotification(
        userId,
        postId,
        comment._id,
        text,
        post.user._id.toString()
      );
    }

    return res.status(200).json(comment._id);
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
});

// Delete a Comment
router.delete(
  '/comment/:postId/:commentId',
  authMiddleware,
  async (req, res) => {
    const { postId, commentId } = req.params;
    const { userId } = req;
    try {
      const post = await Post.findById(postId);
      if (!post) return res.send('Post not found');

      const comment = post.comments.find((c) => c._id === commentId);

      if (!comment) return res.status(404).send('Comment not found');

      const user = await User.findById(userId);

      const deleteComment = async () => {
        const index = post.comments.map((c) => c._id).indexOf(commentId);
        await post.comments.splice(index, 1);
        await post.save();
        return res.status(200).send('Comment deleted');
      };

      if (comment.user.toString() !== user._id.toString()) {
        if (user.role === 'root') {
          await deleteComment();
        }
        return res.status(404).send('Unauthorized');
      }

      await deleteComment();
      if (post.user.toString() !== userId) {
        await removeCommentNotification(
          userId,
          postId,
          comment._id,
          post.user._id.toString()
        );
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
