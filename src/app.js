const express = require('express');

const cookieParser = require('cookie-parser');

const app = express();


app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//define Routes

const userRoutes = require('./routes/user-routes');



//use Routes

app.use("/api/v1/users", userRoutes)

module.exports = app;