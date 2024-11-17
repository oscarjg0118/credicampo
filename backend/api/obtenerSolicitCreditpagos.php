<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$servername = "localhost:3307";
$username = "root";
$password = "";
$dbname = "credicampo1";

if (!isset($_GET['userId'])) {
    echo json_encode(["error" => "Falta el parámetro userId."]);
    exit();
}

$userId = intval($_GET['userId']);

try {
    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }

    $sql = "SELECT id, monto, plazo, interes_mensual, cuota_mensual
    FROM solicitudes_credito
    WHERE usuario_id = ? AND estado = 'desembolsado'";

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
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
