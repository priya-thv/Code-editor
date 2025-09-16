const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { runCode } = require("./compiles");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serves index.html from root

// Compile endpoint
app.post("/compile", (req, res) => {
  const { code, input, lang } = req.body;

  if (!code || !lang) {
    return res.status(400).json({ output: "❌ Code or language missing!" });
  }

  runCode({ code, input, lang }, (output) => {
    res.json({ output });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
