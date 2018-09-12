/*
* Request handlers
*
*/

// Dependencies
const _data = require("./data");
const helpers = require("./helpers");
const config = require("./config");

// Define handlers
const handlers = {};

///////////////////////////
// Tokens
///////////////////////////
handlers.tokens = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];

  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the tokens submethods
handlers._tokens = {};

// Tokens - post
// Required data: email, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
  const email =
    typeof data.payload.email == "string" &&
    /\S+@\S+/.test(data.payload.email.trim()) &&
    data.payload.email.trim().length < 254
      ? data.payload.email.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (email && password) {
    // Look up the user who matches that email number
    _data.read("users", email.replace("@", "AT"), (err, data) => {
      if (!err && data) {
        // Hash the sent password and compare it to the password stored in the user object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword == data.hashedPassword) {
          // If valid create a new token with a random name. Set expiration date 1 hour into the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            email,
            id: tokenId,
            expires
          };

          // Store the token
          _data.create("tokens", tokenId, tokenObject, err => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              console.log("ID: ", tokenObject.id);
              callback(500, { Error: "Could not create the new token" });
            }
          });
        } else {
          callback(400, {
            Error: "Passwords did not match specified users stored password"
          });
        }
      } else {
        callback(400, { Error: " Could not find specified user" });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = (data, callback) => {
  // Check that the id is valid
  const id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // Lookup the user
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Tokens - put
// Required field: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
  const id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;
  const extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? true
      : false;

  if (id && extend) {
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        // Check to the make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          // Store the new updates
          _data.update("tokens", id, tokenData, err => {
            if (!err) {
              callback(200);
            } else {
              callback(500, {
                Error: "Could not update the token's expiration"
              });
            }
          });
        } else {
          callback(400, {
            Error: "The token has already expired and cannont be extended"
          });
        }
      } else {
        callback(400, { Error: "Specified token does not exist" });
      }
    });
  } else {
    callback(400, {
      Error: "Missing required field(s) or field(s) are invalid"
    });
  }
};

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
  // Check that id is valid
  // Check that the id is valid
  const id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // Lookup the user
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        _data.delete("tokens", id, err => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: "Could not delete specifed token" });
          }
        });
      } else {
        callback(400, { Error: "Could not find the specified token" });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, email, callback) => {
  // Lookup the token
  _data.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
      // Check that the token is for the given user and not expired
      if (tokenData.email == email && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

///////////////////////////
// Users
///////////////////////////
handlers.users = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];

  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, email, password, tosAgreement, address
// Optional data: none
handlers._users.post = (data, callback) => {
  // Check that all required fields are filled out
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const email =
    typeof data.payload.email == "string" &&
    /\S+@\S+/.test(data.payload.email.trim()) &&
    data.payload.email.trim().length < 254
      ? data.payload.email.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;
  const address =
    typeof data.payload.address == "string" &&
    data.payload.address.trim().length > 0
      ? data.payload.address.trim()
      : false;
  if (firstName && lastName && email && password && tosAgreement && address) {
    // Make sure that the user doesnt already exist
    _data.read("users", email.replace("@", "AT"), (err, data) => {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          // Create the user object
          const userObject = {
            firstName,
            lastName,
            email,
            hashedPassword,
            tosAgreement: true,
            address
          };

          // Store the user
          _data.create("users", email.replace("@", "AT"), userObject, err => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { Error: "Could not create the new user" });
            }
          });
        } else {
          callback(500, { Error: "Could not hash the user's password" });
        }
      } else {
        // User already exist
        callback(400, { Error: "A user with that email already exist" });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

// Users - get
// Required data: email
// Optional data: none
handlers._users.get = (data, callback) => {
  // Check that the email is valid
  const email =
    typeof data.queryStringObject.email == "string" &&
    /\S+@\S+/.test(data.queryStringObject.email.trim()) &&
    data.queryStringObject.email.trim().length < 254
      ? data.queryStringObject.email.trim()
      : false;
  if (email) {
    // Get the token from the headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;
    // Verify that the given token is valid for the email number
    handlers._tokens.verifyToken(token, email, tokenIsValid => {
      if (tokenIsValid) {
        // Lookup the user
        _data.read("users", email.replace("@", "AT"), (err, data) => {
          if (!err && data) {
            // Remove the hashed password from the user object before returning to the requester
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header or token is invalid"
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Users - put
// Required data: email
// Optional data: firstName, lastName, password (at least one must be specified)
handlers._users.put = (data, callback) => {
  // Check for the required field
  const email =
    typeof data.payload.email == "string" &&
    /\S+@\S+/.test(data.payload.email.trim()) &&
    data.payload.email.trim().length < 254
      ? data.payload.email.trim()
      : false;
  // Check for the optional fields
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  // Error if email is invalid
  if (email) {
    if (firstName || lastName || password) {
      // Get the token from the headers
      const token =
        typeof data.headers.token == "string" ? data.headers.token : false;
      // Verify that the given token is valid for the phone number
      handlers._tokens.verifyToken(token, email, tokenIsValid => {
        if (tokenIsValid) {
          // Look up user
          _data.read("users", email.replace("@", "AT"), (err, userData) => {
            if (!err && data) {
              // Update the fields necessary
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              // Store the new updates
              _data.update("users", email.replace("@", "AT"), userData, err => {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { Error: "Could not update the user" });
                }
              });
            } else {
              callback(400, { Error: "The specified user does not exist" });
            }
          });
        } else {
          callback(403, {
            Error: "Missing required token in header or token is invalid"
          });
        }
      });
    } else {
      callback(400, { Error: "Missing fields to update" });
    }
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Users - delete
// Required Field: email
handlers._users.delete = (data, callback) => {
  // Check that the email is valid
  const email =
    typeof data.queryStringObject.email == "string" &&
    /\S+@\S+/.test(data.queryStringObject.email.trim()) &&
    data.queryStringObject.email.trim().length < 254
      ? data.queryStringObject.email.trim()
      : false;

  // Error if email is invalid
  if (email) {
    // Get the token from the headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;
    // Verify that the given token is valid for the email number
    handlers._tokens.verifyToken(token, email, tokenIsValid => {
      if (tokenIsValid) {
        // Look up the user
        _data.read("users", email.replace("@", "AT"), (err, userData) => {
          if (!err && userData) {
            _data.delete("users", email.replace("@", "AT"), err => {
              if (!err) {
                // Delete the token object associated with user
                _data.delete("tokens", token, err => {
                  if (!err) {
                    callback(200);
                  } else {
                    console.log(
                      "Error deleting token associated with deleted user",
                      err
                    );
                  }
                });
              } else {
                callback(500, { Error: "Could not delete specified user" });
              }
            });
          } else {
            callback(400, { Error: "Could not find the specified user" });
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header or token is invalid"
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

///////////////////////////
// Menu Items
///////////////////////////
handlers.menu = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];

  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._menu[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
handlers._menu = {};

// menu - get
handlers._menu.get = (data, callback) => {
  // Get the token from the headers
  const token =
    typeof data.headers.token == "string" ? data.headers.token : false;

  // Get user email that belongs to the token
  _data.read("tokens", token, (err, tokenData) => {
    if (!err && tokenData) {
      // Verify that the given token is valid for the email
      handlers._tokens.verifyToken(token, tokenData.email, tokenIsValid => {
        if (tokenIsValid) {
          // Lookup the user
          _data.read("menu", "menu", (err, menuData) => {
            if (!err && menuData) {
              callback(200, menuData);
            } else {
              console.log("THIS BE YO ERROR SON! ", err);
              callback(404);
            }
          });
        } else {
          callback(403, {
            Error: "Missing required token in header or token is invalid"
          });
        }
      });
    } else {
      callback(400, { Error: "Could not find the specified token" });
    }
  });
};

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

// Export the module
module.exports = handlers;
