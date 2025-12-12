import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const Stories = ({ onClose }) => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState('story'); // 'story' or 'message'
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    // Auto-advance story after 5 seconds
    if (stories.length > 0 && currentStoryIndex < stories.length) {
      const timer = setTimeout(() => {
        if (currentStoryIndex < stories.length - 1) {
          setCurrentStoryIndex(currentStoryIndex + 1);
        } else {
          onClose();
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentStoryIndex, stories.length]);

  const fetchStories = async () => {
    try {
      const response = await api.get('/stories');
      if (response.data.success) {
        setStories(response.data.stories);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      // Demo stories
      setStories([
        {
          id: 1,
          userId: 2,
          userName: 'Lucie M.',
          type: 'video',
          url: null,
          thumbnail: null,
          caption: 'Dnes večer live stream! 🎥',
          isPremium: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: 2,
          userId: 3,
          userName: 'Tereza N.',
          type: 'image',
          url: null,
          thumbnail: null,
          caption: 'Nové fotky v galerii 📸',
          isPremium: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        },
        {
          id: 3,
          userId: 1,
          userName: 'Petra K.',
          type: 'video',
          url: null,
          thumbnail: null,
          caption: 'Behind the scenes 💄',
          isPremium: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
        }
      ]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Vyber video nebo fotku');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', uploadType);
    formData.append('userId', user.id);
    formData.append('isPremium', false);

    try {
      setProgress(10);
      const response = await api.post('/stories/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        alert('Story nahrána! 🎉');
        setShowUpload(false);
        setSelectedFile(null);
        setPreview(null);
        setProgress(0);
        fetchStories();
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Nahrávání se nezdařilo');
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const currentStory = stories[currentStoryIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Upload Modal */}
      {showUpload ? (
        <div className="w-full max-w-2xl p-8">
          <div className="bg-gray-900 rounded-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">📹 Nahrát Story</h2>
              <button
                onClick={() => {
                  setShowUpload(false);
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="text-white/60 hover:text-white transition text-3xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Type Selector */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setUploadType('story')}
                  className={`flex-1 px-6 py-4 rounded-lg transition ${
                    uploadType === 'story'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <div className="text-3xl mb-2">📸</div>
                  <div className="font-bold">Story (24h)</div>
                </button>
                <button
                  onClick={() => setUploadType('message')}
                  className={`flex-1 px-6 py-4 rounded-lg transition ${
                    uploadType === 'message'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <div className="text-3xl mb-2">💌</div>
                  <div className="font-bold">Video Message</div>
                </button>
              </div>

              {/* File Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center hover:border-primary-500 transition cursor-pointer"
              >
                {preview ? (
                  <div className="relative">
                    {selectedFile?.type.startsWith('video/') ? (
                      <video src={preview} className="max-h-64 mx-auto rounded-lg" controls />
                    ) : (
                      <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-6xl mb-4">📤</div>
                    <div className="text-white text-xl mb-2">Klikni nebo přetáhni video/fotku</div>
                    <div className="text-white/60 text-sm">Max 100 MB, MP4/MOV/JPG/PNG</div>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Upload Progress */}
              {progress > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">Nahrávání...</span>
                    <span className="text-white font-semibold">{progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-gold-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || progress > 0}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-gold-500 text-white font-bold text-lg rounded-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {progress > 0 ? '⏳ Nahrávám...' : '✅ Nahrát'}
              </button>
            </div>
          </div>
        </div>
      ) : stories.length === 0 ? (
        /* Empty State */
        <div className="text-center">
          <div className="text-8xl mb-6">📸</div>
          <div className="text-white text-3xl font-bold mb-4">Žádné stories</div>
          <div className="text-white/60 text-xl mb-8">Buď první kdo přidá story!</div>
          <button
            onClick={() => setShowUpload(true)}
            className="px-8 py-4 bg-gradient-to-r from-primary-500 to-gold-500 text-white font-bold text-lg rounded-lg hover:scale-105 transition"
          >
            📹 Přidat Story
          </button>
          <button
            onClick={onClose}
            className="ml-4 px-8 py-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
          >
            Zavřít
          </button>
        </div>
      ) : (
        /* Story Viewer */
        <div className="relative w-full max-w-lg h-full max-h-[90vh] flex flex-col">
          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 flex space-x-1 p-4 z-10">
            {stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-white transition-all duration-[5000ms] ${
                    index === currentStoryIndex ? 'w-full' : index < currentStoryIndex ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Story Header */}
          <div className="absolute top-6 left-0 right-0 px-4 pt-8 pb-4 bg-gradient-to-b from-black/60 to-transparent z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-gold-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {currentStory?.userName?.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-bold">{currentStory?.userName}</div>
                  <div className="text-white/60 text-sm">
                    {currentStory && new Date(currentStory.createdAt).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-white text-3xl">✕</button>
            </div>
          </div>

          {/* Story Content */}
          <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden relative">
            {currentStory?.type === 'video' ? (
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                autoPlay
                loop
                muted
              >
                <source src={currentStory.url || 'https://via.placeholder.com/600x800/1a1a1a/ffffff?text=Video'} />
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-gold-500/20">
                <div className="text-8xl">📷</div>
              </div>
            )}

            {/* Navigation Areas */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 cursor-pointer" onClick={handlePrevious} />
              <div className="flex-1 cursor-pointer" onClick={handleNext} />
            </div>

            {/* Caption */}
            {currentStory?.caption && (
              <div className="absolute bottom-0 left-0 right-0 px-4 py-6 bg-gradient-to-t from-black/60 to-transparent">
                <div className="text-white text-lg">{currentStory.caption}</div>
              </div>
            )}

            {/* Premium Badge */}
            {currentStory?.isPremium && (
              <div className="absolute top-20 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold flex items-center space-x-2">
                <span>💎</span>
                <span>Premium</span>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            {currentStoryIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-2xl transition"
              >
                ‹
              </button>
            )}
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <button
              onClick={handleNext}
              className="w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-2xl transition"
            >
              ›
            </button>
          </div>

          {/* Add Story Button */}
          {user?.role === 'worker' && (
            <button
              onClick={() => setShowUpload(true)}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-gradient-to-r from-primary-500 to-gold-500 text-white font-bold rounded-full hover:scale-105 transition"
            >
              ➕ Přidat Story
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Stories;
