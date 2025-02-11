/*
 * Title: User Handler
 * Description: Route Handler to handle user related routes
 * Author: Jubayer Alam Likhon
 * Date: 04/02/2025
 */

// dependencies
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ["get", "post", "put", "delete"];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._users[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
    const firstName =
        typeof requestProperties.body.firstName === "string" &&
            requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName =
        typeof requestProperties.body.lastName === "string" &&
            requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;
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
    const tosAgreement =
        typeof requestProperties.body.tosAgreement === "boolean" &&
            requestProperties.body.tosAgreement
            ? requestProperties.body.tosAgreement
            : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that the user does not already exist
        data.read("users", phone, (err1, user) => {
            if (err1) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                // store the user to db
                data.create("users", phone, userObject, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: "User was created successfully",
                        });
                    } else {
                        callback(500, {
                            error: "Could not create user",
                        });
                    }
                });
            } else {
                callback(500, {
                    error: "User already exist",
                });
            }
        });
    } else {
        callback(400, {
            error: "You have a problem in your request",
        });
    }
};

handler._users.get = (requestProperties, callback) => {
    // check the phone number if valid
    const phone =
        typeof requestProperties.queryStringObject.phone === "string" &&
            requestProperties.queryStringObject.phone.trim().length === 11
            ? requestProperties.queryStringObject.phone
            : false;
    if (phone) {
        // verify token
        const token =
            typeof requestProperties.headersObject.token === "string"
                ? requestProperties.headersObject.token
                : false;
        tokenHandler._token.verify(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // lookup the user
                data.read("users", phone, (err, user) => {
                    const userInfo = { ...parseJSON(user) };
                    if (!err && userInfo) {
                        delete userInfo.password;
                        callback(200, userInfo);
                    } else {
                        callback(404, {
                            error: "Requested user was not found",
                        });
                    }
                });
            } else {
                callback(403, {
                    error: "Authentication failed",
                });
            }
        });
    } else {
        callback(404, {
            error: "Requested user was not found",
        });
    }
};

handler._users.put = (requestProperties, callback) => {
    // check the phone number if valid
    const phone =
        typeof requestProperties.body.phone === "string" &&
            requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;
    // check for the optional fields
    const firstName =
        typeof requestProperties.body.firstName === "string" &&
            requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;
    const lastName =
        typeof requestProperties.body.lastName === "string" &&
            requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;
    const password =
        typeof requestProperties.body.password === "string" &&
            requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : false;

    if (phone) {
        // verify token
        const token =
            typeof requestProperties.headersObject.token === "string"
                ? requestProperties.headersObject.token
                : false;
        tokenHandler._token.verify(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                if (firstName || lastName || password) {
                    // lookup the user
                    data.read("users", phone, (err1, userData) => {
                        const userInfo = { ...parseJSON(userData) };
                        if (!err1 && userInfo) {
                            if (firstName) {
                                userInfo.firstName = firstName;
                            }
                            if (lastName) {
                                userInfo.lastName = lastName;
                            }
                            if (password) {
                                userInfo.password = hash(password);
                            }
                            // store the user to db
                            data.update("users", phone, userInfo, (err2) => {
                                if (!err2) {
                                    callback(200, {
                                        message: "User was updated successfully",
                                    });
                                } else {
                                    callback(500, {
                                        error: "Could not update user",
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                error: "You have a problem in your request",
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: "You must provide at least one field to update",
                    });
                }
            } else {
                callback(403, {
                    error: "Authentication failed",
                });
            }
        });
    } else {
        callback(400, {
            error: "Invalid Phone Number",
        });
    }
};

handler._users.delete = (requestProperties, callback) => {
    // check the phone number if valid
    const phone =
        typeof requestProperties.queryStringObject.phone === "string" &&
            requestProperties.queryStringObject.phone.trim().length === 11
            ? requestProperties.queryStringObject.phone
            : false;
    if (phone) {
        // verify token
        const token =
            typeof requestProperties.headersObject.token === "string"
                ? requestProperties.headersObject.token
                : false;
        tokenHandler._token.verify(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                data.read("users", phone, (err1, userData) => {
                    if (!err1 && userData) {
                        data.delete("users", phone, (err2) => {
                            if (!err2) {
                                callback(200, {
                                    message: "User was successfully deleted",
                                });
                            } else {
                                callback(500, {
                                    error: "Could not delete the specified user",
                                });
                            }
                        });
                    } else {
                        callback(500, {
                            error: "Could not find the specified user",
                        });
                    }
                });
            } else {
                callback(403, {
                    error: "Authentication failed",
                });
            }
        });
    } else {
        callback(400, {
            error: "Invalid Phone Number",
        });
    }
};

// export module
module.exports = handler;
