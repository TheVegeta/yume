## Yume (夢)

> Yume is a lightweight and exceptionally fast web framework specifically designed for building efficient API servers. It achieves this by leveraging the power of [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js), a high-performance WebSocket library for Node.js, and [regexparam](https://github.com/lukeed/regexparam), A tiny utility that converts route patterns into RegExp.

## Quick start

### Install with NPM

```bash
npm i yume-server
```

### Hello world

```js
import { Yume } from "yume-server";

const app = new Yume();
const PORT = 3000;

app.get("/", (req, res) => {
  res.json({ hello: "Yume 夢" });
});

app.listen(PORT, () => {
  console.log(`>started @${PORT}`);
});
```

## Basic

### Routing

```js

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

For more details, [see](https://github.com/lukeed/regexparam#usage).

### Request

#### Headers

```js
// return all the headers
app.get("/", (req, res) => {
  const headers = req.headers();
  return res.json({ success: true, headers });
});
```

#### Params

```js
// return all the params
app.get("/anime/:id", (req, res) => {
  const params = req.getParams<{ id: string }>();
  res.end(`GET /anime/${params?.id}`);
});
```

#### Query

```js
// ?page=2&limit=3
app.get("/post", async (req, res) => {
  const { page, limit } = req.query();
  return res.json({ page, limit });
});
```

#### Body

```js
// return all the body
app.post("/user", async (req, res) => {
  const body = await req.body();
  return res.json({ success: true, body });
});
```

#### Raw body

```js
// return all the body
app.post("/user", async (req, res) => {
  const body = await req.rawBody();
  return res.end(body);
});
```

Supported methods

- application/x-www-form-urlencoded
- application/json
- text/plain

## Thanks

- [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js)
- [regexparam](https://github.com/lukeed/regexparam)

## License

Licensed under [MIT License](https://github.com/TheVegeta/Yume/blob/main/LICENSE).
