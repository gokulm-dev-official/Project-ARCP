import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ShieldCheck, Car } from 'lucide-react';

const Login = () => {
  const [role, setRole] = useState('AMBULANCE_DRIVER'); // 'AMBULANCE_DRIVER' or 'TRAFFIC_USER'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Fetch existing users from localStorage
    const users = JSON.parse(localStorage.getItem('smart_ambulance_users') || '[]');
    
    // Find matching user
    const user = users.find(u => u.email === email && u.password === password && u.role === role);

    if (!user) {
      setError('Invalid credentials or wrong role selected.');
      return;
    }

    if (role === 'AMBULANCE_DRIVER') {
      navigate('/ambulance-dashboard');
    } else {
      navigate('/vehicle-dashboard');
    }
  };

  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-surface rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Branding */}
        <div className="w-full md:w-1/2 bg-surface p-12 flex flex-col items-center justify-center border-r border-gray-100">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <Activity className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-textPrimary mb-2">Smart Ambulance</h1>
          <p className="text-textSecondary text-center font-body mb-8">
            Route Clearance & Nearest Hospital Recommendation System
          </p>
          <img src="https://images.unsplash.com/photo-1587556610433-8c46450f19c4?auto=format&fit=crop&q=80&w=400" alt="Ambulance" className="w-64 rounded-xl opacity-90 shadow-md"/>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-heading font-bold mb-2">Welcome Back</h2>
          <p className="text-textSecondary mb-8">Login to continue</p>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button
              onClick={() => setRole('AMBULANCE_DRIVER')}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
                role === 'AMBULANCE_DRIVER' ? 'bg-primary text-white shadow-md' : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              <ShieldCheck className="w-4 h-4 inline-block mr-2" />
              Ambulance Driver
            </button>
            <button
              onClick={() => setRole('TRAFFIC_USER')}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
                role === 'TRAFFIC_USER' ? 'bg-secondary text-white shadow-md' : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              <Car className="w-4 h-4 inline-block mr-2" />
              Vehicle / Traffic
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-textSecondary cursor-pointer">
                <input type="checkbox" className="mr-2 rounded text-primary focus:ring-primary" />
                Remember me
              </label>
              <a href="#" className="text-secondary font-medium hover:underline">Forgot Password?</a>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-primary hover:bg-[#2EB550] text-white font-semibold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
            >
              Login
            </button>
          </form>

          <p className="text-center text-textSecondary mt-8 text-sm font-medium">
            Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
