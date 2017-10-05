/*
**  router.js
*/

const uuid = require("node-uuid");
const express = require('express');
const app = express.Router();
module.exports = app;

app.use(express.static('uploads'));

app.get('/:day', function(req, res, next) {
  console.dir(req.params);
  next();
});

// list all days
app.get('/', function(req, res) {

  return res.status(200);
})