import "./styles/styles.scss";

// Si estás usando React, importa React y ReactDOM
import React from "react";
import ReactDOM from "react-dom";

// Código JavaScript para la página de ingreso
// Por ejemplo, la validación del formulario de ingreso

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  if (form) {
    form.addEventListener("submit", function (event) {
      const usuario = document.querySelector('input[type="text"]').value;
      const contraseña = document.querySelector('input[type="password"]').value;

      if (!usuario || !contraseña) {
        alert("Por favor ingresa tu usuario y contraseña.");
        event.preventDefault();
      }
    });
  }
});
