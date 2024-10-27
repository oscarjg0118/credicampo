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
    echo json_encode(["message" => "Fallo en la conexión: " . $conn->connect_error]);
    http_response_code(500);
    exit();
}

// Obtener el ID del usuario de la solicitud GET
$userId = $_GET['userId'] ?? null;

// Validar que userId es proporcionado y que es un número válido
if (!$userId || !filter_var($userId, FILTER_VALIDATE_INT)) {
    echo json_encode(["success" => false, "message" => "userId es requerido y debe ser un número entero válido"]);
    http_response_code(400);
    exit();
}

// Consultar la cuenta de ahorro más reciente del usuario
$sql = "SELECT id, usuario_id, tipo_movimiento, valor_movimiento, saldo_actual, fecha_movimiento
        FROM ctaahorro
        WHERE usuario_id = ?
        ORDER BY fecha_movimiento DESC
        LIMIT 1";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Error en la preparación de la consulta: " . $conn->error]);
    http_response_code(500);
    exit();
}
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

// Verificar si hay resultados
if ($result->num_rows > 0) {
    // Devolver el resultado en formato JSON
    $cuenta = $result->fetch_assoc();
    echo json_encode($cuenta);
} else {
    echo json_encode(["success" => false, "message" => "No se encontraron cuentas de ahorro para este usuario"]);
    http_response_code(404);
}

// Cerrar la conexión
$stmt->close();
$conn->close();
