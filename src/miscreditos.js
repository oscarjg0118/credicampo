import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "/public/styles.scss";

function App() {
  const [creditos, setCreditos] = useState([]);
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

  // Fetch para obtener los créditos desde la tabla creditos
  useEffect(() => {
    fetch(`http://localhost/backend/api/obtenerCreditos.php?userId=${userId}`)
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

  // Fetch para obtener la cuenta de ahorro más reciente
  useEffect(() => {
    fetch(
      `http://localhost/backend/api/obtenerctaahorroCredit.php?userId=${userId}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCuentaAhorro(data || null);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setIsLoading(false);
      });
  }, [userId]);

  const transferirMonto = () => {
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

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
          <h3>Envía crédito a tu cuenta de ahorro</h3>
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
          {cuentaAhorro ? (
            <select onChange={() => setSelectedCuentaAhorro(cuentaAhorro)}>
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

          {/* Modal para mostrar créditos */}
          {showModal && (
            <div className="modal fade show" style={{ display: "block" }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Créditos</h5>
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
                          <th>ID</th>
                          <th>Solicitud ID</th>
                          <th>Fecha</th>
                          <th>Valor Transacción</th>
                          <th>Abono Capital</th>
                          <th>Abono Intereses</th>
                          <th>Saldo Capital</th>
                        </tr>
                      </thead>
                      <tbody>
                        {creditos.map((credito) => (
                          <tr key={credito.id}>
                            <td>{credito.id}</td>
                            <td>{credito.solicitud_id}</td>
                            <td>{credito.fecha}</td>
                            <td>${credito.valor_transaccion}</td>
                            <td>${credito.abono_capital}</td>
                            <td>${credito.abono_intereses}</td>
                            <td>${credito.saldo_capital}</td>
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
