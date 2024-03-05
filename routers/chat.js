const express = require('express')
const router = express.Router()
const Chat = require('../models/chat')
const User = require('../models/user')

router.post('/', async (req, res) => {
  try {
    // 从请求体中获取前端发送的消息数据
    const { content, time, sender, receiver, isRead } = req.body;

    // 创建 Chat 模型实例并保存到数据库
    const newChat = new Chat({
      content,
      time,
      sender,
      receiver,
      isRead,
    });

    const savedChat = await newChat.save();

    // 返回成功响应
    res.status(201).json({ success: true, message: 'Message sent successfully', data: savedChat });
  } catch (error) {
    // 处理错误，返回错误响应
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


router.get('/', async (req, res) => {
  try {
    // 从请求参数中获取接收者的 ID
    const receiverId = req.query.receiver;

    // 查询数据库，获取指定接收者的消息列表
    const data = await Chat.find({ receiver: receiverId });

    // 返回成功响应
    res.status(200).json(data);
  } catch (error) {
    // 处理错误，返回错误响应
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

//查询其他人发给我的信息
router.post('/otherUser', async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    // 查询数据库，获取指定发送者和接收者之间的消息列表
    const data = await Chat.find({ sender, receiver });

    // 返回成功响应
    res.status(200).json(data);
  } catch (error) {
    // 处理错误，返回错误响应
    console.error('Error fetching other user messages:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 添加到路由文件中
router.post('/markAsRead', async (req, res) => {
  try {
    const { sender } = req.body;

    // 将指定发送者的消息标记为已读
    await Chat.updateMany({ sender, isRead: false }, { $set: { isRead: true } });

    res.status(200).json({ success: true, message: 'Message marked as read successfully' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

//储存简历id
router.post('/storeResume', async (req, res) => {
  try {
      // 从请求体中获取两个变量
      const { userId, resumeId } = req.body;

      // 查询用户
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // 检查简历 ID 是否已经存在于用户的 resumes 数组中
      if (user.resumes.includes(resumeId)) {
          return res.status(400).json({ message: 'Resume ID already exists in user resumes' });
      }

      // 将简历 ID 添加到用户的 resumes 字段中
      user.resumes.push(resumeId);

      // 保存用户
      await user.save();

      // 返回成功响应
      res.status(200).json({ message: 'Resume stored successfully' });
  } catch (err) {
      console.error('Error storing resume:', err);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router