const express = require('express');
const router = express.Router();
const cookie = require('js-cookie');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/UserModel');

router.get('/:searchText', authMiddleware, async (req, res) => {
  try {
    const { searchText } = req.params;
    const { userId } = req;

    if (searchText.trim().length === 0) {
      return;
    }
    const results = await User.find({
      name: { $regex: searchText, $options: 'i' },
    });

    if (!results) {
      return res.status(401).send('No User Found');
    }

    const resultsToBeSent =
      results.length > 0 &&
      results.filter((result) => result._id.toString() !== userId);

    return res.status(200).json(resultsToBeSent);
  } catch (e) {
    console.error(e);
    return res.status(500).send('server Error');
  }
});

module.exports = router;
