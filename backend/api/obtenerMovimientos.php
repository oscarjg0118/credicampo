<?php
// Permitir el acceso desde cualquier origen (restringir esto en producción a los orígenes permitidos)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

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

// Obtener el ID del usuario de la solicitud GET
$usuario_id = $_GET['usuario_id'] ?? null;

// Verificar que el parámetro usuario_id esté presente y sea un número entero válido
if (is_null($usuario_id) || !filter_var($usuario_id, FILTER_VALIDATE_INT)) {
    echo json_encode([
        "success" => false,
        "message" => "userId es requerido y debe ser un número entero válido"
    ]);
    http_response_code(400);
    exit();
}

$sql_movimientos = "SELECT id, usuario_id, tipo_movimiento, valor_movimiento, saldo_actual, fecha_movimiento
                    FROM ctaahorro
                    WHERE usuario_id = ?  
                    ORDER BY fecha_movimiento DESC";
$stmt_movimientos = $conn->prepare($sql_movimientos);
if (!$stmt_movimientos) {
    echo json_encode(["success" => false, "message" => "Error en la preparación de la consulta: " . $conn->error]);
    http_response_code(500);
    exit();
}
$stmt_movimientos->bind_param("i", $usuario_id);
$stmt_movimientos->execute();
$result_movimientos = $stmt_movimientos->get_result();

// Verificar si hay resultados y convertirlos a un arreglo JSON
$movimientos = [];
while ($row = $result_movimientos->fetch_assoc()) {
    $movimientos[] = $row;
}

// Consultar el saldo actual del usuario (último saldo registrado o cálculo en base a los movimientos)
$sql_saldo = "SELECT saldo_actual FROM ctaahorro
              WHERE usuario_id = ?
              ORDER BY fecha_movimiento DESC LIMIT 1";
$stmt_saldo = $conn->prepare($sql_saldo);
if (!$stmt_saldo) {
    echo json_encode(["success" => false, "message" => "Error al consultar el saldo: " . $conn->error]);
    http_response_code(500);
    exit();
}
$stmt_saldo->bind_param("i", $usuario_id);
$stmt_saldo->execute();
$result_saldo = $stmt_saldo->get_result();
$saldo_actual = $result_saldo->fetch_assoc()['saldo_actual'] ?? 0;

// Preparar la respuesta
$response = [
    "success" => true,
    "saldo" => $saldo_actual,
    "movimientos" => $movimientos
];

// Devolver la respuesta en formato JSON
echo json_encode($response);

// Cerrar las conexiones
$stmt_movimientos->close();
$stmt_saldo->close();
$conn->close();
