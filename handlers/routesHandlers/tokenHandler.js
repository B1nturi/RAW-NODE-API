/*
 * Title: Token Handler
 * Description: Handle Token Related Routes
 * Author: Jubayer Alam Likhon
 * Date: 10/02/2025
 */

// dependencies
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { createRamdomString } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ["get", "post", "put", "delete"];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
}

handler._token = {};

handler._token.post = (requestProperties, callback) => {
    const phone =
        typeof requestProperties.body.phone === "string" &&
            requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;
    const password =
        typeof requestProperties.body.password === "string" &&
            requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : false;
    if (phone && password) {
        data.read("users", phone, (err1, userData) => {
            const hashedPassword = hash(password);
            if (hashedPassword === parseJSON(userData).password) {
                const tokenId = createRamdomString(20);
                const expires = Date.now() + 60 * 60 * 1000;
                const tokenObject = {
                    phone,
                    id: tokenId,
                    expires,
                };
                data.create("tokens", tokenId, tokenObject, (err2) => {
                    if (!err2) {
                        callback(200, tokenObject);
                    } else {
                        callback(500, {
                            error: "There was a problem in the server side",
                        });
                    }
                });
            } else {
                callback(400, {
                    error: "Password is not valid",
                });
            }
        })
    } else {
        callback(400, {
            error: "You have a problem in your request"
        });
    }
};

handler._token.get = (requestProperties, callback) => {
    // check the id number if valid
    const id =
        typeof requestProperties.queryStringObject.id === "string" &&
            requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if (id) {
        // lookup the token
        data.read("tokens", id, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };
            if (!err && token) {
                callback(200, token);
            } else {
                callback(404, {
                    error: "Requested token was not found",
                });
            }
        });
    } else {
        callback(404, {
            error: "Requested token was not found",
        });
    }
};

handler._token.put = (requestProperties, callback) => {
    // check the id number if valid
    const id =
        typeof requestProperties.body.id === "string" &&
            requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;
    const extend =
        typeof requestProperties.body.extend === "boolean" &&
            requestProperties.body.extend === true
            ? requestProperties.body.extend
            : false;
    if (id && extend) {
        // lookup the token
        data.read("tokens", id, (err1, tokenData) => {
            let token = { ...parseJSON(tokenData) };
            if (!err1 && token.expires > Date.now()) {
                token.expires = Date.now() + 60 * 60 * 1000;
                // store the updated token
                data.update("tokens", id, token, (err2) => {
                    if (!err2) {
                        callback(200);
                    } else {
                        callback(500, {
                            error: "There was a problem in the server side",
                        });
                    }
                });
            } else {
                callback(400, {
                    error: "Token already expired",
                });
            }
        });
    } else {
        callback(400, {
            error: "There was a problem in your request",
        });
    }
};

handler._token.delete = (requestProperties, callback) => {
    // check the id number if valid
    const id =
        typeof requestProperties.queryStringObject.id === "string" &&
            requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if (id) {
        // lookup the token
        data.read("tokens", id, (err1, tokenData) => {
            const token = { ...parseJSON(tokenData) };
            if (!err1 && token) {
                data.delete("tokens", id, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: "Token was successfully deleted",
                        });
                    } else {
                        callback(500, {
                            error: "There was a server side problem",
                        });
                    }
                });
                callback(200);
            } else {
                callback(404, {
                    error: "Requested token was not found",
                });
            }
        });
    } else {
        callback(404, {
            error: "Requested token was not found",
        });
    }
};

handler._token.verify = (id, phone, callback) => {
    data.read("tokens", id, (err, tokenData) => {
        if (!err && tokenData) {
            if (parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
}

// export module
module.exports = handler;
