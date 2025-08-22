import React, { useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';

// Configure monaco loader
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.48.0/min/vs'
  }
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

  const handleEditorDidMount = () => {
    setIsLoading(false);
    setError(null);
  };

  if (error) {
    return (
      <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-800 p-4">
        <div className="text-red-400 text-sm">
          <p>Code editor failed to load.</p>
          <p>Error: {error}</p>
        </div>
        <textarea
          value={getDefaultCode()}
          onChange={(e) => onChange && onChange(e.target.value)}
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
        value={getDefaultCode()}
        onChange={onChange}
        theme="vs-dark"
        loading={<div className="bg-gray-800 p-4 text-center text-gray-400">Loading...</div>}
        onMount={handleEditorDidMount}
        beforeMount={(monaco) => {
          try {
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