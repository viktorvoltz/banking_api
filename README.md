# Documentation

## dependencies

npm i bcrypt dotenv express jsonwebtoken mongoose morgan

npm install --save-dev nodemon

## setup
setup a .env file and initialize PORT, MONGODB_URI, JWT_SECRETKEY

## to run

npm start

## features

USERS CAN;
Login
Deposit
Withdraw
Transfer to other users
See transaction record

ADMIN CAN;
Add users
Delete users
Reverse transaction
Disable a user account

## endpoints
to test connection to network and database.

GET: http://localhost:PORT/ping

## user signin
signin an already registered user, provide email, and password.

POST: http://localhost:PORT/auth/signin

## user account endpoints
*to let a user create a bank account. user provides an account_name and account_pin.

POST: http://localhost:PORT/account/create

*depositing money into an account. user to provide _id of their account in the request parameter 
and money value to the key parameter - account_balance in request body.

PATCH: http://localhost:PORT/account/deposit/:_id

*withdrawing money from an account. user to provide _id of their account in the request parameter 
and money value to the key parameter - account_balance in request body.

PATCH: http://localhost:PORT/account/withdraw/:_id

*transfering money; user passes their account id in the otherID request parameter, the _id of the account
they wish to send the money to and the amount value from the account_balance both in the request body

PATCH: http://localhost:PORT/account/transfer/:otherID

transaction records; user passes their account id to see transaction records

POST: http://localhost:PORT/transaction-records

## admin endpoints

for admin signup and signin, admin provides email and password.

POST: http://localhost:PORT/admin/signup

POST: http://localhost:PORT/admin/signin

*ONLY and admin can create a user. to create a user, admin enters personal secret id, then email, password, fullname for the user.

POST: http://localhost:PORT/admin/create-user

*delete user. admin enters personal id in request body and passes the desired userId in the request parameters.

DELETE: http://localhost:PORT/delete-user/:userId

*reversing transfer. admin enters personal id in request body, passes otherID of account to take money from (in request parameter), 
_id of account to deposit money into and amount to transfer in requeest body.

PATCH: http://localhost:PORT/transfer/:otherID

*disable user account. admin enters personal id in request body, passes id of account to disable in request parameter,
then boolean (true/false) to the Acc_isActive key in request body.

PATCH: http://localhost:PORT/disable-account/:id

## endpoints marked * require authorization therefore the correct token of user or admin should be passed into the authorization header.
