import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Play, Share, Trash2, Plus, Calendar, Code } from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const { user } = useAuth();
  const [playgrounds, setPlaygrounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPlaygrounds();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPlaygrounds = async () => {
    try {
      const response = await axios.get('/api/playground', { withCredentials: true });
      setPlaygrounds(response.data);
    } catch (error) {
      console.error('Failed to fetch playgrounds:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePlayground = async (id) => {
    if (!confirm('Are you sure you want to delete this playground?')) return;
    
    try {
      await axios.delete(`/api/playground/${id}`, { withCredentials: true });
      setPlaygrounds(playgrounds.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete playground:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <Code size={64} className="mx-auto mb-8 text-orange-400" />
          <h1 className="text-4xl font-bold mb-4 text-white">Code Playground</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            Compile, Run, Debug. Write and execute Java and Python code online with our powerful playground.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
          >
            <span>Get Started</span>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">My Playgrounds</h1>
          <p className="text-gray-400 mt-2">Manage and organize your code snippets</p>
        </div>
        <Link
          to="/playground"
          className="inline-flex items-center space-x-2 px-4 md:px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors touch-manipulation w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus size={20} />
          <span>New Playground</span>
        </Link>
      </div>

      {playgrounds.length === 0 ? (
        <div className="text-center py-12">
          <Code size={48} className="mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No playgrounds yet</h3>
          <p className="text-gray-500 mb-6">Create your first playground to get started</p>
          <Link
            to="/playground"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Create Playground</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {playgrounds.map((playground) => (
            <div
              key={playground.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-medium text-white mb-2 truncate">
                    {playground.title}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-400">
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs font-medium">
                      {playground.language}
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{formatDate(playground.updated_at)}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              {playground.description && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {playground.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <Link
                  to={`/playground/${playground.id}`}
                  className="inline-flex items-center space-x-2 px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors touch-manipulation"
                >
                  <Play size={16} />
                  <span>Open</span>
                </Link>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => deletePlayground(playground.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors touch-manipulation"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;