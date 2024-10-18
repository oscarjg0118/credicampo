import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "/public/styles.scss";

function SolicitudCredito() {
  const [monto, setMonto] = useState(0);
  const [ingreso, setIngreso] = useState(0);
  const [plazo, setPlazo] = useState(12);
  const [interesMensual, setInteresMensual] = useState(0.5); // Interés mensual del 0.5% por defecto
  const [cuotaMensual, setCuotaMensual] = useState(null);
  const [resultado, setResultado] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);
  const [cupo, setCupo] = useState(null); // Nuevo estado para almacenar el cupo

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      alert("Debe iniciar sesión para solicitar un crédito.");
      window.location.href = "ingreso.html"; // Redirigir a la página de inicio de sesión si no está logueado
    } else {
      setUsuarioId(userId);
    }
  }, []);

  // Función para calcular la cuota mensual con el método de amortización francesa
  const calcularCuota = () => {
    const TN = interesMensual / 100; // Tasa nominal en decimal
    const n = plazo; // Plazo en meses

    // Aplicar la fórmula de amortización francesa
    const cuota =
      (monto * TN * Math.pow(1 + TN, n)) / (Math.pow(1 + TN, n) - 1);

    // Redondear la cuota a la cantidad entera más cercana
    setCuotaMensual(Math.round(cuota));
  };

  // Función para asignar el cupo basado en los ingresos
  const asignarCupo = () => {
    if (ingreso <= 2000000) {
      setCupo(1200000);
    } else {
      setCupo(1900000);
    }
  };

  // Función para limpiar el formulario
  const limpiarFormulario = () => {
    setMonto(0);
    setIngreso(0);
    setPlazo(12);
    setInteresMensual(0.5);
    setCuotaMensual(null);
    setResultado("");
    setCupo(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const maxMonto = ingreso * 12 * 0.25;
    if (monto > maxMonto) {
      alert("El monto solicitado no puede ser mayor al 25% del ingreso anual");
      return;
    }

    // Validar que el monto no sea mayor al cupo asignado
    if (monto > cupo) {
      alert("El monto solicitado excede el cupo disponible.");
      return;
    }

    if (cuotaMensual === null) {
      alert(
        "Por favor, calcule la cuota mensual antes de enviar la solicitud."
      );
      return;
    }

    // Asignar el cupo antes de enviar la solicitud
    asignarCupo();

    try {
      // Enviar la solicitud de crédito
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
            interesMensual: interesMensual,
            cuota: cuotaMensual,
            usuario_id: usuarioId,
            estado: "creado", // Agregar el campo estado con valor 'creado'
            cupo: cupo, // Enviar el valor del cupo asignado
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
        <button
          type="button"
          className="btn btn-warning ml-2"
          onClick={limpiarFormulario}
        >
          Limpiar
        </button>
      </form>

      <div id="resultado" className="mt-3">
        {resultado}
      </div>
    </div>
  );
}

ReactDOM.render(<SolicitudCredito />, document.getElementById("root"));
