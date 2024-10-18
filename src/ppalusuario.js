import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "/public/styles.scss";

function PpalUsuario() {
  useEffect(() => {
    const userEmail = sessionStorage.getItem("userEmail");
    const userId = sessionStorage.getItem("userId");
    const userInfo = document.getElementById("userInfo");

    console.log("userEmail:", userEmail); // Log para verificar el valor
    console.log("userId:", userId); // Log para verificar el valor

    if (userInfo) {
      if (userEmail && userId) {
        userInfo.innerText = `Bienvenido, ${userEmail} (ID: ${userId})`;
      } else {
        userInfo.innerText = "No se ha iniciado sesión.";
      }
    }

    const logoutButton = document.getElementById("logoutButton");

    const handleLogout = () => {
      sessionStorage.removeItem("userEmail");
      sessionStorage.removeItem("userId");
      alert("Sesión cerrada exitosamente.");
      window.location.href = "ingreso.html";
    };

    if (logoutButton) {
      logoutButton.addEventListener("click", handleLogout);
    }

    return () => {
      if (logoutButton) {
        logoutButton.removeEventListener("click", handleLogout);
      }
    };
  }, []);

  return null;
}

ReactDOM.render(<PpalUsuario />, document.getElementById("root"));
