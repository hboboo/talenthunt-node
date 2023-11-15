const express = require('express')
const router = express.Router()
const Recruitment = require('../models/recruitment')
const recruitmentData = require('../initial/job')

//根路径外面注册为job
router.get("/", async function(req, res) {
  await Recruitment.insertMany(recruitmentData)
  res.send('成功')
})

router.get('/find', async function(req, res) {
  const isFullTime =  req.query.is_full_time;
  const data = await Recruitment.find({is_full_time: isFullTime});
  res.send(data)
});
 
module.exports = router