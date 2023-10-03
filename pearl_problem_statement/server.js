const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Dummy data for doctors
const doctors = [
  {
    id: 1,
    name: 'Dr. Smith',
    location: 'City Hospital',
    maxPatients: 10,
    weeklySchedule: '0111110', // Assuming evenings from Mon to Sat
  },
  // Add more doctor data as needed
];

// Dummy data for appointments
const appointments = [];

// API endpoint for listing doctors
app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

// API endpoint for viewing doctor details by ID
app.get('/api/doctors/:id', (req, res) => {
  const doctorId = parseInt(req.params.id);
  const doctor = doctors.find((doc) => doc.id === doctorId);

  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  res.json(doctor);
});

// API endpoint for booking appointments
app.post('/api/appointments', (req, res) => {
  const { doctorId, date, time, patientName } = req.body;

  const doctor = doctors.find((doc) => doc.id === doctorId);

  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
  
  // Check if the doctor practices on the requested day
  if (dayOfWeek !== 0 && doctor.weeklySchedule[dayOfWeek - 1] === '1') {
    // Check if the appointment time is in the evening (for simplicity)
    if (time >= '17:00' && time <= '20:00') {
      // Check if the maximum patient limit is reached
      const appointmentsForDoctor = appointments.filter(
        (app) => app.doctorId === doctorId && app.date === date && app.time === time
      );

      if (appointmentsForDoctor.length < doctor.maxPatients) {
        appointments.push({ doctorId, date, time, patientName });
        return res.json({ message: 'Appointment booked successfully' });
      } else {
        return res.status(400).json({ message: 'Maximum patient limit reached for this slot' });
      }
    } else {
      return res.status(400).json({ message: 'Appointments are only available in the evening' });
    }
  } else {
    return res.status(400).json({ message: 'Doctor is not available on this day' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
