import React, { useState } from "react";
import "./Register.css";

function Register() {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost/backend/api/register.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombres,
            apellidos,
            direccion,
            ciudad,
            email,
          }),
        }
      );
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Error al registrar usuario.");
    }
  };

  return (
    <div className="formulario">
      <h2>Registra tus Datos</h2>
      <form onSubmit={handleSubmit}>
        <div className="nombres">
          <input
            type="text"
            placeholder="Nombres"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            required
          />
        </div>
        <div className="apellidos">
          <input
            type="text"
            placeholder="Apellidos"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            required
          />
        </div>
        <div className="direccion">
          <input
            type="text"
            placeholder="Direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
          />
        </div>
        <div className="ciudad">
          <input
            type="text"
            placeholder="Ciudad"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            required
          />
        </div>
        <div className="email">
          <input
            type="email"
            placeholder="Correo Electronico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <input type="submit" value="Registrarse" />
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
