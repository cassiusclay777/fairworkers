import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const BookingSystem = ({ worker, service, onClose, onBookingCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    if (worker && service) {
      generateAvailableSlots();
    }
  }, [worker, service]);

  const generateAvailableSlots = () => {
    // Generate available time slots for the next 7 days
    const slots = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Generate time slots from 9 AM to 9 PM
      for (let hour = 9; hour <= 21; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        slots.push({
          date: date.toISOString().split('T')[0],
          time: timeString,
          display: `${date.toLocaleDateString()} ${timeString}`
        });
      }
    }
    
    setAvailableSlots(slots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to make a booking');
      return;
    }

    try {
      setLoading(true);
      
      const bookingData = {
        clientId: user.id,
        workerId: worker.id,
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        duration: service.duration,
        dateTime: new Date(`${formData.date}T${formData.time}`),
        location: formData.location,
        specialRequests: formData.specialRequests
      };

      const response = await api.post('/api/bookings', bookingData);
      
      if (onBookingCreated) {
        onBookingCreated(response.data.booking);
      }
      
      if (onClose) {
        onClose();
      }
      
      alert('Booking created successfully!');
      
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!worker || !service) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="card max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Booking Error</h2>
          <p className="text-white/70 mb-6">Worker or service information is missing.</p>
          <button onClick={onClose} className="btn-secondary w-full">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Book Service</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-3xl"
          >
            ×
          </button>
        </div>

        {/* Service Summary */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{service.name}</h3>
              <p className="text-white/60">with {worker.username}</p>
              <p className="text-white/60 mt-2">{service.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-400">
                {service.price} Kč
              </div>
              <div className="text-white/60">{service.duration}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Time
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                className="input w-full"
              >
                <option value="">Select time</option>
                {availableSlots
                  .filter(slot => slot.date === formData.date)
                  .map(slot => (
                    <option key={`${slot.date}-${slot.time}`} value={slot.time}>
                      {slot.time}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter meeting location"
              required
              className="input w-full"
            />
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Special Requests (Optional)
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              placeholder="Any special requirements or preferences..."
              rows="4"
              className="input w-full resize-none"
            />
          </div>

          {/* Booking Summary */}
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Service:</span>
                <span>{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Duration:</span>
                <span>{service.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Price:</span>
                <span>{service.price} Kč</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Platform Fee (15%):</span>
                <span>{Math.round(service.price * 0.15)} Kč</span>
              </div>
              <div className="border-t border-white/10 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Worker Receives:</span>
                  <span className="text-primary-400">
                    {Math.round(service.price * 0.85)} Kč
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Creating Booking...' : 'Confirm Booking'}
            </button>
          </div>

          {/* Fair Pricing Note */}
          <div className="text-center text-white/60 text-sm">
            <p>✨ Worker receives 85% of the payment - fair and transparent!</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingSystem;