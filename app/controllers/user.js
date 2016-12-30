var mongoose = require('mongoose')
var User = mongoose.model('User')
var Mydoc = mongoose.model('Doc')

  // signup
exports.showSignup = function(req, res) {
  res.render('signup', {
    title: '注册页面'
  })
}
exports.showSignin = function(req, res) {
  res.render('signin', {
    title: '登录页面'
  })
}
exports.signup = function(req, res) {
    var _user = req.body
    _user.group = [{groupName:"默认分组",groupFile:[]}]
    User.findOne({
      name: _user.name
    }, function(err, user) {
      if (err) {
        console.log(err)
      }
      if (user) {
        return res.redirect('/signin')
      } else {
        user = new User(_user)
        user.save(function(err, user) {
          if (err) {
            console.log(err)
          }
           req.session.user = user //注册后自动登陆
          res.redirect('/')
        })
      }
    })
  }
  // signin
exports.signin = function(req, res) {
    var _user = req.body
    var name = _user.name
    var password = _user.password
    User.findOne({
      name: name
    }, function(err, user) {
      if (err) {
        console.log(err)
      }
      if (!user) {
        return res.redirect('/signup')
      }
      if (user.comparePassword(password)) {
        req.session.user = user
        return res.redirect('/')
      } else {
        return res.redirect('/signin')
      }
    })
  }
  // logout
exports.logout = function(req, res) {
    delete req.session.user
      //delete app.locals.user
    res.redirect('/')
  }
  // userlist page
exports.list = function(req, res) {
    User.fetch(function(err, users) {
      if (err) {
        console.log(err)
      }
      res.render('userlist', {
        title: '用户列表页',
        users: users
      })
    })
  }
  // midware for user
exports.signinRequired = function(req, res, next) {
  var user = req.session.user
  if (!user) {
    return res.redirect('/signin')
  }
  next()
}
exports.adminRequired = function(req, res, next) {
  var user = req.session.user
  if (user.role <= 10) {
    return res.redirect('/signin')
  }
  next()
}
exports.del = function(req, res) {
  var id = req.query.id
    //var user = req.session.user
  if (id) {
    User.remove({
      _id: id
    }, function(err, course) {
      if (err) {
        console.log(err)
        res.json({
          success: 0
        })
      } else {
        res.json({
          success: 1
        })
      }
    })
  }
}

exports.usergroup = function(req, res) {
  User.findById(req.session.user._id, function(err, user) {
    if (err) {
      console.log(err)
    }
    var group = new Array()
    user.group.forEach(function(grp) {
      group.push(grp.groupName)

    })
    res.json(group)
  })

}

exports.postnewgroup = function(req, res) {
  User.findById(req.session.user._id, function(err, user) {
    if (err) {
      console.log(err)
    }
    if (req.body.name != "") {
      user.group.forEach(function(grp) {
        if (grp.groupName == req.body.name) {
          return
        }
      })
      user.group.push({
        groupName: req.body.name,
        groupFile: new Array()
      })
    }
    user.save(function(err, user) {
      if (err) {
        console.log(err)
      } else {

        User.findOne({
            _id: user._id
          })
          .populate("group.groupFile")
          .exec(function(err, exec_user) {
            // console.log(exec_user.group.groupFile)
            var treedata = new Array()
            exec_user.group.forEach(function(_group,gr) {
              treedata.push({
                label: _group.groupName,
                children: _group.groupFile.map(function(obj,tu) {
                  var child = new Object()
                  child.label = obj.originalName
                  child.parent = _group.groupName
                  child.docid = obj._id
                  child.type =obj.type
                  child.time =obj.referenceTime
                  child.grtu=[gr,tu]
                  return child
                })
              })
            })
            res.json(treedata)
          })
      }
    })

  })
}

exports.doc = function(req, res) {
  Mydoc.findById(req.body.docid, function(err, doc) {
    if (err) {
      console.log(err)
    } else {
      console.log(doc._id)
      console.log(doc)
      res.json({
        html: doc.htmlContent
      })
    }
  })

}