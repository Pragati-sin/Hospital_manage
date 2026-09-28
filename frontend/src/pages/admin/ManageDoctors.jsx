import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import Card from '../../components/ui/Card';

const ManageDoctors = () => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [deptForm, setDeptForm] = useState({ name: '', description: '' });
  
  const [docForm, setDocForm] = useState({
    name: '', email: '', password: '', phone: '', department: '',
    specialization: '', experience: '', consultationFee: '',
    availableDays: [], shiftStart: '', shiftEnd: ''
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchData = async () => {
    try {
      const [deptRes, docRes] = await Promise.all([
        axios.get('/api/departments'),
        axios.get('/api/doctors')
      ]);
      setDepartments(deptRes.data.data || deptRes.data);
      setDoctors(docRes.data.data || docRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDept = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/departments', deptForm);
      setDeptForm({ name: '', description: '' });
      fetchData();
      alert('Department added');
    } catch (error) {
      alert('Error adding department');
    }
  };

  const handleDocChange = (e) => setDocForm({ ...docForm, [e.target.name]: e.target.value });

  const handleDaysChange = (day) => {
    setDocForm(prev => {
      const days = prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: days };
    });
  };

  const handleAddDoc = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/doctors', {
        name: docForm.name,
        email: docForm.email,
        password: docForm.password,
        phone: docForm.phone,
        department: docForm.department,
        specialization: docForm.specialization,
        experience: Number(docForm.experience),
        consultationFee: Number(docForm.consultationFee),
        availableDays: docForm.availableDays,
        shiftStart: docForm.shiftStart,
        shiftEnd: docForm.shiftEnd
      });
      alert('Doctor registered');
      fetchData();
      setDocForm({
        name: '', email: '', password: '', phone: '', department: '',
        specialization: '', experience: '', consultationFee: '',
        availableDays: [], shiftStart: '', shiftEnd: ''
      });
    } catch (error) {
      alert('Error registering doctor');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Manage Doctors & Departments</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card title="Add Department">
            <form onSubmit={handleAddDept} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input required type="text" name="name" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} className="mt-1 block w-full rounded border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea name="description" value={deptForm.description} onChange={e => setDeptForm({...deptForm, description: e.target.value})} className="mt-1 block w-full rounded border p-2" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Add Department</button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card title="Register New Doctor">
            <form onSubmit={handleAddDoc} className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input required type="text" name="name" value={docForm.name} onChange={handleDocChange} className="mt-1 block w-full rounded border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input required type="email" name="email" value={docForm.email} onChange={handleDocChange} className="mt-1 block w-full rounded border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Password</label>
                  <input required type="password" name="password" value={docForm.password} onChange={handleDocChange} className="mt-1 block w-full rounded border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input required type="text" name="phone" value={docForm.phone} onChange={handleDocChange} className="mt-1 block w-full rounded border p-2" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium">Department</label>
                <select required name="department" value={docForm.department} onChange={handleDocChange} className="mt-1 block w-full rounded border p-2">
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Specialization</label>
                <input required type="text" name="specialization" value={docForm.specialization} onChange={handleDocChange} className="mt-1 block w-full rounded border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Experience (years)</label>
                <input required type="number" name="experience" value={docForm.experience} onChange={handleDocChange} className="mt-1 block w-full rounded border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Consultation Fee</label>
                <input required type="number" name="consultationFee" value={docForm.consultationFee} onChange={handleDocChange} className="mt-1 block w-full rounded border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Shift Start</label>
                <input required type="time" name="shiftStart" value={docForm.shiftStart} onChange={handleDocChange} className="mt-1 block w-full rounded border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Shift End</label>
                <input required type="time" name="shiftEnd" value={docForm.shiftEnd} onChange={handleDocChange} className="mt-1 block w-full rounded border p-2" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-2">Available Days</label>
                <div className="flex flex-wrap gap-4">
                  {daysOfWeek.map(day => (
                    <label key={day} className="flex items-center space-x-2">
                      <input type="checkbox" checked={docForm.availableDays.includes(day)} onChange={() => handleDaysChange(day)} className="rounded" />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Register Doctor</button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <Card title="All Doctors">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctors.map(doc => (
                <tr key={doc._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{doc.user?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.department?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.specialization}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${doc.consultationFee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ManageDoctors;
