const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { required } = require("joi");

const signupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob:{type:String, required:true},
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

signupSchema.pre("save",async function (next)  {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

module.exports = signupSchema;