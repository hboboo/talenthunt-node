const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Job = require("../models/job");
const User = require("../models/user");
const Company = require("../models/company");

const TEST_USER_ID = "655b146dabe5460953b36360";

//查找全部岗位
router.get("/", async function (req, res) {
  try {
    const { pageIndex, pageSize } = req.query;
    const jobs = await Job.find()
      .populate("company")
      .skip((pageIndex - 1) * pageSize)
      .limit(pageSize);

    const totalJobsCount = await Job.countDocuments();

    res.json({
      data: jobs,
      total: totalJobsCount,
    });
  } catch (error) {
    res.status(500).json({ error: "服务器错误", message: error.message });
  }
});

//设置上传文件
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/companyLog"); // 上传的文件存储在 uploads 目录
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  },
});
const upload = multer({ storage: storage });

// 处理上传公司logo的路由
router.post("/upload", upload.single("companyLogo"), async (req, res) => {
  try {
    // 获取上传的文件信息
    const companyLogo = req.file;

    // 保存文件的路径，供前端访问
    const companyLogoPath = companyLogo ? `/uploads/companyLog/${companyLogo.filename}` : "";

    // 返回成功响应
    res.status(200).json({ message: "公司logo上传成功", companyLogoPath });
  } catch (error) {
    // 返回错误响应
    res.status(500).json({ error: "公司logo上传失败", message: error.message });
  }
});

//后台新增岗位
router.post("/submit", async function (req, res) {
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
      companyLogo, // 公司logo的路径
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
      companyLogo,
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
      job_tag, // 已经是数组形式
      job_responsibility, // 已经是数组形式
      job_require, // 已经是数组形式
      job_education,
      job_experience,
      recruiter,
      company: savedCompany._id,
      userId: TEST_USER_ID, // 使用常量值代替用户Id
    });

    // 保存Job模型实例到数据库
    const savedJob = await job.save();

    // 返回成功响应
    res.status(200).json({ message: "数据保存成功", job: savedJob, company: savedCompany });
  } catch (error) {
    // 返回错误响应
    res.status(500).json({ error: "服务器错误", message: error.message });
  }
});

// 编辑岗位和公司信息的接口
router.put("/jobs/:id", async function (req, res) {
  try {
    const jobId = req.params.id;
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
      job_experience,
      job_education,
      recruiter,
      companyName,
      financing,
      scale_company,
      industry,
      workingHours,
      rest_weekend,
      overtime,
      company_address,
      company_introduction,
      companyLogo,
    } = req.body;

    // 检查是否存在对应的岗位信息
    const existingJob = await Job.findById(jobId);
    if (!existingJob) {
      return res.status(404).json({ error: "岗位信息未找到" });
    }

    // 更新公司信息
    const company = await Company.findOneAndUpdate(
      { companyName },
      {
        financing,
        scale_company,
        industry,
        workingHours,
        rest_weekend,
        overtime,
        company_address,
        company_introduction,
        companyLogo,
      },
      { new: true, upsert: true }
    );

    // 更新岗位信息
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
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
        job_experience,
        job_education,
        recruiter,
        company: company._id,
      },
      { new: true }
    );

    res.status(200).json({ message: "岗位信息更新成功", updatedJob });
  } catch (error) {
    res.status(500).json({ error: "服务器错误", message: error.message });
  }
});

//删除岗位
router.post('/deleteJob', async function (req, res) {
  try {
    const {jobId } = req.body;

    // 检查岗位是否存在
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: '岗位未找到' });
    }

    // 删除岗位及关联的公司信息
    await Promise.all([
      Job.deleteOne({ _id: jobId}),
      Company.deleteOne({ _id: job.company }) // 删除关联的公司信息
    ]);

    res.status(200).json({ message: '成功删除岗位及关联的公司信息' });
  } catch (error) {
    console.error('错误', error.message);
    return res.status(500).json({ error: '服务器错误', message: error.message });
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

module.exports = router;
