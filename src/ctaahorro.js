import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "/public/styles.scss";

function CuentasAhorro() {
  const [saldo, setSaldo] = useState(null); // Saldo inicial, null si no hay cuenta
  const [monto, setMonto] = useState(""); // Monto que ingresa el usuario
  const [accion, setAccion] = useState("apertura"); // Acción seleccionada
  const [mensaje, setMensaje] = useState(""); // Mensaje para mostrar al usuario
  const [cuentaDestino, setCuentaDestino] = useState(""); // Cuenta destino para transferencias
  const [cuentas, setCuentas] = useState([]); // Lista de cuentas de ahorro
  const [movimientos, setMovimientos] = useState([]); // Movimientos de la cuenta

  // Función para actualizar las cuentas de ahorro del usuario
  const actualizarCuentas = () => {
    const userId = sessionStorage.getItem("userId");

    fetch(`http://localhost/backend/api/obtenerctaahorro.php?userId=${userId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          setCuentas(data);
          setSaldo(data[0].saldo_actual); // Actualizar saldo con la primera cuenta obtenida
          obtenerMovimientos(data[0].id_cuenta); // Obtener movimientos de la cuenta
        } else {
          setCuentas([]);
          setSaldo(null); // Si no hay cuentas
        }
      })
      .catch((error) => {
        console.error("Error al obtener las cuentas de ahorro:", error);
      });
  };

  const obtenerMovimientos = (idCuenta) => {
    fetch(
      `http://localhost/backend/api/obtenerMovimientos.php?idCuenta=${idCuenta}`
    )
      .then((response) => response.json())
      .then((data) => {
        setMovimientos(data);
      })
      .catch((error) => {
        console.error("Error al obtener los movimientos:", error);
      });
  };

  // Efecto para cargar las cuentas de ahorro al montar el componente
  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      alert("Debe iniciar sesión para realizar una operación.");
      window.location.href = "ingreso.html";
      return;
    }

    actualizarCuentas(); // Llamar para obtener las cuentas
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const valor = parseFloat(monto);
    const fechaMovimiento = new Date().toISOString();

    if (accion !== "apertura" && (isNaN(valor) || valor <= 0)) {
      alert("Por favor ingrese un monto válido.");
      return;
    }

    switch (accion) {
      case "apertura":
        if (saldo !== null) {
          alert("Ya tienes una cuenta de ahorro.");
        } else {
          crearCuentaAhorro(fechaMovimiento);
        }
        break;
      case "consignacion":
        if (saldo !== null) {
          const nuevoSaldo = saldo + valor;
          setSaldo(nuevoSaldo);
          alert(`Consignación exitosa. Nuevo saldo: $${nuevoSaldo}`);
          crearMovimiento(valor, nuevoSaldo, fechaMovimiento);
        } else {
          alert("No hay cuenta de ahorro para realizar la consignación.");
        }
        break;
      case "retiro":
        if (saldo === null) {
          alert("No hay cuenta de ahorro para realizar el retiro.");
        } else if (valor > saldo) {
          alert("Fondos insuficientes.");
        } else {
          const nuevoSaldo = saldo - valor;
          setSaldo(nuevoSaldo);
          alert(`Retiro exitoso. Nuevo saldo: $${nuevoSaldo}`);
          crearMovimiento(-valor, nuevoSaldo, fechaMovimiento);
        }
        break;
      case "transferencia":
        if (saldo === null) {
          alert("No hay cuenta de ahorro para realizar la transferencia.");
        } else if (valor > saldo) {
          alert("Fondos insuficientes para transferir.");
        } else if (!cuentaDestino) {
          alert("Por favor ingrese el número de cuenta destino.");
        } else {
          const nuevoSaldo = saldo - valor;
          setSaldo(nuevoSaldo);
          alert(
            `Transferencia de $${valor} a la cuenta ${cuentaDestino} realizada con éxito. Nuevo saldo: $${nuevoSaldo}`
          );
          crearMovimiento(-valor, nuevoSaldo, fechaMovimiento);
        }
        break;
      default:
        alert("Operación no válida.");
    }

    setMonto("");
  };

  const crearCuentaAhorro = (fechaMovimiento) => {
    const userId = sessionStorage.getItem("userId");

    fetch("http://localhost/backend/api/crearctaahorro.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuario_id: userId, // Usar el ID del usuario conectado
        tipo_movimiento: "apertura",
        valor_movimiento: 0,
        saldo_actual: 0,
        fecha_movimiento: fechaMovimiento,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setMensaje("Cuenta de ahorro creada exitosamente.");
          actualizarCuentas(); // Refrescar las cuentas una vez creada
        } else {
          setMensaje("Error al crear la cuenta de ahorro.");
        }
      })
      .catch((error) => {
        console.error("Error al realizar la solicitud:", error);
        setMensaje("Error al realizar la solicitud.");
      });
  };

  const crearMovimiento = (valorMovimiento, saldoActual, fechaMovimiento) => {
    const userId = sessionStorage.getItem("userId");

    fetch("http://localhost/backend/api/crearctaahorro.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuario_id: userId, // Usar el ID del usuario conectado
        tipo_movimiento: accion,
        valor_movimiento: valorMovimiento,
        saldo_actual: saldoActual,
        fecha_movimiento: fechaMovimiento,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setMensaje("Movimiento registrado exitosamente.");
          actualizarCuentas(); // Refrescar cuentas tras un movimiento
        } else {
          setMensaje("Error al registrar el movimiento.");
        }
      })
      .catch((error) => {
        console.error("Error al realizar la solicitud:", error);
        setMensaje("Error al realizar la solicitud.");
      });
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
      {mensaje && <p>{mensaje}</p>}
      {saldo === null ? (
        <p>Aún no tienes cuenta de ahorro.</p>
      ) : (
        <div>
          <p>Saldo actual: ${saldo}</p>
          <h3>Movimientos:</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Tipo de Movimiento</th>
                <th>Valor</th>
                <th>Saldo Actual</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((mov, index) => (
                <tr key={index}>
                  <td>{mov.tipo_movimiento}</td>
                  <td>{mov.valor_movimiento}</td>
                  <td>{mov.saldo_actual}</td>
                  <td>{new Date(mov.fecha_movimiento).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
              type="text"
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

const container = document.getElementById("root"); // El elemento 'root' en el HTML
const root = createRoot(container); // Crear el 'root' para React 18
root.render(<CuentasAhorro />);

ReactDOM.render(<CuentasAhorro />, document.getElementById("root"));
