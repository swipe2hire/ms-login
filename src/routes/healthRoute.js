

const express = require("express")
const os = require("os")
const  connectDB = require("../db/connection")   

const routes = express.Router();
routes.get("/heathcheck",async (request,response)=> {

    let dbStatus = "Disconnected";

    try {
        await connectDB.db("admin").command({ ping: 1 }); // Check if MongoDB is reachable
        dbStatus = "Connected";
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
    }
    response.send({
    status:"UP",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    loadAverage: os.loadavg(),
    })
})

module.exports = routes;

