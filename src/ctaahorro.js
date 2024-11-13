import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "/public/styles.scss";

function CuentasAhorro() {
  const [saldo, setSaldo] = useState(null);
  const [monto, setMonto] = useState("");
  const [accion, setAccion] = useState("apertura");
  const [mensaje, setMensaje] = useState("");
  const [cuentaDestino, setCuentaDestino] = useState("");
  const [movimientos, setMovimientos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);

  const obtenerUserId = () => {
    const userId = parseInt(sessionStorage.getItem("userId"), 10);
    if (isNaN(userId) || userId <= 0) {
      setMensaje(
        "Error: userId es requerido y debe ser un número entero válido."
      );
      return null;
    }
    return userId;
  };

  const actualizarCuentas = () => {
    const userId = obtenerUserId();
    if (!userId) return;

    fetch(
      `http://localhost/backend/api/obtenerMovimientos.php?usuario_id=${userId}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data && data.success !== false) {
          setSaldo(data.saldo || 0);
          const movimientosFiltrados = Array.isArray(data.movimientos)
            ? data.movimientos.filter((mov) => mov.usuario_id === userId)
            : [];
          setMovimientos(movimientosFiltrados);
        } else {
          setSaldo(null);
          setMovimientos([]);
          setMensaje(data.message || "No se encontraron cuentas de ahorro.");
        }
      })
      .catch((error) => {
        console.error("Error al obtener la cuenta de ahorro:", error);
        setMensaje("Error al cargar la cuenta de ahorro.");
      });
  };

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      alert("Debe iniciar sesión para realizar una operación.");
      window.location.href = "ingreso.html";
    } else {
      actualizarCuentas();
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const userId = obtenerUserId();
    if (!userId) return;

    if (accion === "apertura") {
      fetch("http://localhost/backend/api/crearctaahorro.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: userId,
          tipo_movimiento: "apertura",
          valor_movimiento: 0,
          saldo_actual: 0,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setMensaje("Cuenta de ahorro creada exitosamente.");
            actualizarCuentas();
          } else {
            setMensaje(data.message || "Error al crear la cuenta.");
          }
        })
        .catch((error) => {
          console.error("Error en la creación de cuenta:", error);
          setMensaje("Error al crear la cuenta de ahorro.");
        });
    } else {
      const valor = parseFloat(monto);
      if (isNaN(valor) || valor <= 0) {
        alert("Por favor ingrese un monto válido.");
        return;
      }

      if (
        accion === "transferencia" &&
        (!cuentaDestino || isNaN(parseInt(cuentaDestino, 10)))
      ) {
        alert("Por favor ingrese un número de cuenta destino válido.");
        return;
      }

      setMensaje(`Operación ${accion} realizada con éxito.`);
    }

    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setMonto("");
    setCuentaDestino("");
    setAccion("apertura");
    setMensaje("");
  };

  return (
    <div className="container mt-5">
      <h2>Gestión de Cuentas de Ahorro</h2>
      {mensaje && <p className="alert alert-info">{mensaje}</p>}
      {saldo === null ? (
        <p>Aún no tienes cuenta de ahorro.</p>
      ) : (
        <div>
          <p>Saldo actual: ${saldo}</p>
          <button
            className="btn btn-info"
            onClick={() => setMostrarModal(true)}
          >
            Ver Movimientos
          </button>
          {mostrarModal && (
            <div className="modal show" style={{ display: "block" }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Movimientos de la Cuenta de Ahorro
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setMostrarModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>ID Usuario</th>
                          <th>Tipo de Movimiento</th>
                          <th>Valor</th>
                          <th>Saldo Actual</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movimientos.length === 0 ? (
                          <tr>
                            <td colSpan="6">
                              No hay movimientos para mostrar.
                            </td>
                          </tr>
                        ) : (
                          movimientos.map((mov) => (
                            <tr key={mov.id}>
                              <td>{mov.id}</td>
                              <td>{mov.usuario_id}</td>
                              <td>{mov.tipo_movimiento}</td>
                              <td>{mov.valor_movimiento}</td>
                              <td>{mov.saldo_actual}</td>
                              <td>
                                {new Date(
                                  mov.fecha_movimiento
                                ).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setMostrarModal(false)}
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
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="accion">Seleccione la operación:</label>
          <select
            id="accion"
            className="form-control"
            value={accion}
            onChange={(e) => setAccion(e.target.value)}
          >
            <option value="apertura">Apertura</option>
            <option value="consignacion">Consignación</option>
            <option value="retiro">Retiro</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>

        {accion !== "apertura" && (
          <div className="form-group">
            <label htmlFor="monto">Monto:</label>
            <input
              type="number"
              id="monto"
              className="form-control"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>
        )}

        {accion === "transferencia" && (
          <div className="form-group">
            <label htmlFor="cuentaDestino">Número de cuenta destino:</label>
            <input
              type="number"
              id="cuentaDestino"
              className="form-control"
              value={cuentaDestino}
              onChange={(e) => setCuentaDestino(e.target.value)}
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          Realizar operación
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={limpiarFormulario}
        >
          Limpiar
        </button>
      </form>
    </div>
  );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<CuentasAhorro />);
