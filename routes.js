/*
 * Title: Routes
 * Description: Application Routes
 * Author: Jubayer Alam Likhon
 * Date: 03/02/2025
 */

// dependencies
const { sampleHandler } = require("./handlers/routesHandlers/sampleHandler");
const { userHandler } = require("./handlers/routesHandlers/userHandler");
const { tokenHandler } = require("./handlers/routesHandlers/tokenHandler");
const { checkHandler } = require("./handlers/routesHandlers/checkHandler");

const routes = {
  sample: sampleHandler,
  user: userHandler,
  token: tokenHandler,
  check: checkHandler,
};

module.exports = routes;
