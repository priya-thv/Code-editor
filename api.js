// server.js
const express = require("express");
const bodyParser = require("body-parser");
const compiler = require("compilex");
const path = require("path");

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

// Utility: Determine OS dynamically
const getOS = () => (process.platform === "win32" ? "windows" : "linux");

// Safe compile callback
function safeCompile(compileFunc, envData, code, input, res, langName) {
  try {
    const callback = (data) => {
      if (data.errors) {
        console.error(`${langName} compile errors:`, data.errors);
        return res.json({ output: data.errors });
      }
      if (data.output) {
        return res.json({ output: data.output });
      }
      return res.json({ output: `Unknown error during ${langName} execution` });
    };

    if (input && input.trim() !== "") {
      compileFunc(envData, code, input, callback);
    } else {
      compileFunc(envData, code, callback);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ output: `Server error during ${langName} execution` });
  }
}

// Compile route
app.post("/compile", (req, res) => {
  const { code, input, lang } = req.body;

  if (!code || !lang) {
    return res.status(400).json({ output: "⚠ Code and language are required" });
  }

  const OS = getOS();
  let envData;

  switch (lang) {
    case "c++":
      envData = { OS, cmd: OS === "windows" ? "g++" : undefined, options: { timeout: 10000 } };
      safeCompile(OS === "windows" ? compiler.compileCPP : compiler.compileCPP, envData, code, input, res, "C++");
      break;

    case "python":
      envData = { OS };
      safeCompile(OS === "windows" ? compiler.compilePython : compiler.compilePython, envData, code, input, res, "Python");
      break;

    case "java":
      envData = { OS };
      safeCompile(OS === "windows" ? compiler.compileJava : compiler.compileJava, envData, code, input, res, "Java");
      break;

    default:
      res.status(400).json({ output: "⚠ Unsupported language" });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
