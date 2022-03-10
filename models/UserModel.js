const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    username: { type: String, required: true, unique: true, trim: true },
    profilePicUrl: { type: String },
    newMessagePopup: { type: Boolean, default: true },
    unreadMessage: { type: Boolean, default: false },
    unreadNotification: { type: Boolean, default: false },
    role: { type: String, default: 'user', enum: ['root', 'user'] },
    resetToken: { type: String },
    expireToken: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

module.exports = User;
