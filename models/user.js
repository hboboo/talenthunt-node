const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
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
  }
})

module.exports = mongoose.model('User', schema)