import Joi from "joi";

export const verifyOtpRequest = Joi.object({
    email:joi.string().required().email(),
    otp: joi.string().required()
})