const express = require("express");
const app = express();
const compiler = require("compilex");
const options = { stats: true };
compiler.init(options);
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(
  "/codemirror-5.65.18",
  express.static("C:/compiler/codemirror-5.65.18")
);

app.get("/", function (req, res) {
    compiler.flush(function(){
        console.log("deleted")
    })
    res.sendFile("C:/compiler/index.html");
});

app.post("/compile", function (req, res) {
  const code = req.body.code;
  const input = req.body.input;
  const lang = req.body.lang;

  try {
    let envData;
    if (lang === "c++") {
      envData = { OS: "windows", cmd: "g++",options:{timeout:10000} }; 
      if (input) {
        compiler.compileCPPWithInput(envData, code, input, function (data) {
          if (data.output) {
            res.send(data);
          } else {
            res.send({ output: "error" });
          }
        });
      } else {
        compiler.compileCPP(envData, code, function (data) {
          if (data.output) {
            res.send(data);
          } else {
            res.send({ output: "error" });
          }
        });
      }
    } else if (lang === "python") {
      envData = { OS: "windows" }; // Adjust for Linux if necessary
      if (input) {
        compiler.compilePythonWithInput(envData, code, input, function (data) {
          if (data.output) {
            res.send(data);
          } else {
            res.send({ output: "error" });
          }
        });
      } else {
        compiler.compilePython(envData, code, function (data) {
          if (data.output) {
            res.send(data);
          } else {
            res.send({ output: "error" });
          }
        });
      }
    } else if (lang === "java") {
      envData = { OS: "windows" }; // Adjust for Linux if necessary
      if (input) {
        compiler.compileJavaWithInput(envData, code, input, function (data) {
          if (data.output) {
            res.send(data);
          } else {
            res.send({ output: "error" });
          }
        });
      } else {
        compiler.compileJava(envData, code, function (data) {
          if (data.output) {
            res.send(data);
          } else {
            res.send({ output: "error" });
          }
        });
      }
    } else {
      res.status(400).send({ error: "Unsupported language" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: "An error occurred during compilation." });
  }
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});  