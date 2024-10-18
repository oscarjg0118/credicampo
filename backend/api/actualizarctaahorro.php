<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost:3307";
$username = "root";
$password = "";
$dbname = "credicampo1";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    http_response_code(500);
    exit();
}

// Obtener datos del POST
$data = json_decode(file_get_contents("php://input"), true);
$id_usuario = $data['id_usuario'];
$tipo_movimiento = $data['tipo_movimiento'];
$valor_movimiento = $data['valor_movimiento'];
$saldo_actual = $data['saldo_actual'];

// Validar datos
if (!$id_usuario || !$tipo_movimiento || !isset($valor_movimiento) || !isset($saldo_actual)) {
    echo json_encode(["success" => false, "message" => "Datos incompletos para actualizar la cuenta de ahorro."]);
    http_response_code(400);
    exit();
}

// Actualizar o insertar el movimiento en la cuenta de ahorro
$sql = "INSERT INTO ctaahorro (id_usuario, tipo_movimiento, valor_movimiento, saldo_actual, fecha_movimiento)
        VALUES (?, ?, ?, ?, NOW())";

$stmt = $conn->prepare($sql);
$stmt->bind_param("isdi", $id_usuario, $tipo_movimiento, $valor_movimiento, $saldo_actual);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Movimiento registrado exitosamente."]);
} else {
    echo json_encode(["success" => false, "message" => "Error al registrar el movimiento."]);
}

$stmt->close();
$conn->close();
