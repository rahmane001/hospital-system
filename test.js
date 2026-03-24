process.env.JWT_SECRET = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';

console.log("1. testing express...");
require("express");
console.log("2. express OK");

console.log("3. testing morgan...");
require("morgan");
console.log("4. morgan OK");

console.log("5. testing cors...");
require("cors");
console.log("6. cors OK");

console.log("7. testing authRoutes...");
require("./src/routes/authRoutes");
console.log("8. authRoutes OK");

console.log("9. testing adminRoutes...");
require("./src/routes/adminRoutes");
console.log("10. adminRoutes OK");

console.log("11. testing userRoutes...");
require("./src/routes/userRoutes");
console.log("12. userRoutes OK");

console.log("13. testing appointmentRoutes...");
require("./src/routes/appointmentRoutes");
console.log("14. appointmentRoutes OK");

console.log("15. testing billRoutes...");
require("./src/routes/billRoutes");
console.log("16. billRoutes OK");

console.log("17. testing doctorRoutes...");
require("./src/routes/doctorRoutes");
console.log("18. doctorRoutes OK");

console.log("19. testing patientRoutes...");
require("./src/routes/patientRoutes");
console.log("20. patientRoutes OK");

console.log("ALL OK!");
