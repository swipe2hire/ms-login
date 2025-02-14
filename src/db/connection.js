const mongoose = require("mongoose");
const configs = require("../../config")

const connectDB = async () => {
    try{
        console.log(configs.MonGoDbConnectionUrl)
        await mongoose.connect(configs.MonGoDbConnectionUrl);
        console.log("✅ MongoDB Connected");
    }catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        process.exit(1);
      }
}

module.exports = connectDB;