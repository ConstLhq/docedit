var mongoose = require('mongoose')
var crypto=require('crypto')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var UserSchema = new mongoose.Schema({
  name: {
    unique: true,
    type: String
  },
  password: String,
  // 0: nomal user
  // >10: admin
  role: {
    type: Number,
    default: 0
  },
  docs: [{
    type: ObjectId,
    ref: 'Doc'
  }],
  group: [{
    groupName: String,
    groupFile:[{type:ObjectId ,ref:"Doc"}]
  }],
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
UserSchema.pre('save', function(next) {
  var user = this
  //加密密码
  var cipher = crypto.createCipher('aes192', 'itIsa_54673SaLty');
  var encrypted = cipher.update(this.password, 'utf8', 'hex');
  encrypted += cipher.final('hex')
  this.password=encrypted
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }
  next()
})
UserSchema.methods = {
  comparePassword: function(_password) {
    var cipher = crypto.createCipher('aes192', 'itIsa_54673SaLty');
    var encrypted = cipher.update(_password, 'utf8', 'hex');
    encrypted += cipher.final('hex')
    if (encrypted === this.password) {
      return true
    } else
      return false
  }
}
UserSchema.statics = {
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
module.exports = UserSchema