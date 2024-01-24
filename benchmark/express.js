const express = require("express");

const app = express();

app.get("/", (req, res) => res.end("Hello"));
app.get("/user/:id", (req, res) => res.end(req.params.id));

app.listen(3000);
