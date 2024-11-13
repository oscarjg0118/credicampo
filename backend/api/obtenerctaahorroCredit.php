<?php
// Permitir acceso desde cualquier origen
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de la conexión a la base de datos
$servername = "localhost:3307";
$username = "root";
$password = "";
$dbname = "credicampo1";

// Crear conexión a la base de datos
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Fallo en la conexión: " . $conn->connect_error]);
    http_response_code(500);
    exit();
}

// Verificar si el parámetro userId está presente
if (!isset($_GET['userId'])) {
    echo json_encode(["success" => false, "message" => "El parámetro userId es obligatorio"]);
    http_response_code(400);
    exit();
}

$userId = intval($_GET['userId']);

// Consultar la cuenta de ahorro más reciente del usuario
$sql = "SELECT * FROM ctaahorro WHERE usuario_id = ? ORDER BY fecha_movimiento DESC LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $cuentaAhorro = $result->fetch_assoc();
    echo json_encode($cuentaAhorro);
} else {
    echo json_encode(null); // Si no hay resultados, retornar null
}

$stmt->close();
$conn->close();
