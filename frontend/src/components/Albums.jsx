import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const Albums = ({ workerId, isOwner = false, onClose }) => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    description: '',
    accessLevel: 'premium', // public, premium, exclusive
    price: 100
  });

  useEffect(() => {
    fetchAlbums();
  }, [workerId]);

  const fetchAlbums = async () => {
    try {
      const response = await api.get(`/albums/worker/${workerId}`);
      if (response.data.success) {
        setAlbums(response.data.albums);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
      // Demo data pro ukázku
      setAlbums([
        {
          id: 1,
          title: 'Veřejné fotky',
          description: 'Dostupné pro všechny',
          accessLevel: 'public',
          price: 0,
          thumbnailUrl: null,
          mediaCount: 8,
          unlocked: true
        },
        {
          id: 2,
          title: 'Premium obsah',
          description: 'Exclusive behind the scenes',
          accessLevel: 'premium',
          price: 200,
          thumbnailUrl: null,
          mediaCount: 15,
          unlocked: false
        },
        {
          id: 3,
          title: 'VIP Exclusive',
          description: 'Only for VIP members',
          accessLevel: 'exclusive',
          price: 500,
          thumbnailUrl: null,
          mediaCount: 25,
          unlocked: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = async () => {
    try {
      const response = await api.post('/albums/create', {
        ...newAlbum,
        workerId: user.id
      });

      if (response.data.success) {
        setAlbums(prev => [...prev, response.data.album]);
        setShowCreateModal(false);
        setNewAlbum({ title: '', description: '', accessLevel: 'premium', price: 100 });
      }
    } catch (error) {
      console.error('Error creating album:', error);
      alert('Nepodařilo se vytvořit album');
    }
  };

  const handleUnlockAlbum = async (albumId, price) => {
    if (!confirm(`Odemknout album za ${price} Kč?`)) return;

    try {
      const response = await api.post(`/albums/${albumId}/unlock`);
      if (response.data.success) {
        setAlbums(prev => prev.map(a =>
          a.id === albumId ? { ...a, unlocked: true } : a
        ));
        alert('Album odemčeno!');
      }
    } catch (error) {
      console.error('Error unlocking album:', error);
      alert('Nepodařilo se odemknout album');
    }
  };

  const getAccessBadge = (level) => {
    const badges = {
      public: { text: 'Veřejné', color: 'bg-green-500' },
      premium: { text: 'Premium', color: 'bg-gold-500' },
      exclusive: { text: 'Exclusive', color: 'bg-purple-500' }
    };
    return badges[level] || badges.public;
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                📸 Galerie
              </h1>
              <p className="text-white/60">
                {isOwner ? 'Spravuj své albumy' : 'Prohlížej prémiový obsah'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {isOwner && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-gold-500 text-white font-semibold rounded-lg hover:scale-105 transition"
                >
                  ➕ Nové album
                </button>
              )}
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition text-3xl"
              >
                ✕
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-white text-2xl py-20">Načítání...</div>
          ) : (
            <>
              {/* Albums Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album) => {
                  const badge = getAccessBadge(album.accessLevel);
                  const isLocked = !album.unlocked && album.accessLevel !== 'public';

                  return (
                    <div
                      key={album.id}
                      className="card hover:scale-105 transition cursor-pointer relative overflow-hidden group"
                      onClick={() => !isLocked && setSelectedAlbum(album)}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-gold-500/20 rounded-lg mb-4 flex items-center justify-center relative">
                        {album.thumbnailUrl ? (
                          <img
                            src={album.thumbnailUrl}
                            alt={album.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-6xl">📷</div>
                        )}

                        {/* Lock overlay */}
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-6xl mb-2">🔒</div>
                              <div className="text-white text-xl font-bold">{album.price} Kč</div>
                            </div>
                          </div>
                        )}

                        {/* Access badge */}
                        <div className={`absolute top-2 right-2 ${badge.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                          {badge.text}
                        </div>
                      </div>

                      {/* Info */}
                      <h3 className="text-xl font-bold text-white mb-2">{album.title}</h3>
                      <p className="text-white/60 text-sm mb-3">{album.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-sm">{album.mediaCount} položek</span>
                        {isLocked && !isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnlockAlbum(album.id, album.price);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-gold-500 to-yellow-500 text-white font-bold rounded-lg hover:scale-105 transition text-sm"
                          >
                            🔓 Odemknout
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty state */}
              {albums.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📸</div>
                  <div className="text-white text-xl mb-2">Zatím žádná alba</div>
                  <div className="text-white/60">
                    {isOwner ? 'Vytvoř své první album!' : 'Tento model zatím nemá žádný obsah'}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Create Album Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-white mb-6">Nové album</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Název</label>
                    <input
                      type="text"
                      value={newAlbum.title}
                      onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                      placeholder="Například: Premium fotky"
                    />
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Popis</label>
                    <textarea
                      value={newAlbum.description}
                      onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                      rows="3"
                      placeholder="Popis obsahu..."
                    />
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Úroveň přístupu</label>
                    <select
                      value={newAlbum.accessLevel}
                      onChange={(e) => setNewAlbum({ ...newAlbum, accessLevel: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="public">Veřejné (zdarma)</option>
                      <option value="premium">Premium (platba)</option>
                      <option value="exclusive">Exclusive (VIP)</option>
                    </select>
                  </div>

                  {newAlbum.accessLevel !== 'public' && (
                    <div>
                      <label className="text-white/60 text-sm mb-2 block">Cena (Kč)</label>
                      <input
                        type="number"
                        value={newAlbum.price}
                        onChange={(e) => setNewAlbum({ ...newAlbum, price: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                        min="0"
                      />
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                  >
                    Zrušit
                  </button>
                  <button
                    onClick={handleCreateAlbum}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-gold-500 text-white font-bold rounded-lg hover:scale-105 transition"
                  >
                    Vytvořit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Album Detail Modal */}
          {selectedAlbum && (
            <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
              <div className="min-h-screen p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white">{selectedAlbum.title}</h2>
                      <p className="text-white/60 mt-2">{selectedAlbum.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedAlbum(null)}
                      className="text-white/60 hover:text-white transition text-3xl"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Media Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(selectedAlbum.mediaCount)].map((_, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gradient-to-br from-primary-500/20 to-gold-500/20 rounded-lg flex items-center justify-center hover:scale-105 transition cursor-pointer"
                      >
                        <div className="text-4xl">🖼️</div>
                      </div>
                    ))}
                  </div>

                  {/* Upload section for owners */}
                  {isOwner && (
                    <div className="mt-8 card">
                      <h3 className="text-xl font-bold text-white mb-4">Nahrát obsah</h3>
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-primary-500 transition cursor-pointer">
                        <div className="text-4xl mb-2">📤</div>
                        <div className="text-white/60">Klikni nebo přetáhni fotky/videa</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Albums;
