<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Conexión a la base de datos
$servername = "localhost:3307";
$username = "root";
$password = "";
$dbname = "credicampo1";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["error" => "Conexión fallida: " . $conn->connect_error]));
}

// Validar el parámetro userId
if (!isset($_GET['userId']) || !is_numeric($_GET['userId'])) {
    http_response_code(400);
    die(json_encode(["error" => "Parámetro userId faltante o inválido."]));
}

$userId = intval($_GET['userId']); // Asegurarse de que sea un entero

// Consulta para obtener las solicitudes de crédito
$sql = "SELECT monto, plazo, interes_mensual, estado FROM solicitudes_credito WHERE usuario_id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    die(json_encode(["error" => "Error en la preparación de la consulta: " . $conn->error]));
}

$stmt->bind_param("i", $userId);

if (!$stmt->execute()) {
    http_response_code(500);
    die(json_encode(["error" => "Error en la ejecución de la consulta: " . $stmt->error]));
}

$result = $stmt->get_result();
$solicitudes = [];

while ($row = $result->fetch_assoc()) {
    $solicitudes[] = $row;
}

// Enviar la respuesta en formato JSON
echo json_encode($solicitudes);

$stmt->close();
$conn->close();
