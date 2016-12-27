var fs = require('fs')
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
    txt: "" //"2015年1月20日，二中院作出执行裁定，按照生效判决，对张曙光的个人财产予以没收包括银行存款和房产。《法制晚报》记者看到，裁定书分八项两部分，一部分是银行存款，其中包括冻结的张曙光的全部银行存款；张曙光妻子名下的存款和张曙光情妇罗菲名下的银行存款。第二部分就是房产，包扣张曙光名下的位于海淀区上河村的一套房产和地下车库，一套位于上海市虹许路的楼房一套，第三套房屋就是位于海淀区蓝靛厂南路的一套房产。第三套房屋在案发前由罗菲居住，二中院作出执行裁定后，罗菲不服，称执行标的物其其名下合法财产，向二中院提出执行异议，请求停止执行涉案房屋。罗菲称，购买涉案房屋的款项大部分是个人还有父母给的，不应归为张曙光的个人财产并予以没收。一审法院判决涉案房屋属于赃物诉二中院审理查明，2014年10月17日，二中院对张曙光作出一审判决，以受贿罪，判处张曙光死刑缓期二年执行，剥夺政治权利终身，并处没收个人全部财产，在案扣押款物予以没收，上缴国库，超出犯罪所得部分作为张曙光的个人财产，并入没收个人全部财产项执行，并附上了清单。在该判决中写明，证人罗某的证言证明：2007年，张曙光给了其280万元，用于购买蓝靛厂南路房产，在判决书后的清单中列明的予以变价所得款予以没收的第26项物品为该套房产。2014年12月16日，市高院对张曙光作出终审裁定，维持二中院一审判决。2015年1月14日，该案被移至二中院执行。2015年12月11日，二中院发出公告，依据生效刑事判决将对查封的涉案房屋进行评估、拍卖，责令房屋所有权人及占有人于2016年1月11日前迁出涉案房屋，到期不履行，将依法强制执行，随后罗菲向二中院提出执行异议。二中院认为，发生法律效力的刑事判决已判明对在案扣押款物予以没收，上缴国库，超出犯罪所得的部分作为张曙光的个人财产，并入没收个人全部财产项执行，且判决书所附的清单中列明有该套涉案房屋，因此该院依生效判决对涉案房屋采取执行措施符合法律规定，罗菲称购买涉案房屋的款项大部分属于其个人及其父母，但是其提交的证据均不足以证明该项主张。且罗菲在张曙光受贿一案中作为证人，明确表示张曙光给其280万元用于购买涉案房屋，故对罗菲的该项主张不予支持。此外，二中院生效刑事判决已认定涉案房屋系涉案赃物，并判决对涉案房屋予以变价，所得款予以没收，罗菲要求停止对涉案房屋的执行，实质上是对执行依据本身存在异议，应当通过申请再审等其他途径解决。综上，罗菲要求对涉案房屋停止执行的异议请求，缺乏事实及法律依据，法院不予支持。二中院裁定驳回案外人罗菲的异议请求。罗菲不服，向市高院提起复议。市高院维持一审裁定驳回复议申请罗菲表示，二中院裁定认定涉案房屋是张曙光案中被执行的财产是错误的。在张曙光案中，罗菲所称张曙光给其钱款数额的供述，不能相互印证，且现金非特定物，无证据证明罗菲用于买房的现金，就是张曙光给其的那笔特定的现金。债权与物权有别，即便要执行，也应当是追回钱款而非没收的该套房屋。此外，在罗菲受贿一案中，市高院终审裁定认定赃款、赃物已全部追缴到案，说明罗菲的其他财产应受到保护，法院也无任何理由执行罗菲的其他财产。二分检对罗菲的相关起诉书中，并没有指控罗菲名下的该套房产。罗菲还提出，作为独生子女，罗菲的父母不吝倾其所有积蓄、出资110余万元帮助女儿购买该套房屋，且一直居住在该房中，如果法院强制执行，则其父母在北京将没有地方居。综上，罗菲请求依法撤销二中院作出的执行裁定书，停止对涉案房产的执行。市高院认为，根据刑法第六十条规定，“犯罪分子违法所得的一切财物，应当予以追缴或者责令退赔，对被害人的合法财产，应当及时返还，违禁品和供犯罪所用的本人财物，应当予以没收，没收的财物和罚金，一律上缴国库，不得挪用和自行处理。”本案涉案房产系已经发生法律效力的二中院（2013）二中刑初字第1530号刑事判决特定物，列为“予以变价所得款予以没收”的扣押款物处理清单，明确作为在案扣押款物予以没收、上缴国库，超出犯罪所得部分作为张曙光的个人财产，并入没收个人全部财产项执行。案外人罗菲于执行程序中认为刑事裁判对涉案财物是否属于赃款赃物认定错误提出异议，实际上是对执行依据本身的异议，应当通过审判监督等程序解决。二中院认为罗某异议请求缺乏事实及法律依据，依法驳回其异议，并无不当，应予维持。2016年11月17日，市高院作出裁定，驳回罗菲的复议申请，维持二中院的执行裁定。",
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
      var gr=tu=temp=0;
      user.docs.push(newdoc._id)
      user.group.forEach(function(grp) {
        if (grp.groupName == req.body.docGroup){
          grp.groupFile.push(newdoc._id)
          tu=grp.groupFile.length-1
          gr=temp
        }
        temp++;
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