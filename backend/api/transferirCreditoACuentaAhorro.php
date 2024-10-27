<?php
// Permitir acceso desde cualquier origen
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

// Obtener los datos enviados por el cuerpo de la solicitud
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->usuario_id) || !isset($data->id_cuenta_ahorro) || !isset($data->monto_transferencia) || !isset($data->id_credito)) {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    http_response_code(400);
    exit();
}

// Extraer los datos
$usuario_id = $data->usuario_id;
$id_cuenta_ahorro = $data->id_cuenta_ahorro;
$monto_transferencia = $data->monto_transferencia;
$id_credito = $data->id_credito;

// Verificar el estado del crédito
$sql_check = "SELECT estado FROM solicitudes_credito WHERE id = ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("i", $id_credito);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

if ($result_check->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Crédito no encontrado"]);
    http_response_code(404);
    exit();
}

$row = $result_check->fetch_assoc();
if ($row['estado'] === 'desembolsado') {
    echo json_encode(["success" => false, "message" => "El crédito ya ha sido desembolsado"]);
    http_response_code(400);
    exit();
}

// Iniciar una transacción para asegurar integridad de datos
$conn->begin_transaction();

try {
    // 1. Obtener el saldo actual de la cuenta de ahorro (último registro)
    $sql_get_saldo = "SELECT saldo_actual FROM ctaahorro WHERE id = ? ORDER BY fecha_movimiento ASC LIMIT 1";
    $stmt_get_saldo = $conn->prepare($sql_get_saldo);
    $stmt_get_saldo->bind_param("i", $id_cuenta_ahorro);
    $stmt_get_saldo->execute();
    $result_saldo = $stmt_get_saldo->get_result();

    if ($result_saldo->num_rows === 0) {
        throw new Exception("Cuenta de ahorro no encontrada.");
    }

    $row_saldo = $result_saldo->fetch_assoc();
    $saldo_actual = $row_saldo['saldo_actual'];

    // 2. Insertar el movimiento en ctaahorro y actualizar saldo_actual
    $nuevo_saldo = $saldo_actual + $monto_transferencia;
    $sql1 = "INSERT INTO ctaahorro (usuario_id, tipo_movimiento, valor_movimiento, saldo_actual, fecha_movimiento)
             VALUES (?, 'transferencia', ?, ?, NOW())";
    $stmt1 = $conn->prepare($sql1);
    $stmt1->bind_param("idd", $usuario_id, $monto_transferencia, $nuevo_saldo);
    $stmt1->execute();

    // Obtener el último id insertado en ctaahorro
    $ultimo_id_ctaahorro = $conn->insert_id;

    // 3. Actualizar el estado de la solicitud de crédito a "desembolsado"
    $sql2 = "UPDATE solicitudes_credito SET estado = 'desembolsado', saldo_capital = 0 WHERE id = ?";
    $stmt2 = $conn->prepare($sql2);
    $stmt2->bind_param("i", $id_credito);
    $stmt2->execute();

    // Confirmar la transacción si ambas operaciones son exitosas
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Transferencia realizada con éxito",
        "ultimo_id_ctaahorro" => $ultimo_id_ctaahorro
    ]);
} catch (Exception $e) {
    // Revertir la transacción si hay algún error
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Error al realizar la transferencia: " . $e->getMessage()]);
    http_response_code(500);
}

// Cerrar conexiones
$stmt_check->close();
$stmt_get_saldo->close();
$stmt1->close();
$stmt2->close();
$conn->close();
