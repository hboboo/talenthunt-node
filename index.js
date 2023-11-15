const express = require('express')
const app = express()
const path = require('path');
const routes = require('./routers')

app.use(require('cors')())

const db = require('./mongodb/db');

routes(app)

app.use('/uploads/avatars', express.static(path.join(__dirname, 'public/uploads/avatars')));


app.listen(3000, () => {
  console.log('http://localhost:3000');
})