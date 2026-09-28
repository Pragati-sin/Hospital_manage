import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { format } from 'date-fns';
import AddDoctorModal from '../../components/AddDoctorModal';
import ReceptionInbox from '../../components/chat/ReceptionInbox';
import { useAuth } from '../../context/AuthContext';
import { Plus } from 'lucide-react';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const { user } = useAuth();

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`/api/appointments?date=${date}`);
      setAppointments(res.data.data || res.data);
    } catch (error) {
      console.error("Error fetching appointments", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [date]);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`/api/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (error) {
      alert('Error updating status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Reception Desk</h1>
        <div className="flex items-center gap-4">
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" 
          />
          <button
            onClick={() => setIsAddDoctorOpen(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Today's Appointments" className="shadow-sm border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {appointments.map(apt => (
                    <tr key={apt._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{apt.patient?.user?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{apt.doctor?.user?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{apt.timeSlot}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge status={apt.status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={apt.status}
                          onChange={(e) => handleStatusChange(apt._id, e.target.value)}
                          className="border border-slate-300 rounded-lg p-1 text-sm bg-white focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirm</option>
                          <option value="Completed">Complete</option>
                          <option value="Cancelled">Cancel</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No appointments for this date.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <ReceptionInbox receptionistId={user?._id} />
        </div>
      </div>

      <AddDoctorModal 
        isOpen={isAddDoctorOpen} 
        onClose={() => setIsAddDoctorOpen(false)} 
        onSuccess={() => alert('Doctor registered successfully!')}
      />
    </div>
  );
};

export default AppointmentList;
