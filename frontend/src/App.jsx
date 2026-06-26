import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AmbulanceDashboard from './pages/AmbulanceDashboard';
import VehicleDashboard from './pages/VehicleDashboard';
import RouteMap from './pages/RouteMap';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-body text-textPrimary">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ambulance-dashboard" element={<AmbulanceDashboard />} />
          <Route path="/vehicle-dashboard" element={<VehicleDashboard />} />
          <Route path="/route-map" element={<RouteMap />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
