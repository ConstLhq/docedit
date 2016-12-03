var fs = require('fs')
var request = require('request')
var mongoose = require('mongoose')
var User = mongoose.model('User')
var Mydoc = mongoose.model('Doc')
var Events = mongoose.model('Record')
var muilter = require('../modules/multerUtil');
var entities = require('entities')
var _ = require('underscore')
var mammoth = require("mammoth");
var upload = muilter.single('file');
var xml2js = require('xml2js')
var parser = new xml2js.Parser({
  attrkey: "_key"
})
//multer有single()中的名称必须是表单上传字段的name名称。
var docSaveCb = function(err, newdoc,req,res) {
  if (err) {
    console.log(err)

  }
  console.log("文件内容存入了数据库！")
  console.log(newdoc.Events)


  User.findById(req.session.user._id, function(err, user) {
    if (err) {
      console.log(err)
    }
    if (user.docs.indexOf(newdoc._id) == -1) {
      user.docs.push(newdoc._id)
      user.group.forEach(function(grp) {
        if (grp.groupName == req.body.docGroup) {
          grp.groupFile.push(newdoc._id)
        }
      })
      user.save(function(err, user) {
        if (err) {
          console.log(err)
        } else {
          User.findOne({
              _id: user._id
            })
            .populate("group")
            .exec(function(err, exec_user) {
              var treedata = new Array()
              exec_user.group.forEach(function(_group) {
                treedata.push({
                  label: _group.groupName,
                  children: _group.groupFile.map(function(obj) {
                    return obj.originalName
                  })
                })
              })
              res.json(treedata)
            })
        }
      })
    }
  })
}
exports.dataInput = function(req, res) {
  upload(req, res, function(err) {
    if (err) {
      return console.log(err);
    }
    //文件信息在req.file或者req.files中显示。
    var file = req.file
    console.log(req.file)
    switch (file.originalname.split(".")[1]) {
      case "txt":
        fs.readFile(file.path,{encoding:'utf-8'}, (err, data) => {
          if (err) {
            console(err)
          }
          var html = "<p>" + data + "</p>"
          var raw = data;
          parser.parseString("<All>"+raw+"</All>",function(err,results){


            var doc = new Mydoc({
            originalName: file.originalname,
            owner: req.session.user._id,
            sequence: req.body.sequence,
            rawContent: raw,
            htmlContent: html,
            // Sentences: raw.replace(/[。？！]/g, "$&>>>").split(">>>"),
            Sentences: raw.replace(/<\/EVENT>/g, "$&||").split("||"),
            Events:results.All.EVENT,
            groupName: req.body.docGroup,
          })
          console.log(JSON.stringify(results.All.EVENT))
          doc.save(docSaveCb(err, doc,req,res))
        })
          })
        // break;
          
      // case "docx":
      //   mammoth.convertToHtml({
      //     path: file.path
      //   }).then(function(result_html) {
      //     var html = result_html.value;
      //     mammoth.extractRawText({
      //       path: file.path
      //     }).then(function(result_raw) {
      //       var raw = result_raw.value
      //       var doc = new Mydoc({
      //         originalName: file.originalname,
      //         owner: req.session.user._id,
      //         sequence: req.body.sequence,
      //         rawContent: raw,
      //         htmlContent: html,
      //         Sentences: raw.replace(/<\/EVENT>/g, "$&||").split("||"),
      //         groupName: req.body.docGroup,
      //       })
      //       doc.save(docSaveCb(err, doc,req,res))
      //     })
      //   });
      //   break;
    }
  })
}