'use strict';
const pug = require('pug');
const util = require('./handler-util');

function handle(req, res){

  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      res.end(pug.renderFile('./views/diaries.pug', {
        user: req.user
      }));
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

module.exports = {
  handle
};