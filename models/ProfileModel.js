const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    bio: { type: String, required: true },
    social: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      youtube: { type: String },
    },
  },
  { timestamps: true }
);

const Profile =
  mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

module.exports = Profile;
