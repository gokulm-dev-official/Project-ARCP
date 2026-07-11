import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Ambulance, User, Mail, Lock, Phone, Car, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    role: 'VEHICLE_DRIVER', vehicleNumber: '',
    vehicleType: 'SEDAN', hospitalName: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await register(formData);
      toast.success('Registration successful');
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'ADMIN') navigate('/admin');
        else if (user.role === 'AMBULANCE_DRIVER') navigate('/ambulance');
        else navigate('/vehicle');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden bg-dark-50 dark:bg-dark-950">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-500/10 blur-[100px] pointer-events-none" />
      
      <div className="card w-full max-w-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Create Account</h1>
          <p className="text-dark-500 mt-2">Join the Smart Ambulance Network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'VEHICLE_DRIVER' })}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                formData.role === 'VEHICLE_DRIVER'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                  : 'border-dark-200 dark:border-dark-700 text-dark-500 hover:border-primary-300'
              }`}
            >
              <Car className="w-8 h-8" />
              <span className="font-semibold">Civilian Vehicle</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'AMBULANCE_DRIVER' })}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                formData.role === 'AMBULANCE_DRIVER'
                  ? 'border-emergency-500 bg-emergency-50 dark:bg-emergency-900/20 text-emergency-600'
                  : 'border-dark-200 dark:border-dark-700 text-dark-500 hover:border-emergency-300'
              }`}
            >
              <Ambulance className="w-8 h-8" />
              <span className="font-semibold">Ambulance Driver</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-dark-400" />
                </div>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input pl-11" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-dark-400" />
                </div>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="input pl-11" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-dark-400" />
                </div>
                <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange} className="input pl-11" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-dark-400" />
                </div>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input pl-11" />
              </div>
            </div>

            {/* Conditional Fields based on Role */}
            <div className="md:col-span-2 grid md:grid-cols-2 gap-5 p-5 bg-dark-50 dark:bg-dark-800/50 rounded-xl border border-dark-200 dark:border-dark-700">
              {formData.role === 'AMBULANCE_DRIVER' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Ambulance Number Plate</label>
                    <input type="text" name="vehicleNumber" required value={formData.vehicleNumber} onChange={handleChange} className="input uppercase" placeholder="e.g. MH-12-AB-1234" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Hospital Name</label>
                    <input type="text" name="hospitalName" required value={formData.hospitalName} onChange={handleChange} className="input" placeholder="e.g. City General Hospital" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Vehicle Number Plate</label>
                    <input type="text" name="vehicleNumber" required value={formData.vehicleNumber} onChange={handleChange} className="input uppercase" placeholder="e.g. MH-12-CD-5678" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Vehicle Type</label>
                    <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="input">
                      <option value="SEDAN">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="HATCHBACK">Hatchback</option>
                      <option value="TRUCK">Truck</option>
                      <option value="TWO_WHEELER">Two Wheeler</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Create Account
                <Plus className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-dark-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
