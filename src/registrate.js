import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./styles/styles.scss";

function Register() {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [documento, setDocumento] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [clave, setClave] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (clave !== passwordConfirm) {
      setMessage("Las contraseñas no coinciden");
      return;
    }

    const userData = {
      nombres,
      apellidos,
      documento,
      direccion,
      ciudad,
      email,
      celular,
      clave,
    };

    console.log(JSON.stringify(userData)); // Agregar este log para verificar los datos

    try {
      const response = await fetch(
        "http://localhost/backend/api/register.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage("Error: " + data.message);
      }
    } catch (error) {
      setMessage("Error al registrar usuario.");
    }
  };

  return (
    <div className="formulario">
      <h2>Registra tus Datos</h2>
      <form onSubmit={handleSubmit}>
        <div className="campo">
          <input
            type="text"
            placeholder="Nombres"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            required
          />
        </div>
        <div className="campo">
          <input
            type="text"
            placeholder="Apellidos"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            required
          />
        </div>
        <div className="campo">
          <input
            type="text"
            placeholder="Documento"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            required
          />
        </div>
        <div className="campo">
          <input
            type="text"
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
          />
        </div>
        <div className="campo">
          <input
            type="text"
            placeholder="Ciudad"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            required
          />
        </div>
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
            type="text"
            placeholder="Celular"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
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
        <div className="campo">
          <input
            type="password"
            placeholder="Confirmar Contraseña"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
        </div>
        <input type="submit" value="Registrarse" />
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

ReactDOM.render(<Register />, document.getElementById("root"));
