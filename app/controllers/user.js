const User = require('../models/User')
const Folder = require('../models/Folder')
const Docown = require('../models/Docown')
const Docpub = require('../models/Docpub')
const _ = require("underscore")

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
    User.findOne({
      where: {
        name: _user.name
      }
    }).then(function(user) {
      if (user) {
        return res.redirect('/signin')
      } else {
        _user = _.extend(_user, {
          folders: [{
            folderName: "默认分组"
          }]
        })

        user = User.create(_user, {
          include: [{
            model: Folder,
            as: 'folders'
          }]
        }).then(function(user) {

          console.log("###########")
          console.log(user.addFolder)
          console.log(user.addDoc)

          req.session.user = user //注册后自动登陆
          res.redirect('/')
        }).catch(function(err) {
          console.log('failed save user: ' + err);
        })
      }
    }).catch(function(err) {
      console.log('failed query user: ' + err);
    });
  }
  // signin
exports.signin = function(req, res) {
    var _user = req.body
    var name = _user.name
    var password = _user.password
    User.findOne({
      where: {
        name: name
      }
    }).then(function(user) {
      if (!user) {
        return res.redirect('/signup')
      }
      if (user.comparePassword(password)) {
        req.session.user = user
        return res.redirect('/')
      } else {
        return res.redirect('/signin')
      }
    }).catch(function(err) {
      console.log('failed signin query: ' + err);
    });
  }
  // logout
exports.logout = function(req, res) {
    delete req.session.user
    res.redirect('/')
  }
  // userlist page
  // exports.list = function(req, res) {
  //     User.fetch(function(err, users) {
  //       if (err) {
  //         console.log(err)
  //       }
  //       res.render('userlist', {
  //         title: '用户列表页',
  //         users: users
  //       })
  //     })
  //   }

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
  if (id) {
    User.findOne({
      where: {
        id: id
      }
    }).then(function(course) {
      if (course) {
        course.destroy();
        res.json({
          success: 1
        })
      }
    })
  }
}

exports.usergroup = function(req, res) {
  User.findById(req.session.user.id, {
    include: [{
      model: Folder,
      as: "folders"
    }]
  }).then(function(user) {
    var folders = new Array()
    user.folders.forEach(function(folder) {
      folders.push(folder.folderName)
    })
    res.json(folders)
  }).catch(function(err) {
    console.log('failed usergroup query: ' + err);
  });
}

exports.postnewgroup = function(req, res) {
  User.findById(req.session.user.id, {
    include: [{
      model: Folder,
      as: "folders",
      include: [{
        model: Docown,
        as: "docs"
      }]
    }]
  }).then(function(user) {
    if (req.body.name != "") {
      // user.folders.forEach(function(grp) {
      //     if (grp.folderName == req.body.name) {
      //       return
      //     }
      //   })
      (async() => {
        //create a new folder
        var newfolder = await Folder.create({
          folderName: req.body.name
        })
        user.addFolder(newfolder)

      })()
    }


    var treedata = new Array();
    user.folders.forEach(function(_group, gr) {
      treedata.push({
        label: _group.folderName,
        children: _group.docs.map(function(obj, tu) {
          var child = new Object()
          child.label = obj.originalName
          child.parent = _group.folderName
          child.docid = obj.id
          child.type = obj.type
          child.time = obj.referenceTime
          child.grtu = [gr, tu]
          return child
        })
      })
    });
    treedata.push({label:req.body.name,children:[]})
    res.json(treedata)
  })
}

exports.doc = function(req, res) {
  Docown.findById(req.body.docid).then(function(doc) {
    if (doc) {
      res.json({
        paragraph: doc.paragraph
      })
    }
  })
}

exports.publicDoc = function(req, res) {
  Docpub.findById(req.body.docid).then(function(doc) {
    if (doc) {
      res.json({
        paragraph: [new Buffer(doc.content, 'binary').toString('base64')]
      })
    }
  })
}