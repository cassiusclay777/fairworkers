import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    query: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    location: '',
    verifiedOnly: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch client bookings
      const bookingsResponse = await api.get(`/api/bookings/user/${user.id}?role=client`);
      setBookings(bookingsResponse.data);

      // Fetch available workers
      const workersResponse = await api.get('/api/search/workers');
      setWorkers(workersResponse.data.results || []);
      setSearchResults(workersResponse.data.results || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchWorkers = async (filters = searchFilters) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== false) {
          params.append(key, value);
        }
      });

      const response = await api.get(`/api/search/workers?${params}`);
      setSearchResults(response.data.results);
    } catch (error) {
      console.error('Error searching workers:', error);
    }
  };

  const createBooking = async (workerId, service) => {
    try {
      const bookingData = {
        clientId: user.id,
        workerId,
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        duration: service.duration,
        dateTime: new Date(), // In real app, this would be from a form
        location: 'Client Location', // In real app, this would be from a form
        specialRequests: ''
      };

      await api.post('/api/bookings', bookingData);
      fetchDashboardData(); // Refresh bookings
      setActiveTab('bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Client Dashboard</h1>
              <p className="text-white/60">Welcome, {user?.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-400">
                  {bookings.length}
                </div>
                <div className="text-sm text-white/60">Total Bookings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary-500/20 to-primary-700/20 border-primary-500/30">
            <div className="text-3xl font-bold text-primary-400">{bookings.length}</div>
            <div className="text-white/60">Total Bookings</div>
          </div>
          
          <div className="card bg-gradient-to-br from-green-500/20 to-green-700/20 border-green-500/30">
            <div className="text-3xl font-bold text-green-400">
              {bookings.filter(b => b.status === 'completed').length}
            </div>
            <div className="text-white/60">Completed</div>
          </div>
          
          <div className="card bg-gradient-to-br from-yellow-500/20 to-yellow-700/20 border-yellow-500/30">
            <div className="text-3xl font-bold text-yellow-400">
              {bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length}
            </div>
            <div className="text-white/60">Active</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/5 rounded-lg p-1">
          {['browse', 'bookings', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary-500 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="card">
          {activeTab === 'browse' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Find Workers</h2>
              
              {/* Search Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
                <input
                  type="text"
                  placeholder="Search workers or services..."
                  value={searchFilters.query}
                  onChange={(e) => setSearchFilters({...searchFilters, query: e.target.value})}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={searchFilters.location}
                  onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                  className="input"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="verifiedOnly"
                    checked={searchFilters.verifiedOnly}
                    onChange={(e) => setSearchFilters({...searchFilters, verifiedOnly: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="verifiedOnly" className="text-sm text-white/60">Verified Only</label>
                </div>
              </div>

              <button 
                onClick={() => searchWorkers()}
                className="btn-primary"
              >
                Search Workers
              </button>

              {/* Search Results */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map(worker => (
                  <div key={worker.id} className="p-4 bg-white/5 rounded-lg hover:scale-105 transition-transform">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
                        <span className="text-xl">👤</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{worker.username}</h3>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm">{worker.rating || 'New'}</span>
                          {worker.verified && (
                            <span className="text-green-400 text-sm">✓ Verified</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/60 text-sm mb-3">{worker.bio || 'No bio available'}</p>
                    
                    <div className="space-y-2">
                      {worker.services?.slice(0, 2).map(service => (
                        <div key={service.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                          <div>
                            <div className="font-medium text-sm">{service.name}</div>
                            <div className="text-xs text-white/60">{service.duration}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-primary-400 font-semibold">{service.price} Kč</div>
                            <button
                              onClick={() => createBooking(worker.id, service)}
                              className="btn-primary text-xs"
                            >
                              Book
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
              {bookings
                .filter(booking => booking.status !== 'completed' && booking.status !== 'cancelled')
                .map(booking => (
                  <div key={booking._id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.serviceName}</h3>
                        <p className="text-white/60">Worker: {booking.workerId?.username}</p>
                        <p className="text-white/60">
                          {new Date(booking.dateTime).toLocaleString()}
                        </p>
                        <p className="text-primary-400 font-semibold">{booking.price} Kč</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {booking.status}
                      </div>
                    </div>
                    
                    {booking.specialRequests && (
                      <p className="text-white/60 text-sm mb-3">
                        <strong>Special Requests:</strong> {booking.specialRequests}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Booking History</h2>
              {bookings
                .filter(booking => booking.status === 'completed' || booking.status === 'cancelled')
                .map(booking => (
                  <div key={booking._id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.serviceName}</h3>
                        <p className="text-white/60">Worker: {booking.workerId?.username}</p>
                        <p className="text-white/60">
                          {new Date(booking.dateTime).toLocaleString()}
                        </p>
                        <p className="text-primary-400 font-semibold">{booking.price} Kč</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {booking.status}
                      </div>
                    </div>
                    
                    {booking.rating && (
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400">⭐</span>
                        <span>{booking.rating}/5</span>
                        {booking.review && (
                          <span className="text-white/60 text-sm">- {booking.review}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;