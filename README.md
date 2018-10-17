# shopping-cart-backend

An node api for CRUDing users and creating and processing a shopping cart

## Starting the app

If you are starting the app locally load your api key and token into enviroment variables and kick off the app with the `node index` command. Optionally you can add a runApp.sh bash script that will export your variables and kick off the node app like so.

```
#!/bin/bash

export STRIPE_API_KEY="sk_test_pJ6ovgqNLK2zzvOaHwjBgY23"
export STRIPE_TOKEN="tok_visa"

node index.js
```
