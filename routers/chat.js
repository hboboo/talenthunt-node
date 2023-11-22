const express = require('express')
const router = express.Router()
const Chat = require('../models/chat')

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

module.exports = router