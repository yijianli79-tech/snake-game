const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT) || 5173;

const mimeByExt = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
};

function safePath(urlPath) {
  const normalized = path.normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, "");
  const target = path.join(root, normalized || "index.html");
  if (!target.startsWith(root)) {
    return null;
  }
  return target;
}

const server = http.createServer((req, res) => {
  const reqPath = req.url === "/" ? "/index.html" : req.url;
  const filePath = safePath(reqPath);

  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeByExt[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Snake dev server: http://localhost:${port}`);
});
