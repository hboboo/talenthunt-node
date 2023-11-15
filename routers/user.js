const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router()
const User = require('../models/user')
const SECRET_KEY = 'asd546as65f46dg4dsfajhsgdak'; //临时定义的常量，实际应该为唯一环境变量

//注册API
router.post('/', async function (req, res) {
  try {
    const {username, password, role} = req.body

    // 生成salt的强度10
    const saltRounds = 10
    const salt = await bcrypt.genSaltSync(saltRounds)

    // 使用salt和密码生成哈希
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      username: username,
      password: hashedPassword,       // 储存哈希后的密码
      role: role
    })
    await newUser.save()
    res.send('添加成功')
  } catch (error) {
    console.error('错误', error.message)
  }
})

// 登录API
router.post('/login', async function (req, res) {
  try {
    const { username, password} = req.body

    // 在数据库查找用户
    const user = await User.findOne({ username })

    // 查找不到则未注册
    if (!user) {
      return res.status(401).json({message: '用户未注册'})
    }

    // 使用 bcrypt 的 compare 函数验证密码是否匹配
    const isPasswordValid = await bcrypt.compare(password, user.password)

    // 密码匹配，则返回成功响应，否者返回失败响应
    if (isPasswordValid) {
      const token = jwt.sign({ username, role: user.role }, SECRET_KEY, {
        expiresIn: '1h'
      })
      return res.status(200).json({message: '登录成功', token})
    } else {
      return res.status(401).json({message: '密码错误'})
    }
  } catch (error) {
    console.error('错误', error.message);
    return res.status(401).json({message: '服务器失败'})
  }
})

module.exports = router