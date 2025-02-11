/*
 * Title: Notifications Library
 * Description: Important functions for sending notifications to users
 * Author: Jubayer Alam Likhon
 * Date: 11/02/2025
 */

// dependencies
const https = require("https");
const querystring = require("querystring");
const { twilio } = require("./environments");

// module scaffolding
const notifications = {};

// send sms to user using twilio api
notifications.sendTwilioSms = (phone, msg, callback) => {
    // input validation
    const userPhone =
        typeof phone === "string" && phone.trim().length === 11
            ? phone.trim()
            : false;

    const userMsg =
        typeof msg === "string" && msg.trim().length <= 1600
            ? msg.trim()
            : false;

    if (userPhone && userMsg) {
        // configure the request payload
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        };

        // stringify the payload
        const stringPayload = querystring.stringify(payload);

        // configure the request details
        const requestDetails = {
            hostname: "api.twilio.com",
            method: "POST",
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
        };

        // instantiate the request object
        const req = https.request(requestDetails, (res) => {
            // get the status of the sent request
            const status = res.statusCode;
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`Status code returned was ${status}`);
            }
        });

        req.on("error", (e) => {
            callback(e);
        });

        req.write(stringPayload);
        req.end();
    } else {
        callback("Given parameters were missing or invalid!");
    }
};

// export module
module.exports = notifications;