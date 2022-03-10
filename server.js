const express = require('express');
const app = express();
const server = require('http').Server(app);
const { Server } = require('socket.io');
const io = new Server(server);
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
require('dotenv').config({ path: './config.env' });

const connectDB = require('./utilsServer/connectDB');

connectDB();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const {
  addUser,
  removeUser,
  findConnectedUser,
} = require('./utilsServer/roomActions');
const {
  loadMessages,
  sendMessage,
  setMsgToUnread,
  deleteMsg,
  deleteChat,
} = require('./utilsServer/messagesActions');

const { likeUnlikePost } = require('./utilsServer/postActions');

io.on('connection', (socket) => {
  socket.on('join', ({ userId }) => {
    const users = addUser(userId, socket.id);
    console.log(users);
    setInterval(() => {
      socket.emit('connectedUsers', {
        users: users.filter((user) => user.userId !== userId),
      });
    }, 10000);
  });

  socket.on('loadMessages', async ({ userId, messagesWith }) => {
    const { chat, error } = await loadMessages(userId, messagesWith);
    !error
      ? socket.emit('messagesLoaded', { chat })
      : socket.emit('noChatFound');
  });

  socket.on('sendNewMsg', async ({ senderId, receiverId, msg }) => {
    const { newMsg, error } = await sendMessage(senderId, receiverId, msg);
    const receiverSocket = findConnectedUser(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket.socketId).emit('newMsgReceived', { newMsg });
    } else {
      await setMsgToUnread(receiverId);
    }
    !error ? socket.emit('msgSent', { newMsg }) : socket.emit('error');
  });

  socket.on('deleteMsg', async ({ userId, messagesWith, messageId }) => {
    const { success, error } = await deleteMsg(userId, messagesWith, messageId);
    if (success) socket.emit('msgDeleted');
  });

  socket.on('deleteChat', async ({ userId, messagesWith }) => {
    const { success, error } = await deleteChat(userId, messagesWith);
    if (success) socket.emit('chatDeleted');
  });

  socket.on(
    'sendMsgFromNotification',
    async ({ senderId, receiverId, msg }) => {
      const { newMsg, error } = await sendMessage(senderId, receiverId, msg);
      const receiverSocket = findConnectedUser(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket.socketId).emit('newMsgReceived', { newMsg });
      } else {
        await setMsgToUnread(receiverId);
      }
      !error
        ? socket.emit('msgSentFromNotification', { newMsg })
        : socket.emit('error');
    }
  );

  socket.on('likePost', async ({ postId, userId, isLiked }) => {
    const action = isLiked ? 'unlike' : 'like';
    const { success, error, name, username, profilePicUrl, userToNotifyId } =
      await likeUnlikePost(postId, userId, action);
    if (success) socket.emit('postLiked');
    if (userToNotifyId !== userId) {
      const receiverSocket = findConnectedUser(userToNotifyId);
      if (receiverSocket && action === 'like') {
        io.to(receiverSocket.socketId).emit('newNotificationReceived', {
          name,
          profilePicUrl,
          username,
          postId,
        });
      }
    }
  });

  // CLOSE CONNECTION
  socket.on('close', () => {
    removeUser(socket.id);
    console.log('disconnected');
  });
});

nextApp.prepare().then(() => {
  app.use('/api/signup', require('./api/signup'));
  app.use('/api/auth', require('./api/auth'));
  app.use('/api/search', require('./api/search'));
  app.use('/api/posts', require('./api/posts'));
  app.use('/api/profile', require('./api/profile'));
  app.use('/api/notifications', require('./api/notifications'));
  app.use('/api/chats', require('./api/chats'));
  app.use('/api/reset', require('./api/reset'));

  app.all('*', (req, res) => handle(req, res));

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log('Express server running');
  });
});
