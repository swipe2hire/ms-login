const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const otpSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob:{type:String, required:true},
    otp: {type:String, required:true},
    createdAt: { type: Date, default: Date.now, expires: 600 },
    role: {
        type: String,
        enum: ["admin", "manager", "sales"],
        required: function () {
            return this.userType === "employer";
        }
    },
    userType: {
        type: String,
        enum: ["candidate","employer"],
        required:true,
    }
})

otpSchema.pre("save",  async function(next) {
    if (!this.isModified("password")) return next();
     const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();

})

const otpUser = mongoose.model("otpUser", otpSchema)
module.exports = otpUser;

