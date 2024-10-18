<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost:3307";
$username = "root";
$password = "";
$dbname = "credicampo1";

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
$id_origen = $data['id_origen'];
$id_destino = $data['id_destino'];
$valor_movimiento = $data['valor_movimiento'];

// Verificar datos
if (!$id_origen || !$id_destino || !is_numeric($valor_movimiento) || $valor_movimiento <= 0) {
    echo json_encode(["success" => false, "message" => "Datos incompletos o inválidos para realizar la transferencia."]);
    http_response_code(400);
    exit();
}

// Iniciar transacción
$conn->begin_transaction();

try {
    // Obtener saldo de la cuenta origen
    $sql = "SELECT saldo_actual FROM ctaahorro WHERE id_usuario = ? FOR UPDATE";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id_origen);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $saldo_origen = $row['saldo_actual'];

    if ($saldo_origen < $valor_movimiento) {
        throw new Exception("Fondos insuficientes en la cuenta de origen.");
    }

    // Actualizar saldo en la cuenta origen
    $sql = "UPDATE ctaahorro SET saldo_actual = saldo_actual - ? WHERE id_usuario = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("di", $valor_movimiento, $id_origen);
    $stmt->execute();

    // Actualizar saldo en la cuenta destino
    $sql = "UPDATE ctaahorro SET saldo_actual = saldo_actual + ? WHERE id_usuario = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("di", $valor_movimiento, $id_destino);
    $stmt->execute();

    // Registrar la transferencia
    $sql = "INSERT INTO ctaahorro_movimientos (id_usuario, tipo_movimiento, valor_movimiento, saldo_actual, fecha_movimiento)
            VALUES (?, 'transferencia', ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("idi", $id_origen, $valor_movimiento, $saldo_origen - $valor_movimiento);
    $stmt->execute();
    $stmt->bind_param("idi", $id_destino, $valor_movimiento, $saldo_origen + $valor_movimiento);
    $stmt->execute();

    // Confirmar transacción
    $conn->commit();

    echo json_encode(["success" => true, "message" => "Transferencia realizada exitosamente."]);
} catch (Exception $e) {
    // Revertir transacción en caso de error
    $conn->rollback();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$stmt->close();
$conn->close();
