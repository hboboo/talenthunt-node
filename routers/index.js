const job = require('./job')
const user = require('./user')
const submit = require('./submit')
const chat = require('./chat')

module.exports = (app) => {
  app.use('/job', job),
  app.use('/user', user),
  app.use('/submit', submit),
  app.use('/chat', chat)
}