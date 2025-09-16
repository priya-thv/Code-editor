import express from "express";
import bodyParser from "body-parser";
import compiler from "compilex";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize Compilex
const options = { stats: true };
compiler.init(options);

app.use(bodyParser.json());
app.use("/codemirror-5.65.18", express.static(path.join(__dirname, "codemirror-5.65.18")));
app.use(express.static(__dirname));

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Helper: Send response safely
function sendOnce(res, data) {
  console.log("DEBUG: Compilex returned:", data);
  if (res.headersSent) return;

  if (!data) return res.json({ output: "⚠ Compilex returned no data" });
  if (data.errors && data.errors.trim() !== "") return res.json({ output: data.errors });
  if (data.output && data.output.trim() !== "") return res.json({ output: data.output });
  return res.json({ output: "⚠ Unknown error: Empty output" });
}

// Compile endpoint
app.post("/compile", (req, res) => {
  const { code, input, lang } = req.body;

  if (!code || !lang) return res.status(400).json({ output: "Code and language are required" });

  try {
    switch (lang) {
      case "c++": {
        const envData = { OS: "linux", cmd: "g++", options: { timeout: 15000 } };
        if (input && input.trim() !== "") {
          compiler.compileCPPWithInput(envData, code, input, (data) => sendOnce(res, data));
        } else {
          compiler.compileCPP(envData, code, (data) => sendOnce(res, data));
        }
        break;
      }

      case "python": {
        const envData = { OS: "linux" };
        if (input && input.trim() !== "") {
          compiler.compilePythonWithInput(envData, code, input, (data) => sendOnce(res, data));
        } else {
          compiler.compilePython(envData, code, (data) => sendOnce(res, data));
        }
        break;
      }

      case "java": {
        const envData = { OS: "linux" };
        if (input && input.trim() !== "") {
          compiler.compileJavaWithInput(envData, code, input, (data) => sendOnce(res, data));
        } else {
          compiler.compileJava(envData, code, (data) => sendOnce(res, data));
        }
        break;
      }

      default:
        return res.status(400).json({ output: "Unsupported language" });
    }
  } catch (err) {
    console.error("Server error:", err);
    if (!res.headersSent) res.status(500).json({ output: "Server error during compilation" });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
