/*
 * Title: Handle Request Response
 * Description: Handle Request Response
 * Author: Jubayer Alam Likhon
 * Date: 03/02/2024
 */

// dependencies
const url = require("url");
const { StringDecoder } = require("string_decoder");
const routes = require("../routes");
const { notFoundHandler } = require("../handlers/routesHandlers/notFoundHandler");
const { parseJSON } = require("../helpers/utilities");

// moudule scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
  //Get the URL and parse it
  const parsedUrl = url.parse(req.url, true);

  //Get the path
  const path = parsedUrl.pathname;

  //Trim the path
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  //Get the HTTP method
  const method = req.method.toLowerCase();

  //Get the query string as an object
  const queryStringObject = parsedUrl.query;

  //Get the headers as an object
  const headersObject = req.headers;

  //Request properties
  const requestProperties = {
    parsedUrl,
    path,
    trimmedPath,
    method,
    queryStringObject,
    headersObject,
  };

  //Get the payload, if any
  const decoder = new StringDecoder("utf-8");
  let realData = "";

  const chosenHandler = routes[trimmedPath]
    ? routes[trimmedPath]
    : notFoundHandler;

  req.on("data", (buffer) => {
    realData += decoder.write(buffer);
  });

  req.on("end", () => {
    realData += decoder.end();

    requestProperties.body = parseJSON(realData);

    //console.log(realData);
    chosenHandler(requestProperties, (statusCode, payload) => {
      statusCode = typeof statusCode === "number" ? statusCode : 500;
      payload = typeof payload === "object" ? payload : {};

      const payloadString = JSON.stringify(payload);

      //Return the response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);
    });

    //Response handling
    //res.end("Hello World");
  });
};

module.exports = handler;
