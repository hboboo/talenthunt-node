const job = require('./job')
const user = require('./user')

module.exports = (app) => {
  app.use('/job', job),
  app.use('/user', user)
}