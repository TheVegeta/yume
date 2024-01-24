const HyperExpress = require("hyper-express");
const webserver = new HyperExpress.Server();

webserver.get("/", (request, response) => {
  response.end("Hello");
});
webserver.get("/user/:id", (request, response) => {
  response.end(request.params.id);
});

webserver.listen(3000);
