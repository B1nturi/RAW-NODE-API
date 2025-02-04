/*
 * Title: Sample Handler
 * Description: Sample Handler
 * Author: Jubayer Alam Likhon
 * Date: 03/02/2024
 */

// module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
  console.log(requestProperties);

  callback(200, {
    message: "This is a sample url",
  });
};

module.exports = handler;
