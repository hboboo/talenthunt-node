const express = require('express')
const router = express.Router()
const Job = require('../models/job')

//首页渲染
router.get('/', async function(req, res) {
  try {
    const isFullTime = req.query.is_full_time;
    const data = await Job.find({ is_full_time: isFullTime }).populate('company');
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});
 
// 查询岗位详情
router.get('/:id', async function(req, res) {
  try {
    const jobId = req.params.id;
    const jobDetails = await Job.findById(jobId).populate('company');
    
    if (!jobDetails) {
      return res.status(404).json({ error: '岗位详情未找到' });
    }

    res.json(jobDetails);
  } catch (error) {
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

//获取岗位
router.post('/', async function(req, res) {
  try {
    const jobId = req.body.jobId;

    // 查询指定 jobId 的工作信息
    const data = await Job.findById(jobId).populate('company');

    res.send(data);
  } catch (error) {
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

//搜索岗位
router.post('/search', async function(req, res) {
  try {
    const keyword = req.body.keyword;

    // 使用正则表达式实现模糊搜索，i 表示不区分大小写
    const data = await Job.find({ jobname: { $regex: new RegExp(keyword, 'i') } }).populate('company');

    res.send(data);
  } catch (error) {
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});


//筛选岗位
// 用于筛选工作的POST API
router.post('/filtrate', async (req, res) => {
  try {
    // 从请求体中解构筛选数据
    const { job_education, job_experience, salary } = req.body;

    // 基于提供的数据构建筛选对象
    const filters = {};
    if (job_education) filters.job_education = job_education;
    if (job_experience) filters.job_experience = job_experience;
    if (salary) filters.salary = salary;

    // 使用筛选条件查询数据库
    const filteredJobs = await Job.find(filters).populate('company');

    // 将筛选后的工作结果作为JSON响应返回
    res.json(filteredJobs);
  } catch (error) {
    console.error('筛选工作时发生错误：', error);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

module.exports = router