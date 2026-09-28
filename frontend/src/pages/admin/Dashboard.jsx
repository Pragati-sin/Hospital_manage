import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import Card from '../../components/ui/Card';
import { Users, Calendar, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointmentsToday: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          axios.get('/api/patients'),
          axios.get('/api/doctors'),
          axios.get(`/api/appointments?date=${format(new Date(), 'yyyy-MM-dd')}`)
        ]);
        
        setStats({
          patients: patientsRes.data.count || patientsRes.data.data?.length || 0,
          doctors: doctorsRes.data.count || doctorsRes.data.data?.length || 0,
          appointmentsToday: appointmentsRes.data.count || appointmentsRes.data.data?.length || 0
        });
        
        const allAppointments = await axios.get('/api/appointments');
        setRecentAppointments((allAppointments.data.data || []).slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="relative h-48 rounded-2xl overflow-hidden mb-8 shadow-sm">
        <img 
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80" 
          alt="Hospital Interior" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/20 flex items-center p-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center p-6 space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Users className="w-8 h-8" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Patients</p>
            <p className="text-2xl font-bold text-gray-800">{stats.patients}</p>
          </div>
        </Card>
        <Card className="flex items-center p-6 space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full"><UserCheck className="w-8 h-8" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Doctors</p>
            <p className="text-2xl font-bold text-gray-800">{stats.doctors}</p>
          </div>
        </Card>
        <Card className="flex items-center p-6 space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><Calendar className="w-8 h-8" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Appointments Today</p>
            <p className="text-2xl font-bold text-gray-800">{stats.appointmentsToday}</p>
          </div>
        </Card>
      </div>

      <Card title="Recent Appointments">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAppointments.map((apt) => (
                <tr key={apt._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{apt.patient?.user?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.doctor?.user?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(apt.date), 'PP')} {apt.timeSlot}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.status}</td>
                </tr>
              ))}
              {recentAppointments.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No recent appointments</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
