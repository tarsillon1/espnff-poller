const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const functionsDir = `src`;
const outDir = `build`;

esbuild.build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  outdir: path.join(__dirname, outDir),
  outbase: functionsDir,
  platform: "node",
  sourcemap: "inline",
});
