/*
 * Title: Utilities
 * Description: Important utility functions
 * Author: Jubayer Alam Likhon
 * Date: 04/02/2024
 */

// dependencies
const crypto = require("crypto");
const environments = require("./environments");

// module scaffolding
const utilities = {};

// parse JSON string to object
utilities.parseJSON = (jsonString) => {
    let output;
    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }
    return output;
};

// hash string
utilities.hash = (str) => {
    if (typeof str === "string" && str.length > 0) {
        const hash = crypto.createHmac("sha256", environments.secretKey)
            .update(str)
            .digest("hex");
        return hash;
    } else {
        return false;
    }
};


// module exports
module.exports = utilities;