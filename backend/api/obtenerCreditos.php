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
    die(json_encode(["error" => "Conexión fallida: " . $conn->connect_error]));
}

$userId = $_GET['userId'];

// Consulta SQL para obtener los créditos asociados al usuario
$sql = "SELECT c.id, c.solicitud_id, c.fecha, c.valor_transaccion, 
               c.abono_capital, c.abono_intereses, c.saldo_capital 
        FROM creditos c
        INNER JOIN solicitudes_credito sc ON c.solicitud_id = sc.id
        WHERE sc.usuario_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$creditos = [];

while ($row = $result->fetch_assoc()) {
    $creditos[] = $row;
}

echo json_encode($creditos);

$stmt->close();
$conn->close();
