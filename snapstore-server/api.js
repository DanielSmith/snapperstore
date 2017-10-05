/*
**  api.js
*/

const path = require('path')
const express = require('express');
const router = express.Router();


const multer  = require('multer');
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, tttUtils.createUploadFilename('.png'));
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
  // const theContainer = req.body.container;
  // const url = "none";
  // const title = req.body.title;
  // const description = req.body.description;

  res.json({
    status: "ok"
  });
})



