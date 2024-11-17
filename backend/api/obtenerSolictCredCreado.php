<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); // Ajusta según el dominio permitido
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Conexión a la base de datos
$servername = "localhost:3307";
$username = "root";
$password = "";
$dbname = "credicampo1";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["status" => "error", "message" => "Conexión fallida: " . $conn->connect_error]));
}

// Validación del parámetro userId
if (!isset($_GET['userId']) || !filter_var($_GET['userId'], FILTER_VALIDATE_INT)) {
    http_response_code(400);
    die(json_encode(["status" => "error", "message" => "Parámetro userId inválido o no proporcionado."]));
}

$userId = intval($_GET['userId']);

// Obtener solicitudes de crédito en estado "creado"
$sql = "SELECT id, monto FROM solicitudes_credito WHERE usuario_id = ? AND estado = 'creado'";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    die(json_encode(["status" => "error", "message" => "Error en la preparación de la consulta."]));
}

$stmt->bind_param("i", $userId);

if (!$stmt->execute()) {
    http_response_code(500);
    die(json_encode(["status" => "error", "message" => "Error al ejecutar la consulta: " . $stmt->error]));
}

$result = $stmt->get_result();
$solicitudes = [];

while ($row = $result->fetch_assoc()) {
    $solicitudes[] = $row;
}

echo json_encode([
    "status" => "success",
    "data" => $solicitudes
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

$stmt->close();
$conn->close();
