import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Navigation, History, Settings, LogOut,
  Ambulance, Car, Shield, Sun, Moon, Activity, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const ambulanceLinks = [
  { to: '/ambulance', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ambulance/mission', icon: Navigation, label: 'Mission Control' },
  { to: '/ambulance/history', icon: History, label: 'Mission History' },
];

const vehicleLinks = [
  { to: '/vehicle', icon: LayoutDashboard, label: 'Dashboard' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/missions', icon: Activity, label: 'Live Missions' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const links = user?.role === 'AMBULANCE_DRIVER' ? ambulanceLinks
    : user?.role === 'VEHICLE_DRIVER' ? vehicleLinks
    : adminLinks;

  const roleIcon = user?.role === 'AMBULANCE_DRIVER' ? Ambulance
    : user?.role === 'VEHICLE_DRIVER' ? Car : Shield;
  const RoleIcon = roleIcon;

  const roleLabel = user?.role === 'AMBULANCE_DRIVER' ? 'Ambulance'
    : user?.role === 'VEHICLE_DRIVER' ? 'Vehicle' : 'Admin';

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`${collapsed ? 'w-20' : 'w-64'} h-screen sticky top-0 flex flex-col glass-strong border-r border-dark-200 dark:border-dark-700 transition-all duration-300 z-40`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-dark-200 dark:border-dark-700">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emergency-500 to-emergency-700 flex items-center justify-center shadow-lg shadow-emergency-500/30">
          <Ambulance className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="font-bold text-sm text-dark-900 dark:text-white">Smart Ambulance</h1>
            <p className="text-xs text-dark-500">Alert System</p>
          </motion.div>
        )}
      </div>

      {/* Role Badge */}
      <div className="px-4 py-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-950/50 ${collapsed ? 'justify-center' : ''}`}>
          <RoleIcon className="w-4 h-4 text-primary-600" />
          {!collapsed && <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">{roleLabel}</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/ambulance' || link.to === '/vehicle' || link.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${collapsed ? 'justify-center' : ''} ${
                isActive
                  ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 shadow-sm'
                  : 'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-white'
              }`
            }
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-1 border-t border-dark-200 dark:border-dark-700">
        <button onClick={toggle} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 transition-all ${collapsed ? 'justify-center' : ''}`}>
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button onClick={logout} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-emergency-600 hover:bg-emergency-50 dark:hover:bg-emergency-950/30 transition-all ${collapsed ? 'justify-center' : ''}`}>
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 flex items-center justify-center shadow-sm hover:shadow-md transition-all"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
