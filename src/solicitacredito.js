import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./styles/styles.scss";

function SolicitudCredito() {
  const [monto, setMonto] = useState(0);
  const [ingreso, setIngreso] = useState(0);
  const [plazo, setPlazo] = useState(12);
  const [interesMensual, setInteresMensual] = useState(0.5); // Interés mensual del 0.5% por defecto
  const [cuotaMensual, setCuotaMensual] = useState(null);
  const [resultado, setResultado] = useState("");

  const calcularCuota = () => {
    const tasaInteresMensual = interesMensual / 100;
    const cuota =
      (monto * tasaInteresMensual) /
      (1 - Math.pow(1 + tasaInteresMensual, -plazo));
    setCuotaMensual(Math.round(cuota)); // Redondear la cuota a la cantidad entera más cercana
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const maxMonto = ingreso * 12 * 0.25;
    if (monto > maxMonto) {
      alert("El monto solicitado no puede ser mayor al 25% del ingreso anual");
      return;
    }

    if (cuotaMensual === null) {
      alert(
        "Por favor, calcule la cuota mensual antes de enviar la solicitud."
      );
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/backend/api/solicitacredito.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            monto: monto,
            ingreso: ingreso,
            plazo: plazo,
            interesMensual: interesMensual, // Asegúrate de enviar el interés mensual
            cuota: cuotaMensual, // Campo "cuota" en lugar de "cuotaMensual"
          }),
        }
      );

      const data = await response.json();
      setResultado(data.message || "Error desconocido");
    } catch (error) {
      console.error("Error:", error);
      setResultado("Error al enviar la solicitud");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Solicitar Crédito</h2>
      <form id="creditoForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="monto">Monto Solicitado:</label>
          <div className="input-group">
            <span className="input-group-text">$</span>
            <input
              type="number"
              className="form-control"
              id="monto"
              value={monto}
              onChange={(e) => setMonto(parseFloat(e.target.value))}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="ingreso">Ingreso Mensual:</label>
          <div className="input-group">
            <span className="input-group-text">$</span>
            <input
              type="number"
              className="form-control"
              id="ingreso"
              value={ingreso}
              onChange={(e) => setIngreso(parseFloat(e.target.value))}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="plazo">Plazo (meses):</label>
          <select
            className="form-control"
            id="plazo"
            value={plazo}
            onChange={(e) => setPlazo(parseInt(e.target.value))}
            required
          >
            <option value="12">12 meses</option>
            <option value="24">24 meses</option>
            <option value="36">36 meses</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="interesMensual">Interés Mensual (%):</label>
          <input
            type="number"
            className="form-control"
            id="interesMensual"
            value={interesMensual}
            onChange={(e) => setInteresMensual(parseFloat(e.target.value))}
            required
          />
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={calcularCuota}
        >
          Calcular Cuota
        </button>
        {cuotaMensual !== null && (
          <div className="mt-3">
            <p>Cuota Mensual: ${cuotaMensual}</p>
          </div>
        )}
        <button type="submit" className="btn btn-primary">
          Enviar Solicitud
        </button>
      </form>
      <div id="resultado" className="mt-3">
        {resultado}
      </div>
    </div>
  );
}

ReactDOM.render(<SolicitudCredito />, document.getElementById("root"));
