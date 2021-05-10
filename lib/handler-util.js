'use strict';
const fs = require('fs');
const crypto = require('crypto');

function handleLogout(req, res) {
  res.writeHead(401, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end('<!DOCTYPE html><html lang="jp"><body>' +
    '<h1>ログアウトしました</h1>' +
    '<a href="/posts">ログイン</h1>' +
    '</body></html>');
}

function handleNotFound(req, res) {
  res.writeHead(404, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('ページがみつかりません');
}

function handleBadRequest(req, res) {
  res.writeHead(400, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('未対応のリクエストです');
}

function handleFavicon(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/vnd.microsoft.icon'
  });
  const favicon = fs.readFileSync('./favicon.ico');
  res.end(favicon);
}

/**
 * Cookieに含まれているトラッキングIDに異常がなければその値を返し、
 * 存在しない場合や異常なものである場合には、再度作成しCookieに付与してその値を返す
 * @param {Cookeies} cookies
 * @param {String} userName
 * @return {String} トラッキングID
 */
function addTrackingCookie(cookies, userName) {
  const trackingIdKey = 'tracking_id';
  const requestedTrackingId = cookies.get(trackingIdKey);
  if (isValidTrackingId(requestedTrackingId, userName)) {
    return requestedTrackingId;
  } else {
    const originalId = parseInt(crypto.randomBytes(8).toString('hex'), 16);
    const tomorrow = new Date(new Date().getTime() + (1000 * 60 * 60 * 24));
    const trackingId = originalId + '_' + createValidHash(originalId, userName);
    cookies.set(trackingIdKey, trackingId, { expires: tomorrow });
    return trackingId;
  }
}

function isValidTrackingId(trackingId, userName) {
  if (!trackingId) {
    return false;
  }
  const spilited = trackingId.split('_');
  const originalId = spilited[0];
  const requestedHash = spilited[1];
  return createValidHash(originalId, userName) === requestedHash;
}


const secretKey =
  '5a69bb55532235125986a0df24aca759f69bae045c7a66d6e2bc4652e3efb43da4' +
  'd1256ca5ac705b9cf0eb2c6abb4adb78cba82f20596985c5216647ec218e84905a' +
  '9f668a6d3090653b3be84d46a7a4578194764d8306541c0411cb23fbdbd611b5e0' +
  'cd8fca86980a91d68dc05a3ac5fb52f16b33a6f3260c5a5eb88ffaee07774fe2c0' +
  '825c42fbba7c909e937a9f947d90ded280bb18f5b43659d6fa0521dbc72ecc9b4b' +
  'a7d958360c810dbd94bbfcfd80d0966e90906df302a870cdbffe655145cc4155a2' +
  '0d0d019b67899a912e0892630c0386829aa2c1f1237bf4f63d73711117410c2fc5' +
  '0c1472e87ecd6844d0805cd97c0ea8bbfbda507293beebc5d9';

function createValidHash(originalId, userName) {
  const sha1sum = crypto.createHash('sha1');
  sha1sum.update(originalId + userName + secretKey);
  return sha1sum.digest('hex');
}

module.exports = {
  handleLogout,
  handleNotFound,
  handleBadRequest,
  handleFavicon,
  addTrackingCookie
};