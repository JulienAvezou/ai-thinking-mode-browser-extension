import { copyFile, cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);

const fileCopies = [
  ["src/manifest.json", "dist/manifest.json"],
  ["src/content/content.css", "dist/content/content.css"]
];

await Promise.all(
  fileCopies.map(async ([from, to]) => {
    const target = resolve(root, to);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(resolve(root, from), target);
  })
);

await cp(resolve(root, "src/icons"), resolve(root, "dist/icons"), {
  recursive: true
});
