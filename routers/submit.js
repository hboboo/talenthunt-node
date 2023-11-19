const express = require('express')
const router = express.Router()
const multer = require('multer');
const path = require('path')
const fs = require('fs').promises;
const Job = require('../models/job')
const Company = require('../models/company')

// 设置 Multer，指定存储目录和文件名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/companyLog'); // 上传的文件存储在 uploads 目录
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

router.post('/', upload.single('companyLogo'), async function (req, res) {
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
      userId
    } = req.body;

    // 解构上传的文件数据
    const companyLogo = req.file;

    // 保存文件的路径，供前端访问
    const companyLogoPath = companyLogo ? `/uploads/companyLog/${companyLogo.filename}` : '';

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
      companyLogo: companyLogoPath,
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
      userId
    });

    // 保存Job模型实例到数据库
    const savedJob = await job.save();

    // 返回成功响应
    res.status(200).json({ message: '数据保存成功', job: savedJob, company: savedCompany });
  } catch (error) {
    // 返回错误响应
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});



module.exports = router