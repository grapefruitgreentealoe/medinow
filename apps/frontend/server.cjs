const http = require('http');
const { parse } = require('url');
const next = require('next');
const https = require('https');
const fs = require('fs');

const { readFileSync } = fs;

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = 3000;

const httpsOptions = {
  key: readFileSync('./cert/localhost-key.pem'),
  cert: readFileSync('./cert/localhost.pem'),
};

app.prepare().then(() => {
  http
    .createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      console.log(headers);
      console.log('🍪 [HTTP] 쿠키:', req.headers.cookie); // <- 여기!
      handle(req, res, parsedUrl);
    })
    .listen(PORT, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${PORT}`);
    });

  https
    .createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      const cookies = req.headers.cookie || '';
      const filtered = cookies
        .split('; ')
        .filter((c) => !c.startsWith('__next_hmr_refresh_hash__='))
        .join('; ');
      req.headers.cookie = filtered;

      handle(req, res, parsedUrl);
    })
    .listen(PORT + 1, (err) => {
      if (err) throw err;
      console.log(`> HTTPS: Ready on https://localhost:${PORT + 1}`);
    });
});
