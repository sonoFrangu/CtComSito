import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const distDir = path.join(__dirname, "dist");

app.use(express.static(distDir));

const pages = ["index.html", "induno.html", "varese.html"];
pages.forEach((p) => {
  const route = p === "index.html" ? "/" : `/${p.replace(".html", "")}`;
  app.get(route, (req, res) => res.sendFile(path.join(distDir, p)));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server http://localhost:${port}`));