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
      `http://localhost/backend/api/obtenerSolicitCreditpagos.php?userId=${userId}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Solicitudes obtenidas:", data);
        setSolicitudes(data);
      })
      .catch((error) => {
        console.error("Error al obtener las solicitudes de crédito:", error);
      });
  }, []);

  const calcularAbonos = (monto, interesMensual, valor) => {
    const interesGenerado = monto * (interesMensual / 100);
    const abonoIntereses = Math.min(valor, interesGenerado);
    const abonoCapital = Math.max(0, valor - abonoIntereses);
    const saldoCapital = Math.max(0, monto - abonoCapital);
    const saldoIntereses = Math.max(0, interesGenerado - abonoIntereses);

    return { abonoIntereses, abonoCapital, saldoCapital, saldoIntereses };
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const solicitud = solicitudes.find((s) => s.id.toString() === obligacionId);
    if (!solicitud) {
      alert("Número de obligación no encontrado.");
      return;
    }

    console.log("Solicitud seleccionada:", solicitud);

    const valor = parseFloat(valorPago);
    const monto = parseFloat(solicitud.monto);
    const interesMensual = parseFloat(solicitud.interes_mensual);
    const plazo = parseInt(solicitud.plazo, 10);
    const cuotaMensual = parseFloat(solicitud.cuota_mensual);

    console.log("Valores ingresados:");
    console.log("Valor a pagar:", valor);
    console.log("Monto:", monto);
    console.log("Interés mensual:", interesMensual);
    console.log("Plazo:", plazo);

    if (
      isNaN(valor) ||
      valor <= 0 ||
      isNaN(monto) ||
      monto <= 0 ||
      isNaN(interesMensual) ||
      interesMensual <= 0 ||
      isNaN(plazo) ||
      plazo <= 0
    ) {
      const errorMessage =
        "Error en los cálculos. Por favor revise que los valores ingresados sean números válidos y mayores que cero.";
      console.error(errorMessage);
      alert(errorMessage);
      return;
    }

    try {
      const { abonoIntereses, abonoCapital, saldoCapital, saldoIntereses } =
        calcularAbonos(monto, interesMensual, valor);

      const data = {
        solicitud_id: obligacionId,
        fecha: new Date().toISOString(),
        valor_transaccion: valor,
        abono_capital: abonoCapital,
        abono_intereses: abonoIntereses,
        saldo_capital: saldoCapital,
        saldo_intereses: saldoIntereses,
      };

      console.log("Datos enviados:", data);

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
    } catch (error) {
      console.error(error);
      alert(
        "Error al calcular los abonos. Por favor, revise los valores ingresados."
      );
    }
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
                {solicitud.plazo} meses - Interés Mensual:{" "}
                {solicitud.interes_mensual}%: Cuota Mensual{" "}
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
            min="0.01"
            step="0.01"
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
