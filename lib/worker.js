/*
 * Title: Workers Library
 * Description: Worker related files
 * Author: Jubayer Alam Likhon
 * Date: 11/02/2025
 */

// Dependencies
const data = require("./data");
const { parseJSON } = require("../helpers/utilities");
const url = require("url");
const http = require("http");
const https = require("https");

// Worker object - module scaffolding
const worker = {};

// lookup all checks, get their data, send to a validator
worker.gatherAllChecks = () => {
    // get all the checks
    data.list("checks", (err1, checks) => {
        if (!err1 && checks && checks.length > 0) {
            checks.forEach((check) => {
                // read the check data
                data.read("checks", check, (err2, originalCheckData) => {
                    if (!err2 && originalCheckData) {
                        // pass the data to the check validator
                        worker.validateCheckData(parseJSON(originalCheckData));
                    } else {
                        console.log("Error reading one of the check data");
                    }
                });
            });
        } else {
            console.log("Error: Could not find any checks to process");
        }
    });
};

// validate individual check data
worker.validateCheckData = (originalCheckData) => {
    if (originalCheckData && originalCheckData.id) {
        originalCheckData.state =
            typeof originalCheckData.state === "string" &&
                ["up", "down"].indexOf(originalCheckData.state) > -1
                ? originalCheckData.state
                : "down";
        originalCheckData.lastChecked =
            typeof originalCheckData.lastChecked === "number" &&
                originalCheckData.lastChecked > 0
                ? originalCheckData.lastChecked
                : false;

        // pass the data to the next process
        worker.performCheck(originalCheckData);
    } else {
        console.log("Error: Check was invalid or not properly formatted");
    }
};

// perform check
worker.performCheck = (originalCheckData) => {
    // prepare the initial check outcome
    let checkOutcome = {
        error: false,
        responseCode: false,
    };
    // mark that the outcome has not been sent yet
    let outcomeSent = false;
    // parse the hostname & full url from the original check data
    const parsedUrl = url.parse(
        `${originalCheckData.protocol}://${originalCheckData.url}`,
        true
    );
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path; // using path not pathname because we want the query string

    // construct the request
    const requestDetails = {
        protocol: `${originalCheckData.protocol}:`,
        hostname: hostName,
        method: originalCheckData.method.toUpperCase(),
        path,
        timeout: originalCheckData.timeoutSeconds * 1000,
    };

    const protocolToUse = originalCheckData.protocol === "http" ? http : https;

    const req = protocolToUse.request(requestDetails, (res) => {
        // get the status of the sent request
        const status = res.statusCode;

        // update the check outcome and pass to next process
        checkOutcome.responseCode = status;
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.on("error", (e) => {
        checkOutcome = {
            error: true,
            value: e,
        };
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.on("timeout", () => {
        checkOutcome = {
            error: true,
            value: "timeout",
        };
        if (!outcomeSent) {
            worker.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }

    });

    req.end();
};

// process the check outcome, update the check data as needed, trigger an alert if needed
worker.processCheckOutcome = (originalCheckData, checkOutcome) => {
    // check if the check outcome is up or down
    const state =
        !checkOutcome.error &&
            checkOutcome.responseCode &&
            originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1
            ? "up"
            : "down";

    // decide whether to alert the user or not
    const alertWanted =
        originalCheckData.lastChecked && originalCheckData.state !== state
            ? true
            : false;

    // update the check data
    const newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // save the updates
    data.update("checks", newCheckData.id, newCheckData, (err) => {
        if (!err) {
            // send the check data to the next process
            if (alertWanted) {
                worker.alertUserToStatusChange(newCheckData);
            } else {
                console.log("Alert is not needed as there is no state change");
            }
        } else {
            console.log("Error: trying to save updates to one of the checks");
        }
    });
}

// alert the user as to a change in their check status
worker.alertUserToStatusChange = (newCheckData) => {
    const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${
        newCheckData.protocol
        }://${newCheckData.url} is currently ${newCheckData.state}`;
    // send the message as a text message
    console.log(msg);
};

// timer to execute the worker-process once per minute
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000 * 10);
};
// Start the worker
worker.init = () => {
    // execute all the checks
    worker.gatherAllChecks();

    // call the loop so the checks will execute later on
    worker.loop();
};

// Execute all the workers
worker.execute = () => { };

// Export the module
module.exports = worker;
