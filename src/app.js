
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();


const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");


app.use(express.json()); 
app.use(cors()); 
app.use(morgan("dev")); 


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);

app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = app;
