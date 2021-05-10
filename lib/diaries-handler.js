'use strict';
const crypto = require('crypto');
const pug = require('pug');
const Cookies = require('cookies');
const moment = require('moment-timezone');
const util = require('./handler-util');
const Diary = require('./diary');

const oneTimeTokenMap = new Map(); // キーをユーザー名、値をトークンとする連想配列

function handle(req, res){
  const cookies = new Cookies(req, res);
  const trackingId = util.addTrackingCookie(cookies, req.user);
  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      Diary.findAll({ order: [['id', 'DESC']] }).then((diaries) => {
        diaries.forEach((diary) => {
          diary.content = diary.content.replace(/\+/g, ' ');
          diary.formattedCreatedAt = moment(diary.formattedCreatedAt).tz('Asia/Tokyo').format('YYYY年MM月DD日 HH時mm分ss秒');
        });
        const oneTimeToken = crypto.randomBytes(8).toString('hex');
        oneTimeTokenMap.set(req.user, oneTimeToken);
        res.end(pug.renderFile('./views/diaries.pug', {
          diaries: diaries,
          user: req.user,
          oneTimeToken: oneTimeToken
        }));
      });
      break;
    case 'POST':
      let body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        const decoded = decodeURIComponent(body);
        const matchResult = decoded.match(/title=(.*)&content=(.*)&oneTimeToken=(.*)/);
        if (!matchResult) {
          console.log('調査1');
          util.handleBadRequest(req, res);
        } else {
          const title = matchResult[1];
          const content = matchResult[2];
          const requestedOneTimeToken = matchResult[3];
          if (oneTimeTokenMap.get(req.user) === requestedOneTimeToken) {
            console.info('投稿されました: ' + content);
            Diary.create({
              title: title,
              content: content,
              trackingCookie: trackingId,
              postedBy: req.user
            }).then(() => {
              oneTimeTokenMap.delete(req.user);
              handleRedirectDiaries(req, res);
            });
          } else {
            console.log('調査2');
            util.handleBadRequest(req, res);
          }
        }
      });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

function handleRedirectDiaries(req, res) {
  res.writeHead(303, {
    'Location': '/diaries'
  });
  res.end();
}

module.exports = {
  handle
};