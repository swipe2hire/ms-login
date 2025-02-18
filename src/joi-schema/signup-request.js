import Joi from "joi";


export const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    dob: Joi.string().required(),
    role: Joi.string(),
    userType: Joi.string()
})