import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'sonner';

import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AmbulanceDashboard from './pages/ambulance/AmbulanceDashboard';
import AmbulanceMission from './pages/ambulance/AmbulanceMission';
import VehicleDashboard from './pages/vehicle/VehicleDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route Wrapper
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on role if they try to access something they shouldn't
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'AMBULANCE_DRIVER') return <Navigate to="/ambulance" replace />;
    return <Navigate to="/vehicle" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WebSocketProvider>
          <BrowserRouter>
            <Toaster position="top-right" richColors />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes inside AppLayout */}
              <Route path="/" element={<AppLayout />}>
                {/* Default redirect based on role is handled in ProtectedRoute, but let's add a root redirect */}
                <Route index element={<ProtectedRoute><Navigate to="/login" /></ProtectedRoute>} />

                {/* Ambulance Routes */}
                <Route path="ambulance" element={<ProtectedRoute allowedRoles={['AMBULANCE_DRIVER']}><AmbulanceDashboard /></ProtectedRoute>} />
                <Route path="ambulance/mission" element={<ProtectedRoute allowedRoles={['AMBULANCE_DRIVER']}><AmbulanceMission /></ProtectedRoute>} />
                
                {/* Vehicle Routes */}
                <Route path="vehicle" element={<ProtectedRoute allowedRoles={['VEHICLE_DRIVER']}><VehicleDashboard /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
