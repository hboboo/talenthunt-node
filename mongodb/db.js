const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/talent-hut-node')
const db = mongoose.connection;

db.once('open' ,() => {
	console.log('连接数据库成功');
})


db.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});


module.exports = db; 