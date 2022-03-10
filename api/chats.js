const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Chat = require('../models/ChatModel');
const User = require('../models/UserModel');

// Get All Chats
router.get('/', authMiddleware, async (req, res) => {
  const { userId } = req;
  try {
    const userChats = await Chat.findOne({ user: userId }).populate(
      'chats.messagesWith'
    );
    let chatsToBeSent = [];
    if (userChats?.chats?.length > 0) {
      chatsToBeSent = userChats.chats.map((chat) => ({
        messagesWith: chat.messagesWith._id,
        name: chat.messagesWith.name,
        profilePicUrl: chat.messagesWith.profilePicUrl,
        lastMsg: chat.messages[chat.messages.length - 1].msg,
        date: chat.messages[chat.messages.length - 1].date,
      }));
    }
    return res.status(200).json(chatsToBeSent);
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
});

router.post('/user/:chatUserId', async (req, res) => {
  try {
    const { chatUserId } = req.params;
    const chatUser = await User.findById(chatUserId);
    if (!chatUser) return res.status(401).send('No user found');
    return { name: chatUser.name, profilePicUrl: chatUser.profilePicUrl };
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
