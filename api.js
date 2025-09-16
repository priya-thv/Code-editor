const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { runCode } = require("./runCode");

const app = express();
app.use(bodyParser.json());

// Serve CodeMirror static files if you keep them locally
app.use("/codemirror-5.65.18", express.static(path.join(__dirname, "codemirror-5.65.18")));

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Compile endpoint
app.post("/compile", (req, res) => {
  const { code, input, lang } = req.body;
  if (!code || !lang) return res.status(400).json({ output: "Code and language are required" });

  runCode({ code, input, lang }, (result) => {
    res.json({ output: result });
  });
});

// Optional: Check if compilers exist
app.get("/check", (req, res) => {
  const { exec } = require("child_process");
  exec("g++ --version", (err, stdout, stderr) => {
    if (err) return res.send("❌ g++ not installed");
    res.send(`✅ g++ installed: ${stdout.split("\n")[0]}`);
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
