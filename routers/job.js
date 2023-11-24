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

module.exports = router