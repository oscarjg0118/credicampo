import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "/public/styles.scss";

function App() {
  const [creditos, setCreditos] = useState([]);
  const [cuentasAhorro, setCuentasAhorro] = useState([]);
  const [selectedCredito, setSelectedCredito] = useState(null);
  const [selectedCuentaAhorro, setSelectedCuentaAhorro] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);

  const userId = sessionStorage.getItem("userId");

  if (!userId) {
    alert("Debe iniciar sesión para acceder a esta página.");
    window.location.href = "ingreso.html";
    return null;
  }

  // Fetch para obtener los créditos
  useEffect(() => {
    fetch(
      `http://localhost/backend/api/obtenerSolicitudesCredito.php?userId=${userId}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCreditos(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setIsLoading(false);
      });
  }, [userId]);

  // Fetch para obtener las cuentas de ahorro
  useEffect(() => {
    fetch(`http://localhost/backend/api/obtenerctaahorro.php?userId=${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCuentasAhorro(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setIsLoading(false);
      });
  }, [userId]);

  // Función para copiar el monto del crédito a la cuenta de ahorro
  const transferirMonto = () => {
    if (!selectedCredito || !selectedCuentaAhorro) {
      alert("Debe seleccionar un crédito y una cuenta de ahorro.");
      return;
    }

    // Verificar si el crédito ya está desembolsado
    if (selectedCredito.estado === "desembolsado") {
      alert("No se puede transferir un crédito que ya ha sido desembolsado.");
      return;
    }

    const { monto, id: id_credito } = selectedCredito;
    const { id: id_cuenta_ahorro, saldo_actual } = selectedCuentaAhorro;

    if (
      confirm(
        `¿Estás seguro de que deseas transferir $${monto} a la cuenta de ahorro seleccionada?`
      )
    ) {
      setIsCopying(true);

      fetch("http://localhost/backend/api/transferirCreditoACuentaAhorro.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: userId,
          id_cuenta_ahorro: id_cuenta_ahorro,
          monto_transferencia: monto,
          id_credito: id_credito,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(
                `Error HTTP: ${response.status}. ${
                  data?.message || "Ocurrió un error."
                }`
              );
            });
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            alert("Monto transferido con éxito a la cuenta de ahorro.");
            // Actualizar el estado del crédito a desembolsado
            setCreditos((prevCreditos) =>
              prevCreditos.map((credito) =>
                credito.id === id_credito
                  ? { ...credito, estado: "desembolsado" }
                  : credito
              )
            );
            // Sumar el monto al saldo de la cuenta de ahorro
            setCuentasAhorro((prevCuentas) =>
              prevCuentas.map((cuenta) =>
                cuenta.id === id_cuenta_ahorro
                  ? { ...cuenta, saldo_actual: cuenta.saldo_actual + monto }
                  : cuenta
              )
            );
          } else {
            alert("Error al transferir el monto: " + data.message);
          }
        })
        .catch((error) => {
          console.error("Error al transferir el monto:", error);
          alert("Hubo un problema al transferir el monto.");
        })
        .finally(() => setIsCopying(false));
    }
  };

  return (
    <div>
      <button
        id="logoutButton"
        onClick={() => {
          sessionStorage.removeItem("userId");
          window.location.href = "ingreso.html";
        }}
      >
        Salir
      </button>

      {isLoading ? (
        <p>Cargando información...</p>
      ) : error ? (
        <p>Hubo un problema al cargar la información: {error}</p>
      ) : (
        <div>
          <h3>Selecciona un Crédito</h3>
          {creditos.length === 0 ? (
            <p>No tienes créditos activos.</p>
          ) : (
            <select
              onChange={(e) =>
                setSelectedCredito(
                  creditos.find((credito) => credito.id == e.target.value)
                )
              }
            >
              <option value="">Seleccione un crédito</option>
              {creditos
                .filter((credito) => credito.estado !== "desembolsado")
                .map((credito) => (
                  <option key={credito.id} value={credito.id}>
                    Crédito ID: {credito.id} - Monto: ${credito.monto}
                  </option>
                ))}
            </select>
          )}

          <h3>Selecciona una Cuenta de Ahorro</h3>
          {cuentasAhorro.length === 0 ? (
            <p>No tienes cuentas de ahorro activas.</p>
          ) : (
            <select
              onChange={(e) =>
                setSelectedCuentaAhorro(
                  cuentasAhorro.find((cuenta) => cuenta.id == e.target.value)
                )
              }
            >
              <option value="">Seleccione una cuenta de ahorro</option>
              {cuentasAhorro.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  Cuenta Ahorro ID: {cuenta.id} - Saldo: ${cuenta.saldo_actual}
                </option>
              ))}
            </select>
          )}

          <button
            className="btn btn-primary"
            onClick={transferirMonto}
            disabled={isCopying || !selectedCredito || !selectedCuentaAhorro}
          >
            {isCopying
              ? "Transfiriendo..."
              : "Transferir Monto a Cuenta de Ahorro"}
          </button>
        </div>
      )}
    </div>
  );
}

// Inicializar el renderizado en el DOM
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(<App />);
