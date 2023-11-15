const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  title: String,
  is_full_time: Boolean,
  salary: String,
  company_name: String,
  company_capital: String,
  region: String,
  place: String,
  hot: Boolean
})

module.exports = mongoose.model('Recruitment',schema)

