/*
**  utils.js
*/

const uuid = require("node-uuid");
const datefns = require('date-fns');
const fs = require('fs');
const ROOT_UPLOAD_DIR = './uploads';

function checkDir(whichDir = '') {  

  const dir = `${ROOT_UPLOAD_DIR}/${whichDir}`;

  // in case we need the top level...
  if (!fs.existsSync(ROOT_UPLOAD_DIR)) {
      fs.mkdirSync(ROOT_UPLOAD_DIR);
  }
  if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
  }
}


function todayDir() {
  return  datefns.format(new Date(), 'YYYY-MM-DD');
}


function createUploadFilename(ext = '') {
  const ts = datefns.getTime(new Date());
  const unique = uuid.v4();

  return `${ts}-${unique}${ext}`;  
}


module.exports = {
  todayDir,
  checkDir,
  createUploadFilename
};