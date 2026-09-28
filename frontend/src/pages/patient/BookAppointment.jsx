import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Card from '../../components/ui/Card';
import { format } from 'date-fns';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get('/api/doctors');
        const doc = res.data.data.find(d => d._id === doctorId);
        setDoctor(doc);
      } catch (error) {
        console.error("Error fetching doctor", error);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!doctorId || !date) return;
      try {
        const res = await axios.get(`/api/doctors/${doctorId}/availability?date=${date}`);
        setAvailableSlots(res.data.data || []);
        setSelectedSlot('');
      } catch (error) {
        console.error("Error fetching availability", error);
        setAvailableSlots([]);
      }
    };
    fetchAvailability();
  }, [doctorId, date]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setError('');
    try {
      await axios.post('/api/appointments', {
        doctor: doctorId,
        department: doctor.department?._id,
        date,
        timeSlot: selectedSlot,
        reasonForVisit: reason
      });
      alert('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Slot already booked. Please choose another.');
      } else {
        setError('Failed to book appointment. Please try again.');
      }
    }
  };

  if (!doctor) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Book Appointment with Dr. {doctor.user?.name}</h1>
      
      <Card>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleBook} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <input 
              type="date" 
              required
              min={format(new Date(), 'yyyy-MM-dd')}
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="block w-full border-gray-300 rounded p-2 border" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {availableSlots.length > 0 ? (
                availableSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2 text-sm rounded border ${selectedSlot === slot ? 'bg-blue-600 text-white border-blue-600' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}
                  >
                    {slot}
                  </button>
                ))
              ) : (
                <p className="col-span-full text-sm text-gray-500">No available slots for this date.</p>
              )}
            </div>
          </div>

          {selectedSlot && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
              <textarea 
                required
                rows="3"
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                className="block w-full border-gray-300 rounded p-2 border"
                placeholder="Briefly describe your symptoms or reason for visit"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={!selectedSlot}
            className={`w-full p-3 rounded text-white font-medium ${!selectedSlot ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            Confirm Booking
          </button>
        </form>
      </Card>
    </div>
  );
};

export default BookAppointment;
