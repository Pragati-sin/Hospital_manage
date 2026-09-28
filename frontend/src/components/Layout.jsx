import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Calendar, Clock, FileText, Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWidget from './chat/ChatWidget';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    switch (user?.role) {
      case 'Admin':
        return [
          { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'Doctors', path: '/admin/doctors', icon: Users },
        ];
      case 'Receptionist':
        return [
          { name: 'Appointments', path: '/receptionist', icon: Calendar },
        ];
      case 'Doctor':
        return [
          { name: 'My Schedule', path: '/doctor', icon: Calendar },
        ];
      case 'Patient':
        return [
          { name: 'Find Doctors', path: '/patient', icon: Users },
          { name: 'My Appointments', path: '/patient/appointments', icon: Clock },
          { name: 'My Records', path: '/patient/records', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-md shadow-lg border-r border-slate-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-700 bg-clip-text text-transparent">HMS Clinical</span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-teal-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.name} to={link.path} className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-teal-50 text-teal-700 font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-teal-600'}`}>
                <link.icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden relative">
        {/* Top bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 flex items-center justify-between px-6 z-40">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-teal-600">
            <Menu className="w-6 h-6" />
          </button>
          <div className="ml-auto flex items-center space-x-6">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-700">{user?.name}</span>
              <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{user?.role}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center text-slate-500 hover:text-red-600 transition-colors bg-slate-50 hover:bg-red-50 p-2 rounded-full">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {user?.role === 'Patient' && <ChatWidget user={user} />}
    </div>
  );
};

export default Layout;
