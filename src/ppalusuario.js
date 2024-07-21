import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./styles/styles.scss";

function PpalUsuario() {
  useEffect(() => {
    const userEmail = sessionStorage.getItem("userEmail");
    const userInfo = document.getElementById("userInfo");

    if (userInfo) {
      if (userEmail) {
        userInfo.innerText = "Bienvenido, " + userEmail;
      } else {
        userInfo.innerText = "No se ha iniciado sesión.";
      }
    }

    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        sessionStorage.removeItem("userEmail"); // Eliminar el email del sessionStorage
        alert("Sesión cerrada exitosamente.");
        window.location.href = "ingreso.html"; // Redirigir al usuario a la página de inicio de sesión
      });
    }
  }, []);

  return null;
}

ReactDOM.render(<PpalUsuario />, document.getElementById("root"));
