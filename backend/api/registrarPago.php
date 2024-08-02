<?php
header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Métodos permitidos
header("Access-Control-Allow-Headers: Content-Type"); // Encabezados permitidos

// Recibir y decodificar los datos JSON
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Verificar que se están recibiendo los datos correctamente
if (is_null($data)) {
    echo json_encode(["error" => "No se recibieron datos válidos"]);
    exit;
}

// Extraer los datos recibidos
$solicitud_id = $data['solicitud_id'];
$valor_transaccion = $data['valor_transaccion'];
$abono_capital = $data['abono_capital'];
$abono_intereses = $data['abono_intereses'];
$saldo_capital = $data['saldo_capital'];
$saldo_intereses = $data['saldo_intereses'];
$fecha = date("Y-m-d H:i:s");

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

$stmt = $conn->prepare("INSERT INTO creditos (solicitud_id, fecha, valor_transaccion, abono_capital, abono_intereses, saldo_capital, saldo_intereses) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("isddddd", $solicitud_id, $fecha, $valor_transaccion, $abono_capital, $abono_intereses, $saldo_capital, $saldo_intereses);

if ($stmt->execute()) {
    echo json_encode(["message" => "Pago registrado exitosamente."]);
} else {
    echo json_encode(["error" => "Error al registrar el pago: " . $stmt->error]);
}

$stmt->close();
$conn->close();
