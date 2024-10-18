<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexion.php'; // Archivo de conexión a la base de datos

// Obtener los datos enviados desde el frontend
$data = json_decode(file_get_contents('php://input'), true);

$monto = $data['monto'];
$ingreso = $data['ingreso'];
$plazo = $data['plazo'];
$interesMensual = $data['interesMensual'];
$cuota = $data['cuota'];
$usuario_id = $data['usuario_id'];
$cupo = $data['cupo']; // Recibir el valor del cupo desde el frontend

// Validar que el monto no sea mayor al cupo disponible
if ($monto > $cupo) {
    echo json_encode(["message" => "El monto solicitado excede el cupo disponible."]);
    exit;
}

// Insertar la solicitud de crédito en la base de datos
$sql = "INSERT INTO solicitudes_credito (monto, ingreso, plazo, interes_mensual, cuota, usuario_id, estado, cupo) 
        VALUES (?, ?, ?, ?, ?, ?, 'creado', ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ddiddis", $monto, $ingreso, $plazo, $interesMensual, $cuota, $usuario_id, $cupo);

if ($stmt->execute()) {
    echo json_encode(["message" => "Solicitud de crédito registrada correctamente."]);
} else {
    echo json_encode(["message" => "Error al registrar la solicitud."]);
}

$stmt->close();
$conn->close();
