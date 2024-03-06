const express = require('express')
const router = express.Router()
const Job = require('../models/job')
const User = require('../models/user')
const Company = require('../models/company')

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

//我的发布页面，接口
router.post('/jobsByUserId', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId in request body' });
    }

    // 查找与 userId 相关的工作岗位
    const jobs = await Job.find({ userId }).populate('company');

    if (!jobs) {
      return res.status(404).json({ error: 'No jobs found for the given userId' });
    }

    // 在这里可以对 jobs 做进一步的处理，根据需要选择返回哪些数据

    res.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs by userId:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 删除岗位及关联公司信息
router.post('/deleteJob', async function (req, res) {
  try {
    const { userId, jobId } = req.body;

    // 检查用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }

    // 检查岗位是否存在
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: '岗位未找到' });
    }

    // 检查用户是否有权限删除该岗位
    if (job.userId.toString() !== userId) {
      return res.status(403).json({ message: '没有权限删除该岗位' });
    }

    // 删除岗位及关联的公司信息
    await Promise.all([
      Job.deleteOne({ _id: jobId, userId: userId }),
      Company.deleteOne({ _id: job.company }) // 删除关联的公司信息
    ]);

    res.status(200).json({ message: '成功删除岗位及关联的公司信息' });
  } catch (error) {
    console.error('错误', error.message);
    return res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

module.exports = router