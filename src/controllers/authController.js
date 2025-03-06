const schema = require("../joi-schema/signup-request")
const loginModel = require("../joi-schema/login-request")
const responseHelper = require("../utils/responseHelper")
const verifyOtpModel = require("../joi-schema/verify-otp-request")
const literals = require("../literals/literals")
const signUpSchema = require("../db-schemas/signup-schema")
const bcrypt = require("bcryptjs");
const configs = require("../../config")
const otpUser = require("../db-schemas/otp-schema");
const otpGenerator = require("otp-generator")
const jwt = require("jsonwebtoken");
const {sendOTPEmail} = require("../services/emailService")
const { default: mongoose } = require("mongoose")





//Login Route
exports.login = async (request,response) => {
console.log("request body login", request.body)
const signupUser = mongoose.model("signupUser",signUpSchema)
const {error,value} = loginModel.loginRequest.validate(request.body)
if(error) {
    console.log("validatioin login error", error)
    return responseHelper.sendReponse(response,literals.errorCodes.invaliJasonError);
} else {
    const {email,password} = value;
    try {
        console.log("email", email, "password:", password)
        const user = await signupUser.findOne({email});
        if(user) {
            console.log("email", email, "password database:", user.password)
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            console.log("Password mismatch", isPasswordMatch)
            if(isPasswordMatch) {
                const jwtToken = jwt.sign({ userId: user._id, email: user.email, role: user.role }, configs.JwtToken, {
                    expiresIn: "7d",
                });
                response.cookie("s_t",jwtToken,{
                    httpOnly: true,
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000
                })
                return responseHelper.sendReponse(response,{data:{token:jwtToken, name:`${user.firstName} ${user.lastName}`, role:user.role},error:null,validation:null})
            } else {
                return responseHelper.sendReponse(response,literals.errorCodes.invalidCredentials)
            }
            
        } else {
            return responseHelper.sendReponse(response,literals.errorCodes.invalidCredentials)
        }
    } catch(error){
            return responseHelper.sendReponse(response,literals.errorCodes.generalError)
    }
}
}



//signup
exports.signup = async(request,response) => {
    const signupUser = mongoose.model("signupUser",signUpSchema)
    const {error,value} = schema.signupSchema.validate(request.body);
    if(error) {
       return responseHelper.sendReponse(response,literals.errorCodes.invaliJasonError);
    } else {
        //step1 : check for existing user
        const {firstName, lastName, email, dob, password, role} = request.body;
        const name = firstName+lastName;
        try{
            const existingUser = await signupUser.findOne({email})
            if(existingUser) {
            return responseHelper.sendReponse(response,literals.errorCodes.existingUserError)
            } else {
                const newUser = new signupUser({dob, name, email, password, role });
                await newUser.save()
             return responseHelper.sendReponse(response,literals.errorCodes.sucessWithNodata)
            }
        } catch(error){
            return responseHelper.sendReponse(response,literals.errorCodes.generalError)
        }
    }  
}

//sendotp
exports.sendotp = async(request,response) =>{
    const signupUser = mongoose.model("signupUser",signUpSchema)
    request.body.role = 'sales';
    const {error,value} = schema.signupSchema.validate({...request.body});
    console.log("Send otp body", request.body)
    if(error) {
        console.log("root error", error)
        return responseHelper.sendReponse(response,literals.errorCodes.invaliJasonError)
     } else {
         //step1 : check for existing user
         const {firstName, lastName, email, dob, password, role, userType} = request.body;
         const name = firstName+lastName;
         try{
             const existingUser = await signupUser.findOne({email})
             if(existingUser) {
             console.log("existing user")    
             return responseHelper.sendReponse(response,literals.errorCodes.existingUserError)
             } else {
                console.log("Otp generate")
                const newOtp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
                console.log("Otp generate---after")
                //Step2 : Check if otp alredy exists then just create a new OTP and update the same Record
                const existingOtpUser = await otpUser.findOne({email})
                if(existingOtpUser !== null) {
                   console.log("Send OTP Email")
                   const emailSent = await sendOTPEmail(email,newOtp);
                   if(emailSent.sucess) {
                    const updateExistingUser = await otpUser.findOneAndUpdate(
                        {email},
                        {otp:newOtp},
                        {createdAt: Date.now()}
                    )
                    if(updateExistingUser) {
                        return responseHelper.sendReponse(response,literals.errorCodes.sucessWithNodata) 
                    } else {
                        return responseHelper.sendReponse(response,literals.errorCodes.emailOTPSendError)
                    }
                   }
                } else {
                    const emailSent = await sendOTPEmail(email,newOtp);
                if(emailSent.sucess) {
                    console.log("Sucess----otp sent")
                    const otpUserObj = new otpUser({name,email,dob,password,otp:newOtp, userType})
                    await otpUserObj.save();
                    return responseHelper.sendReponse(response,literals.errorCodes.sucessWithNodata)

                } else {
                    console.log("does not send otp")
                    return responseHelper.sendReponse(response,literals.errorCodes.emailOTPSendError)
                }
                }
             }
         } catch(error){
             console.log("Main Error", error)
             return responseHelper.sendReponse(response,literals.errorCodes.generalError)
         }
     }  
}

//verify
exports.verifyotp = async(request,response) =>{
   console.log("First verify otp", request.body)
   const signupUser = mongoose.model("signupUser",signUpSchema)
   const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
   const {error,value} = verifyOtpModel.verifyOtpRequest.validate(request.body)
   if(error) {
    console.log("verify otp error", error)  
    return responseHelper.sendReponse(response,literals.errorCodes.invaliJasonError)
   } else {
    try {
        const {otp,email} = value
        const otpUserRes = await otpUser.findOne({otp, createdAt: {$gte:tenMinutesAgo}, email});
        console.log("OTP found", otpUser)
        if(otpUserRes) {
            const signup = new signupUser({
                password:otpUserRes.password,
                email:otpUserRes.email,
                name:otpUserRes.name,
                dob:otpUserRes.dob,
                role:otpUserRes.role,
                userType:otpUserRes.userType
                })
                await signup.save();
                return responseHelper.sendReponse(response,{data:{email: otpUser.email}})
        } else {
            return responseHelper.sendReponse(response,{data:null,error:literals.errorCodes.verfifyOtpFailed, validation:null})
        } 
    }catch(error) {
        console.log("Main error", error)
        return responseHelper.sendReponse(response,literals.errorCodes.generalError)
    }
}
}

//forgotPassword

exports.verifyEmail= async(request,response) => {
    const signupUser = mongoose.model("signupUser",signUpSchema)
    if(!request.body?.email){
        return responseHelper.sendReponse(response,literals.errorCodes.invaliJasonError)
    } else {
        try {
            const email = request.body.email
            const signup = await signupUser.findOne({email})
            if(signup) {
                return responseHelper.sendReponse(response,literals.errorCodes.sucessWithNodata);
            } else {
                return responseHelper.sendReponse(response,literals.errorCodes.invalidEmail);
            }

        } catch(error){
            return responseHelper.sendReponse(response,literals.errorCodes.generalError)
        }
    }
}


exports.resetPassword = async(request,response) => {
    const signupUser = mongoose.model("signupUser",signUpSchema)
    if(!request.body?.email || !request.body?.password){
        return responseHelper.sendReponse(response,literals.errorCodes.invaliJasonError)
    } else {
        try {
            const {email,password} = request.body;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
        
            // Find user by email and update password
            const updatedUser = await signupUser.findOneAndUpdate(
              { email }, // Find user by email
              { password: hashedPassword }, // Update password
              { new: true } // Return updated document
            );
        
            if (!updatedUser) {
              return responseHelper.sendReponse(response,literals.errorCodes.invalidEmail);
            } else {
                return responseHelper.sendReponse(response,literals.errorCodes.sucessWithNodata);
            }
        } catch(error){
            return responseHelper.sendReponse(response,literals.errorCodes.generalError)
        }
    }
}




