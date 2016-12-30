 var multer = require('multer');
 var fs = require('fs');
 var crypto=require('crypto')
 var storage = multer.diskStorage({
   //设置上传后文件路径，uploads文件夹会自动创建。
   destination: function(req, file, cb) {
     var dir = 'public/uploads/' + req.session.user._id
     if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir);
     }
     cb(null, dir)
   },
   //给上传文件重命名，获取添加后缀名
   filename: function(req, file, cb) {
    var sha1 = crypto.createHash('sha1');
    var fileFormat = (file.originalname).split(".");
    sha1.update(Date.now().toString()+fileFormat[0])
    cb(null, sha1.digest('hex')+ "." + fileFormat[fileFormat.length - 1]);
   }
 });
 //添加配置文件到muler对象。
 var upload = multer({
   storage: storage
 });

 //如需其他设置，请参考multer的limits,使用方法如下。
 //var upload = multer({
 //    storage: storage,
 //    limits:{}
 // });

 //导出对象
 module.exports = upload;