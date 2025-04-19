// server.ts (CJS 스타일로 수정)
const { createServer } = require('https');
const { readFileSync } = require('fs');
const next = require('next');

const port = 3001;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: readFileSync('./cert/localhost-key.pem'),
  cert: readFileSync('./cert/localhost.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`🚀 HTTPS server ready at https://localhost:${port}`);
  });
});
