<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Datos de conexión a la base de datos
$servername = "localhost:3307";
$username = "root";
$password = "123456";
$dbname = "credicampo1";

// Crear la conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    echo json_encode(["message" => "Error de conexión: " . $conn->connect_error]);
    http_response_code(500);
    exit();
}

// Obtener los datos de la solicitud
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

$usuario_id = $data['usuario_id'] ?? null;
$monto = $data['monto'] ?? null;
$ingreso = $data['ingreso'] ?? null;
$plazo = $data['plazo'] ?? null;
$interesMensual = $data['interesMensual'] ?? null;
$cuotaMensual = $data['cuota'] ?? null;

if (!$usuario_id || !$monto || !$ingreso || !$plazo || !$interesMensual || !$cuotaMensual) {
    echo json_encode(["message" => "Todos los campos son obligatorios"]);
    http_response_code(400);
    exit();
}

// Verificar que el usuario existe en la tabla usuarios
$sql_check_user = "SELECT id FROM usuarios WHERE id = ?";
$stmt_check_user = $conn->prepare($sql_check_user);

if ($stmt_check_user === false) {
    echo json_encode(["message" => "Error en la preparación de la consulta: " . $conn->error]);
    http_response_code(500);
    exit();
}

$stmt_check_user->bind_param("i", $usuario_id);
$stmt_check_user->execute();
$stmt_check_user->store_result();

if ($stmt_check_user->num_rows === 0) {
    echo json_encode(["message" => "El usuario no existe"]);
    http_response_code(400);
    $stmt_check_user->close();
    $conn->close();
    exit();
}

$stmt_check_user->close();

// Insertar los datos en la tabla solicitudes_credito
$sql_insert = "INSERT INTO solicitudes_credito (usuario_id, monto, ingreso, plazo, interes_mensual, cuota_mensual) 
               VALUES (?, ?, ?, ?, ?, ?)";

$stmt_insert = $conn->prepare($sql_insert);

if ($stmt_insert === false) {
    echo json_encode(["message" => "Error en la preparación de la consulta: " . $conn->error]);
    http_response_code(500);
    exit();
}

$stmt_insert->bind_param("iddidd", $usuario_id, $monto, $ingreso, $plazo, $interesMensual, $cuotaMensual);

$response = array();

if ($stmt_insert->execute()) {
    $response['message'] = "Solicitud de crédito registrada correctamente. Cuota mensual: $" . number_format($cuotaMensual, 2);
} else {
    $response['message'] = "Error al registrar la solicitud de crédito: " . $stmt_insert->error;
    http_response_code(500);
}

$stmt_insert->close();
$conn->close();

echo json_encode($response);
