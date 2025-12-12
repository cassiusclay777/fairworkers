import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const AlbumManager = () => {
  const { user } = useAuth();
  const [albumsList, setAlbumsList] = useState([]);
  const [activeAlbumId, setActiveAlbumId] = useState(null);
  const [photosList, setPhotosList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [newAlbumData, setNewAlbumData] = useState({
    title: '',
    description: '',
    price: 0,
    isPublic: true
  });

  useEffect(() => {
    fetchAlbumsList();
  }, []);

  const fetchAlbumsList = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/workers/${user.id}/albums`);
      setAlbumsList(response.data.albums || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbumPhotos = async (albumId) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/albums/${albumId}/photos`);
      setPhotosList(response.data.photos || []);
      setActiveAlbumId(albumId);
    } catch (error) {
      console.error('Error fetching album photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlbum = async () => {
    if (!newAlbumData.title.trim()) {
      alert('Album title is required');
      return;
    }

    try {
      await api.post(`/api/workers/${user.id}/albums`, {
        ...newAlbumData,
        price: parseFloat(newAlbumData.price) || 0
      });
      setShowCreateAlbumModal(false);
      setNewAlbumData({ title: '', description: '', price: 0, isPublic: true });
      fetchAlbumsList();
    } catch (error) {
      console.error('Error creating album:', error);
      alert('Failed to create album');
    }
  };

  const uploadPhotos = async (albumId, files) => {
    if (!files || files.length === 0) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('photos', file);
      });

      await api.post(`/api/albums/${albumId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      fetchAlbumPhotos(albumId);
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload photos');
    } finally {
      setLoading(false);
    }
  };

  const updateAlbumPrice = async (albumId, price) => {
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice < 0) {
      alert('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/api/albums/${albumId}`, { price: newPrice });
      fetchAlbumsList();
    } catch (error) {
      console.error('Error updating album price:', error);
      alert('Failed to update album price');
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div>
      <h2>Album Manager</h2>
      {loading && <div>Loading...</div>}
      <button onClick={() => setShowCreateAlbumModal(true)}>Create New Album</button>
      {showCreateAlbumModal && (
        <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px 0' }}>
          <h3>Create New Album</h3>
          <input 
            type="text" 
            placeholder="Title" 
            value={newAlbumData.title} 
            onChange={(e) => setNewAlbumData({ ...newAlbumData, title: e.target.value })} 
          />
          <input 
            type="text" 
            placeholder="Description" 
            value={newAlbumData.description} 
            onChange={(e) => setNewAlbumData({ ...newAlbumData, description: e.target.value })} 
          />
          <input 
            type="number" 
            placeholder="Price" 
            value={newAlbumData.price} 
            onChange={(e) => setNewAlbumData({ ...newAlbumData, price: e.target.value })} 
            min="0"
            step="0.01"
          />
          <label>
            <input 
              type="checkbox" 
              checked={newAlbumData.isPublic} 
              onChange={(e) => setNewAlbumData({ ...newAlbumData, isPublic: e.target.checked })} 
            />
            Public
          </label>
          <button onClick={createAlbum}>Create</button> 
          <button onClick={() => setShowCreateAlbumModal(false)}>Cancel</button>
        </div>
      )}
      <div>
        {albumsList.map(album => (
          <div key={album.id} style={{ border: '1px solid #eee', padding: '10px', margin: '5px 0' }}>
            <h3>{album.title}</h3>
            <p>{album.description}</p>
            <p>Price: ${album.price}</p>
            <p>Status: {album.isPublic ? 'Public' : 'Private'}</p>
            <button onClick={() => fetchAlbumPhotos(album.id)}>View Photos</button>
            <button onClick={() => {
              const newPrice = prompt('Enter new price:', album.price);
              if (newPrice !== null) {
                updateAlbumPrice(album.id, newPrice);
              }
            }}>Update Price</button>
          </div>
        ))}
      </div>
      {activeAlbumId && (
        <div style={{ marginTop: '20px' }}>
          <h3>Album Photos</h3>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={(e) => uploadPhotos(activeAlbumId, e.target.files)} 
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
            {photosList.map(photo => (
              <img 
                key={photo.id} 
                src={photo.url} 
                alt={photo.title || 'Album photo'} 
                style={{ width: '200px', height: '200px', objectFit: 'cover' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumManager;
