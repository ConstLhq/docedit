var mongoose = require('mongoose');
var RecordSchema = require('../schemas/record');
var Record = mongoose.model('Record', RecordSchema);
module.exports = Record;