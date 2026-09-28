import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { format } from 'date-fns';

const Schedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedApt, setSelectedApt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({ diagnosis: '', notes: '', prescription: [] });

  const fetchSchedule = async () => {
    try {
      const res = await axios.get('/api/appointments'); // Backend handles filtering for logged-in doctor
      const today = format(new Date(), 'yyyy-MM-dd');
      // Filter for today's appointments if backend returns all
      setAppointments(res.data.data.filter(a => a.date?.startsWith(today)));
    } catch (error) {
      console.error("Error fetching schedule", error);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const openModal = (apt) => {
    setSelectedApt(apt);
    setRecordForm({ diagnosis: '', notes: '', prescription: [{ medication: '', dosage: '', duration: '' }] });
    setIsModalOpen(true);
  };

  const handleAddMed = () => {
    setRecordForm({ ...recordForm, prescription: [...recordForm.prescription, { medication: '', dosage: '', duration: '' }] });
  };

  const handleMedChange = (index, field, value) => {
    const newPresc = [...recordForm.prescription];
    newPresc[index][field] = value;
    setRecordForm({ ...recordForm, prescription: newPresc });
  };

  const handleRemoveMed = (index) => {
    const newPresc = recordForm.prescription.filter((_, i) => i !== index);
    setRecordForm({ ...recordForm, prescription: newPresc });
  };

  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/medical-records', {
        patient: selectedApt.patient._id,
        appointment: selectedApt._id,
        diagnosis: recordForm.diagnosis,
        clinicalNotes: recordForm.notes,
        prescription: recordForm.prescription.filter(p => p.medication)
      });
      await axios.patch(`/api/appointments/${selectedApt._id}/status`, { status: 'Completed' });
      setIsModalOpen(false);
      fetchSchedule();
      alert('Record saved and appointment completed.');
    } catch (error) {
      alert('Error saving record');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Schedule (Today)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map(apt => (
          <Card key={apt._id} className="cursor-pointer hover:shadow-lg transition-shadow" >
            <div onClick={() => openModal(apt)}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">{apt.patient?.user?.name}</h3>
                <Badge status={apt.status} />
              </div>
              <p className="text-sm text-gray-600 mb-2"><strong>Time:</strong> {apt.timeSlot}</p>
              <p className="text-sm text-gray-600 mb-2"><strong>Reason:</strong> {apt.reasonForVisit}</p>
            </div>
          </Card>
        ))}
        {appointments.length === 0 && <p className="text-gray-500">No appointments scheduled for today.</p>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Appointment Details">
        {selectedApt && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800">Patient Info</h4>
              <p className="text-sm">Name: {selectedApt.patient?.user?.name}</p>
              <p className="text-sm">Email: {selectedApt.patient?.user?.email}</p>
            </div>
            
            {(selectedApt.status === 'Confirmed' || selectedApt.status === 'Completed') && (
              <form onSubmit={handleSubmitRecord} className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-gray-800">Clinical Notes & Prescription</h4>
                <div>
                  <label className="block text-sm font-medium">Diagnosis</label>
                  <input required type="text" value={recordForm.diagnosis} onChange={e => setRecordForm({...recordForm, diagnosis: e.target.value})} className="mt-1 block w-full rounded border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Notes</label>
                  <textarea value={recordForm.notes} onChange={e => setRecordForm({...recordForm, notes: e.target.value})} className="mt-1 block w-full rounded border p-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Prescription</label>
                    <button type="button" onClick={handleAddMed} className="text-xs bg-gray-200 px-2 py-1 rounded">Add Med</button>
                  </div>
                  {recordForm.prescription.map((med, idx) => (
                    <div key={idx} className="flex gap-2 mb-2 items-center">
                      <input placeholder="Medication" value={med.medication} onChange={e => handleMedChange(idx, 'medication', e.target.value)} className="w-1/3 border rounded p-1 text-sm" />
                      <input placeholder="Dosage" value={med.dosage} onChange={e => handleMedChange(idx, 'dosage', e.target.value)} className="w-1/3 border rounded p-1 text-sm" />
                      <input placeholder="Duration" value={med.duration} onChange={e => handleMedChange(idx, 'duration', e.target.value)} className="w-1/4 border rounded p-1 text-sm" />
                      <button type="button" onClick={() => handleRemoveMed(idx)} className="text-red-500 font-bold">X</button>
                    </div>
                  ))}
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Save & Complete</button>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Schedule;
