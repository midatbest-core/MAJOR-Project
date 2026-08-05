const { spawn } = require('child_process');
const path = require('path');

const fs = require('fs');

/**
 * Executes a Python script located in backend/python-services/ with JSON IPC.
 * @param {string} scriptName - Name of python file (e.g., 'transcribe_whisper.py')
 * @param {object} inputPayload - Object payload to serialize as JSON argument
 * @returns {Promise<object>} Parsed JSON response from python stdout
 */
const runPythonScript = (scriptName, inputPayload = {}) => {
  return new Promise((resolve, reject) => {
    let pythonExe = process.env.PYTHON_PATH;
    
    // Auto-detect virtualenv python if available
    const venvPythonPath = path.join(__dirname, '..', '.venv', 'Scripts', 'python.exe');
    if (!pythonExe && fs.existsSync(venvPythonPath)) {
      pythonExe = venvPythonPath;
    }
    if (!pythonExe) {
      pythonExe = 'python';
    }

    const scriptPath = path.join(__dirname, '..', 'python-services', scriptName);
    const jsonPayload = JSON.stringify(inputPayload);

    console.log(`[Python Bridge] Executing script with (${pythonExe}): ${scriptName}`);
    
    const pyProcess = spawn(pythonExe, [scriptPath, jsonPayload]);

    let stdoutData = '';
    let stderrData = '';

    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pyProcess.on('close', (code) => {
      if (code !== 0) {
        console.warn(`[Python Bridge Warning] Script ${scriptName} exited with code ${code}. Stderr: ${stderrData}`);
      }

      try {
        // Find JSON response output from python script
        const jsonMatch = stdoutData.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          resolve(parsed);
        } else {
          // If execution returned plain text or mock format
          resolve({ rawOutput: stdoutData.trim(), stderr: stderrData.trim() });
        }
      } catch (err) {
        console.error(`[Python Bridge Error] Failed to parse output from ${scriptName}:`, err.message);
        reject(new Error(`Failed to parse Python script output: ${stdoutData || stderrData}`));
      }
    });

    pyProcess.on('error', (err) => {
      console.error(`[Python Bridge Process Error] Could not spawn ${pythonExe}:`, err.message);
      reject(err);
    });
  });
};

module.exports = {
  runPythonScript
};
