const mongoose = require('mongoose')

const shema = new mongoose.Schema({
  jobname: String,
  salary: {
    type: String,
    enum: ['3k以下','3-5k','5-10k','10-20k','20k以上']
  },
  hot: Boolean,
  is_full_time: Boolean,
  city: String,
  district: String,
  short_company_name: String,
  job_tag: [String],
  job_responsibility: [String],
  job_require: [String],
  job_experience: {
    type: String,
    enum: ['在校生','应届生','1年以内','1-3年','3-5年','5-10年','10年以上']
  },
  job_education: {
    type: String,
    enum: ['初中以下', '中专', '高中', '大专', '本科', '硕士', '博士']
  },
  recruiter: String,
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

module.exports = mongoose.model('Job', shema)