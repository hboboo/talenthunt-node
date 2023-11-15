const job = require('./job')

module.exports = (app) => {
  app.use('/job', job)
}