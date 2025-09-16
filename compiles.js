import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

/**
 * Runs code in C++, Java, or Python.
 * @param {Object} param0 - { code, input, lang }
 * @param {Function} callback - callback(output)
 */
export function runCode({ code, input, lang }, callback) {
  const id = Date.now();
  let fileName, exeFile, compileCmd, runCmd;

  try {
    if (lang === "c++") {
      fileName = path.join(tempDir, `${id}.cpp`);
      exeFile = path.join(tempDir, `${id}`); // Linux: no .exe
      fs.writeFileSync(fileName, code);

      compileCmd = `g++ "${fileName}" -o "${exeFile}"`;
      runCmd = input
        ? `echo "${input.replace(/"/g, '\\"')}" | "${exeFile}"`
        : `"${exeFile}"`;

    } else if (lang === "java") {
      const javaFileName = "Main";
      fileName = path.join(tempDir, `${javaFileName}.java`);
      fs.writeFileSync(fileName, code);

      compileCmd = `javac "${fileName}"`;
      runCmd = input
        ? `echo "${input.replace(/"/g, '\\"')}" | java -cp "${tempDir}" ${javaFileName}`
        : `java -cp "${tempDir}" ${javaFileName}`;

    } else if (lang === "python") {
      fileName = path.join(tempDir, `${id}.py`);
      fs.writeFileSync(fileName, code);

      runCmd = input
        ? `echo "${input.replace(/"/g, '\\"')}" | python3 "${fileName}"`
        : `python3 "${fileName}"`;

      compileCmd = null; // Python doesn’t need compilation

    } else {
      return callback("❌ Unsupported language");
    }

    const fullCommand = compileCmd ? `${compileCmd} && ${runCmd}` : runCmd;

    exec(fullCommand, { timeout: 15000 }, (error, stdout, stderr) => {
      if (error) return callback(stderr || error.message);
      callback(stdout || stderr);
    });

  } catch (err) {
    callback(`Server error: ${err.message}`);
  }
}
