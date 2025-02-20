export const errorCodes = {
    invalidCredentials: {data:null,error:[{code:"40001",message:"Please Enter Valid Credentails"}],validation:null},
    invalidOtp:"40002",
    verfifyOtpFailed:[{code:"40004", message:"Invalid OTP"}],
    generalError: {data:null,error:[{code:"4005",message:"Something went Wrong. Please Try again"}],validation:null},
    sucessWithNodata:{data:null,error:null,validation:null},
    invaliJasonError:{data:null,error:[{code:"4000",message:"Something went wrong with request"}],validation:null},
    emailOTPSendError:{data:null,error:[{code:"40006",message: "Not able to send Email at this time. Please tray again after sometime!"}],validation:null},
    existingUserError:{data:null,error:[{code:"4007",message:"You alredy have an account. Please use login or forgot password"}],validation:null},
    invalidEmail:{data:null,error:[{code:"4008",message:"Please enter a valid email"}]}
}