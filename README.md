# ms-login
#send-OTP
http://localhost:5000/api/auth/sendotp
{
    "firstName": "yesu",
    "lastName": "prabhu",
    "dob": "02-02-1990",
    "email": "dinesh.b@swipe2hire.com",
    "password": "Dinshi@123",
    "userType":"candidate"
}

#verify-OTP
http://localhost:5000/api/auth/verifyotp
{
   "email": "dinesh.b@swipe2hire.com",
   "otp":"tfayfr"
}

#login
http://localhost:5000/api/auth/login
{
    "email":"dinesh.b@swipe2hire.com",
    "password":"Dinshi@123"
}