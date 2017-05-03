var fs = require('fs')
var path = require('path');
var request = require('request')
var sync_request = require('sync-request')
var mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId
var User = mongoose.model('User')
var Mydoc = mongoose.model('Doc')
var Event = mongoose.model('Event')
var muilter = require('../modules/multerUtil');
var entities = require('entities')
var _ = require('underscore')
var mammoth = require("mammoth");
var upload = muilter.single('file');
var xml2js = require('xml2js');
var Cut_Events = require('../modules/event');
var parser = new xml2js.Parser({
  attrkey: "_key"
})

var options = {
  method: "POST",
  url: 'http://geocontext.svail.com:8080/txt',
  encoding: "utf-8",
  headers: {
    'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
  },
  form: {
    req: "parse",
    txt: "",
    type: "",
    t: "",
  }
};

//multer有single()中的名称必须是表单上传字段的name名称。
var docSaveCb = function(err, newdoc, newevents, req, res) {
  if (err) {
    console.log(err)
  }
  console.log("文件内容存入了数据库！")

  //填充Event数据集
  Event.insertMany(newevents.map(function(event) {
    event.fromdoc = newdoc._id
    return event
  }), (err, _es) => {
    var i = 0; //段落搜索索引
    if (err) {
      console.log(err)
    }
    _es.forEach(function(e,_i) {
     
      var flag = -1
      while (i < newdoc.paragraph.length) {
        flag = newdoc.paragraph[i].indexOf(e.content)
        if (flag != -1) {
          e.fromparagraph = i
          e.offsetS = flag
          e.offsetE = flag + e.content.length
          e.save((err, d) => {
            if (err) {
              console.log(err)
            }
          })
          return
        } else {i++}
      }
      if (flag == -1) { //找死没有
        e.fromparagraph = -1
        e.offsetS = -1
        e.offsetE = -1
        e.save((err, d) => {
          if (err) {
            console.log(err)
          }
        })

      }
    })
  })


  User.findById(req.session.user._id, function(err, user) {
    if (err) {
      console.log(err)
    }
    if (user.docs.indexOf(newdoc._id) == -1) {
     
      var gr = tu = 0;
      user.docs.push(newdoc._id)
      user.group.forEach(function(grp, _gr) {

          

        if (grp.groupName == req.body.docGroup) {
          grp.groupFile.push(newdoc._id);
          tu = grp.groupFile.length - 1;
          gr = _gr;
        }
      })
      user.save(function(err, user) {
        if (err) {
          console.log(err)
        } else {
          res.json([gr, tu])
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
    console.log(file.path)
    options.form.type = req.body.docType
    options.form.t = new Date(req.body.docDate).toISOString()

    //添加全文解析和切分
    function parseAndCut(filedata) {
      console.log("in parse")
        //拆分解析
      var paragraphs = filedata.split(/\n/)
      paragraphs = paragraphs.filter(function(s) {
        return s != ""
      })

      var doc = new Mydoc({
        filePath: path.join(__dirname, "../../", file.path),
        type: req.body.docType,
        referenceTime: new Date(req.body.docDate).toISOString(),
        originalName: file.originalname,
        owner: req.session.user._id,
        sequence: req.body.sequence,
        rawContent: filedata,
        paragraph: paragraphs,
        groupName: req.body.docGroup,
      })


      var counter = 0
      var contextarry = [null, null]
      var newevents = []
      paragraphs.forEach(function(s, p_index) {
        console.log(s)
        var events = new Cut_Events(contextarry);

        options.form.txt = s.replace(/\s/g, '')
        request(options, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var parsedXML = entities.decodeXML(body)
            console.log( parsedXML)
            var i = parsedXML.indexOf("<content>");
            var e = parsedXML.indexOf("</content>");
            parsedXML = parsedXML.substring(i + 9, e)
            var data = events._cutScene(parsedXML.replace(/\n/g, ""))
            contextarry = events.getBgContext()
            parser.parseString("<All>" + data + "</All>", function(err, results) {
              if (err) {
                console.log(err)
              } else {
                newevents = newevents.concat(results.All.EVENT.map(function(event) {
                  if (event._key != undefined) {
                    return {
                      content: event._,
                      location: event._key.locname,
                      lat: event._key.lat ,
                      lng: event._key.lng ,
                      time: "timevalue" in event._key ? event._key.timevalue : null
                    }
                  } 
                }))
              }
              counter += 1
                //所有回调函数执行完成
              if (counter == paragraphs.length) {
                doc.save(docSaveCb(err, doc, newevents, req, res))
              }
            })
          }
        })
      })
    }

    switch (file.originalname.split(".")[1]) {
      case "txt":
        fs.readFile(file.path, {
          encoding: 'utf-8'
        }, (err, filedata) => {
          if (err) {
            console(err)
          } else {
            parseAndCut(filedata)
          }
        })
        break;
      case "docx":
        mammoth.extractRawText({
          path: file.path
        }).then(function(result_raw) {
          parseAndCut(result_raw.value)
        });
        break;
    }
  })
}

exports.devide = function(req, res) {

  Mydoc.findById(req.body.docid, function(err, doc) {
    if (err) {
      console.log(err)
    } else {

      var oldhtml = doc.htmlContent
      var s = oldhtml.indexOf(req.body.str)
      var newparagraph = new Array

      for (var i = 0; i < doc.paragraph.length; i++) {
        var str = req.body.str
        var s = doc.paragraph.indexOf(str)
        if (s == -1) {
          newparagraph.push(doc.paragraph[i])
        } else {
          newparagraph.push(doc.paragraph[i].substring(0, s + str.length))
          newparagraph.push(doc.paragraph[i].substr(s + str.length))
          break;
        }

      }

      doc.paragraph = newparagraph
      doc.save(function(err, doc) {
        if (err) {
          console.log(err)
        } else {
          console.log("doc updated")
        }
      })
      res.send({
        paragraph: doc.paragraph
      })
    }
  })
}

exports.reparse = function(req, res) {

  Mydoc.findById(req.body.docid, function(err, doc) {
    if (err) {
      console.log(err)
    } else {
      var oldhtml = doc.htmlContent
        //拆分解析
      var paragraphs = oldhtml.split(/<\/p><p.*?>/)
      paragraphs = paragraphs.map(function(s) {
        return s.replace(/<\/?.*?>/, '')
      })
      paragraphs = paragraphs.filter(function(s) {
        return s != ""
      })
      var counter = 0
      var newevents = []
      paragraphs.forEach(function(s) {
        var events = new Cut_Events();
        options.form.txt = s.replace(/\s/g, '')
        request(options, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var parsedXML = entities.decodeXML(body)
            var i = parsedXML.indexOf("<content>");
            var e = parsedXML.indexOf("</content>");
            parsedXML = parsedXML.substring(i + 9, e)
            var data = events._cutScene(parsedXML.replace(/\n/g, ""))
            parser.parseString("<All>" + data + "</All>", function(err, results) {
              if (err) {
                console.log(err)
              } else {
                newevents = newevents.concat(results.All.EVENT.map(function(event) {
                  if (event._key != undefined) {
                    return {
                      CONTENT: event._,
                      LOC: event._key.locname || "不明",
                      LAT: event._key.lat || "不明",
                      LNG: event._key.lng || "不明",
                      TIME: "timevalue" in event._key ? event._key.timevalue : "不明"
                    }
                  } else {
                    return {
                      CONTENT: event._,
                      LOC: "不明",
                      LAT: "不明",
                      LNG: "不明",
                      TIME: "不明"
                    }
                  }
                }))
              }
              counter += 1
              if (counter == paragraphs.length) {
                //所有回调函数执行完成
                doc.Events = newevents
                doc.save(function(err, d) {
                  if (err) {
                    console.log(err)
                  }
                })
                res.json(newevents)
              }
            })
          }
        })
      })
    }
  })
}

exports.downloadFile = function(req, res) {
  console.log(req.params.docid)
    //
  Mydoc.findById(req.params.docid, (err, doc) => {
    if (err) {
      res.json({
        error: "download failed"
      })
    } else {
      res.download(doc.filePath, doc.originalName)
    }
  })
}