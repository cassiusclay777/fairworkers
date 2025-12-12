import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const AlbumBrowser = () => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await api.get('/api/albums/public');
      setAlbums(response.data.albums || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
      // Demo data for testing
      setAlbums([
        {
          id: 1,
          title: 'Summer Collection',
          description: 'Beautiful summer photos',
          price: 299,
          worker: { username: 'Petra K.', rating: 4.9 },
          photosCount: 12,
          coverPhoto: null
        },
        {
          id: 2,
          title: 'Urban Style',
          description: 'Modern urban photography',
          price: 199,
          worker: { username: 'Lucie M.', rating: 4.8 },
          photosCount: 8,
          coverPhoto: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbumPhotos = async (albumId) => {
    try {
      const response = await api.get(`/api/albums/${albumId}/photos`);
      setPhotos(response.data.photos || []);
      setSelectedAlbum(albumId);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const purchaseAlbum = async (albumId) => {
    try {
      const response = await api.post('/api/purchases', {
        albumId,
        buyerId: user.id,
        amount: albums.find(a => a.id === albumId)?.price
      });
      
      if (response.data.success) {
        alert('Album purchased successfully!');
        fetchAlbumPhotos(albumId);
      }
    } catch (error) {
      console.error('Error purchasing album:', error);
      alert('Error purchasing album. Please check your wallet balance.');
    }
  };

  const filteredAlbums = albums.filter(album => {
    const matchesSearch = album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         album.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         album.worker.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMinPrice = !minPrice || album.price >= parseInt(minPrice);
    const matchesMaxPrice = !maxPrice || album.price <= parseInt(maxPrice);
    
    return matchesSearch && matchesMinPrice && matchesMaxPrice;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse Photo Albums</h1>
          
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search albums, workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input col-span-2"
            />
            <input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input"
            />
            <input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="input"
            />
          </div>
        </div>

        {/* Albums Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAlbums.map(album => (
            <div key={album.id} className="card hover:scale-105 transition-transform cursor-pointer">
              {/* Album Cover */}
              <div 
                className="aspect-square bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-lg mb-3 flex items-center justify-center overflow-hidden"
                onClick={() => fetchAlbumPhotos(album.id)}
              >
                {album.coverPhoto ? (
                  <img 
                    src={album.coverPhoto} 
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-6xl">📷</span>
                    <div className="text-white/60 text-sm mt-2">
                      {album.photosCount} photos
                    </div>
                  </div>
                )}
              </div>
              
              {/* Album Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{album.title}</h3>
                  <p className="text-white/60 text-sm line-clamp-2">{album.description}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center">
                      <span className="text-xs">👤</span>
                    </div>
                    <span className="text-sm text-white/60">{album.worker.username}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400 text-sm">⭐</span>
                    <span className="text-sm">{album.worker.rating}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-primary-400 font-bold text-lg">
                    {album.price} Kč
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      purchaseAlbum(album.id);
                    }}
                    className="btn-primary text-sm"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Album Preview Modal */}
        {selectedAlbum && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {albums.find(a => a.id === selectedAlbum)?.title}
                </h2>
                <button 
                  onClick={() => setSelectedAlbum(null)}
                  className="text-white/60 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-[60vh]">
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map(photo => (
                      <div key={photo.id} className="aspect-square bg-white/5 rounded-lg overflow-hidden">
                        <img 
                          src={photo.url} 
                          alt="Album photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <span className="text-6xl">🔒</span>
                    <h3 className="text-xl font-bold mt-4">Album Locked</h3>
                    <p className="text-white/60 mt-2 mb-6">
                      Purchase this album to view all {albums.find(a => a.id === selectedAlbum)?.photosCount} photos
                    </p>
                    <button
                      onClick={() => purchaseAlbum(selectedAlbum)}
                      className="btn-primary"
                    >
                      Purchase for {albums.find(a => a.id === selectedAlbum)?.price} Kč
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">
                      by {albums.find(a => a.id === selectedAlbum)?.worker.username}
                    </div>
                    <div className="text-white/60 text-sm">
                      {albums.find(a => a.id === selectedAlbum)?.description}
                    </div>
                  </div>
                  {photos.length === 0 && (
                    <button
                      onClick={() => purchaseAlbum(selectedAlbum)}
                      className="btn-primary"
                    >
                      Buy Album
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredAlbums.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl">🔍</span>
            <h3 className="text-xl font-bold mt-4">No albums found</h3>
            <p className="text-white/60 mt-2">
              Try adjusting your search criteria or check back later for new albums.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumBrowser;
