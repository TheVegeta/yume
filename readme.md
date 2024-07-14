# Yume (夢)

> Yume is a lightweight and exceptionally fast web framework specifically designed for building efficient API servers. It achieves this by leveraging the power of [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js), a high-performance WebSocket library for Node.js, and [regexparam](https://github.com/lukeed/regexparam), A tiny utility that converts route patterns into RegExp.

> [!WARNING]  
> This project is not meant for production or any serious projects

## Quick start

### Install with NPM

```ts
npm i yume-server
```

### Hello World

```ts
import { Yume } from "yume-server";

const app = new Yume();
const PORT = 3000;

app.get("/", (req, res) => {
  res.json({ hello: "bye" });
});

app.listen(PORT, () => {
  console.log(`> started @${PORT}`);
});
```

## Basic

### Routing

```ts
// HTTP methods
app.get("/", (req, res) => res.end("GET /"));

app.post("/", (req, res) => res.end("POST /"));

app.put("/", (req, res) => res.end("PUT /"));

app.del("/", (req, res) => res.end("DELETE /"));

// All methods
app.all("/", (req, res) => res.end("All /"));

// Dynamics routes
app.get("/anime/:id", (req, res) => {
  const params = req.getParams<{ id: string }>();
  res.end(`GET /anime/${params?.id}`);
});

app.get("/anime/:studio/:year", (req, res) => {
  const params = req.getParams<{ studio: string; year: string }>();
  res.end(`GET /anime/${params?.studio}/${params?.year}`);
});

// Wildcard
app.get("/users/*", (req, res) => res.end(`GET /users/*`));
```

For more details, [https://github.com/lukeed/regexparam](https://github.com/lukeed/regexparam#usage).

### cors

```ts
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set(
    "Access-Control-Allow-Headers",
    "origin, content-type, accept, x-requested-with"
  );
  res.set("Access-Control-Max-Age", "3600");
  next();
});
```

### Request

#### getBody

```ts
app.post("/", async (req, res) => {
  const { anime } = await req.getBody(); // { anime: 'kuzu no honkai' }
  res.json({ success: true });
});
```

#### getFile

```ts
app.post("/", async (req, res) => {
  const file = await req.getFile();
  res.json({ success: true });
});
```

#### getQuery

```ts
// http://localhost:3000/anime?name=Kuzu_no_Honkai
app.get("/anime", (req, res) => {
  const query = req.getQuery(); // { name: 'Kuzu_no_Honkai' }
  res.json({ hello: "bye" });
});
```

#### getParams

```ts
//localhost:3000/anime/32949/Kuzu_no_Honkai
http: app.get("/anime/:id/:slug", (req, res) => {
  const param = req.getParams(); // { id: '32949', slug: 'Kuzu_no_Honkai' }
  res.json({ hello: "bye" });
});
```

#### getHeaders

```ts
app.get("/", (req, res) => {
  const headers = req.getHeaders(); // will give you all headers
  res.json({ hello: "bye" });
});
```

### Response

#### send

```ts
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
```

#### json

```ts
app.get("/", (req, res) => {
  res.json({ name: "Kuzu_no_Honkai" });
});
```

#### render

```ts
app.get("/", (req, res) => {
  res.render("<h1>Hello, World!</h1>");
});
```

#### redirect

```ts
app.get("/", (req, res) => {
  res.redirect("https://myanimelist.net/anime/32949/Kuzu_no_Honkai");
});
```

#### status

```ts
app.get("/", (req, res) => {
  res.status(200).json({ success: true });
});
```

#### sendFile

```ts
app.get("/anime/Kuzu_no_Honkai.jpg", (req, res) => {
  const filepath = path.resolve(process.cwd() + "/upload/Kuzu_no_Honkai.jpg");
  res.sendFile(filepath);
});
```

#### set

```ts
app.get("/", (req, res) => {
  res.set("X-Custom-Header", "value").json({ success: true });
});
```

## License

Licensed under [MIT License](LICENSE).
