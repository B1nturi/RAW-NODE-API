/*
* Title: Uptime Monitoring Application
* Description: A RESTful API to monitor up or down time of user defined links
* Author: Jubayer Alam Likhon
* Date: 03/02/2024
*/

// Dependencies
const http = require('http');
const {handleReqRes} = require('./helpers/handleReqRes');

// app object - module scaffolding
const app = {};

// Configuration
app.config = {
  port: 3000,
};

// Create server
app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(app.config.port, () => {
    console.log(`Server is running on port ${app.config.port}`);
  });
};

// Handle Request Response
app.handleReqRes = handleReqRes;

// Start the server
app.createServer();