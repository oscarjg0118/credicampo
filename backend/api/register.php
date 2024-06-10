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

// Log para verificar los datos crudos recibidos
error_log("Raw data received: " . $rawData);
error_log("Raw data length: " . strlen($rawData));
error_log("Content-Type header: " . $_SERVER['CONTENT_TYPE']);
error_log("Request method: " . $_SERVER['REQUEST_METHOD']);

// Decodificar los datos JSON
try {
    $data = json_decode($rawData, true);
} catch (Exception $e) {
    error_log('Error al decodificar JSON: ' . $e->getMessage());
    echo json_encode(['message' => 'Error al decodificar los datos JSON']);
    http_response_code(400);
    exit();
}

// Log para verificar los datos decodificados
error_log(print_r($data, true));

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["message" => "Error en el formato de los datos JSON"]);
    http_response_code(400);
    exit();
}

// Validar los datos
$nombres = $data['nombres'] ?? null;
$apellidos = $data['apellidos'] ?? null;
$documento = $data['documento'] ?? null;
$direccion = $data['direccion'] ?? null;
$ciudad = $data['ciudad'] ?? null;
$email = $data['email'] ?? null;
$celular = $data['celular'] ?? null;
$clave = $data['clave'] ?? null;

error_log("Antes de la validación de datos:");
error_log("Nombres: " . ($nombres ?? 'NULL'));
error_log("Apellidos: " . ($apellidos ?? 'NULL'));
error_log("Documento: " . ($documento ?? 'NULL'));
error_log("Dirección: " . ($direccion ?? 'NULL'));
error_log("Ciudad: " . ($ciudad ?? 'NULL'));
error_log("Email: " . ($email ?? 'NULL'));
error_log("Celular: " . ($celular ?? 'NULL'));
error_log("Clave: " . ($clave ?? 'NULL'));

if (!$nombres || !$apellidos || !$documento || !$direccion || !$ciudad || !$email || !$celular || !$clave) {
    echo json_encode(["message" => "Todos los campos son obligatorios"]);
    http_response_code(400);
    exit();
}

error_log("Después de la validación de datos:");
error_log("Nombres: " . ($nombres ?? 'NULL'));
error_log("Apellidos: " . ($apellidos ?? 'NULL'));
error_log("Documento: " . ($documento ?? 'NULL'));
error_log("Dirección: " . ($direccion ?? 'NULL'));
error_log("Ciudad: " . ($ciudad ?? 'NULL'));
error_log("Email: " . ($email ?? 'NULL'));
error_log("Celular: " . ($celular ?? 'NULL'));
error_log("Clave: " . ($clave ?? 'NULL'));

// Encriptar la contraseña
$clave_hashed = password_hash($clave, PASSWORD_DEFAULT);

// Insertar los datos en la base de datos
$sql = "INSERT INTO usuarios (nombres, apellidos, documento, direccion, ciudad, email, celular, clave, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssss", $nombres, $apellidos, $documento, $direccion, $ciudad, $email, $celular, $clave_hashed);

$response = array();

if ($stmt->execute()) {
    $response['message'] = "Usuario registrado correctamente";
} else {
    $response['message'] = "Error al registrar usuario: " . $stmt->error;
    http_response_code(500);
}

$stmt->close();
$conn->close();

echo json_encode($response);
