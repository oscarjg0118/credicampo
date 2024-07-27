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

$monto = $data['monto'] ?? null;
$ingreso = $data['ingreso'] ?? null;
$plazo = $data['plazo'] ?? null;
$interesMensual = $data['interesMensual'] ?? null; // Obtener el interés mensual
$cuotaMensual = $data['cuota'] ?? null; // Asegurarse de obtener el valor correcto

if (!$monto || !$ingreso || !$plazo || !$interesMensual || !$cuotaMensual) {
    echo json_encode(["message" => "Todos los campos son obligatorios"]);
    http_response_code(400);
    exit();
}

// Insertar los datos en la tabla solicitudes_credito
$sql_insert = "INSERT INTO solicitudes_credito (monto, ingreso, plazo, interes_mensual, cuota_mensual) 
               VALUES (?, ?, ?, ?, ?)";

$stmt_insert = $conn->prepare($sql_insert);

// Verifica si la preparación de la sentencia fue exitosa
if ($stmt_insert === false) {
    echo json_encode(["message" => "Error en la preparación de la consulta: " . $conn->error]);
    http_response_code(500);
    exit();
}

// Ajustar la cadena de tipos de acuerdo a los parámetros: ddidd
$stmt_insert->bind_param("ddidd", $monto, $ingreso, $plazo, $interesMensual, $cuotaMensual);

$response = array();

if ($stmt_insert->execute()) {
    $response['message'] = "Solicitud de crédito registrada correctamente. Cuota mensual: $cuotaMensual";
} else {
    $response['message'] = "Error al registrar la solicitud de crédito: " . $stmt_insert->error;
    http_response_code(500);
}

$stmt_insert->close();
$conn->close();

echo json_encode($response);
