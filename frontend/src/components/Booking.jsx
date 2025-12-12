import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const Booking = ({ workerId, workerName, isOwner = false, onClose }) => {
  const { user } = useAuth();
  const [view, setView] = useState(isOwner ? 'manage' : 'book'); // 'book' or 'manage'
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);

  // Service types
  const services = [
    { id: 'call-30', name: '30min Privátní hovor', duration: 30, price: 300, icon: '📞' },
    { id: 'call-60', name: '1h Privátní hovor', duration: 60, price: 500, icon: '📞' },
    { id: 'call-120', name: '2h Privátní hovor', duration: 120, price: 900, icon: '📞' },
    { id: 'photoshoot', name: 'Foto session', duration: 60, price: 800, icon: '📸' },
    { id: 'custom', name: 'Custom požadavek', duration: 60, price: 1000, icon: '✨' }
  ];

  useEffect(() => {
    fetchBookings();
    fetchAvailability();
  }, [workerId]);

  const fetchBookings = async () => {
    try {
      const response = await api.get(`/bookings/worker/${workerId}`);
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Demo bookings
      setBookings([
        {
          id: 1,
          clientName: 'Jan N.',
          service: services[1],
          date: '2025-11-15',
          time: '14:00',
          status: 'confirmed',
          price: 500
        },
        {
          id: 2,
          clientName: 'Petr K.',
          service: services[0],
          date: '2025-11-16',
          time: '18:00',
          status: 'pending',
          price: 300
        }
      ]);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await api.get(`/bookings/availability/${workerId}`);
      if (response.data.success) {
        setAvailability(response.data.availability);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      // Demo availability
      setAvailability({
        '2025-11-15': ['10:00', '11:00', '14:00', '15:00', '16:00', '18:00', '19:00', '20:00'],
        '2025-11-16': ['12:00', '13:00', '14:00', '15:00', '18:00', '19:00', '20:00', '21:00'],
        '2025-11-17': ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']
      });
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedService) {
      alert('Vyber prosím datum, čas a typ služby');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/bookings/create', {
        workerId,
        clientId: user.id,
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        price: selectedService.price,
        duration: selectedService.duration
      });

      if (response.data.success) {
        alert(`Rezervace úspěšná! 🎉\n\n${selectedService.name}\n${selectedDate} v ${selectedTime}\nCena: ${selectedService.price} Kč`);
        fetchBookings();
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedService(null);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Rezervace se nezdařila');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Opravdu chceš zrušit tuto rezervaci?')) return;

    try {
      const response = await api.post(`/bookings/${bookingId}/cancel`);
      if (response.data.success) {
        alert('Rezervace zrušena');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Zrušení se nezdařilo');
    }
  };

  const handleSetAvailability = async (date, times) => {
    try {
      const response = await api.post('/bookings/set-availability', {
        workerId,
        date,
        times
      });

      if (response.data.success) {
        setAvailability(prev => ({ ...prev, [date]: times }));
        alert('Dostupnost nastavena!');
      }
    } catch (error) {
      console.error('Error setting availability:', error);
    }
  };

  // Generate next 14 days
  const getNext14Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date) => {
    const days = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
    const months = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
    return `${days[date.getDay()]} ${date.getDate()}. ${months[date.getMonth()]}`;
  };

  const availableTimeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

  const next14Days = getNext14Days();

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                📅 {isOwner ? 'Správa rezervací' : `Rezervovat s ${workerName}`}
              </h1>
              <p className="text-white/60">
                {isOwner ? 'Spravuj své termíny a dostupnost' : 'Vyber si čas a typ služby'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {isOwner && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setView('manage')}
                    className={`px-4 py-2 rounded-lg transition ${
                      view === 'manage'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    📋 Rezervace
                  </button>
                  <button
                    onClick={() => setView('availability')}
                    className={`px-4 py-2 rounded-lg transition ${
                      view === 'availability'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    ⏰ Dostupnost
                  </button>
                </div>
              )}
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition text-3xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Client Booking View */}
          {!isOwner && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Service Selection */}
              <div className="lg:col-span-3">
                <h2 className="text-2xl font-bold text-white mb-4">1️⃣ Vyber typ služby</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`card cursor-pointer hover:scale-105 transition ${
                        selectedService?.id === service.id
                          ? 'ring-2 ring-primary-500 bg-primary-500/10'
                          : ''
                      }`}
                    >
                      <div className="text-4xl mb-2">{service.icon}</div>
                      <h3 className="text-white font-bold text-sm mb-1">{service.name}</h3>
                      <div className="text-white/60 text-xs mb-2">{service.duration} min</div>
                      <div className="text-primary-400 font-bold">{service.price} Kč</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="lg:col-span-3">
                <h2 className="text-2xl font-bold text-white mb-4">2️⃣ Vyber datum</h2>
                <div className="grid grid-cols-7 gap-3">
                  {next14Days.map((date) => {
                    const dateStr = formatDate(date);
                    const isAvailable = availability[dateStr]?.length > 0;
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        key={dateStr}
                        onClick={() => isAvailable && setSelectedDate(dateStr)}
                        disabled={!isAvailable}
                        className={`card p-4 text-center transition ${
                          !isAvailable
                            ? 'opacity-30 cursor-not-allowed'
                            : 'hover:scale-105 cursor-pointer'
                        } ${
                          isSelected
                            ? 'ring-2 ring-primary-500 bg-primary-500/10'
                            : ''
                        }`}
                      >
                        <div className="text-white/60 text-xs mb-1">{formatDateDisplay(date).split(' ')[0]}</div>
                        <div className="text-white font-bold text-xl">{date.getDate()}</div>
                        <div className="text-white/40 text-xs mt-1">{formatDateDisplay(date).split(' ')[2]}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="lg:col-span-3">
                  <h2 className="text-2xl font-bold text-white mb-4">3️⃣ Vyber čas</h2>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {availability[selectedDate]?.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`card p-3 text-center hover:scale-105 transition ${
                          selectedTime === time
                            ? 'ring-2 ring-primary-500 bg-primary-500/10'
                            : ''
                        }`}
                      >
                        <div className="text-white font-bold">{time}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Summary */}
              {selectedService && selectedDate && selectedTime && (
                <div className="lg:col-span-3 card bg-gradient-to-r from-primary-500/20 to-gold-500/20 border-primary-500/30">
                  <h2 className="text-2xl font-bold text-white mb-4">📋 Shrnutí rezervace</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-white/60">Služba:</span>
                      <span className="text-white font-semibold">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Datum:</span>
                      <span className="text-white font-semibold">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Čas:</span>
                      <span className="text-white font-semibold">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Délka:</span>
                      <span className="text-white font-semibold">{selectedService.duration} minut</span>
                    </div>
                    <div className="h-px bg-white/10 my-4"></div>
                    <div className="flex justify-between text-xl">
                      <span className="text-white font-bold">Celkem:</span>
                      <span className="text-primary-400 font-bold">{selectedService.price} Kč</span>
                    </div>
                  </div>
                  <button
                    onClick={handleBooking}
                    disabled={loading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-gold-500 text-white font-bold rounded-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    {loading ? '⏳ Rezervuji...' : '✅ Potvrdit rezervaci'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Owner Management View */}
          {isOwner && view === 'manage' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Nadcházející rezervace</h2>
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="card text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <div className="text-white text-xl">Zatím žádné rezervace</div>
                    <div className="text-white/60 mt-2">Čekej na první klienty!</div>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="card hover:scale-[1.02] transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-4xl">{booking.service.icon}</div>
                          <div>
                            <h3 className="text-white font-bold text-lg">{booking.clientName}</h3>
                            <p className="text-white/60">{booking.service.name}</p>
                            <p className="text-white/40 text-sm">{booking.date} v {booking.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-primary-400 font-bold text-xl">{booking.price} Kč</div>
                            <div className={`text-sm font-semibold ${
                              booking.status === 'confirmed' ? 'text-green-400' :
                              booking.status === 'pending' ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {booking.status === 'confirmed' ? '✅ Potvrzeno' :
                               booking.status === 'pending' ? '⏳ Čeká' :
                               '❌ Zrušeno'}
                            </div>
                          </div>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                          >
                            Zrušit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Owner Availability View */}
          {isOwner && view === 'availability' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Nastav svou dostupnost</h2>
              <div className="space-y-6">
                {next14Days.map((date) => {
                  const dateStr = formatDate(date);
                  const currentAvailability = availability[dateStr] || [];

                  return (
                    <div key={dateStr} className="card">
                      <h3 className="text-white font-bold text-lg mb-4">
                        {formatDateDisplay(date)} - {dateStr}
                      </h3>
                      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-2">
                        {availableTimeSlots.map((time) => {
                          const isAvailable = currentAvailability.includes(time);
                          return (
                            <button
                              key={time}
                              onClick={() => {
                                const newTimes = isAvailable
                                  ? currentAvailability.filter(t => t !== time)
                                  : [...currentAvailability, time].sort();
                                handleSetAvailability(dateStr, newTimes);
                              }}
                              className={`p-2 rounded-lg transition text-sm font-semibold ${
                                isAvailable
                                  ? 'bg-green-500/20 border border-green-500 text-green-400'
                                  : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
