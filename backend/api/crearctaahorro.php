<?php
// Encabezados CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Manejar solicitud preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$servername = "localhost:3307";
$username = "root";
$password = "";
$dbname = "credicampo1";

// Habilitar reporte de errores
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    http_response_code(500);
    exit();
}

// Obtener datos del POST
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Error al recibir los datos JSON"]);
    http_response_code(400);
    exit();
}

$usuario_id = $data['usuario_id'];
$tipo_movimiento = $data['tipo_movimiento'];
$valor_movimiento = $data['valor_movimiento'];
$saldo_actual = $data['saldo_actual'];

// Verificar datos
if (!$usuario_id || !$tipo_movimiento || !is_numeric($valor_movimiento) || !is_numeric($saldo_actual)) {
    echo json_encode(["success" => false, "message" => "Datos incompletos o inválidos para crear la cuenta de ahorro."]);
    http_response_code(400);
    exit();
}

// Insertar nueva cuenta de ahorro
$sql = "INSERT INTO ctaahorro (usuario_id, tipo_movimiento, valor_movimiento, saldo_actual, fecha_movimiento)
        VALUES (?, ?, ?, ?, NOW())";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Error al preparar la consulta: " . $conn->error]);
    http_response_code(500);
    exit();
}

$stmt->bind_param("isdi", $usuario_id, $tipo_movimiento, $valor_movimiento, $saldo_actual);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Cuenta de ahorro creada exitosamente."]);
} else {
    echo json_encode(["success" => false, "message" => "Error al crear la cuenta de ahorro: " . $stmt->error]);
    http_response_code(500);
}

$stmt->close();
$conn->close();
