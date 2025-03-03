import Joi from "joi";


export const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    dob: Joi.string().required(),
    role: Joi.string().valid("sales","manager","admin").when("userType",{is:"employer",then: Joi.required(), otherwise: Joi.optional()}),
    userType: Joi.string().valid("candidate","employer").required()
})