require("dotenv").config();
const app = require("./src/app");
const ConDB = require("./src/db/db");
const cors = require("cors");
ConDB();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
const port = process.env.PORT;
app.listen(port, () => {
  console.log("Server run ho gya!");
});
