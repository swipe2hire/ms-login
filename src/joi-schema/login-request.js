import joi from 'joi'

export const loginRequest = joi.object({
    email:joi.string().required().email(),
    password: joi.string().required()
})