const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  // sender: {
  //   type: mongoose.Schema.Types.ObjectId, // 参考用户模型
  //   ref: 'User', // 关联到用户模型
  //   required: true,
  // },
  // receiver: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true,
  // },
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