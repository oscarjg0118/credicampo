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

// Decodificar los datos JSON
try {
    $data = json_decode($rawData, true);
} catch (Exception $e) {
    error_log('Error al decodificar JSON: ' . $e->getMessage());
    echo json_encode(['message' => 'Error al decodificar los datos JSON']);
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

if (!$nombres || !$apellidos || !$documento || !$direccion || !$ciudad || !$email || !$celular || !$clave) {
    echo json_encode(["message" => "Todos los campos son obligatorios"]);
    http_response_code(400);
    exit();
}

// Verificar si el documento ya está registrado
$sql_documento = "SELECT * FROM usuarios WHERE documento = ?";
$stmt_documento = $conn->prepare($sql_documento);
$stmt_documento->bind_param("s", $documento);
$stmt_documento->execute();
$result_documento = $stmt_documento->get_result();
$stmt_documento->close();

if ($result_documento->num_rows > 0) {
    echo json_encode(["message" => "Documento ya Registrado, por favor Confirmar"]);
    http_response_code(400);
    exit();
}

// Verificar si el correo electrónico ya está registrado
$sql_email = "SELECT * FROM usuarios WHERE email = ?";
$stmt_email = $conn->prepare($sql_email);
$stmt_email->bind_param("s", $email);
$stmt_email->execute();
$result_email = $stmt_email->get_result();
$stmt_email->close();

if ($result_email->num_rows > 0) {
    echo json_encode(["message" => "Correo electrónico ya Registrado, por favor Confirmar"]);
    http_response_code(400);
    exit();
}

// Verificar si el celular ya está registrado
$sql_celular = "SELECT * FROM usuarios WHERE celular = ?";
$stmt_celular = $conn->prepare($sql_celular);
$stmt_celular->bind_param("s", $celular);
$stmt_celular->execute();
$result_celular = $stmt_celular->get_result();
$stmt_celular->close();

if ($result_celular->num_rows > 0) {
    echo json_encode(["message" => "Celular ya Registrado, por favor Confirmar"]);
    http_response_code(400);
    exit();
}

// Encriptar la contraseña
$clave_hashed = password_hash($clave, PASSWORD_DEFAULT);

// Insertar los datos en la base de datos
$sql_insert = "INSERT INTO usuarios (nombres, apellidos, documento, direccion, ciudad, email, celular, clave, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
$stmt_insert = $conn->prepare($sql_insert);
$stmt_insert->bind_param("ssssssss", $nombres, $apellidos, $documento, $direccion, $ciudad, $email, $celular, $clave_hashed);

$response = array();

if ($stmt_insert->execute()) {
    $response['message'] = "Usuario registrado correctamente";
} else {
    $response['message'] = "Error al registrar usuario: " . $stmt_insert->error;
    http_response_code(500);
}

$stmt_insert->close();
$conn->close();

echo json_encode($response);
