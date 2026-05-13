const express = require('express')
const app = express()
const cookieParser = require("cookie-parser");
app.use(cookieParser())
app.use(express.json())
const cors = require("cors");

app.use(express.urlencoded({ extended: true }));

// ✅ ADD CORS HERE (top)
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

const authRoute=require("./routes/auth.routes")
const postRoute=require("./routes/follow.routes")
const finduser=require("./routes/finduser.routes")
const commentRoute=require("./routes/comment.routes")
const chat=require("./routes/message.routes")
app.use("/api/auth", authRoute)
app.use("/api/post", postRoute)
app.use("/api/find", finduser)
app.use("/api/comment", commentRoute)
app.use("/api/chat", chat)
// fine

module.exports = app