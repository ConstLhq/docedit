var fs = require('fs')
var path = require('path');
var request = require('request')
var sync_request = require('sync-request')
var User = require('../models/User')
var Folder = require('../models/Folder')
var Docown = require('../models/Docown')
var Event = require('../models/Event')
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
        //FIX ME 暂时去掉段落信息
      var paragraphs = filedata.replace(/\s/g,"").split(/\n/)
      // console.log(paragraphs);
      // console.log(paragraphs.filter);
      paragraphs = paragraphs.filter(function(s) {
        return s!= ""
      })
      var doc = {
            filePath: path.join(__dirname, "../../", file.path),
            type: req.body.docType,
            referenceTime: new Date(req.body.docDate).toISOString(),
            originalName: file.originalname,
            sequence: req.body.sequence,
            rawContent: filedata,
            paragraph: paragraphs,
            folderName: req.body.docGroup,
          }

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
            console.log(parsedXML)
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
                      lochint: event._key.locname,
                      geoloc:{ type: 'MultiPoint', coordinates: [[parseFloat(event._key.lng),parseFloat(event._key.lat)]],crs: { type: 'name', properties: { name: 'EPSG:4326'} }},
                      start_time: "timevalue" in event._key ? event._key.timevalue : null,
                      end_time: "timevalue" in event._key ? event._key.timevalue : null,
                      timehint: "timehint" in event._key ? event._key.timehint : null,
                    }
                  }
                }))
              }
              counter += 1
                //所有回调函数执行完成
              if (counter == paragraphs.length) {
              User.findById(req.session.user.id, {
                  include: [{
                    model: Folder,
                    as:"folders",
                    where: {
                      folderName: doc.folderName
                    },
                    include:[{model:Docown,as:"docs"}]
                  }]
                }).then(function(user){

                  (async() => {
                    doc = _.extend(doc, {
                      events: newevents
                    })
                    var docInstance = await Docown.create(doc, {
                      include: [{
                        model: Event,
                        as: "events"
                      }]
                    })
                    user.addDoc(docInstance)
                    user.addEvents(docInstance.events)
                    user.folders[0].addDoc(docInstance)
                    //fix me
                    res.json([0, 0])

                  })()
                })
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
            console.log(filedata)
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

// exports.devide = function(req, res) {

//   Docown.findById(req.body.docid, function(err, doc) {
//     if (err) {
//       console.log(err)
//     } else {

//       var oldhtml = doc.htmlContent
//       var s = oldhtml.indexOf(req.body.str)
//       var newparagraph = new Array

//       for (var i = 0; i < doc.paragraph.length; i++) {
//         var str = req.body.str
//         var s = doc.paragraph.indexOf(str)
//         if (s == -1) {
//           newparagraph.push(doc.paragraph[i])
//         } else {
//           newparagraph.push(doc.paragraph[i].substring(0, s + str.length))
//           newparagraph.push(doc.paragraph[i].substr(s + str.length))
//           break;
//         }

//       }

//       doc.paragraph = newparagraph
//       doc.save(function(err, doc) {
//         if (err) {
//           console.log(err)
//         } else {
//           console.log("doc updated")
//         }
//       })
//       res.send({
//         paragraph: doc.paragraph
//       })
//     }
//   })
// }

// exports.reparse = function(req, res) {

//   Docown.findById(req.body.docid, function(err, doc) {
//     if (err) {
//       console.log(err)
//     } else {
//       var oldhtml = doc.htmlContent
//         //拆分解析
//       var paragraphs = oldhtml.split(/<\/p><p.*?>/)
//       paragraphs = paragraphs.map(function(s) {
//         return s.replace(/<\/?.*?>/, '')
//       })
//       paragraphs = paragraphs.filter(function(s) {
//         return s != ""
//       })
//       var counter = 0
//       var newevents = []
//       paragraphs.forEach(function(s) {
//         var events = new Cut_Events();
//         options.form.txt = s.replace(/\s/g, '')
//         request(options, function(error, response, body) {
//           if (!error && response.statusCode == 200) {
//             var parsedXML = entities.decodeXML(body)
//             var i = parsedXML.indexOf("<content>");
//             var e = parsedXML.indexOf("</content>");
//             parsedXML = parsedXML.substring(i + 9, e)
//             var data = events._cutScene(parsedXML.replace(/\n/g, ""))
//             parser.parseString("<All>" + data + "</All>", function(err, results) {
//               if (err) {
//                 console.log(err)
//               } else {
//                 newevents = newevents.concat(results.All.EVENT.map(function(event) {
//                   if (event._key != undefined) {
//                     return {
//                       CONTENT: event._,
//                       LOC: event._key.locname || "不明",
//                       LAT: event._key.lat || "不明",
//                       LNG: event._key.lng || "不明",
//                       TIME: "timevalue" in event._key ? event._key.timevalue : "不明"
//                     }
//                   } else {
//                     return {
//                       CONTENT: event._,
//                       LOC: "不明",
//                       LAT: "不明",
//                       LNG: "不明",
//                       TIME: "不明"
//                     }
//                   }
//                 }))
//               }
//               counter += 1
//               if (counter == paragraphs.length) {
//                 //所有回调函数执行完成
//                 doc.Events = newevents
//                 doc.save(function(err, d) {
//                   if (err) {
//                     console.log(err)
//                   }
//                 })
//                 res.json(newevents)
//               }
//             })
//           }
//         })
//       })
//     }
//   })
// }

exports.downloadFile = function(req, res) {
  console.log(req.params.docid)
    //
  Docown.findById(req.params.docid, (err, doc) => {
    if (err) {
      res.json({
        error: "download failed"
      })
    } else {
      res.download(doc.filePath, doc.originalName)
    }
  })
}