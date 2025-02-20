const express = require("express");
const {login,signup, sendotp,verifyotp,resetPassword} = require("../controllers/authController")

const routes = express.Router();
routes.post("/login",login);
routes.post("/signup",signup);
//routes.post("/forgotpassword",forgotPassword);
routes.post("/resetpassword",resetPassword);
routes.post("/sendotp",sendotp)
routes.post("/verifyotp",verifyotp)
//routes.post("refreshToken",resetToken);

module.exports = routes;