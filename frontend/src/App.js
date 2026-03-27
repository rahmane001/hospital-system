import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import { Login, Register } from "./pages/Auth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={`/${user.role}`} /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <Register />} />

      {/* Admin routes */}
      <Route path="/admin" element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/analytics" element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/departments" element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/beds" element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/appointments" element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/prescriptions" element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/billing" element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/blockchain" element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/audit" element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />

      {/* Doctor routes */}
      <Route path="/doctor" element={<PrivateRoute roles={["doctor"]}><DoctorDashboard /></PrivateRoute>} />
      <Route path="/doctor/appointments" element={<PrivateRoute roles={["doctor"]}><DoctorDashboard /></PrivateRoute>} />
      <Route path="/doctor/prescriptions" element={<PrivateRoute roles={["doctor"]}><DoctorDashboard /></PrivateRoute>} />
      <Route path="/doctor/billing" element={<PrivateRoute roles={["doctor"]}><DoctorDashboard /></PrivateRoute>} />
      <Route path="/doctor/profile" element={<PrivateRoute roles={["doctor"]}><DoctorDashboard /></PrivateRoute>} />

      {/* Patient routes */}
      <Route path="/patient" element={<PrivateRoute roles={["patient"]}><PatientDashboard /></PrivateRoute>} />
      <Route path="/patient/doctors" element={<PrivateRoute roles={["patient"]}><PatientDashboard /></PrivateRoute>} />
      <Route path="/patient/appointments" element={<PrivateRoute roles={["patient"]}><PatientDashboard /></PrivateRoute>} />
      <Route path="/patient/prescriptions" element={<PrivateRoute roles={["patient"]}><PatientDashboard /></PrivateRoute>} />
      <Route path="/patient/billing" element={<PrivateRoute roles={["patient"]}><PatientDashboard /></PrivateRoute>} />
      <Route path="/patient/history" element={<PrivateRoute roles={["patient"]}><PatientDashboard /></PrivateRoute>} />

      {/* Receptionist routes */}
      <Route path="/receptionist" element={<PrivateRoute roles={["receptionist"]}><ReceptionistDashboard /></PrivateRoute>} />
      <Route path="/receptionist/register" element={<PrivateRoute roles={["receptionist"]}><ReceptionistDashboard /></PrivateRoute>} />
      <Route path="/receptionist/appointments" element={<PrivateRoute roles={["receptionist"]}><ReceptionistDashboard /></PrivateRoute>} />
      <Route path="/receptionist/beds" element={<PrivateRoute roles={["receptionist"]}><ReceptionistDashboard /></PrivateRoute>} />
      <Route path="/receptionist/billing" element={<PrivateRoute roles={["receptionist"]}><ReceptionistDashboard /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop theme="light" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;