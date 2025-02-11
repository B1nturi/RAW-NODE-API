/*
 * Title: Server Library
 * Description: Server related files
 * Author: Jubayer Alam Likhon
 * Date: 11/02/2025
 */

// Dependencies
const http = require("http");
const { handleReqRes } = require("../helpers/handleReqRes");
const environment = require("../helpers/environments");

// server object - module scaffolding
const server = {};

// Create server
server.createServer = () => {
  const cerateServerVariable = http.createServer(server.handleReqRes);
  cerateServerVariable.listen(environment.port, () => {
    console.log(`Server is running on port ${environment.port}`);
  });
};

// Handle Request Response
server.handleReqRes = handleReqRes;

// Start the server
server.init = () => {
  server.createServer();
};

// Export the module
module.exports = server;
