<?php
// Habilitar CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Datos de conexión a la base de datos
$servername = "localhost:3307";
$username = "root";
$password = "";
$dbname = "credicampo1";

// Crear conexión a la base de datos
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar si la conexión tuvo éxito
if ($conn->connect_error) {
    die(json_encode(["message" => "Error en la conexión a la base de datos: " . $conn->connect_error]));
}

// Obtener los datos enviados desde el frontend
$data = json_decode(file_get_contents('php://input'), true);

$monto = $data['monto'];
$ingreso = $data['ingreso'];
$plazo = $data['plazo'];
$interesMensual = $data['interesMensual'];
$cuota = $data['cuota'];
$usuario_id = $data['usuario_id'];

// Insertar la solicitud de crédito en la base de datos
$sql = "INSERT INTO solicitudes_credito (monto, ingreso, plazo, interes_mensual, cuota_mensual, usuario_id, estado) 
        VALUES (?, ?, ?, ?, ?, ?, 'creado')";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ddiddi", $monto, $ingreso, $plazo, $interesMensual, $cuota, $usuario_id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Solicitud de crédito registrada correctamente."]);
} else {
    echo json_encode(["message" => "Error al registrar la solicitud."]);
}

$stmt->close();
$conn->close();
