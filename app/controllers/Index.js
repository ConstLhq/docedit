var mongoose = require('mongoose')
var User = mongoose.model('User')
var Mydoc = mongoose.model('Doc')
var Event = mongoose.model('Event')

exports.index = function(req, res) {
    if (req.session.user) {
        res.render('index', {})
    } else {
        res.render('index', {})
    }
}
exports.edit = function(req, res) {
    User.findOne({
            _id: req.session.user._id
        })
        .populate("group.groupFile")
        .exec(function(err, exec_user) {
            // console.log(exec_user.group.groupFile)
            var treedata = new Array()
            exec_user.group.forEach(function(_group, gr) {
                treedata.push({
                    label: _group.groupName,
                    children: _group.groupFile.map(function(obj, tu) {
                        var child = new Object()
                        child.label = obj.originalName
                        child.parent = _group.groupName
                        child.docid = obj._id
                        child.type = obj.type
                        child.time = obj.referenceTime
                        child.grtu = [gr, tu]
                        return child
                    })
                })
            })
            res.render('edit', {
                userTreeData: JSON.stringify(treedata)
            })
        })
}
exports.extract = function(req, res) {

    Event.find({
            fromdoc: req.body.docid
        })
        .exec((err, e) => {
            var filter = req.body.filter
            var result = new Array()

            result = filter[0].keyword ? e.filter(function(events) {
                return events.content.indexOf(filter[0].keyword) > -1
            }) : e;
            for (var i = 1; i < filter.length; i++) {
                if (filter[i].logic == "or") {
                    var temp_result = e.filter(function(events) {
                        return events.content.indexOf(filter[i].keyword) > -1
                            //merge result and temp_result
                        temp_result.forEach(function(item) {
                            if (result.indexOf(item) == -1) {
                                result.push(item)
                            }
                        })
                    })
                }
                if (filter[i].logic == "and") {
                    result = result.filter(function(events) {
                        return events.content.indexOf(filter[i].keyword) > -1
                    })
                }
                if (filter[i].logic == "not") {
                    result = result.filter(function(events) {
                        return events.content.indexOf(filter[i].keyword) == -1
                    })
                }
            }
            //105.40661;28.89428

            res.json(result)

        })



}