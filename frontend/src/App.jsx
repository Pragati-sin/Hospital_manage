import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import AppointmentList from './pages/receptionist/AppointmentList';
import Schedule from './pages/doctor/Schedule';
import DoctorDirectory from './pages/patient/DoctorDirectory';
import BookAppointment from './pages/patient/BookAppointment';
import MyRecords from './pages/patient/MyRecords';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute roles={['Admin']} />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/doctors" element={<ManageDoctors />} />
            </Route>
          </Route>

          {/* Receptionist Routes */}
          <Route element={<ProtectedRoute roles={['Receptionist']} />}>
            <Route element={<Layout />}>
              <Route path="/receptionist" element={<AppointmentList />} />
            </Route>
          </Route>

          {/* Doctor Routes */}
          <Route element={<ProtectedRoute roles={['Doctor']} />}>
            <Route element={<Layout />}>
              <Route path="/doctor" element={<Schedule />} />
            </Route>
          </Route>

          {/* Patient Routes */}
          <Route element={<ProtectedRoute roles={['Patient']} />}>
            <Route element={<Layout />}>
              <Route path="/patient" element={<DoctorDirectory />} />
              <Route path="/patient/book/:doctorId" element={<BookAppointment />} />
              <Route path="/patient/appointments" element={<MyRecords />} />
              <Route path="/patient/records" element={<MyRecords />} />
            </Route>
          </Route>

          <Route path="*" element={<div className="p-10 text-center text-2xl font-bold">404 Not Found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
