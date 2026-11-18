/**
 * 作者：邵玉紫檬
 * 建立时间：2026-11-13
 * 使用大模型：DeepSeek-V4.1-Flash
 * 功能名称：诗词数据服务器（端口 3004）
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3004;
const DB_PATH = path.join(__dirname, 'db.json');

// 读取 db.json 并解析成对象，供各接口共用
function readDb() {
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

// 读取 db.json 并解析，返回其中的 poems 数组
function readPoems() {
  const poems = readDb().poems;
  return Array.isArray(poems) ? poems : [];
}

// 读取 db.json 并解析，返回其中的 authors 作者数组
function readAuthors() {
  const authors = readDb().authors;
  return Array.isArray(authors) ? authors : [];
}

// 统一返回 JSON 响应，并带跨域头，便于 file:// 或其他端口页面调用
function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

// 创建 HTTP 服务：/api/poems 返回诗词数组，/db.json 返回原始数据文件
const server = http.createServer(function (req, res) {
  const url = (req.url || '/').split('?')[0];

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  if (url === '/api/poems') {
    try {
      sendJson(res, 200, readPoems());
    } catch (err) {
      sendJson(res, 500, { error: 'db.json 读取或解析失败', detail: err.message });
    }
    return;
  }

  if (url === '/api/authors') {
    try {
      sendJson(res, 200, readAuthors());
    } catch (err) {
      sendJson(res, 500, { error: 'db.json 读取或解析失败', detail: err.message });
    }
    return;
  }

  if (url === '/db.json') {
    fs.readFile(DB_PATH, function (err, buf) {
      if (err) {
        sendJson(res, 404, { error: 'db.json 不存在' });
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      });
      res.end(buf);
    });
    return;
  }

  sendJson(res, 404, { error: '接口不存在', usage: 'GET /api/poems' });
});

// 启动监听并打印可用地址
server.listen(PORT, function () {
  console.log('数据服务器已启动：http://127.0.0.1:' + PORT + '/api/poems');
});
