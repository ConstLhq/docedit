var mongoose = require('mongoose');
var DocSchema = require('../schemas/doc');
var Doc = mongoose.model('Doc', DocSchema);
module.exports = Doc;