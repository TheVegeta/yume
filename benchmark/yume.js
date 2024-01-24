const { Yume } = require("yume-server");

const yume = new Yume();

yume.get("/", (req, res) => {
  res.end("Hello");
});
yume.get("/user/:id", (req, res) => {
  res.end(req.getParams().id);
});

yume.listen(3000, () => {
  console.log(`>started @${3000}`);
});
