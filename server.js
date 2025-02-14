
const express= require("express");
const cors= require("cors");
const config= require("./config")
const authRoutes= require("./src/routes/authRoutes")
const healthCheckRoutes= require("./src/routes/healthRoute")
const connectDB= require("./src/db/connection")



const app = express();
app.use(express.json());
app.use(cors({
    origin: function(origin, callback){
        if (!origin || config.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
    }
}));
connectDB();
app.use("/api/auth",authRoutes);
app.use("/api",healthCheckRoutes);

const PORT = config.PORT

app.listen(PORT,() => console.log(`Server Running on port ${PORT}`))

