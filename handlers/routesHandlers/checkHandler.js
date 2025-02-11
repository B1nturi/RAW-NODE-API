/*
 * Title: Check Handler
 * Description: Handler to handle user defined checks
 * Author: Jubayer Alam Likhon
 * Date: 11/02/2025
 */

// dependencies
const data = require("../../lib/data");
const { parseJSON, createRamdomString } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");
const { maxChecks } = require("../../helpers/environments");

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ["get", "post", "put", "delete"];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    // validate inputs
    const protocol =
        typeof requestProperties.body.protocol === "string" &&
            ["http", "https"].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;
    const url =
        typeof requestProperties.body.url === "string" &&
            requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;
    const method =
        typeof requestProperties.body.method === "string" &&
            ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;
    const successCodes =
        typeof requestProperties.body.successCodes === "object" &&
            requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;
    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === "number" &&
            requestProperties.body.timeoutSeconds % 1 === 0 &&
            requestProperties.body.timeoutSeconds >= 1 &&
            requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;
    if (protocol && url && method && successCodes && timeoutSeconds) {
        // get the token from the headers
        const token =
            typeof requestProperties.headersObject.token === "string"
                ? requestProperties.headersObject.token
                : false;
        // lookup the user phone by reading the token
        data.read("tokens", token, (err1, tokenData) => {
            if (!err1 && tokenData) {
                const phone = parseJSON(tokenData).phone;
                // lookup the user data
                data.read("users", phone, (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandler._token.verify(token, phone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                const userObject = parseJSON(userData);
                                const userChecks =
                                    typeof userObject.checks === "object" &&
                                        userObject.checks instanceof Array
                                        ? userObject.checks
                                        : [];
                                if (userChecks.length < maxChecks) {
                                    const checkId = createRamdomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone: phone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };
                                    // save the object
                                    data.create("checks", checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            // add check id to the user's object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);
                                            // save the new user data
                                            data.update("users", phone, userObject, (err4) => {
                                                if (!err4) {
                                                    // return the data about the new check
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, {
                                                        error: "There was a problem in the server side",
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: "There was a problem in the server side",
                                            });
                                        }
                                    });
                                } else {
                                    callback(401, {
                                        error: "User has already reached max check limit",
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: "Authentication problem",
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: "User not found",
                        });
                    }
                });
            } else {
                callback(403, {
                    error: "Authentication problem",
                });
            }
        });
    } else {
        callback(400, {
            error: "You have a problem in your request",
        });
    }
};

handler._check.get = (requestProperties, callback) => {
    id =
        typeof requestProperties.queryStringObject.id === "string" &&
            requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if (id) {
        // lookup the check
        data.read("checks", id, (err, checkData) => {
            if (!err && checkData) {
                const check = { ...parseJSON(checkData) };
                // get the token from the headers
                const token =
                    typeof requestProperties.headersObject.token === "string"
                        ? requestProperties.headersObject.token
                        : false;
                // lookup the user phone by reading the token
                data.read("tokens", token, (err1, tokenData) => {
                    if (!err1 && tokenData) {
                        const phone = parseJSON(tokenData).phone;
                        // lookup the user data
                        data.read("users", phone, (err2, userData) => {
                            if (!err2 && userData) {
                                tokenHandler._token.verify(token, phone, (tokenIsValid) => {
                                    if (tokenIsValid) {
                                        if (phone === check.userPhone) {
                                            callback(200, check);
                                        } else {
                                            callback(403, {
                                                error: "Authentication problem",
                                            });
                                        }
                                    } else {
                                        callback(403, {
                                            error: "Authentication problem",
                                        });
                                    }
                                });
                            } else {
                                callback(403, {
                                    error: "User not found",
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: "Authentication problem",
                        });
                    }
                });
            } else {
                callback(500, {
                    error: "You have a problem in your request",
                });
            }
        });
    } else {
        callback(400, {
            error: "You have a problem in your request",
        });
    }

};

handler._check.put = (requestProperties, callback) => {
    id =
        typeof requestProperties.queryStringObject.id === "string" &&
            requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    const protocol =
        typeof requestProperties.body.protocol === "string" &&
            ["http", "https"].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;
    const url =
        typeof requestProperties.body.url === "string" &&
            requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;
    const method =
        typeof requestProperties.body.method === "string" &&
            ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;
    const successCodes =
        typeof requestProperties.body.successCodes === "object" &&
            requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;
    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === "number" &&
            requestProperties.body.timeoutSeconds % 1 === 0 &&
            requestProperties.body.timeoutSeconds >= 1 &&
            requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;
    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            data.read("checks", id, (err1, checkData) => {
                if(!err1 && checkData) {
                    const checkObject = parseJSON(checkData);
                    const token =
                        typeof requestProperties.headersObject.token === "string"
                            ? requestProperties.headersObject.token
                            : false;
                    data.read("tokens", token, (err2, tokenData) => {
                        if(!err2 && tokenData) {
                            const phone = parseJSON(tokenData).phone;
                            data.read("users", phone, (err3, userData) => {
                                if(!err3 && userData) {
                                    tokenHandler._token.verify(token, phone, (tokenIsValid) => {
                                        if(tokenIsValid) {
                                            if(phone === checkObject.userPhone) {
                                                if(protocol) {
                                                    checkObject.protocol = protocol;
                                                }
                                                if(url) {
                                                    checkObject.url = url;
                                                }
                                                if(method) {
                                                    checkObject.method = method;
                                                }
                                                if(successCodes) {
                                                    checkObject.successCodes = successCodes;
                                                }
                                                if(timeoutSeconds) {
                                                    checkObject.timeoutSeconds = timeoutSeconds;
                                                }
                                                // update the check
                                                data.update("checks", id, checkObject, (err4) => {
                                                    if(!err4) {
                                                        callback(200, checkObject);
                                                    } else {
                                                        callback(500, {
                                                            error: "There was a problem in the server side",
                                                        });
                                                    }
                                                });
                                            } else {
                                                callback(403, {
                                                    error: "Authentication problem",
                                                });
                                            }
                                        } else {
                                            callback(403, {
                                                error: "Authentication problem",
                                            });
                                        }
                                    });
                                } else {
                                    callback(403, {
                                        error: "User not found",
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                error: "Authentication problem",
                            });
                        }
                    });
                }

            });
        } else {
            callback(400, {
                error: "You must provide at least one field to update",
            });
        }
    } else {
        callback(400, {
            error: "You have a problem in your request",
        });
    }

};

handler._check.delete = (requestProperties, callback) => {
    id =
        typeof requestProperties.queryStringObject.id === "string" &&
            requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if (id) {
        // lookup the check
        data.read("checks", id, (err, checkData) => {
            if (!err && checkData) {
                const check = { ...parseJSON(checkData) };
                // get the token from the headers
                const token =
                    typeof requestProperties.headersObject.token === "string"
                        ? requestProperties.headersObject.token
                        : false;
                tokenHandler._token.verify(token, check.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        // delete the check data
                        data.delete("checks", id, (err1) => {
                            if (!err1) {
                                data.read("users", check.userPhone, (err2, userData) => {
                                    const user = { ...parseJSON(userData) };
                                    if (!err2 && userData) {
                                        const userChecks =
                                            typeof user.checks === "object" && user.checks instanceof Array
                                                ? user.checks
                                                : [];
                                        // remove the deleted check id from user's list of checks
                                        const checkIndex = userChecks.indexOf(id);
                                        if (checkIndex > -1) {
                                            userChecks.splice(checkIndex, 1);
                                            // resave the user data
                                            user.checks = userChecks;
                                            data.update("users", user.phone, user, (err3) => {
                                                if (!err3) {
                                                    callback(200, {
                                                        message: "Check was successfully deleted",
                                                    });
                                                } else {
                                                    callback(500, {
                                                        error: "There was a server side problem",
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: "The check id that you are trying to remove is not found in the user",
                                            });
                                        }
                                    } else {
                                        callback(500, {
                                            error: "There was a problem in the server side",
                                        });
                                    }
                                });
                            } else {
                                callback(500, {
                                    error: "There was a problem in the server side",
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: "Authentication problem",
                        });
                    }
                });
            } else {
                callback(500, {
                    error: "You have a problem in your request",
                });
            }
        });
    } else {
        callback(400, {
            error: "You have a problem in your request",
        });
    }

};

// export module
module.exports = handler;
