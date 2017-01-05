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
    time: "",
  }
};

//multer有single()中的名称必须是表单上传字段的name名称。
var docSaveCb = function(err, newdoc, results, req, res) {
    if (err) {
      console.log(err)
    }
    console.log("文件内容存入了数据库！")

    //填充Event数据集
    Event.insertMany(results.All.EVENT.map(function(result) {
          return {
            fromdoc: newdoc._id,
            content: result._,
            location: result._key.locname,
            lat: result._key.lat,
            lng: result._key.lng,
            time: "timevalue" in result._key ? result._key.timevalue : "NONE"
          }
        }), (err, _es) => {

          var i = 0; //段落搜索索引
          if (err) {
            console.log(err)
          }
          console.log(_es)
          _es.forEach(function(e) {
            do {
              console.log(i)
              console.log(newdoc.paragraph.length)
              var flag = newdoc.paragraph[i].indexOf(e.content)
              if (flag != -1) {
                e.fromparagraph = i
                e.offsetS = flag
                e.offsetE = flag + e.content.length
                e.save((err, d) => {
                  if (err) {
                    console.log(err)
                  }
                })
              } else {
                i++
              }
            } while (i < newdoc.paragraph.length-1  && flag == -1)
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
                  parser.parseString("<All>" + data + "</All>", function(err, results) {
                    if (err) {
                      console.log(err)
                    }


                    var doc = new Mydoc({
                        filePath: path.join(__dirname, "../../", file.path),
                        type: req.body.docType,
                        referenceTime: new Date(req.body.docDate).toISOString(),
                        originalName: file.originalname,
                        owner: req.session.user._id,
                        sequence: req.body.sequence,
                        rawContent: raw,
                        Sentences: data.replace(/<\/EVENT>/g, "$&||").split("||"),
                        paragraph: filedata.split(/\n/),
                        groupName: req.body.docGroup,
                      })
                    doc.save(docSaveCb(err, doc, results, req, res))
                  })
                }
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