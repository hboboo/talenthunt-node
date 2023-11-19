const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  account: {
    type: String,
    required: true
  },
  password: {
    type: String,
    require: true
  },
  role: {
    type: String,
    enum: ['recruiter', 'jobSeeker'],
    required: true
  },
  username: {
    type: String,
    required: true
  },
  userLogo: String,
})

module.exports = mongoose.model('User', schema)