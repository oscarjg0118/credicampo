import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./styles/styles.scss";

function Pagos() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [obligacionId, setObligacionId] = useState("");
  const [valorPago, setValorPago] = useState("");

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      alert("Debe iniciar sesión para realizar un pago.");
      window.location.href = "ingreso.html";
      return;
    }

    fetch(
      `http://localhost/backend/api/obtenerSolicitudesCredito.php?userId=${userId}`
    )
      .then((response) => response.json())
      .then((data) => {
        setSolicitudes(data);
      })
      .catch((error) => {
        console.error("Error al obtener las solicitudes de crédito:", error);
      });
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    const solicitud = solicitudes.find((s) => s.id.toString() === obligacionId);
    if (!solicitud) {
      alert("Número de obligación no encontrado.");
      return;
    }

    const saldoCapital = Math.max(0, solicitud.monto - valorPago);
    const abonoCapital =
      valorPago > solicitud.monto ? solicitud.monto : valorPago;
    const abonoIntereses =
      valorPago > solicitud.monto ? valorPago - solicitud.monto : 0;

    const data = {
      solicitud_id: obligacionId,
      valor_transaccion: parseFloat(valorPago),
      abono_capital: parseFloat(abonoCapital),
      abono_intereses: parseFloat(abonoIntereses),
      saldo_capital: parseFloat(saldoCapital),
      saldo_intereses: parseFloat(solicitud.cuota_mensual - abonoIntereses),
    };

    console.log("Datos enviados:", data); // Añadido para depuración

    fetch("http://localhost/backend/api/registrarPago.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Respuesta del servidor:", data);
        alert(data.message || "Pago registrado exitosamente.");
      })
      .catch((error) => {
        console.error("Error al registrar el pago:", error);
        alert("Error al registrar el pago.");
      });
  };

  return (
    <div className="container mt-5">
      <h2>Realiza el Pago de tus Productos</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="obligacionId">Número de Obligación:</label>
          <select
            id="obligacionId"
            className="form-control"
            value={obligacionId}
            onChange={(e) => setObligacionId(e.target.value)}
            required
          >
            <option value="">Seleccione una obligación</option>
            {solicitudes.map((solicitud) => (
              <option key={solicitud.id} value={solicitud.id}>
                {solicitud.id} - Monto: {solicitud.monto} - Plazo:{" "}
                {solicitud.plazo} meses - Cuota Mensual:{" "}
                {solicitud.cuota_mensual}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="valorPago">Valor a Pagar:</label>
          <input
            type="number"
            id="valorPago"
            className="form-control"
            value={valorPago}
            onChange={(e) => setValorPago(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Continuar
        </button>
      </form>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<Pagos />);
