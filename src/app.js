
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();


const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));



app.use(express.json()); 
app.use(cors()); 
app.use(morgan("dev")); 


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));



app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = app;
