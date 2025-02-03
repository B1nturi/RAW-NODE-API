/*
* Title: Routes
* Description: Application Routes
* Author: Jubayer Alam Likhon
* Date: 03/02/2024
*/

// dependencies
const { sampleHandler } = require('./handlers/routesHandlers/sampleHandler');

const routes = {
    'sample': sampleHandler,
};

module.exports = routes;