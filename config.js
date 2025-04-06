require("dotenv").config();

const configs = {
    PORT:5000,
    env:'dev',
    AllowedOrigin:["http://localhost:4000","https://swipe2hire.com"],
    MonGoDbConnectionUrl: "mongodb+srv://msUser:Dinshi%401990@cluster0.krwpy.mongodb.net/authDB?retryWrites=true&w=majority&appName=Cluster0",
    JwtToken:"AQSMyQUPOVYFVK3WoEiJEJA8UqmQOZgO",
    Email:"dineshkits@gmail.com",
    EmailPassword:"wtzr vhqd jwsr zbjh",
    EmailHost:"smtp.gmail.com",
    EmailPort:"587"

}

module.exports = configs