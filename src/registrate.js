import "./styles/styles.scss";

// Si estás usando React, importa React y ReactDOM
import React from "react";
import ReactDOM from "react-dom";

// Código JavaScript para la página de registro
// Por ejemplo, la validación del formulario de registro

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  if (form) {
    form.addEventListener("submit", function (event) {
      const nombre = document.querySelector('input[name="nombre"]').value;
      const email = document.querySelector('input[name="email"]').value;
      const contraseña = document.querySelector(
        'input[name="contraseña"]'
      ).value;

      if (!nombre || !email || !contraseña) {
        alert("Por favor completa todos los campos.");
        event.preventDefault();
      }
    });
  }
});
