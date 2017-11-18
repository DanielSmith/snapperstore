/*
**  api.js
*/

const express = require('express');
const ssconfig = require("./config.json");
const utils = require("./utils.js");

const { MediaProject } = require('./models/ssmodels');
var router = express.Router();
module.exports = router;


const multer  = require('multer');
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const checkTodayDir = utils.todayDir();
    utils.checkDir(checkTodayDir);
    cb(null, `public/uploads/${checkTodayDir}`)
  },
  filename: function (req, file, cb) {        
    let ext = utils.getExt(file);
    cb(null, utils.createUploadFilename(`.${ext}`));
  }
})

let multerUpload = multer({ storage: storage })
let uploadFile = multerUpload.single('thefile');

router.post('/gettags', function(req, res) {
  
  // const tq = req.body.tagquery;
  
  console.log(' in gett');
  console.log(req.body.tagquery);
  res.json({
    status: "ok"
  });
})

// this and addlink share the DB save code.. should refactor
router.post('/fileupload', uploadFile, function(req, res, next) {
  
  // are we using a database too?
  const theTags = JSON.parse(req.body.tags);
  
  
  console.log(theTags);
  console.log(theTags[1]);
  res.json({
    status: "ok"
  });
})


router.get('/')

