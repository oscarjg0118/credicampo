<?php
// Permitir acceso desde cualquier origen
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Credenciales de la base de datos
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

// Iniciar una transacción para asegurar integridad de datos
$conn->begin_transaction();

try {
    // 1. Copiar el valor de monto_transferencia a valor_movimiento en ctaahorro y actualizar saldo_actual
    $sql1 = "INSERT INTO ctaahorro (usuario_id, tipo_movimiento, valor_movimiento, saldo_actual, fecha_movimiento)
             VALUES (?, 'transferencia', ?, ?, NOW())";
    $stmt1 = $conn->prepare($sql1);
    $stmt1->bind_param("idd", $usuario_id, $monto_transferencia, $monto_transferencia);
    $stmt1->execute();

    // 2. Actualizar el estado de la solicitud de crédito a "desembolsado"
    $sql2 = "UPDATE solicitudes_credito SET estado = 'desembolsado', saldo_capital = 0 WHERE id = ?";
    $stmt2 = $conn->prepare($sql2);
    $stmt2->bind_param("i", $id_credito);
    $stmt2->execute();

    // Si ambas consultas son exitosas, confirmar la transacción
    $conn->commit();

    echo json_encode(["success" => true, "message" => "Transferencia realizada con éxito"]);
} catch (Exception $e) {
    // Si hay algún error, revertir la transacción
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Error al realizar la transferencia: " . $e->getMessage()]);
    http_response_code(500);
}

// Cerrar conexiones
$stmt1->close();
$stmt2->close();
$conn->close();
