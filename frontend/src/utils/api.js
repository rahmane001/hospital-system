import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8000/api" });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Auth
export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);
export const createAdmin = (data) => API.post("/admin/create-admin", data);
export const walletLogin = (data) => API.post("/auth/wallet-login", data);
export const linkWallet = (data) => API.post("/auth/link-wallet", data);

// Users
export const getUsers = () => API.get("/users");
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const approveDoctor = (id) => API.put(`/users/approve-doctor/${id}`);

// Doctors
export const getDoctorProfile = (id) => API.get(`/doctors/${id}`);
export const createDoctorProfile = (data) => API.post("/doctors", data);
export const updateDoctorProfile = (id, data) => API.put(`/doctors/${id}`, data);

// Patients
export const getPatientProfile = (id) => API.get(`/patients/${id}`);
export const createPatientProfile = (data) => API.post("/patients", data);

// Appointments
export const getAppointments = () => API.get("/appointments");
export const getAvailableAppointments = (doctorId) => API.get(`/appointments/available/${doctorId}`);
export const bookAppointment = (id) => API.post(`/appointments/book/${id}`);
export const getPatientAppointments = () => API.get("/appointments/booked");
export const createAppointment = (data) => API.post("/appointments/add", data);
export const adminGetAllAppointments = () => API.get("/appointments/admin/all");
export const adminDeleteAppointment = (id) => API.delete(`/appointments/admin/${id}`);

// Bills
export const getMyBills = () => API.get("/bills/my");
export const getDoctorBills = () => API.get("/bills/doctor");
export const getAdminBills = () => API.get("/bills/admin");
export const payBill = (id) => API.post(`/bills/pay/${id}`);

// Departments
export const getDepartments = () => API.get("/departments");
export const createDepartment = (data) => API.post("/departments", data);
export const updateDepartment = (id, data) => API.put(`/departments/${id}`, data);
export const deleteDepartment = (id) => API.delete(`/departments/${id}`);

// Beds
export const getBeds = () => API.get("/beds");
export const getBedsByDepartment = (deptId) => API.get(`/beds/department/${deptId}`);
export const createBed = (data) => API.post("/beds", data);
export const assignBed = (id, data) => API.put(`/beds/assign/${id}`, data);
export const releaseBed = (id) => API.put(`/beds/release/${id}`);

// Prescriptions
export const createPrescription = (data) => API.post("/prescriptions", data);
export const getMyPrescriptions = () => API.get("/prescriptions/my");
export const getDoctorPrescriptions = () => API.get("/prescriptions/doctor");
export const getAdminPrescriptions = () => API.get("/prescriptions/admin");

// Notifications
export const getNotifications = () => API.get("/notifications");
export const getUnreadCount = () => API.get("/notifications/unread");
export const markNotificationsRead = () => API.put("/notifications/read");

// Audit Logs
export const getAuditLogs = (params) => API.get("/audit", { params });

export default API;