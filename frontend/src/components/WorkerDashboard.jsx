import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch booking statistics
      const statsResponse = await api.get(`/api/bookings/stats/${user.id}?role=worker`);
      setStats(statsResponse.data);

      // Fetch recent bookings
      const bookingsResponse = await api.get(`/api/bookings/user/${user.id}?role=worker`);
      setBookings(bookingsResponse.data);

      // Fetch worker services
      const workerResponse = await api.get(`/api/workers/${user.id}`);
      setServices(workerResponse.data.services || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/api/bookings/${bookingId}/status`, { status });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const addService = async (serviceData) => {
    try {
      await api.post(`/api/workers/${user.id}/services`, serviceData);
      fetchDashboardData(); // Refresh services
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
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
              <h1 className="text-3xl font-bold">Worker Dashboard</h1>
              <p className="text-white/60">Welcome back, {user?.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-400">
                  {stats.totalEarnings.toLocaleString()} Kč
                </div>
                <div className="text-sm text-white/60">Total Earnings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary-500/20 to-primary-700/20 border-primary-500/30">
            <div className="text-3xl font-bold text-primary-400">{stats.totalEarnings.toLocaleString()} Kč</div>
            <div className="text-white/60">Total Earnings</div>
          </div>
          
          <div className="card bg-gradient-to-br from-green-500/20 to-green-700/20 border-green-500/30">
            <div className="text-3xl font-bold text-green-400">{stats.completedBookings}</div>
            <div className="text-white/60">Completed Bookings</div>
          </div>
          
          <div className="card bg-gradient-to-br from-yellow-500/20 to-yellow-700/20 border-yellow-500/30">
            <div className="text-3xl font-bold text-yellow-400">{stats.pendingBookings}</div>
            <div className="text-white/60">Pending Requests</div>
          </div>
          
          <div className="card bg-gradient-to-br from-purple-500/20 to-purple-700/20 border-purple-500/30">
            <div className="text-3xl font-bold text-purple-400">{stats.averageRating || 'N/A'}</div>
            <div className="text-white/60">Average Rating</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/5 rounded-lg p-1">
          {['overview', 'bookings', 'services', 'earnings'].map(tab => (
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
              {bookings.slice(0, 5).map(booking => (
                <div key={booking._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="font-semibold">{booking.serviceName}</div>
                    <div className="text-sm text-white/60">
                      {new Date(booking.dateTime).toLocaleDateString()} • {booking.clientId?.username}
                    </div>
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
              ))}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Booking Management</h2>
              {bookings.map(booking => (
                <div key={booking._id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{booking.serviceName}</h3>
                      <p className="text-white/60">Client: {booking.clientId?.username}</p>
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
                  
                  {booking.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                        className="btn-primary text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'rejected')}
                        className="btn-secondary text-sm"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => updateBookingStatus(booking._id, 'completed')}
                      className="btn-primary text-sm"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Services</h2>
                <button className="btn-primary">Add New Service</button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {services.map(service => (
                  <div key={service.id} className="p-4 bg-white/5 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                    <p className="text-white/60 mb-2">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-primary-400 font-semibold">{service.price} Kč</span>
                      <span className="text-white/60">{service.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Earnings Overview</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-green-500/20 to-green-700/20 rounded-lg border border-green-500/30">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {stats.totalEarnings.toLocaleString()} Kč
                  </div>
                  <div className="text-white/60">Total Earnings</div>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-700/20 rounded-lg border border-blue-500/30">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {Math.round(stats.totalEarnings * 0.85).toLocaleString()} Kč
                  </div>
                  <div className="text-white/60">Your Share (85%)</div>
                </div>
              </div>
              
              <div className="p-6 bg-white/5 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Recent Payouts</h3>
                <div className="space-y-3">
                  {bookings
                    .filter(b => b.status === 'completed')
                    .slice(0, 5)
                    .map(booking => (
                      <div key={booking._id} className="flex justify-between items-center p-3 bg-white/5 rounded">
                        <div>
                          <div className="font-medium">{booking.serviceName}</div>
                          <div className="text-sm text-white/60">
                            {new Date(booking.dateTime).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-green-400 font-semibold">
                          +{Math.round(booking.price * 0.85)} Kč
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;