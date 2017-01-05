var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
  /**
    Doc中没有记录所包含的事件信息，通过在Event中记录doc的_id来实现关联, 两套关联反而不利于同步
  */
var DocSchema = new Schema({
  filePath: String,
  originalName: String,
  referenceTime: String,
  sequence: Boolean,
  type: String,
  rawContent: String,
  paragraph: [{
    type: String
  }],
  matchedSentences: [{
    type: String
  }],
  groupName: String,
  owner: {
    type: ObjectId,
    ref: 'User'
  },
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