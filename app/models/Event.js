var mongoose = require('mongoose');
var EventSchema = require('../schemas/event');
var Event = mongoose.model('Event', EventSchema);
module.exports = Event;