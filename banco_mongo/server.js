const dotenv = require("dotenv");
dotenv.config({ path: "./config/.env" });

const express = require("express");
const mongoose = require("mongoose");
const mongoString = process.env.DATABASE_URL;
const routes = require("./routes/routes");

mongoose.connect(mongoString);
const db = mongoose.connection;

db.on("error", (error) => console.error(error));
db.once("connected", () => console.log("Connected to database"));

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use("/api", routes);

app.listen(port, () => console.log("Server is running on port " + port));
