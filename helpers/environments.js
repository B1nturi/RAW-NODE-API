/*
 * Title: Environments
 * Description: Handle all environment related things
 * Author: Jubayer Alam Likhon
 * Date: 04/02/2025
 */

// dependencies

// module scaffolding
const environments = {};

// Staging {default} environment
environments.staging = {
  port: 3000,
  envName: "staging",
  secretKey: "password",
  maxChecks: 5,
};

environments.production = {
  port: 5000,
  envName: "production",
  secretKey: "userSecretKey",
  maxChecks: 5,
};

// Determine which environment was passed
const currentEnvironment =
  typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging"; // default environment

// Export corresponding environment object
const environmentToExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : environments.staging; // default environment

// Export module
module.exports = environmentToExport;
