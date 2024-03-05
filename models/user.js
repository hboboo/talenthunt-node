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
  collectId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  age: String,
  gender: String,
  expectation: String,
  advantage: String,
  work: String,
  project: String,
  school: String,
  resumes: [{
    type: mongoose.Schema.Types.ObjectId
  }]
})

module.exports = mongoose.model('User', schema)