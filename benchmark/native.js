const http = require("http");

http
  .createServer((req, res) => {
    if (req.url === "/") return res.end("Hello");
    if (req.url.startsWith("/user/"))
      return res.end(req.url.substring("/user/".length));
  })
  .listen(3000);
