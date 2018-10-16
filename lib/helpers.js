/*
* Helpers for various task
*
*/

// Dependencies
const crypto = require("crypto");
const querystring = require("querystring");
const https = require("https");
const _data = require("./data");
const config = require("./config");

// Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = str => {
  if (typeof str == "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

// Parse a JSON string to an object in all cases without throwing
helpers.parseJsonToObject = str => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

// Create a string of random alphanumeric characters of a given length
helpers.createRandomString = strLength => {
  strLength = typeof strLength == "number" && strLength > 0 ? strLength : false;
  if (strLength) {
    // Define all the possible characters that could go into a string
    const possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";

    // Start the final string
    let str = "";

    for (i = 1; i <= strLength; i++) {
      // Get a random charcter from the possibleCharacters string
      const randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      // Append this character to the final string
      str += randomCharacter;
    }

    // Return the final string
    return str;
  } else {
    return false;
  }
};

// @TODO: Get rid of extra callback for errors
helpers.createStripeCharge = (requestData, callback) => {
  const payload = {
    amount: requestData.amount,
    source: requestData.source,
    description: requestData.description,
    currency: requestData.currency
  };
  // Stringify the payload
  const stringPayload = querystring.stringify(payload);

  // Configure the request details
  const requestDetails = {
    protocol: "https:",
    method: "POST",
    hostname: "api.stripe.com",
    path: "/v1/charges",
    auth: config.stripeApiKey,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(stringPayload)
    }
  };

  // Instantiate the request object
  const req = https.request(requestDetails, res => {
    // Grab the status of the sent request
    const status = res.statusCode;
    try {
      // Callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        // console.log("Status code returned was ", status);
        callback("Status code returned was " + status);
      }
    } catch (err) {
      console.log(err);
    }
  });

  // Bind to the error event so it doesn't get thrown
  req.on("error", e => {
    callback(e);
  });

  // Add the payload
  req.write(stringPayload);

  // End the request
  req.end();
};

helpers.sendEmailReceipt = () => {
  console.log("Sending Email");
};

// export the module
module.exports = helpers;
