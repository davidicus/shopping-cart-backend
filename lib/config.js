/*
* Create and export configuration variables
*
*/

// Dependenies
const env = require("../.env");

// Container for all the environments
const environments = {};

// Staging (default) environment
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging",
  hashingSecret: "thisIsASecret",
  stripeApiKey: env.staging.stripeApiKey,
  stripeToken: env.staging.stripeToken
};

// Production environment
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: "thisIsAlsoASecret",
  stripeApiKey: env.prod.stripeApiKey,
  stripeToken: env.prod.stripeToken
};

// Determine which environment was passed as a command-line argument
const currentEnvironment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";

// CHeck that the current environment is one of hte environmnets above, if not defaut to staging
const environmentToExport =
  typeof environments[currentEnvironment] == "object"
    ? environments[currentEnvironment]
    : environments.staging;

// export the module
module.exports = environmentToExport;
