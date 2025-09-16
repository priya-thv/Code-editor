import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { runCode } from "./runCode.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());

// Serve CodeMirror static files
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

// Optional: check compilers
app.get("/check", (req, res) => {
  import("child_process").then(cp => {
    cp.exec("g++ --version", (err, stdout, stderr) => {
      if (err) return res.send("❌ g++ not installed");
      res.send(`✅ g++ installed: ${stdout.split("\n")[0]}`);
    });
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
