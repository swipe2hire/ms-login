

export const createReponsePayload = ({data= null,error=[{ code: "", message: "" }],validation=[{ code: "", message: "" }]} = {}) => {
    return {
        data,
        errorMessage: error,
        validationMessage: validation,
        hasValidation: validation.length>0,
        hasError: error.length > 0,
        sucess: errorMessage.length === 0 && validation.length === 0

    }
}


export const sendReponse = (res,{data= null,error=[{ code: "", message: "" }],validation=[{ code: "", message: "" }]} = {}) => {
    return res.status(error.length === 0 && validation.length === 0?200:400).json(createReponsePayload(data,error,validation));
}


export const sendDefaultErrorResponse=(res) => {
    return res.status(500).json(createReponsePayload({data:null,error:[{code:"NIL_POINTER",message:"something_went_Wrong"}]}))
}