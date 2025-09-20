# Hospital System Backend

This is a **backend system for a hospital** built with Node.js, Express, MongoDB, and JWT authentication.  
It includes features for user management (Auth, CRUD), role-based access control, and API documentation using Swagger.

---

## **Technologies**

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (JSON Web Token)
- bcryptjs (Password hashing)
- morgan (Logger)
- cors
- dotenv
- swagger-jsdoc & swagger-ui-express

---

## **Project Structure**

hospital-system/
│
├─ .env                        
├─ server.js                  
├─ swagger.yaml                 
├─ package.json
├─ package-lock.json
├─ .gitignore
│
└─ src/
   ├─ app.js                   
   ├─ config/
   │   └─ db.js                
   │
   ├─ models/
   │   ├─ User.js               
   │   ├─ Doctor.js            
   │   ├─ Patient.js            
   │   ├─ Appointment.js        
   │   └─ Billing.js           
   │
   ├─ routes/
   │   ├─ authRoutes.js         
   │   ├─ userRoutes.js        
   │   ├─ doctorRoutes.js       
   │   ├─ patientRoutes.js     
   │   ├─ appointmentRoutes.js  
   │   └─ billingRoutes.js     
   │
   ├─ controllers/
   │   ├─ authController.js
   │   ├─ userController.js
   │   ├─ doctorController.js
   │   ├─ patientController.js
   │   ├─ appointmentController.js
   │   └─ billingController.js
   │
   └─ middleware/
       └─ authMiddleware.js     





