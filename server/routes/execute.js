const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const router = express.Router();

const TEMP_DIR = path.join(__dirname, '../temp');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const executeCode = (language, code) => {
  return new Promise((resolve, reject) => {
    const fileName = uuidv4();
    const startTime = Date.now();
    
    let filePath, command;
    
    if (language === 'java') {
      filePath = path.join(TEMP_DIR, `${fileName}.java`);
      const className = extractJavaClassName(code) || 'Main';
      const updatedCode = code.includes('public class') ? code : `public class ${className} {\n${code}\n}`;
      
      fs.writeFileSync(filePath, updatedCode);
      command = `cd ${TEMP_DIR} && javac ${fileName}.java && java ${className}`;
    } else if (language === 'python') {
      filePath = path.join(TEMP_DIR, `${fileName}.py`);
      fs.writeFileSync(filePath, code);
      command = `python3 ${filePath}`;
    } else {
      return reject(new Error('Unsupported language'));
    }

    const timeout = setTimeout(() => {
      reject(new Error('Execution timeout (10 seconds)'));
    }, 10000);

    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      clearTimeout(timeout);
      const executionTime = Date.now() - startTime;
      
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        if (language === 'java') {
          const classFile = path.join(TEMP_DIR, `${extractJavaClassName(code) || 'Main'}.class`);
          if (fs.existsSync(classFile)) {
            fs.unlinkSync(classFile);
          }
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }

      if (error) {
        resolve({
          success: false,
          output: stdout,
          error: stderr || error.message,
          executionTime
        });
      } else {
        resolve({
          success: true,
          output: stdout,
          error: stderr,
          executionTime
        });
      }
    });
  });
};

const extractJavaClassName = (code) => {
  const classMatch = code.match(/public\s+class\s+(\w+)/);
  return classMatch ? classMatch[1] : null;
};

router.post('/', async (req, res) => {
  const { code, language, playgroundId } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  if (!['java', 'python'].includes(language)) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  try {
    const result = await executeCode(language, code);
    
    if (playgroundId && req.user) {
      await pool.query(
        'INSERT INTO executions (playground_id, code, output, error, execution_time_ms) VALUES ($1, $2, $3, $4, $5)',
        [playgroundId, code, result.output, result.error, result.executionTime]
      );
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      output: '',
      executionTime: 0
    });
  }
});

module.exports = router;