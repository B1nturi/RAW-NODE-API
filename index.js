/*
 * Title: Project Initial File
 * Description: Initial file to start the node server and workers
 * Author: Jubayer Alam Likhon
 * Date: 03/02/2025
 */

// Dependencies
const server = require("./lib/server");
const worker = require("./lib/worker");

// app object - module scaffolding
const app = {};

app.init = () => {
  // Start the server
  server.createServer();

  // Start the workers
  worker.init();
};

app.init();

// Export the app
module.exports = app;
