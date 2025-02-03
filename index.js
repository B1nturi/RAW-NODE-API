/*
* Title: Uptime Monitoring Application
* Description: A RESTful API to monitor up or down time of user defined links
* Author: Jubayer Alam Likhon
* Date: 03/02/2024
*/

// Dependencies
const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');

// app object - module scaffolding
const app = {};

// Configuration
app.config = {
  port: 3000,
};

// Create server
app.createServer = () => {
  const server = http.createServer(app.handleRequest);
  server.listen(app.config.port, () => {
    console.log(`Server is running on port ${app.config.port}`);
  });
};

// Handle Request Response
app.handleRequest = (req, res) => {

  //Get the URL and parse it
  const parsedUrl = url.parse(req.url, true);

  //Get the path
  const path = parsedUrl.pathname;

  //Trim the path
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  //Get the HTTP method
  const method = req.method.toLowerCase();

  //Get the query string as an object
  const queryStringObject = parsedUrl.query;

  //Get the headers as an object
  const headersObject = req.headers;

  //Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let realData = '';

  req.on('data', (buffer) => {
    realData += decoder.write(buffer);
  });

  req.on('end', () => {
    realData += decoder.end();
    
    console.log(realData);

    //Response handling
    res.end('Hello World');
  });
  
};

// Start the server
app.createServer();