const schema = require("../joi-schema/signup-request")
const loginModel = require("../joi-schema/login-request")
const responseHelper = require("../utils/responseHelper")
const literals = require("../literals/literals")
const signUpSchema = require("../db-schemas/signup-schema")
const bcrypt = require("bcryptjs");
const configs = require("../../config")
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose")





//Login Route
exports.login = async (request,response) => {
const signupUser = mongoose.model("signupUser",signUpSchema)
const {error,value} = loginModel.loginRequest.validate(request.body)
if(error) {
    return responseHelper.sendReponse(response,{data:null,error:[{code:literals.errorCodes.invalidJasonParse,message:error.message}], validation:null})
} else {
    const {email,password} = value;
    try {
        const user = await signupUser.findOne({email});
        if(user) {
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if(isPasswordMatch) {
                const jwtToken = jwt.sign({ userId: user._id, email: user.email }, configs.JwtToken, {
                    expiresIn: "7d",
                });
                response.cookie("s_t",jwtToken,{
                    httpOnly: true,
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000
                })
                return responseHelper.sendReponse(response,{data:{token:jwtToken},error:null,validation:null})
            } else {
                return responseHelper.sendReponse(response,{data:null,error:[{code:literals.errorCodes.invalidCredentials,message:"INVALID_CREDENTIALS"}]})
            }
            
        } else {
            return responseHelper.sendReponse(response,{data:null,error:[{code:literals.errorCodes.invalidCredentials,message:"INVALID_CREDENTIALS"}]})
        }
    } catch(error){
            return responseHelper.sendReponse(response,{data:null,error:[{code:error.code,message:error.message}]})

    }
}
}




exports.signup = async(request,response) => {
    const signupUser = mongoose.model("signupUser",signUpSchema)
    const {error,value} = schema.signupSchema.validate(request.body);
    if(error) {
       return responseHelper.sendReponse(response,{data:null,error:[{code:literals.errorCodes.invalidJasonParse,message:error.message}], validation:null})
    } else {
        //step1 : check for existing user
        const {firstName, lastName, email, dob, password, role} = request.body;
        const name = firstName+lastName;
        try{
            const existingUser = await signupUser.findOne({email})
            if(existingUser) {
            return responseHelper.sendReponse(response,{data:null,error:[{code:"EXISTING_USER",message:"EXISTING_USER"}]})
            } else {
                const newUser = new signupUser({dob, name, email, password, role });
                await newUser.save()
             return responseHelper.sendReponse(response,{data:null,error:null,validation:null})
            }
        } catch(error){
            return responseHelper.sendReponse(response,{data:null,error:[{code:error.code,message:error.message}]})

        }

    }  
}





exports.forgotPassword = async (request,response) => {
    response.send("forgotpassword")
}

exports.resetPassword = async (request,response) => {
    response.send("resetPassword");
}

exports.resetToken = async (request,response) => {
    response.send("refershToken");
}