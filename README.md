# Endpoints

## For both users/distributors

- POST /users/signup
- POST /users/updateWallet

## For distributors

- POST /products/mine
- POST /products/:distributor
- POST /products/:distributor/:id/update

## For users

- GET /products/:distributor
- POST /products/:distributor/:id/buy
- POST /products/:distributor/:id/review
