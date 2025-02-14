const schema = require("../joi-schema/signup-request")
const responseHelper = require("../utils/responseHelper")
const literals = require("../literals/literals")
const signUpSchema = require("../db-schemas/signup-schema")
const { default: mongoose } = require("mongoose")
exports.login = async (request,response) => {
    // token in response & also set Cookie for browser
    // sucessresponse
    response.send("abc")
}

exports.signup = async(request,response) => {
    debugger;
    const signupUser = mongoose.model("signupUser",signUpSchema)
    const {error,value} = schema.signupSchema.validate(request);
    if(error) {
        responseHelper.sendReponse(response,{data:null,error:[{code:literals.errorCodes.invalidJasonParse,message:"Invalid Request"}]})
    } else {
        //step1 : check for existing user
        const {firstName, lastName, email, dob} = request.body;
        const name = firstName+lastName;
        try{
            const existingUser = await signupUser.findOne({email})
            if(existingUser) {
                responseHelper.sendReponse(response,{data:null,error:[{code:"EXISTING_USER",message:"EXISTING_USER"}]})
            } else {
                const newUser = new signupUser({ name, email, password });
                await newUser.save()
                responseHelper.sendReponse(response,{data:null,error:null,validation:null})
            }
        } catch(error){
            responseHelper.sendReponse(response,{data:null,error:[{code:error.code,message:error.message}]})

        }

    }

    //default error
    responseHelper.sendDefaultErrorResponse(response);
    
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