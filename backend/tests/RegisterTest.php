<?php

use PHPUnit\Framework\TestCase;

class RegisterTest extends TestCase
{
    protected function setUp(): void
    {
        // Iniciar el almacenamiento de salida
        ob_start();
    }

    protected function tearDown(): void
    {
        // Limpiar el almacenamiento de salida
        ob_end_clean();
    }

    private function setInputData(array $data)
    {
        // Simular el contenido de php://input
        $jsonData = json_encode($data);

        // Crear un stream temporal para php://input
        $stream = fopen('php://memory', 'r+');
        fwrite($stream, $jsonData);
        rewind($stream);

        // Reemplazar php://input con nuestro stream temporal
        global $php_input;
        $php_input = $stream;

        // Ajustar las variables globales del servidor para simular la solicitud
        $_SERVER['CONTENT_TYPE'] = 'application/json';
        $_SERVER['REQUEST_METHOD'] = 'POST';
    }

    public function testValidInputData()
    {
        // Simulamos datos de entrada válidos
        $inputData = [
            'nombres' => 'John',
            'apellidos' => 'Doe',
            'documento' => '123456789',
            'direccion' => '123 Main St',
            'ciudad' => 'New York',
            'email' => 'john@example.com',
            'celular' => '1234567890',
            'clave' => 'password123',
        ];

        // Simulamos la solicitud HTTP POST
        $this->setInputData($inputData);

        // Verificar los datos que se están enviando
        error_log("Input data sent: " . json_encode($inputData));

        // Incluir el archivo a probar
        include '../../backend/api/register.php';

        // Capturar la salida
        $output = ob_get_clean();

        // Verificar si hay errores en la respuesta
        error_log("Server response: " . $output);

        // Verificamos que la respuesta sea la esperada
        $responseData = json_decode($output, true);
        $this->assertEquals('Usuario registrado correctamente', $responseData['message']);
    }

    public function testMissingInputData()
    {
        // Simulamos datos de entrada faltantes
        $inputData = [
            'nombres' => 'John',
            // Otros campos faltantes
        ];

        // Simulamos la solicitud HTTP POST
        $this->setInputData($inputData);

        // Verificar los datos que se están enviando
        error_log("Input data sent: " . json_encode($inputData));

        // Incluir el archivo a probar
        include '../../backend/api/register.php';

        // Capturar la salida
        $output = ob_get_clean();

        // Verificar si hay errores en la respuesta
        error_log("Server response: " . $output);

        // Verificamos que se devuelva un mensaje de error
        $responseData = json_decode($output, true);
        $this->assertEquals('Todos los campos son obligatorios', $responseData['message']);
    }
}
