const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const tempDir = path.join(__dirname, "temp");

// Ensure temp folder exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

function runCode({ code, input, lang }, callback) {
  const id = Date.now(); // Unique name for each run
  let fileName, command;

  // Decide command and file type
  if (lang === "c++") {
    fileName = path.join(tempDir, `${id}.cpp`);
    fs.writeFileSync(fileName, code);
    command = `g++ "${fileName}" -o "${tempDir}/${id}.exe" && "${tempDir}/${id}.exe"`;
  } 
  else if (lang === "java") {
    const javaFileName = "Main"; // Class name must match file name
    fileName = path.join(tempDir, `${javaFileName}.java`);
    fs.writeFileSync(fileName, code);
    command = `javac "${fileName}" && java -cp "${tempDir}" ${javaFileName}`;
  } 
  else if (lang === "python") {
    fileName = path.join(tempDir, `${id}.py`);
    fs.writeFileSync(fileName, code);
    command = `python "${fileName}"`;
  } 
  else {
    return callback("❌ Unsupported language");
  }

  // Run the code
  const process = exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
    if (error) {
      return callback(stderr || error.message);
    }
    callback(stdout);
  });

  // Pass input to stdin
  if (input) {
    process.stdin.write(input);
    process.stdin.end();
  }
}

module.exports = { runCode };
