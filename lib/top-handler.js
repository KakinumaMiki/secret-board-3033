'use strict';
const pug = require('pug');
const util = require('./handler-util');
const Post = require('./post');
const moment = require('moment-timezone');


function handle(req, res){

  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      Post.findAll({
        limit: 3,
        order: [['id', 'DESC']]
      }).then((posts) =>{
        posts.forEach((post) => {
          post.content = post.content.replace(/\+/g, ' ');
          post.formattedCreatedAt = moment(post.createdAt).tz('Asia/Tokyo').format('YYYY年MM月DD日 HH時mm分ss秒');
        });
        res.end(pug.renderFile('./views/top.pug', {
          posts: posts,
          user: req.user
        }));
      });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

module.exports = {
  handle
};