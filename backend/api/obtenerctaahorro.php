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

// Consultar las cuentas de ahorro del usuario
$sql = "SELECT id, usuario_id, tipo_movimiento, valor_movimiento, saldo_actual, fecha_movimiento 
        FROM ctaahorro 
        WHERE usuario_id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Error en la preparación de la consulta: " . $conn->error]);
    http_response_code(500);
    exit();
}
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

// Crear un array para almacenar las cuentas de ahorro
$cuentas = [];

while ($row = $result->fetch_assoc()) {
    $cuentas[] = $row;
}

// Verificar si hay resultados
if (count($cuentas) > 0) {
    // Devolver los resultados en formato JSON
    echo json_encode($cuentas);
} else {
    echo json_encode(["success" => false, "message" => "No se encontraron cuentas de ahorro para este usuario"]);
    http_response_code(404);
}

// Cerrar la conexión
$stmt->close();
$conn->close();
