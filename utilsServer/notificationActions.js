const Notification = require('../models/NotificationModel');
const User = require('../models/UserModel');

const setNotificationToUnread = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user.unreadNotification) {
      user.unreadNotification = true;
      await user.save();
    }
    return;
  } catch (error) {
    console.error(error);
  }
};

const newLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    const userToNotify = await Notification.findOne({ user: userToNotifyId });
    const newNotification = {
      type: 'newLike',
      user: userId,
      post: postId,
      date: Date.now(),
    };
    await userToNotify.notifications.unshift(newNotification);
    await userToNotify.save();
    await setNotificationToUnread(userToNotifyId);
    return;
  } catch (error) {
    console.error(error);
  }
};

const removeLikeNotification = async (userId, postId, userToNotifyId) => {
  const userToNotify = await Notification.findOne({ user: userToNotifyId });
  const notificationIdx = userToNotify.notifications.findIndex(
    (notification, idx) => {
      notification.type === 'newLike' &&
        notification.post.toString() === postId &&
        notification.user.toString() === userId;
    }
  );
  await userToNotify.notifications.splice(notificationIdx, 1);
  await userToNotify.save();
};

const newCommentNotification = async (
  userId,
  postId,
  commentId,
  text,
  userToNotifyId
) => {
  try {
    const userToNotify = await Notification.findOne({ user: userToNotifyId });
    const newNotification = {
      type: 'newComment',
      user: userId,
      post: postId,
      commentId,
      text,
      date: Date.now(),
    };
    await userToNotify.notifications.unshift(newNotification);
    await userToNotify.save();
    await setNotificationToUnread(userToNotifyId);
    return;
  } catch (error) {
    console.error(error);
  }
};

const removeCommentNotification = async (
  userId,
  postId,
  commentId,
  userToNotifyId
) => {
  try {
    const userToNotify = await Notification.findOne({ user: userToNotifyId });

    const notificcationIdx = userToNotify.notifications.findIndex(
      (notification) =>
        notification.type === 'newComment' &&
        notification.user.toString() === userId &&
        notification.commentId === commentId &&
        notification.post.toString() === postId
    );

    await userToNotify.notifications.splice(notificcationIdx, 1);
    await userToNotify.save();
    return;
  } catch (error) {
    console.error(error);
  }
};

const newFollowerNotification = async (userId, userToNotifyId) => {
  try {
    const userToNotify = await Notification.findOne({ user: userToNotifyId });
    const newNotification = {
      type: 'newFollower',
      user: userId,
      date: Date.now(),
    };
    await userToNotify.notifications.unshift(newNotification);
    await userToNotify.save();
    await setNotificationToUnread(userToNotifyId);
    return;
  } catch (error) {
    console.error(error);
  }
};

const removeFollowerNotification = async (userId, userToNotifyId) => {
  try {
    const userToNotify = await Notification.findOne({ user: userToNotifyId });
    const notificationIdx = userToNotify.notifications.findIndex(
      (notification) =>
        notification.type === 'newFollower' &&
        notification.user.toString() === userId
    );
    await userToNotify.notifications.splice(notificationIdx, 1);
    await userToNotify.save();
    return;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  newLikeNotification,
  removeLikeNotification,
  newCommentNotification,
  removeCommentNotification,
  newFollowerNotification,
  removeFollowerNotification,
};
