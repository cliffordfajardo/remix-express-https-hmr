const path = require("path");
const fs = require("fs");
const https = require("https");
const { createRequestHandler } = require("@remix-run/express");
const { installGlobals, broadcastDevReady } = require("@remix-run/node");
const compression = require("compression");
const express = require("express");
const morgan = require("morgan");
const chokidar = require('chokidar');
const build = require('./build/index.js');
const BUILD_PATH = "./build/index.js";

installGlobals();


const app = express();
app.use(compression());
// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public/build", { immutable: true, maxAge: "1y" }));
app.use(morgan("tiny"));

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? createDevRequestHandler()
    : createRequestHandler({
        build,
        mode: process.env.NODE_ENV,
      })
);

const PORT = process.env.PORT || 15001;
const httpsServer = https.createServer({
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.cert'),
  rejectUnauthorized: false,
}, app).listen(PORT, () => {
    console.log(`Express server listening https://localhost:${PORT}`);

  if (process.env.NODE_ENV === "development") {
    // broadcastDevReady(build, `https://localhost:${PORT}`);
    broadcastDevReady(build,);
  }
});


function createDevRequestHandler() {
  // initial build
  /**
   * @type { import('@remix-run/node').ServerBuild | Promise<import('@remix-run/node').ServerBuild> }
   */
  let devBuild = build;

  const watcher = chokidar.watch(BUILD_PATH, { ignoreInitial: true });

  watcher.on("all", async () => {
    // 1. purge require cache && load updated server build
    const stat = fs.statSync(BUILD_PATH);
    devBuild = import(BUILD_PATH + "?t=" + stat.mtimeMs);
    // 2. tell dev server that this app server is now ready
    // broadcastDevReady(await devBuild, 'https://localhost:15001');
    broadcastDevReady(await devBuild);
  });

  return async (req, res, next) => {
    try {
      //
      return createRequestHandler({
        build: await devBuild,
        mode: "development",
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}