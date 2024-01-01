# Yume (夢)

> Yume is a lightweight web framework designed to build efficient API servers. It achieves this by leveraging the power of uWebSockets.js, a high-performance WebSocket library for Node.js.

## Documentation

- [Hello Yume (夢)](#hello-yume)
- [Applying middleware](#applying-middleware)
- [Dynamic Routes](#dynamic-routes)
- [Query Parameter](#query-parameter)
- [Multipart upload](#multipart-upload)
- [cors](#applying-cors)
- [Handling 404 route](#handling-404-route)
- [Handling globle error](#handling-globle-error)
- [GraphQL](#graphql)

### Hello Yume

```ts
const yume = new Yume();
const PORT = process.env.PORT || 8080;

yume.get("/", (req, res) => {
  res.json({ hello: "Yume 夢" });
});

yume.listen(8080, () => {
  console.log(`>started @${PORT}`);
});
```

### Applying middleware

```ts
yume.use((req, res, next) => {
  console.log("Hello from middleware");
  next();
});
```

### Dynamic Routes

```ts
yume.get("/post/:id", async (req, res) => {
  const { id } = req.getParams();
  return res.json({ id });
});
```

### Query Parameter

```ts
// ?page=2&limit=3
yume.get("/post", async (req, res) => {
  const { page, limit } = req.query();
  return res.json({ page, limit });
});
```

### Multipart upload

```ts
yume.post("/upload", async (req, res) => {
  const filesArray = await req.file();

  filesArray?.map((file: MultipartField) => {
    // do something magical
  });

  res.json({ status: true, msg: "file uploaded successfully", data: {} });
});
```

### cors

```ts
yume.use((req, res, next) => {
  const origin = "https://example.com";
  res.writeHeader("Access-Control-Allow-Origin", origin);
  res.writeHeader("Access-Control-Allow-Methods", "GET, POST");
  next();
});
```

### Handling 404 route

```ts
yume.notFound((req, res) => {
  res.status(404).end("Not found");
});
```

### Handling globle error

```ts
yume.error((err, req, res) => {
  console.error(err);
  res.status(500).end("Internal server error");
});
```

### GraphQL

```ts
const yume = new Yume();
const PORT = process.env.PORT || 8080;

const yoga = createYoga<IGqlContext>({
  schema,
});

yume.all("/graphql", async (req, res) => {
  const url = req.getUrl();
  const method = req.getMethod();
  const body = await req.body();

  const response = await yoga.fetch(
    url,
    {
      method: method,
      headers: req.headers,
      body: JSON.stringify(body),
    },
    { req, res }
  );

  return res.status(response.status).end(await response.text());
});

yume.listen(8080, () => {
  console.log(`>started ${PORT}`);
});
```

## License

Licensed under [MIT License](LICENSE).
