const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  sender: String,
  receiver: String,
  time: {
    type: Date,
    default: Date.now,
  },
  content: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});


module.exports =  mongoose.model('Chat', schema);