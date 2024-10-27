<?php
// Archivo: db_connection.php

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
