const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router()
const User = require('../models/user')
const multer = require('multer');
const path = require('path');
const SECRET_KEY = 'asd546as65f46dg4dsfajhsgdak'; //临时定义的常量，实际应该为唯一环境变量

//注册API

// 设置存储引擎和保存目录
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/userLog');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}${ext}`; // 使用相同的命名规则
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });


// 注册API
router.post('/', upload.single('userLogo'), async function (req, res) {
  try {
    const { account, password, role, username } = req.body;

    // 获取上传的头像文件路径
    const userLogoPath = req.file ? `/uploads/userLog/${req.file.filename}` : null; // 使用相同的路径格式

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
      userLogo: userLogoPath, // 保存头像路径
    });

    await newUser.save();
    res.status(200).json({message: '注册成功'})
  } catch (error) {
    console.error('错误', error.message);
    res.status(500).json({ error: '服务器错误', message: error.message });
  }
});


// 登录API
router.post('/login', async function (req, res) {
  try {
    const { account, password } = req.body;

    // 在数据库查找用户
    const user = await User.findOne({ account });

    // 查找不到则未注册
    if (!user) {
      return res.status(401).json({ message: '用户未注册' });
    }

    // 使用 bcrypt 的 compare 函数验证密码是否匹配
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // 密码匹配，则返回成功响应，否者返回失败响应
    if (isPasswordValid) {
      const token = jwt.sign({ account, role: user.role }, SECRET_KEY, {
        expiresIn: '1h',
      });
      return res.status(200).json({ message: '登录成功', token, role: user.role, userId: user._id });
    } else {
      return res.status(401).json({ message: '密码错误' });
    }
  } catch (error) {
    return res.status(401).json({ message: '服务器失败' });
  }
});

// 获取用户详细信息的API
router.get('/info', async function (req, res) {
  try {
    // 从请求头中获取 token
    const token = req.header('Authorization').replace('Bearer ', '');

    // 验证 token
    const decoded = jwt.verify(token, SECRET_KEY);

    // 使用解码后的信息查找用户
    const user = await User.findOne({ account: decoded.account });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 返回用户详细信息
    res.status(200).json({
      account: user.account,
      role: user.role,
      username: user.username,
      userLogo: user.userLogo,
      // 其他用户信息...
    });
  } catch (error) {
    console.error('错误', error.message);
    return res.status(401).json({ message: '身份验证失败' });
  }
});

//根据id查询用户数据
router.post('/userId', async function (req, res) {
  try {
    const userId = req.body.userId;

    // 根据userId从数据库中获取用户详细信息
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }

    // 返回用户详细信息
    res.status(200).json({
      role: user.role,
      username: user.username,
      userLogo: user.userLogo,
      // 根据需要添加其他用户信息字段
    });
  } catch (error) {
    console.error('错误', error.message);
    return res.status(500).json({ error: '服务器错误', message: error.message });
  }
});

module.exports = router