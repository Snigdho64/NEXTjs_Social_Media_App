const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log('Mongodb connected');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
module.exports = connectDB;
