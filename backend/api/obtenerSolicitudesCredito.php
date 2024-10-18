<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost:3307";
$username = "root";
$password = "";
$dbname = "credicampo1";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["message" => "Connection failed: " . $conn->connect_error]);
    http_response_code(500);
    exit();
}

$userId = $_GET['userId'] ?? null;

if (!$userId) {
    echo json_encode(["success" => false, "message" => "userId es requerido"]);
    http_response_code(400);
    exit();
}

$sql = "SELECT id, monto, plazo, interes_mensual, cuota_mensual FROM solicitudes_credito WHERE usuario_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$solicitudes = [];

while ($row = $result->fetch_assoc()) {
    $solicitudes[] = $row;
}

echo json_encode($solicitudes);

$stmt->close();
$conn->close();
