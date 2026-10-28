import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("out");
const basePath = (process.env.SITE_BASE_PATH || "").replace(/\/$/, "");
if (basePath && !/^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(basePath)) {
  console.error("SITE_BASE_PATH deve ser um caminho como /lubyanka.");
  process.exit(1);
}
try {
  await stat(resolve(root, "index.html"));
} catch {
  console.error("Execute npm run build antes de npm start.");
  process.exit(1);
}
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
};
createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405);
    res.end();
    return;
  }
  try {
    let pathname = decodeURIComponent(
      new URL(req.url, "http://local").pathname,
    );
    if (basePath) {
      if (pathname === basePath) {
        res.writeHead(308, { Location: `${basePath}/` });
        res.end();
        return;
      }
      if (!pathname.startsWith(`${basePath}/`)) {
        res.writeHead(404);
        res.end();
        return;
      }
      pathname = pathname.slice(basePath.length);
    }
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Arquivo não encontrado.");
  }
}).listen(Number(process.env.PORT || 3000), "0.0.0.0", () =>
  console.log(
    "Lubyanka: arquivos estáticos disponíveis na porta " +
      (process.env.PORT || 3000),
  ),
);
