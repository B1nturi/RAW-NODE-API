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

// create random string
utilities.createRamdomString = (strlength) => {
    let length = strlength;
    length = typeof strlength === "number" && strlength > 0 ? strlength : false;

    if (length) {
        const possibleCharacters = "abcdefghijklmnopqrstuvwxyz1234567890";
        let output = "";
        for (let i = 1; i <= length; i++) {
            const randomCharacter = possibleCharacters.charAt(
                Math.floor(Math.random() * possibleCharacters.length)
            );
            output += randomCharacter;
        }
        return output;
    }
};


// module exports
module.exports = utilities;