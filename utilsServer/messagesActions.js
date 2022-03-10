const Chat = require('../models/ChatModel');
const User = require('../models/UserModel');

const loadMessages = async (userId, messagesWith) => {
  try {
    const userChats = await Chat.findOne({ user: userId }).populate(
      'chats.messagesWith'
    );
    const chat = userChats.chats.find(
      (chat) => chat.messagesWith._id.toString() === messagesWith
    );
    if (!chat) {
      return { error: 'No Chats found' };
    }
    return { chat };
  } catch (error) {
    return { error };
  }
};

const sendMessage = async (senderId, receiverId, msg) => {
  const updateChatModel = async (modelToUpdate, modelWithChat, newMsg) => {
    const previousChatIdx = modelToUpdate.chats.findIndex(
      (chat) => chat.messagesWith.toString() === modelWithChat.user.toString()
    );
    if (previousChatIdx === -1) {
      const newChat = {
        messagesWith: modelWithChat.user,
        messages: [newMsg],
      };
      await modelToUpdate.chats.unshift(newChat);
      await modelToUpdate.save();
      console.log('new Chat created')
    } else {
      await modelToUpdate.chats[previousChatIdx].messages.push(newMsg);
      await modelToUpdate.save();
      console.log('Chat updated');
    }
  };

  try {
    const sender = await Chat.findOne({ user: senderId });
    const receiver = await Chat.findOne({ user: receiverId });

    const newMsg = {
      sender: senderId,
      receiver: receiverId,
      msg,
      date: Date.now(),
    };
    await updateChatModel(sender, receiver, newMsg);
    await updateChatModel(receiver, sender, newMsg);
    return { newMsg };
  } catch (error) {
    return { error };
  }
};

const setMsgToUnread = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user.unreadMessage) {
      user.unreadMessage = true;
      await user.save();
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteMsg = async (userId, messagesWith, messageId) => {
  try {
    const userChat = await Chat.findOne({ user: userId });
    const chatIdx = userChat.chats.findIndex(
      (chat) => chat.messagesWith.toString() === messagesWith
    );
    if (chatIdx === -1) return console.log('Chat not found');
    const chat = userChat.chats[chatIdx];
    const msgToDelete = chat.messages.find(
      (msg) => msg._id.toString() === messageId
    );
    if (!msgToDelete) return console.log('Message not found');
    if (msgToDelete.sender.toString() !== userId)
      return console.log('Delete not authorized');

    const msgIdx = chat.messages.findIndex((msg) => msg._id === messageId);

    await userChat.chats[chatIdx].messages.splice(msgIdx, 1);
    await userChat.save();
    console.log('Message deleted ');
    return { success: true };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const deleteChat = async (userId, messagesWith) => {
  try {
    const userChat = await Chat.findOne({ user: userId });
    const chatIdx = userChat.chats.findIndex(
      (chat) => chat.messagesWith.toString() === messagesWith
    );
    if (chatIdx === -1) return console.log('Chat not found');
    await userChat.chats.splice(chatIdx, 1);
    await userChat.save();
    console.log('Chat deleted');
    return { success: true };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

module.exports = {
  loadMessages,
  sendMessage,
  setMsgToUnread,
  deleteMsg,
  deleteChat,
};
