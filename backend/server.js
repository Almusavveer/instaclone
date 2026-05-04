require("dotenv").config();
const app = require("./src/app");
const ConDB = require("./db/db");

ConDB();

const port = process.env.PORT;
app.listen(port, () => {
  console.log("Server run ho gya!");
});
