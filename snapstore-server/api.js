/*
**  api.js
*/

const path = require('path')
const express = require('express');
const router = express.Router();
const utils = require("./utils.js");


const multer  = require('multer');
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const checkTodayDir = utils.todayDir();
    utils.checkDir(checkTodayDir);
    cb(null, `public/uploads/${checkTodayDir}`)
  },
  filename: function (req, file, cb) {
    cb(null, utils.createUploadFilename('.png'));
  }
})

let multerUpload = multer({ storage: storage })
let uploadFile = multerUpload.single('thefile');

const api = express();
const bodyParser = require("body-parser");

api.use(bodyParser.urlencoded({extended: false}));
api.use(bodyParser.json());

module.exports = router;


// this and addlink share the DB save code.. should refactor
router.post('/fileupload', uploadFile, function(req, res, next) {

  res.json({
    status: "ok"
  });
})

router.get('/')

