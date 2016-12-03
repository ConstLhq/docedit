var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var RecordSchema = new Schema({
    fromdoc: {
      type: ObjectId,
      ref: 'doc'
    },
    fromSentence: String,
    json: Object,
    location: String,
    lat: Number,
    lng: Number,
    keywords: [{
      type: String
    }],
    time: String,
    people: String,
    meta: {
      createAt: {
        type: Date,
        default: Date.now()
      },
      updateAt: {
        type: Date,
        default: Date.now()
      }
    }
  })
  // var ObjectId = mongoose.Schema.Types.ObjectId
RecordSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }
  next()
})
RecordSchema.statics = {
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
module.exports = RecordSchema