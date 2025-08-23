import React, { useState, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';

// Configure monaco loader with fallback
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.48.0/min/vs'
  }
});

// Set up loader initialization
loader.init().then(() => {
  console.log('Monaco Editor loaded successfully');
}).catch(error => {
  console.error('Failed to initialize Monaco Editor:', error);
});

const CodeEditor = ({ 
  value, 
  onChange, 
  language = 'java',
  height = '400px',
  readOnly = false 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editorValue, setEditorValue] = useState('');
  
  const defaultJavaCode = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;

  const defaultPythonCode = `print("Hello, World!")`;

  const getDefaultCode = () => {
    if (value) return value;
    return language === 'java' ? defaultJavaCode : defaultPythonCode;
  };

  const handleEditorDidMount = (editor, monaco) => {
    try {
      console.log('Monaco Editor mounted successfully');
      setIsLoading(false);
      setError(null);
      
      // Set initial value
      const initialValue = getDefaultCode();
      setEditorValue(initialValue);
      
      // Set value with proper error handling
      try {
        editor.setValue(initialValue);
      } catch (err) {
        console.warn('Failed to set initial value, using fallback:', err);
      }
      
      // Focus the editor with delay to ensure proper mounting
      setTimeout(() => {
        try {
          editor.focus();
        } catch (err) {
          console.warn('Failed to focus editor:', err);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error in handleEditorDidMount:', error);
      setError(error.message);
    }
  };

  const handleEditorChange = (value) => {
    console.log('Editor value changed:', value?.substring(0, 50) + '...');
    setEditorValue(value || '');
    if (onChange) {
      onChange(value);
    }
  };

  useEffect(() => {
    // Update editor value when value prop changes
    const newValue = getDefaultCode();
    if (newValue !== editorValue) {
      setEditorValue(newValue);
    }
  }, [value, language]);

  if (error) {
    return (
      <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-800 p-4">
        <div className="text-red-400 text-sm">
          <p>Code editor failed to load.</p>
          <p>Error: {error}</p>
        </div>
        <textarea
          value={editorValue || getDefaultCode()}
          onChange={(e) => handleEditorChange(e.target.value)}
          readOnly={readOnly}
          className="w-full h-80 mt-4 bg-gray-900 text-white p-3 border border-gray-600 rounded font-mono text-sm resize-none"
          placeholder="Code editor fallback..."
        />
      </div>
    );
  }

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="bg-gray-800 p-4 text-center text-gray-400">
          Loading editor...
        </div>
      )}
      <Editor
        height={height}
        language={language}
        value={editorValue || getDefaultCode()}
        onChange={handleEditorChange}
        theme="vs-dark"
        loading={<div className="bg-gray-800 p-4 text-center text-gray-400">Loading...</div>}
        onMount={handleEditorDidMount}
        onValidate={(markers) => {
          // Handle validation errors if needed
          if (markers && markers.length > 0) {
            console.log('Editor validation markers:', markers);
          }
        }}
        beforeMount={(monaco) => {
          try {
            console.log('Setting up Monaco Editor...');
            monaco.editor.defineTheme('custom-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [],
              colors: {
                'editor.background': '#1f2937',
              }
            });
          } catch (err) {
            console.warn('Failed to define custom theme:', err);
          }
        }}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: window.innerWidth < 768 ? 12 : 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: language === 'java' ? 4 : 4,
          insertSpaces: true,
          wordWrap: window.innerWidth < 768 ? 'on' : 'off',
          scrollbar: {
            horizontal: window.innerWidth < 768 ? 'auto' : 'visible',
            vertical: 'auto',
            handleMouseWheel: true,
          },
          quickSuggestions: window.innerWidth >= 768,
          suggestOnTriggerCharacters: window.innerWidth >= 768,
          acceptSuggestionOnEnter: window.innerWidth >= 768 ? 'on' : 'off',
          tabCompletion: window.innerWidth >= 768 ? 'on' : 'off',
        }}
      />
    </div>
  );
};

export default CodeEditor;