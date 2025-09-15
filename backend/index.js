const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("KlyntarCRM backend funcionando 🚀");
});

app.listen(3001, () => {
  console.log("Servidor backend en http://localhost:3001");
});