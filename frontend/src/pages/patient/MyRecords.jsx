import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { format } from 'date-fns';

const MyRecords = () => {
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptRes, recRes] = await Promise.all([
          axios.get('/api/appointments'),
          axios.get('/api/medical-records')
        ]);
        setAppointments(aptRes.data.data || aptRes.data);
        setRecords(recRes.data.data || recRes.data);
      } catch (error) {
        console.error("Error fetching patient data", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Appointments</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map(apt => (
            <Card key={apt._id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">Dr. {apt.doctor?.user?.name}</h3>
                <Badge status={apt.status} />
              </div>
              <p className="text-sm text-gray-600"><strong>Date:</strong> {format(new Date(apt.date), 'PP')} at {apt.timeSlot}</p>
              <p className="text-sm text-gray-600"><strong>Reason:</strong> {apt.reasonForVisit}</p>
            </Card>
          ))}
          {appointments.length === 0 && <p className="text-gray-500">No appointments found.</p>}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Medical Records</h1>
        <div className="space-y-4">
          {records.map(rec => (
            <Card key={rec._id}>
              <div className="border-b pb-3 mb-3">
                <p className="text-sm text-gray-500"><strong>Date:</strong> {format(new Date(rec.createdAt), 'PP')}</p>
                <p className="text-sm text-gray-500"><strong>Doctor:</strong> Dr. {rec.doctor?.user?.name || 'Unknown'}</p>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800">Diagnosis</h4>
                <p className="text-gray-700">{rec.diagnosis}</p>
              </div>
              {rec.clinicalNotes && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800">Notes</h4>
                  <p className="text-gray-700">{rec.clinicalNotes}</p>
                </div>
              )}
              {rec.prescription && rec.prescription.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Prescription</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {rec.prescription.map((p, i) => (
                      <li key={i}>
                        <span className="font-medium">{p.medication}</span> - {p.dosage} ({p.duration})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
          {records.length === 0 && <p className="text-gray-500">No medical records found.</p>}
        </div>
      </div>
    </div>
  );
};

export default MyRecords;
