/*
**  utils.js
*/

const uuid = require("node-uuid");
const datefns = require('date-fns');
const fs = require('fs');
const { join } = require('path')
const ROOT_UPLOAD_DIR = './public/uploads';

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


function getDirs() {  

  // a little long winded, just for clarity
  const entries = fs.readdirSync(ROOT_UPLOAD_DIR)
  let dirEntries = [];

  entries.map(file => {
    if (fs.lstatSync(`${ROOT_UPLOAD_DIR}/${file}`).isDirectory() && file[0] !== '.') {
      dirEntries.push(file);
    }
  });

  return dirEntries;
}

function getImages(dir = '') {
  let imageDir;
  let entries = [];

  // if we dont have a directory specified, try today... 
  if (dir === '') {
    dir = todayDir();
  }

  // sanitize path .. seriously..
  // who knows what they they sent over? ;)
  dir = dir.replace(/[^a-zA-Z0-9-]/g, '');
  imageDir = `${ROOT_UPLOAD_DIR}/${dir}`;
 
  if (fs.existsSync(imageDir)) {
    entries = fs.readdirSync(imageDir);
  }
  return entries;
}

function createUploadFilename(ext = '') {
  const ts = datefns.getTime(new Date());
  const unique = uuid.v4();

  return `${ts}-${unique}${ext}`;  
}


module.exports = {
  todayDir,
  checkDir,
  getDirs,
  getImages,
  createUploadFilename
};