import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CodeEditor from '../components/CodeEditor';
import { Play, Save, Share, Settings, Loader, Code, Smartphone, Monitor } from 'lucide-react';
import axios from 'axios';

const Playground = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [playground, setPlayground] = useState({
    title: 'Untitled',
    language: 'java',
    code: '',
    description: '',
    is_public: false
  });
  
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (id) {
      fetchPlayground();
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [id, user, navigate]);

  const fetchPlayground = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/playground/${id}`, { withCredentials: true });
      setPlayground(response.data);
    } catch (error) {
      console.error('Failed to fetch playground:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const savePlayground = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      if (id) {
        const response = await axios.put(`/api/playground/${id}`, playground, { withCredentials: true });
        setPlayground(response.data);
      } else {
        const response = await axios.post('/api/playground', playground, { withCredentials: true });
        setPlayground(response.data);
        navigate(`/playground/${response.data.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to save playground:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const executeCode = async () => {
    setIsExecuting(true);
    setOutput('');
    
    try {
      const response = await axios.post('/api/execute', {
        code: playground.code,
        language: playground.language,
        playgroundId: id
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

  const generateShareLink = async () => {
    if (!id) {
      await savePlayground();
      return;
    }

    try {
      const response = await axios.post(`/api/playground/${id}/share`, {}, { withCredentials: true });
      setShareUrl(response.data.share_url);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(response.data.share_url);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Failed to generate share link:', error);
    }
  };

  const formatCode = () => {
    if (!playground.code) return;
    
    // Simple but effective code formatting
    const lines = playground.code.split('\n');
    let indentLevel = 0;
    const formatted = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      
      // Handle Java formatting
      if (playground.language === 'java') {
        // Decrease indent for closing braces
        if (trimmed.includes('}') && !trimmed.includes('{')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        
        const formattedLine = '    '.repeat(indentLevel) + trimmed;
        
        // Increase indent for opening braces
        if (trimmed.includes('{') && !trimmed.includes('}')) {
          indentLevel++;
        }
        
        return formattedLine;
      } 
      
      // Handle Python formatting
      else if (playground.language === 'python') {
        // Handle dedent for certain keywords
        if (trimmed.match(/^(except|elif|else|finally):/)) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        
        const formattedLine = '    '.repeat(indentLevel) + trimmed;
        
        // Increase indent for lines ending with ':'
        if (trimmed.endsWith(':') && !trimmed.startsWith('#')) {
          indentLevel++;
        }
        
        return formattedLine;
      }
      
      return trimmed;
    }).filter(line => line.trim() !== ''); // Remove empty lines
    
    // Add proper spacing between blocks
    const finalFormatted = formatted.join('\n').replace(/\n{3,}/g, '\n\n');
    
    setPlayground({ ...playground, code: finalFormatted });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={playground.title}
              onChange={(e) => setPlayground({ ...playground, title: e.target.value })}
              className="text-xl font-medium bg-transparent text-white border-none outline-none focus:bg-gray-700 px-2 py-1 rounded"
              placeholder="Untitled"
            />
            <select
              value={playground.language}
              onChange={(e) => setPlayground({ ...playground, language: e.target.value })}
              className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:border-orange-500 outline-none"
            >
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-3">
            <button
              onClick={executeCode}
              disabled={isExecuting}
              className="inline-flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-medium rounded transition-colors text-sm"
            >
              {isExecuting ? <Loader className="animate-spin" size={16} /> : <Play size={16} />}
              <span className="hidden sm:inline">{isExecuting ? 'Running...' : 'Run'}</span>
            </button>
            
            <button
              onClick={formatCode}
              className="inline-flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded transition-colors text-sm"
              title="Format Code"
            >
              <Code size={16} />
              <span className="hidden sm:inline">Format</span>
            </button>
            
            <button
              onClick={savePlayground}
              disabled={isSaving}
              className="inline-flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium rounded transition-colors text-sm"
            >
              {isSaving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
            
            {!isMobile && (
              <button
                onClick={generateShareLink}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded transition-colors text-sm"
              >
                <Share size={16} />
                <span>Share</span>
              </button>
            )}
            
            {isMobile && (
              <button
                onClick={() => setShowOutput(!showOutput)}
                className="inline-flex items-center space-x-1 px-2 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors text-sm"
                title={showOutput ? 'Show Code' : 'Show Output'}
              >
                {showOutput ? <Monitor size={16} /> : <Smartphone size={16} />}
                <span className="hidden sm:inline">{showOutput ? 'Code' : 'Output'}</span>
              </button>
            )}
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Settings size={isMobile ? 16 : 20} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={playground.description}
                onChange={(e) => setPlayground({ ...playground, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-orange-500 outline-none resize-none"
                rows={2}
                placeholder="Add a description for your playground..."
              />
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={playground.is_public}
                  onChange={(e) => setPlayground({ ...playground, is_public: e.target.checked })}
                  className="form-checkbox h-4 w-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-300">Make this playground public</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {isMobile ? (
        /* Mobile Layout - Stacked */
        <div className="flex flex-col flex-1 overflow-hidden">
          {!showOutput ? (
            /* Code Editor */
            <div className="flex flex-col flex-1">
              <div className="p-3 bg-gray-900 text-sm text-gray-400 border-b border-gray-700">
                Code Editor
              </div>
              <div className="flex-1 p-2">
                <CodeEditor
                  value={playground.code}
                  onChange={(value) => setPlayground({ ...playground, code: value })}
                  language={playground.language}
                  height="100%"
                />
              </div>
            </div>
          ) : (
            /* Output Panel */
            <div className="flex flex-col flex-1">
              <div className="p-3 bg-gray-900 text-sm text-gray-400 border-b border-gray-700 flex items-center justify-between">
                <span>Output</span>
                <div className="flex space-x-2">
                  <button
                    onClick={generateShareLink}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors"
                  >
                    <Share size={14} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 p-3 bg-gray-800">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono h-full overflow-auto">
                  {output || 'Click "Run" to see output here...'}
                </pre>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout - Side by side */
        <div className="flex flex-1 overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 bg-gray-900 text-sm text-gray-400 border-b border-gray-700">
              Code Editor
            </div>
            <div className="flex-1 p-4">
              <CodeEditor
                value={playground.code}
                onChange={(value) => setPlayground({ ...playground, code: value })}
                language={playground.language}
                height="100%"
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
      )}
    </div>
  );
};

export default Playground;