const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

/**
 * Runs code in C++, Java, or Python.
 * @param {Object} param0 - { code, input, lang }
 * @param {Function} callback - callback(output)
 */
function runCode({ code, input, lang }, callback) {
  const id = Date.now();
  let fileName, exeFile, command;

  if (lang === "c++") {
    fileName = path.join(tempDir, `${id}.cpp`);
    exeFile = path.join(tempDir, `${id}`); // No .exe on Linux
    fs.writeFileSync(fileName, code);
    command = `g++ "${fileName}" -o "${exeFile}" && "${exeFile}"`;
  } else if (lang === "java") {
    const javaFileName = "Main"; // Must match class name
    fileName = path.join(tempDir, `${javaFileName}.java`);
    fs.writeFileSync(fileName, code);
    command = `javac "${fileName}" && java -cp "${tempDir}" ${javaFileName}`;
  } else if (lang === "python") {
    fileName = path.join(tempDir, `${id}.py`);
    fs.writeFileSync(fileName, code);
    command = `python3 "${fileName}"`;
  } else {
    return callback("❌ Unsupported language");
  }

  // Include input if provided
  if (input) {
    command = `echo "${input.replace(/"/g, '\\"')}" | ${command}`;
  }

  exec(command, { timeout: 15000 }, (error, stdout, stderr) => {
    if (error) return callback(stderr || error.message);
    callback(stdout || stderr);
  });
}

module.exports = { runCode };
