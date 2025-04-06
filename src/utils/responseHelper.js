

export const createReponsePayload = ({data= null,error=[],validation=[]} = {}) => {
    return {
        data,
        errorMessage: error,
        validationMessage: validation,
        hasValidation: validation?.length>0,
        hasError: error?.length > 0,
        sucess: !error && !validation
    }
}


export const sendReponse = (res,{data= null,error=null,validation=null} = {}) => {
    let statusCode = !error && !validation ? 200 : 400
    if(error && error[0]?.code === "40001") {
       statusCode = 401  
    }
    return res.status(statusCode).json(createReponsePayload({data,error,validation}));
}


export const sendDefaultErrorResponse=(res) => {
    return res.status(500).json(createReponsePayload({data:null,error:[{code:"NIL_POINTER",message:"something_went_Wrong"}]}))
}