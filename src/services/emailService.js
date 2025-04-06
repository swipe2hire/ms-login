const nodemailer = require("nodemailer");
const config = require("../../config");


const transporter = nodemailer.createTransport({
    host: config.EmailHost,
    port: config.EmailPort,
    auth: {
        user: config.Email,
        pass: config.EmailPassword
    }
});

const sendOTPEmail = async(email,otp) => {
    const mailOption = {
        from: config.Email,
        to: email,
        subject: "Your OTP for signup to swipe2hire",
        text: `Your OTP for signup is: ${otp}. It is valid for 10 minutes.`
    }

    try{
        await transporter.sendMail(mailOption);
        return {sucess: true}

    }catch(error) {
        return { success: false, error: error.message };
    }
}


module.exports = {sendOTPEmail}
