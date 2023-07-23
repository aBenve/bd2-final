const dotenv = require("dotenv");
dotenv.config({ path: "./config/.env" });

const express = require("express"),
  bodyParser = require("body-parser"),
  swaggerUi = require("swagger-ui-express"),
  swaggerJsDoc = require("swagger-jsdoc");
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

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Banco Verde API",
      version: "0.1.0",
      description:
        "Swagger documentation for Banco Verde API. This API is used to manage users and transactions.",
    },
    servers: [
      {
        url: "http://localhost:3001",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.listen(port, () => console.log("Server is running on port " + port));
