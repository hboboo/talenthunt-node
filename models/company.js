const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  companyName: String,
  financing: {
    type: String,
    enum: ['未融资','天使轮','A轮','B轮','C轮','上市']
  },
  scale_company: {
    type: String,
    enum: ['0-20人','20-99人','100-499人','500-999人','1000人以上']
  },
  industry: {
    type: String,
    enum: ['互联网', '金融', '教育', '医疗', '电商', '制造业', '媒体', '房地产']
  },
  workingHours: {
    type: {
      start: String, 
      end: String
    }
  },
  rest_weekend: {
    type: String,
    enum: ['双休','单休','大小周']
  },
  overtime: {
    type: String,
    enum: ['不加班','偶尔加班','经常加班']
  },
  company_address: String,
  company_introduction: String
})

module.exports = mongoose.model('Company', schema)