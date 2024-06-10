<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Datos de conexión a la base de datos
$servername = "localhost:3307";
$username = "root";
$password = "123456";
$dbname = "credicampo1";

// Crear la conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    echo json_encode(["message" => "Connection failed: " . $conn->connect_error]);
    http_response_code(500);
    exit();
}

// Obtener los datos de la solicitud
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

$email = $data['email'] ?? null;
$clave = $data['clave'] ?? null;

if (!$email || !$clave) {
    echo json_encode(["success" => false, "message" => "Email y clave son requeridos"]);
    http_response_code(400);
    exit();
}

// Consulta para verificar las credenciales en la base de datos
$sql = "SELECT * FROM usuarios WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Usuario encontrado, verificar la contraseña
    $row = $result->fetch_assoc();
    if (password_verify($clave, $row['clave'])) {
        // Contraseña válida, iniciar sesión
        echo json_encode(["success" => true]);
    } else {
        // Contraseña incorrecta
        echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
    }
} else {
    // Usuario no encontrado
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
}

$stmt->close();
$conn->close();
