var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var DocSchema = new Schema({
  filePath:String,
  originalName: String,
  referenceTime:String,
  sequence: Boolean,
  type:String,
  rawContent: String,
  htmlContent: String,
  Sentences: [{
    type: String
  }],
  Events:[]
  ,
  matchedSentences: [{
    type: String
  }],
  groupName: String,
  geoJson: Object,
  owner: {
    type: ObjectId,
    ref: 'User'
  },
  events: [{
    type: ObjectId,
    ref: 'Record'
  }],
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    },
  }
});

DocSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }
  next()
})
DocSchema.statics = {
  fetch: function(cb) {
    return this
      .find({})
      .sort('meta.updateAt')
      .exec(cb)
  },
  findById: function(id, cb) {
    return this
      .findOne({
        _id: id
      })
      .exec(cb)
  }
}
module.exports = DocSchema