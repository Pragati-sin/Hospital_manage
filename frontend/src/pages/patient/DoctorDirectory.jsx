import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Card from '../../components/ui/Card';

const DoctorDirectory = () => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('/api/departments');
        setDepartments(res.data.data || res.data);
      } catch (error) {
        console.error("Error fetching departments", error);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const url = selectedDept ? `/api/doctors?department=${selectedDept}` : '/api/doctors';
        const res = await axios.get(url);
        setDoctors(res.data.data || res.data);
      } catch (error) {
        console.error("Error fetching doctors", error);
      }
    };
    fetchDoctors();
  }, [selectedDept]);

  return (
    <div className="space-y-6">
      <div className="relative h-40 rounded-2xl overflow-hidden mb-6 shadow-sm">
        <img 
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80" 
          alt="Hospital Interior" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-teal-900/20 flex items-center p-8">
          <h1 className="text-3xl font-bold text-white">Find a Doctor</h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <p className="text-slate-600 font-medium">Filter by department:</p>
        <select 
          value={selectedDept} 
          onChange={(e) => setSelectedDept(e.target.value)}
          className="border border-slate-300 rounded-lg p-2 bg-white min-w-[200px] focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept._id} value={dept._id}>{dept.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {doctors.map(doc => (
          <Card key={doc._id} className="flex flex-col hover:shadow-lg transition-shadow duration-300 border border-slate-100">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-teal-100 overflow-hidden flex items-center justify-center border-2 border-teal-50">
                  {doc.user?.profileImage ? (
                    <img src={doc.user.profileImage} alt={doc.user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-teal-700">
                      {doc.user?.name?.charAt(0) || 'D'}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Dr. {doc.user?.name}</h2>
                  <p className="text-sm text-teal-600 font-medium">{doc.specialization}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                <p className="flex justify-between">
                  <span className="font-medium">Department:</span> 
                  <span>{doc.department?.name}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Experience:</span> 
                  <span>{doc.experience} years</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Fee:</span> 
                  <span>${doc.consultationFee}</span>
                </p>
                <p className="flex flex-col gap-1 mt-2 pt-2 border-t border-slate-200">
                  <span className="font-medium">Available Days:</span> 
                  <span className="text-slate-500">{doc.availableDays.join(', ')}</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate(`/patient/book/${doc._id}`)}
              className="mt-6 w-full bg-teal-600 text-white p-2.5 rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
            >
              Book Appointment
            </button>
          </Card>
        ))}
        {doctors.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-100">
            No doctors found for this selection.
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDirectory;
