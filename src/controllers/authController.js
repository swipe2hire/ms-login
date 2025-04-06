const schema = require("../joi-schema/signup-request")
const loginModel = require("../joi-schema/login-request")
const responseHelper = require("../utils/responseHelper")
const verifyOtpModel = require("../joi-schema/verify-otp-request")
const literals = require("../literals/literals")
const bcrypt = require("bcryptjs");
const configs = require("../../config")
const otpUser = require("../db-schemas/otp-schema");
const signupUser = require("../db-schemas/signup-schema")
const otpGenerator = require("otp-generator")
const jwt = require("jsonwebtoken");
const {sendOTPEmail} = require("../services/emailService")





//Login Route
exports.login = async (request,response) => {
const {error,value} = loginModel.loginRequest.validate(request.body)
if(error) {
    return responseHelper.sendReponse(response,literals.errorCodes.invaliJasonError);
} else {
    const {email,password} = value;
    try {
        const user = await signupUser.findOne({email});
        if(user) {
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if(isPasswordMatch) {
                const jwtToken = jwt.sign({ userId: user.userId, email: user.email, role: user.role, userType: user.userType }, configs.JwtToken, {
                    expiresIn: "7d",
                });
                response.cookie("s_t",jwtToken,{
                    httpOnly: true,
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000
                })
                return responseHelper.sendReponse(response,{data:{userType: user.userType, token:jwtToken, name:user.name, role:user.role},error:null,validation:null})
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
    const {error,value} = schema.signupSchema.validate({...request.body});
    if(error) {
        return responseHelper.sendReponse(response,literals.errorCodes.invaliJasonError)
     } else {
         //step1 : check for existing user
         const {firstName, lastName, email, dob, password, role, userType} = request.body;
         const name = firstName+lastName;
         try{
             const existingUser = await signupUser.findOne({email})
             if(existingUser) {  
             return responseHelper.sendReponse(response,literals.errorCodes.existingUserError)
             } else {
                const newOtp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
                //Step2 : Check if otp alredy exists then just create a new OTP and update the same Record
                const existingOtpUser = await otpUser.findOne({email})
                if(existingOtpUser !== null) {
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
                    const otpUserObj = new otpUser({name,email,dob,password,otp:newOtp,role, userType})
                    await otpUserObj.save();
                    return responseHelper.sendReponse(response,literals.errorCodes.sucessWithNodata)

                } else {
                    return responseHelper.sendReponse(response,literals.errorCodes.emailOTPSendError)
                }
                }
             }
         } catch(error){
             return responseHelper.sendReponse(response,literals.errorCodes.generalError)
         }
     }  
}

//verify
exports.verifyotp = async(request,response) =>{
   const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
   const {error,value} = verifyOtpModel.verifyOtpRequest.validate(request.body)
   if(error) {
    return responseHelper.sendReponse(response,literals.errorCodes.invaliJasonError)
   } else {
    try {
        const {otp,email} = value
        const otpUserRes = await otpUser.findOne({otp, createdAt: {$gte:tenMinutesAgo}, email});
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
                return responseHelper.sendReponse(response,{data:{email: otpUserRes.email}})
        } else {
            return responseHelper.sendReponse(response,{data:null,error:literals.errorCodes.verfifyOtpFailed, validation:null})
        } 
    }catch(error) {
        return responseHelper.sendReponse(response,literals.errorCodes.generalError)
    }
}
}

//forgotPassword

exports.verifyEmail= async(request,response) => {
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




