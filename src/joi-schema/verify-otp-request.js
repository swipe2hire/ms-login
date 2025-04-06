import Joi from "joi";

export const verifyOtpRequest = Joi.object({
    email:Joi.string().required().email(),
    otp: Joi.string().required()
})