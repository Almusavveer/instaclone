const express = require('express')
const app = express()
const cookieParser = require("cookie-parser");
app.use(cookieParser())
app.use(express.json())
const authRoute=require("../routes/auth.routes")
app.use("/api/auth", authRoute)

module.exports = app