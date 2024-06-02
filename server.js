const express = require("express");
const path = require("path");
const app = express();

// Configurar Express para servir archivos estáticos desde node_modules
app.use("/static", express.static(path.join(__dirname, "node_modules")));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, "public")));

// Iniciar el servidor
app.listen(3000, () => {
  console.log("Servidor iniciado en el puerto 3000");
});
