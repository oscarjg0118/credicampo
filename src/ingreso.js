import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./styles/styles.scss";

function Ingreso() {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginData = {
      email,
      clave,
    };

    try {
      const response = await fetch("http://localhost/backend/api/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      if (data.success) {
        setMessage("Ingreso exitoso");
        sessionStorage.setItem("userEmail", data.userEmail); // Guardar el email en sessionStorage
        sessionStorage.setItem("userId", data.userId); // Guardar el userId en sessionStorage
        window.location.href = "ppalusuario.html"; // Redirigir a la página de inicio
      } else {
        setMessage("Error: " + data.message);
      }
    } catch (error) {
      setMessage("Error al intentar iniciar sesión.");
    }
  };

  return (
    <div className="formulario">
      <h2>Ingresa tus Datos</h2>
      <form onSubmit={handleSubmit}>
        <div className="campo">
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="campo">
          <input
            type="password"
            placeholder="Contraseña"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
          />
        </div>
        <input type="submit" value="Ingresar" />
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

ReactDOM.render(<Ingreso />, document.getElementById("root"));
