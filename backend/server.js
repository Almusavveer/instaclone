require("dotenv").config();

const app = require("./src/app");
const ConDB = require("./src/db/db");
const cors = require("cors");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await ConDB(); // wait for DB connection

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log("Database connection failed:", error);
  }
};

startServer();