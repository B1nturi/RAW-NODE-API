/*
 * Title: User Handler
 * Description: Route Handler to handle user related routes
 * Author: Jubayer Alam Likhon
 * Date: 04/02/2024
 */

// dependencies
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");

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
    };
};

handler._users.get = (requestProperties, callback) => {
    // check the phone number if valid
    const phone =
        typeof requestProperties.queryStringObject.phone === "string" &&
            requestProperties.queryStringObject.phone.trim().length === 11
            ? requestProperties.queryStringObject.phone
            : false;
    if (phone) {
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
        callback(404, {
            error: "Requested user was not found",
        });
    }
};

handler._users.put = (requestProperties, callback) => {
    callback(200, {
        message: "This is a put request",
    });
};

handler._users.delete = (requestProperties, callback) => {
    callback(200, {
        message: "This is a delete request",
    });
};


// export module
module.exports = handler;
