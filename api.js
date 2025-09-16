import express from "express";
import bodyParser from "body-parser";
import compiler from "compilex";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const options = { stats: true };
compiler.init(options);

// Middleware
app.use(bodyParser.json());

// Serve CodeMirror static files
app.use("/codemirror-5.65.18", express.static(path.join(__dirname, "codemirror-5.65.18")));

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Helper: ensure response is sent only once
function sendOnce(res) {
  let sent = false;
  return (data, lang) => {
    if (sent) return;
    sent = true;

    if (data.errors) return res.json({ output: data.errors });
    if (data.output) return res.json({ output: data.output });
    return res.json({ output: `Error during ${lang} execution` });
  };
}

// Compile route
app.post("/compile", (req, res) => {
  const { code, input, lang } = req.body;

  if (!code || !lang) {
    return res.status(400).json({ output: "Code and language are required" });
  }

  const callback = sendOnce(res);

  try {
    switch (lang) {
      case "c++":
        const cppEnv = { OS: "linux", cmd: "g++", options: { timeout: 10000 } };
        if (input && input.trim()) {
          compiler.compileCPPWithInput(cppEnv, code, input, (data) => callback(data, lang));
        } else {
          compiler.compileCPP(cppEnv, code, (data) => callback(data, lang));
        }
        break;

      case "python":
        const pyEnv = { OS: "linux" };
        if (input && input.trim()) {
          compiler.compilePythonWithInput(pyEnv, code, input, (data) => callback(data, lang));
        } else {
          compiler.compilePython(pyEnv, code, (data) => callback(data, lang));
        }
        break;

      case "java":
        const javaEnv = { OS: "linux" };
        if (input && input.trim()) {
          compiler.compileJavaWithInput(javaEnv, code, input, (data) => callback(data, lang));
        } else {
          compiler.compileJava(javaEnv, code, (data) => callback(data, lang));
        }
        break;

      default:
        res.status(400).json({ output: "Unsupported language" });
    }
  } catch (err) {
    console.error("Compilation server error:", err);
    callback({ output: `Server error during ${lang} execution` }, lang);
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});



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

