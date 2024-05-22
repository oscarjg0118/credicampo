import React from "react";
import ReactDOM from "react-dom";
import "./styles/styles.scss";

// Componente principal de la aplicación
function App() {
  return (
    <div>
      <h1>¡Bienvenido a Credicampo!</h1>
      <p>Esta es tu nueva aplicación React.</p>
    </div>
  );
}

// Renderizamos el componente principal en el elemento con id "root"
ReactDOM.render(<App />, document.getElementById("root"));