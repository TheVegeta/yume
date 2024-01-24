const { App } = require("@ionited/fiber");

const app = new App();

app.get("/", (req, res) => res.end("Hello"));
app.get("/user/:id", (req, res) => res.end(req.params().id));

app.listen(3000);
