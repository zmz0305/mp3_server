var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
    "name": {type: String, dropDup: true},
    "email": {type: String, unique: true, dropDup: true},
    "pendingTasks": [String],
    "dateCreated": {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', userSchema);