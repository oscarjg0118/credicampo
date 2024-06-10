import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./styles/styles.scss";

document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logoutButton");

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      // Aquí puedes añadir funcionalidad para cerrar la sesión, como eliminar cookies o tokens de sesión
      alert("Sesión cerrada exitosamente.");
      window.location.href = "ingreso.html"; // Redirigir al usuario a la página de inicio de sesión
    });
  }
});
