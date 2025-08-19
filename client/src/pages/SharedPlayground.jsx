import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import { Play, User, Calendar, Loader, Code } from 'lucide-react';
import axios from 'axios';

const SharedPlayground = () => {
  const { token } = useParams();
  const [playground, setPlayground] = useState(null);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSharedPlayground();
  }, [token]);

  const fetchSharedPlayground = async () => {
    try {
      const response = await axios.get(`/api/playground/share/${token}`);
      setPlayground(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to load playground');
    } finally {
      setIsLoading(false);
    }
  };

  const executeCode = async () => {
    setIsExecuting(true);
    setOutput('');
    
    try {
      const response = await axios.post('/api/execute', {
        code: playground.code,
        language: playground.language
      });
      
      const result = response.data;
      let outputText = '';
      
      if (result.output) {
        outputText += result.output;
      }
      
      if (result.error) {
        outputText += (outputText ? '\n' : '') + '--- Error ---\n' + result.error;
      }
      
      outputText += (outputText ? '\n' : '') + `\n--- Execution time: ${result.executionTime}ms ---`;
      
      setOutput(outputText || 'No output');
    } catch (error) {
      setOutput('Execution failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsExecuting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Code size={64} className="mx-auto mb-4 text-gray-500" />
          <h1 className="text-2xl font-bold text-white mb-2">Playground Not Found</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
          >
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-medium text-white">{playground.title}</h1>
            <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded">
              {playground.language}
            </span>
            <span className="text-gray-400 text-sm">Read Only</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={executeCode}
              disabled={isExecuting}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-medium rounded transition-colors"
            >
              {isExecuting ? <Loader className="animate-spin" size={16} /> : <Play size={16} />}
              <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
            </button>
          </div>
        </div>
        
        {/* Playground Info */}
        <div className="mt-4 flex items-center space-x-6 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <User size={16} />
            <span>By {playground.author_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={16} />
            <span>
              {new Date(playground.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
        
        {playground.description && (
          <div className="mt-3">
            <p className="text-gray-300 text-sm">{playground.description}</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 bg-gray-900 text-sm text-gray-400 border-b border-gray-700">
            Code Editor (Read Only)
          </div>
          <div className="flex-1 p-4">
            <CodeEditor
              value={playground.code}
              language={playground.language}
              height="100%"
              readOnly={true}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="w-1/3 border-l border-gray-700 flex flex-col">
          <div className="p-4 bg-gray-900 text-sm text-gray-400 border-b border-gray-700">
            Output
          </div>
          <div className="flex-1 p-4 bg-gray-800">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono h-full overflow-auto">
              {output || 'Click "Run Code" to see output here...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedPlayground;