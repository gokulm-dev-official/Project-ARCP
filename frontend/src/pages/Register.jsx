import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ShieldCheck, Car } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('AMBULANCE_DRIVER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    // Fetch existing users from localStorage
    const users = JSON.parse(localStorage.getItem('smart_ambulance_users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      setError('Email is already registered. Please login.');
      return;
    }

    // Save new user
    const newUser = { name, email, password, role };
    users.push(newUser);
    localStorage.setItem('smart_ambulance_users', JSON.stringify(users));

    // Redirect to login
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-surface rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Branding */}
        <div className="w-full md:w-1/2 bg-surface p-12 flex flex-col items-center justify-center border-r border-gray-100 hidden md:flex">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <Activity className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-textPrimary mb-2 text-center">Join Smart Ambulance</h1>
          <p className="text-textSecondary text-center font-body mb-8">
            Create an account to access the Route Clearance System.
          </p>
          <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400" alt="Medical Team" className="w-64 rounded-xl opacity-90 shadow-md"/>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-heading font-bold mb-2">Create Account</h2>
          <p className="text-textSecondary mb-8">Sign up to get started</p>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setRole('AMBULANCE_DRIVER')}
              type="button"
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
                role === 'AMBULANCE_DRIVER' ? 'bg-primary text-white shadow-md' : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              <ShieldCheck className="w-4 h-4 inline-block mr-2" />
              Ambulance
            </button>
            <button
              onClick={() => setRole('TRAFFIC_USER')}
              type="button"
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
                role === 'TRAFFIC_USER' ? 'bg-secondary text-white shadow-md' : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              <Car className="w-4 h-4 inline-block mr-2" />
              Vehicle
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-4 mt-2 bg-primary hover:bg-[#2EB550] text-white font-semibold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
            >
              Register
            </button>
          </form>

          <p className="text-center text-textSecondary mt-6 text-sm">
            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
