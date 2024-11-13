import React from "react";
import ReactDOM from "react-dom";
import "/public/styles.scss";

// Componente principal de la aplicación
function App() {
  return (
    <div>
      <h1>¡Bienvenido a Credicampo!</h1>
      <p>Esta es tu nueva aplicación React.</p>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
