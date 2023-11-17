const express = require('express')
const router = express.Router()
const Job = require('../models/job')
const Company = require('../models/company')

router.post('/', async function (req, res) {
  try {
    // 解构前端传递的数据
    const {
      jobname,
      salary,
      hot,
      is_full_time,
      city,
      district,
      short_company_name,
      job_tag,
      job_responsibility,
      job_require,
      job_education,
      job_experience,
      recruiter,
      companyName,
      financing,
      scale_company,
      industry,
      company_address,
      company_introduction,
      start,
      end,
      rest_weekend,
      overtime,
    } = req.body;

    // 创建Company模型实例
    const company = new Company({
      companyName,
      financing,
      scale_company,
      industry,
      workingHours: {
        start,
        end,
      },
      rest_weekend,
      overtime,
      company_address,
      company_introduction,
    });

    // 保存Company模型实例到数据库
    const savedCompany = await company.save();

    // 创建Job模型实例
    const job = new Job({
      jobname,
      salary,
      hot,
      is_full_time,
      city,
      district,
      short_company_name,
      job_tag,
      job_responsibility,
      job_require,
      job_education,
      job_experience,
      recruiter,
      company: savedCompany._id,
    });

    // 保存Job模型实例到数据库
    const savedJob = await job.save();

    

    // 返回成功响应
    res.status(200).json({ message: '数据保存成功', job: savedJob, company: savedCompany });
  } catch (error) {
    // 返回错误响应
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
})


module.exports = router