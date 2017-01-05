var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var EventSchema = new Schema({
    fromdoc: {
      type: ObjectId,
      ref: 'Doc'
    },
    content: String,
  /////////add on 2017-01-04////////
    fromparagraph:Number, //记录所在段落
    offsetS:Number,//起始偏移位置
    offsetE:Number,//终止偏移位置
  ////////////////////////////////////////
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
EventSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }

  next()
  
})
EventSchema.statics = {
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
module.exports = EventSchema