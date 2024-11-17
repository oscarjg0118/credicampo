import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "/public/styles.scss";

function App() {
  const [creditos, setCreditos] = useState([]);
  const [creditosCreados, setCreditosCreados] = useState([]);
  const [cuentaAhorro, setCuentaAhorro] = useState(null);
  const [selectedCredito, setSelectedCredito] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const userId = sessionStorage.getItem("userId");

  if (!userId) {
    alert("Debe iniciar sesión para acceder a esta página.");
    window.location.href = "ingreso.html";
    return null;
  }

  // Función para obtener las solicitudes de crédito (modal)
  const obtenerSolicitudesCredito = async () => {
    try {
      const response = await fetch(
        `http://localhost/backend/api/obtenerSolicitudesCredit.php?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      setCreditos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar las solicitudes de crédito:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener solicitudes de crédito en estado "creado"
  const obtenerSolicitudesCreditoCreadas = async () => {
    try {
      const response = await fetch(
        `http://localhost/backend/api/obtenerSolictCredCreado.php?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log("Datos recibidos del API:", data); // Verificación de datos recibidos

      // Verificar y extraer el array de datos
      if (data && Array.isArray(data.data)) {
        setCreditosCreados(data.data);
        console.log(
          "Estado creditosCreados después de la actualización:",
          data.data
        );
      } else {
        setCreditosCreados([]);
        console.error("Los datos recibidos no son un array:", data);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar créditos creados:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Función para obtener la cuenta de ahorro
  const obtenerCuentaAhorro = async () => {
    try {
      const response = await fetch(
        `http://localhost/backend/api/obtenerctaahorroCredit.php?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      setCuentaAhorro(data || null);
    } catch (error) {
      console.error("Error al cargar cuenta de ahorro:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para transferir monto a la cuenta de ahorro
  const transferirMonto = async () => {
    if (!selectedCredito || !cuentaAhorro) {
      alert("Debe seleccionar un crédito y una cuenta de ahorro.");
      return;
    }

    if (selectedCredito.estado === "desembolsado") {
      alert("No se puede transferir un crédito que ya ha sido desembolsado.");
      return;
    }

    const { monto, id: id_credito } = selectedCredito;
    const { id: id_cuenta_ahorro } = cuentaAhorro;

    if (
      confirm(
        `¿Estás seguro de que deseas transferir $${monto} a la cuenta de ahorro seleccionada?`
      )
    ) {
      setIsCopying(true);
      try {
        const response = await fetch(
          "http://localhost/backend/api/transferirCreditoACuentaAhorro.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              usuario_id: userId,
              id_cuenta_ahorro,
              monto_transferencia: monto,
              id_credito,
            }),
          }
        );
        if (!response.ok) {
          const data = await response.json();
          throw new Error(
            `Error HTTP: ${response.status}. ${
              data?.message || "Error desconocido."
            }`
          );
        }
        const data = await response.json();
        if (data.success) {
          alert("Monto transferido con éxito a la cuenta de ahorro.");
          actualizarEstados(id_credito, monto);
        } else {
          alert("Error al transferir el monto: " + data.message);
        }
      } catch (error) {
        console.error("Error al transferir el monto:", error);
        alert("Hubo un problema al transferir el monto.");
      } finally {
        setIsCopying(false);
      }
    }
  };

  // Actualiza los estados de créditos y cuenta
  const actualizarEstados = (id_credito, monto) => {
    setCreditos((prevCreditos) =>
      prevCreditos.map((credito) =>
        credito.id === id_credito
          ? { ...credito, estado: "desembolsado" }
          : credito
      )
    );
    setCuentaAhorro((prevCuenta) => ({
      ...prevCuenta,
      saldo_actual: prevCuenta.saldo_actual + monto,
    }));
  };

  useEffect(() => {
    obtenerSolicitudesCredito();
    obtenerSolicitudesCreditoCreadas();
    obtenerCuentaAhorro();
  }, [userId]);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

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
          <h3>Envía crédito a tu cuenta de ahorro</h3>
          <select
            onChange={(e) =>
              setSelectedCredito(
                creditosCreados.find((credito) => credito.id == e.target.value)
              )
            }
          >
            <option value="">Seleccione un crédito</option>
            {creditosCreados.map((credito) => (
              <option key={credito.id} value={credito.id}>
                Crédito ID: {credito.id} - Monto: ${credito.monto}
              </option>
            ))}
          </select>

          <h3>Selecciona una Cuenta de Ahorro</h3>
          {cuentaAhorro ? (
            <select>
              <option value={cuentaAhorro.id}>
                Cuenta Ahorro ID: {cuentaAhorro.id} - Saldo: $
                {cuentaAhorro.saldo_actual}
              </option>
            </select>
          ) : (
            <p>No tienes cuentas de ahorro activas.</p>
          )}

          <button
            className="btn btn-primary"
            onClick={transferirMonto}
            disabled={isCopying || !selectedCredito || !cuentaAhorro}
          >
            {isCopying
              ? "Transfiriendo..."
              : "Transferir Monto a Cuenta de Ahorro"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleShowModal}
            disabled={creditos.length === 0}
          >
            Ver Créditos
          </button>

          {showModal && (
            <div className="modal fade show" style={{ display: "block" }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Detalles de Créditos</h5>
                    <button
                      type="button"
                      className="close"
                      onClick={handleCloseModal}
                    >
                      &times;
                    </button>
                  </div>
                  <div className="modal-body">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Monto</th>
                          <th>Plazo</th>
                          <th>Interés Mensual</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {creditos.map((credito) => (
                          <tr key={credito.id}>
                            <td>${credito.monto}</td>
                            <td>{credito.plazo} meses</td>
                            <td>{credito.interes_mensual}%</td>
                            <td>{credito.estado}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(<App />);
