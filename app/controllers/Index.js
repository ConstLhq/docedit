const User = require('../models/User')
const Event = require('../models/Event')
const Docown = require('../models/Docown')
const Folder = require('../models/Folder')
const Docpub = require('../models/Docpub')
const Eventpub = require("../models/Eventpub")


// DocPrivate.sync({force: true});

// var Folder = require('../models/Folder')
exports.index = function(req, res) {
    if (req.session.user) {
        res.render('index', {})
    } else {
        res.render('index', {})
    }
}
exports.edit = function(req, res) {
    (async() => {
        // console.log(req.session.user._id)
        // console.log(req.session.user)
        var user = await User.findOne({
            where: {
                id: req.session.user.id
            },include:[{model:Folder,as: 'folders',include:[{model:Docown,as:"docs"}]}]
        });
        if (user) {
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
            res.render('edit', {
                userTreeData: JSON.stringify(treedata)
            })
        } else {
            res.redirect('/login')
        }
    })()
}
exports.extract = function(req, res) {

    (async()=>{
        var events = await Event.findAll({
            where :{
                docownId:req.body.docid
            }
        })

        var filter = req.body.filter
        var result = new Array()
        result = filter[0].keyword ? events.filter(function(event) {
            return event.content.indexOf(filter[0].keyword) > -1
        }) : events;
        for (var i = 1; i < filter.length; i++) {
            if (filter[i].logic == "or") {
                var temp_result = events.filter(function(event) {
                    return event.content.indexOf(filter[i].keyword) > -1
                        //merge result and temp_result
                    temp_result.forEach(function(item) {
                        if (result.indexOf(item) == -1) {
                            result.push(item)
                        }
                    })
                })
            }
            if (filter[i].logic == "and") {
                result = result.filter(function(event) {
                    return event.content.indexOf(filter[i].keyword) > -1
                })
            }
            if (filter[i].logic == "not") {
                result = result.filter(function(event) {
                    return event.content.indexOf(filter[i].keyword) == -1
                })
            }
        }
        res.json(result)
    })()
}

exports.publicExtract = function(req, res) {

    (async()=>{
        var events = await Eventpub.findAll({
            where :{
                docownId:req.body.docid
            }
        })

        var filter = req.body.filter
        var result = new Array()
        result = filter[0].keyword ? events.filter(function(event) {
            return event.content.indexOf(filter[0].keyword) > -1
        }) : events;
        for (var i = 1; i < filter.length; i++) {
            if (filter[i].logic == "or") {
                var temp_result = events.filter(function(event) {
                    return event.content.indexOf(filter[i].keyword) > -1
                        //merge result and temp_result
                    temp_result.forEach(function(item) {
                        if (result.indexOf(item) == -1) {
                            result.push(item)
                        }
                    })
                })
            }
            if (filter[i].logic == "and") {
                result = result.filter(function(event) {
                    return event.content.indexOf(filter[i].keyword) > -1
                })
            }
            if (filter[i].logic == "not") {
                result = result.filter(function(event) {
                    return event.content.indexOf(filter[i].keyword) == -1
                })
            }
        }
        res.json(result)
        

    })()
}

exports.eventInfo = function(req,res){
    //只需要返回 事件内容和 文档 id
    (async()=>{
        var event = await Event.findById(req.body.eventid)
    res.json({"time":event.timehint ,"lochint":event.lochint,"content":event.content,docid:event.docownId})
})()
}
