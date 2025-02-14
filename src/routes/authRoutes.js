const express = require("express");
const {login,signup,forgotPassword,resetPassword,resetToken} = require("../controllers/authController")

const routes = express.Router();
routes.get("/login",login);
routes.post("/signup",signup);
routes.post("/forgotpassword",forgotPassword);
routes.post("resetpassword",resetPassword);
routes.post("refreshToken",resetToken);

module.exports = routes;