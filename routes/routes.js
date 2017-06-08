var express = require('express');
var router = express.Router();
var uploadController=require('../app/controllers/uploadController');
var Index= require('../app/controllers/Index')
var User =require('../app/controllers/user')

/* GET home page. */ 
router.get('/', Index.index);
router.post('/fileUpload',uploadController.dataInput);
// router.post('/mydoc',Index.mydoc);
// router.post('/event',Index.event);
// router.post('/geocode',Index.geocode);
// router.post('/updatexml',Index.updateXml);
// router.get('/download/:id',Index.download)
router.get('/edit',Index.edit)
router.post('/user/signup', User.signup)
router.post('/user/signin', User.signin)
router.get('/signin', User.showSignin)
router.get('/signup', User.showSignup)
router.get('/logout', User.logout)
router.get("/user/mygroup",User.usergroup)
router.post("/user/newgroup",User.postnewgroup)
router.post("/user/doc",User.doc)
router.post("/public/doc",User.publicDoc)
router.post("/edit/extract",Index.extract)
router.post("/edit/public/extract",Index.publicExtract)
router.post("/edit/eventinfo",Index.eventInfo)
// router.post("/edit/devide",uploadController.devide)
// router.post("/edit/reparse",uploadController.reparse)
router.get("/edit/downloadfile/:docid",uploadController.downloadFile)

module.exports = router;