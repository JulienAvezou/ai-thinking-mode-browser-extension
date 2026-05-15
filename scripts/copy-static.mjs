import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);

const copies = [
  ["src/manifest.json", "dist/manifest.json"],
  ["src/content/content.css", "dist/content/content.css"]
];

await Promise.all(
  copies.map(async ([from, to]) => {
    const target = resolve(root, to);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(resolve(root, from), target);
  })
);
