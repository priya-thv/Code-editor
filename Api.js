// const express = require("express");
// const bodyParser = require("body-parser");
// const compiler = require("compilex");
// const path = require("path");

// const app = express();
// const options = { stats: true };
// compiler.init(options);

// // Middleware
// app.use(bodyParser.json());

// // Serve CodeMirror static files
// app.use("/codemirror-5.65.18", express.static(path.join(__dirname, "codemirror-5.65.18")));

// // Serve index.html
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

// // Safe compile handler
// function safeCompile(compileFunc, envData, code, input, res, langName) {
//   try {
//     const callback = (data) => {
//       if (data.errors) {
//         console.error(`${langName} compile errors:`, data.errors);
//         return res.json({ output: data.errors });
//       }
//       if (data.output) {
//         return res.json(data);
//       }
//       return res.json({ output: `Unknown error during ${langName} execution` });
//     };

//     if (input !== undefined && input !== "") {
//       compileFunc(envData, code, input, callback);
//     } else {
//       compileFunc(envData, code, callback);
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ output: `Server error during ${langName} execution` });
//   }
// }

// app.post("/compile", (req, res) => {
//   const { code, input, lang } = req.body;

//   if (!code || !lang) {
//     return res.status(400).json({ output: "Code and language are required" });
//   }

//   let envData;
//   let responseSent = false; // ✅ Track if response is already sent

//  const sendOnce = (data) => {
//     if (responseSent) return;
//     responseSent = true;

//     if (data.errors) {
//         return res.json({ output: data.errors });
//     }
//     return res.json({ output: data.output || `Error during ${lang} execution` });
// };


//   try {
//     switch (lang) {
//       case "c++":
//         envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } };
//         if (input) {
//           compiler.compileCPPWithInput(envData, code, input, sendOnce);
//         } else {
//           compiler.compileCPP(envData, code, sendOnce);
//         }
//         break;

//       case "python":
//         envData = { OS: "windows" };
//         if (input) {
//           compiler.compilePythonWithInput(envData, code, input, sendOnce);
//         } else {
//           compiler.compilePython(envData, code, sendOnce);
//         }
//         break;

//       case "java":
//         envData = { OS: "windows" };
//         if (input) {
//           compiler.compileJavaWithInput(envData, code, input, sendOnce);
//         } else {
//           compiler.compileJava(envData, code, sendOnce);
//         }
//         break;

//       default:
//         res.status(400).json({ output: "Unsupported language" });
//     }
//   } catch (err) {
//     console.error(err);
//     if (!responseSent) res.status(500).json({ output: `Server error during ${lang} execution` });
//   }
// });

// // Start server
// const PORT = 8000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on http://localhost:${PORT}`);
// });


import { exec } from "child_process";
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  const { code, input, lang } = req.body;

  if (!code || !lang) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  const tempDir = "/tmp"; // Vercel allows writing only in /tmp
  let fileName = "";
  let runCmd = "";

  try {
    // Decide file name and run command based on language
    if (lang === "c++") {
      fileName = path.join(tempDir, "main.cpp");
      fs.writeFileSync(fileName, code);

      runCmd = `g++ ${fileName} -o ${tempDir}/a.out && echo "${input}" | ${tempDir}/a.out`;
    } else if (lang === "java") {
      fileName = path.join(tempDir, "Main.java");
      fs.writeFileSync(fileName, code);

      runCmd = `javac ${fileName} && echo "${input}" | java -cp ${tempDir} Main`;
    } else if (lang === "python") {
      fileName = path.join(tempDir, "main.py");
      fs.writeFileSync(fileName, code);

      runCmd = `echo "${input}" | python3 ${fileName}`;
    } else {
      return res.status(400).json({ error: "Unsupported language" });
    }

    console.log("Running Command:", runCmd);

    // Execute the code
    exec(runCmd, (error, stdout, stderr) => {
      if (error) {
        return res.json({ output: stderr || error.message });
      }
      res.json({ output: stdout });
    });
  } catch (err) {
    console.error("Execution error:", err);
    return res.status(500).json({ error: err.message });
  }
}



