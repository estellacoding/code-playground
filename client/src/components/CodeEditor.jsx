import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ 
  value, 
  onChange, 
  language = 'java',
  height = '400px',
  readOnly = false 
}) => {
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

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={getDefaultCode()}
        onChange={onChange}
        theme="vs-dark"
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
          // Mobile-friendly settings
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