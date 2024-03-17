const express = require("express");
const router = express.Router();
const multer = require("multer");
const bcrypt = require('bcrypt')
const path = require("path");
const Job = require("../models/job");
const User = require("../models/user");
const Company = require("../models/company");

const TEST_USER_ID = "65f15d15dd56a1a8a1e1d447";

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

//查找全部用户
router.get("/users", async function (req, res) {
  try {
    const { pageIndex, pageSize } = req.query;
    const users = await User.find()
      .skip((pageIndex - 1) * pageSize)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments();

    res.json({
      data: users,
      total: totalUsersCount,
    });
  } catch (error) {
    res.status(500).json({ error: "服务器错误", message: error.message });
  }
});

//删除用户
router.post('/deleteUser', async (req, res) => {
  try {
      const { id } = req.body; // 从请求体中获取用户 ID
      const user = await User.findById(id);
      if (!user) {
          return res.status(404).json({ message: '用户未找到' });
      }
      // 删除用户
      await User.deleteOne({ _id: id });

      res.status(200).json({ message: '成功删除用户' });
  } catch (error) {
      console.error('错误', error.message);
      return res.status(500).json({ error: '服务器错误', message: error.message });
  }
});


// 设置用户存储引擎和保存目录
const storageUser = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/userLog');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}${ext}`; // 使用相同的命名规则
    cb(null, filename);
  },
});

const uploadUser = multer({ storage: storageUser });


// 处理上传用户头像的路由
router.post("/uploadUserLogo", uploadUser.single("userLogo"), async (req, res) => {
  try {
    // 获取上传的文件信息
    const userLogo = req.file;

    // 保存文件的路径，供前端访问
    const userLogoPath = userLogo ? `/uploads/userLog/${userLogo.filename}` : "";

    // 返回成功响应
    res.status(200).json({ message: "用户头像上传成功", userLogoPath });
  } catch (error) {
    // 返回错误响应
    res.status(500).json({ error: "用户头像上传失败", message: error.message });
  }
});


//新增用户
router.post('/register', async function (req, res) {
  try {
    const { account, password, role, username, userLogo } = req.body;

    // 生成salt的强度10
    const saltRounds = 10;
    const salt = await bcrypt.genSaltSync(saltRounds);

    // 使用salt和密码生成哈希
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      account: account,
      password: hashedPassword,
      role: role,
      username: username,
      userLogo: userLogo, // 直接使用表单中的头像路径
    });

    await newUser.save();
    res.status(200).json({message: '注册成功'})
  } catch (error) {
    console.error('错误', error.message);
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

module.exports = router;
