const job = require('./job')
const user = require('./user')
const submit = require('./submit')
const chat = require('./chat')
const admin = require('./admin')

module.exports = (app) => {
  app.use('/job', job),
  app.use('/user', user),
  app.use('/submit', submit),
  app.use('/chat', chat),
  app.use('/admin', admin)
}