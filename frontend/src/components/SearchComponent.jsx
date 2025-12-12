import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/axios';

const SearchComponent = ({ onWorkerSelect, onServiceSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    location: '',
    verifiedOnly: false
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search for autocomplete
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        fetchAutocompleteSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const fetchAutocompleteSuggestions = async () => {
    try {
      const response = await api.get(`/api/search/autocomplete?query=${encodeURIComponent(query)}`);
      setSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
    }
  };

  const performSearch = async (searchFilters = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (query) params.append('query', query);
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value !== '' && value !== false) {
          params.append(key, value);
        }
      });

      const response = await api.get(`/api/search/workers?${params}`);
      setSearchResults(response.data.results);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Error searching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.value);
    setShowSuggestions(false);
    
    // Trigger search based on suggestion type
    if (suggestion.type === 'worker') {
      performSearch({ ...filters, query: suggestion.value });
    } else if (suggestion.type === 'service') {
      performSearch({ ...filters, query: suggestion.value, category: suggestion.category });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      location: '',
      verifiedOnly: false
    });
    setQuery('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar with Autocomplete */}
      <div className="relative" ref={searchRef}>
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              placeholder="Search workers, services, or categories..."
              className="input w-full pl-10"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
              🔍
            </div>
          </div>
          <button
            onClick={() => performSearch()}
            disabled={loading}
            className="btn-primary px-6"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-gray-800 border border-white/10 rounded-lg mt-1 z-50 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">
                    {suggestion.type === 'worker' ? '👤' : '💼'}
                  </span>
                  <div>
                    <div className="font-medium">{suggestion.label}</div>
                    {suggestion.rating && (
                      <div className="text-sm text-white/60 flex items-center space-x-1">
                        <span>⭐ {suggestion.rating}</span>
                      </div>
                    )}
                    {suggestion.category && (
                      <div className="text-sm text-white/60">
                        Category: {suggestion.category}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input w-full"
            >
              <option value="">All Categories</option>
              <option value="conversation">Conversation</option>
              <option value="companionship">Companionship</option>
              <option value="therapy">Therapy</option>
              <option value="consultation">Consultation</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Price Range
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="input flex-1"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="input flex-1"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Minimum Rating
            </label>
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="input w-full"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ ⭐</option>
              <option value="4.0">4.0+ ⭐</option>
              <option value="3.5">3.5+ ⭐</option>
              <option value="3.0">3.0+ ⭐</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Location
            </label>
            <input
              type="text"
              placeholder="City or region"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="input w-full"
            />
          </div>

          {/* Verified Only */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="verifiedOnly"
              checked={filters.verifiedOnly}
              onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="verifiedOnly" className="text-sm text-white/80">
              Verified Workers Only
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 items-end">
            <button
              onClick={() => performSearch()}
              disabled={loading}
              className="btn-primary flex-1"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="btn-secondary"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              Found {searchResults.length} workers
            </h3>
            <div className="text-sm text-white/60">
              Sorted by: Rating
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map(worker => (
              <div
                key={worker.id}
                className="card hover:scale-105 transition-transform cursor-pointer"
                onClick={() => onWorkerSelect && onWorkerSelect(worker)}
              >
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
                
                <p className="text-white/60 text-sm mb-3 line-clamp-2">
                  {worker.bio || 'No bio available'}
                </p>
                
                {worker.location && (
                  <div className="flex items-center space-x-1 text-sm text-white/60 mb-3">
                    <span>📍</span>
                    <span>{worker.location}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  {worker.services?.slice(0, 2).map(service => (
                    <div
                      key={service.id}
                      className="flex justify-between items-center p-2 bg-white/5 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        onServiceSelect && onServiceSelect(worker, service);
                      }}
                    >
                      <div>
                        <div className="font-medium text-sm">{service.name}</div>
                        <div className="text-xs text-white/60">{service.duration}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-primary-400 font-semibold">{service.price} Kč</div>
                        <div className="text-xs text-white/60">
                          Worker gets: {Math.round(service.price * 0.85)} Kč
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {worker.services && worker.services.length > 2 && (
                  <div className="text-center text-sm text-white/60 mt-2">
                    +{worker.services.length - 2} more services
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchResults.length === 0 && query && !loading && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No workers found</h3>
          <p className="text-white/60">
            Try adjusting your search criteria or browse all categories
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;