var fs = require('fs')
var path = require('path');
var request = require('request')
var sync_request = require('sync-request')
var mongoose = require('mongoose')
var User = mongoose.model('User')
var Mydoc = mongoose.model('Doc')
var Events = mongoose.model('Record')
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
    txt: "" ,
    type:"",
    time:"",
  }
};

//multer有single()中的名称必须是表单上传字段的name名称。
var docSaveCb = function(err, newdoc, req, res) {
  if (err) {
    console.log(err)
  }
  console.log("文件内容存入了数据库！")

  User.findById(req.session.user._id, function(err, user) {
    if (err) {
      console.log(err)
    }
    if (user.docs.indexOf(newdoc._id) == -1) {
      var gr=tu=0;
      user.docs.push(newdoc._id)
      user.group.forEach(function(grp,_gr) {
        if (grp.groupName == req.body.docGroup){
          grp.groupFile.push(newdoc._id);
          tu=grp.groupFile.length-1;
          gr=_gr;
        }
      })
      user.save(function(err, user) {
        if (err) {
          console.log(err)
        } else {
          res.json([gr,tu])
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
    options.form.t =new Date(req.body.docDate).toISOString()
   
    switch (file.originalname.split(".")[1]) {
      case "txt":
        fs.readFile(file.path, {
            encoding: 'utf-8'
          }, (err, filedata) => {
            if (err) {
              console(err)
            } else {

              //添加全文解析和切分
              var events = new Cut_Events();

              options.form.txt = filedata.replace(/\s/g, '')
              

              request(options, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                  var parsedXML = entities.decodeXML(body)

                  console.log(parsedXML)
                  var i = parsedXML.indexOf("<content>");
                  var e = parsedXML.indexOf("</content>");

                  parsedXML = parsedXML.substring(i + 9, e)

                  var data = events._cutScene(parsedXML.replace(/\n/g, ""))

                  var raw = parsedXML.replace(/(<\/?.*?>|\n)/g, '');

                  var html = '<p class= "plaintext">' + raw + '</p>'
                    // console.log(data)
                  parser.parseString("<All>" + data + "</All>", function(err, results) {
                    if (err) {
                      console.log(err)
                    }

                    var doc = new Mydoc({
                        originalName: file.originalname,
                        owner: req.session.user._id,
                        sequence: req.body.sequence,
                        rawContent: raw,
                        htmlContent: html,
                        Sentences: data.replace(/<\/EVENT>/g, "$&||").split("||"),
                        Events: results.All.EVENT.map(function(event) {

                          return {
                            CONTENT: event._,
                            LOC: event._key.locname,
                            LAT: event._key.lat,
                            LNG: event._key.lng,
                            TIME: "timevalue" in event._key ? event._key.timevalue : "NONE"
                          }
                        }),
                        groupName: req.body.docGroup,
                      })
                      // console.log(JSON.stringify(results.All.EVENT))
                    doc.save(docSaveCb(err, doc, req, res))
                  })
                }
              })
            }
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


exports.devide = function(req, res) {


  Mydoc.findById(req.body.docid, function(err, doc) {
    if (err) {
      console.log(err)
    } else {

      var oldhtml = doc.htmlContent
      var s = oldhtml.indexOf(req.body.str)

      var e = s + req.body.str.length

      var newhtml = oldhtml.substring(0, s) + "</p><p class =\"plaintext\">" + oldhtml.substring(s, e) + '</p><p class =\"plaintext\">' + oldhtml.substr(e)

      doc.htmlContent = newhtml
      doc.save(function(err, doc) {
        if (err) {
          console.log(err)
        } else {
          console.log("doc updated")
        }
      })

      res.send(newhtml)

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
      console.log(paragraphs)

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
              console.log("counter")
              console.log(counter)
              console.log(paragraphs.length)
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
exports.downloadFile =function(req,res){
  console.log(req.params.docid)
  res.download(path.join(__dirname, "../../public/uploads/as5864c29f2227ca32f66d15e8/s1event-*-1483026258316.txt"))
}