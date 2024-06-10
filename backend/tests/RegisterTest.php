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
        // Encode data to JSON format
        $jsonData = json_encode($data);

        // Write JSON data to php://input
        file_put_contents('php://input', $jsonData);
    }

    public function testValidInputData()
    {
        // Simulate valid input data
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

        // Set Content-Type header
        header('Content-Type: application/json');

        // Simulate HTTP POST request
        $this->setInputData($inputData);

        // Verify sent data
        error_log("Input data sent: " . json_encode($inputData));

        // Include file to test
        include '../../backend/api/register.php';

        // Capture output
        $output = ob_get_clean();
        ob_start(); // Restart buffer for next test

        // Check for errors in response
        error_log("Server response: " . $output);

        // Verify expected response
        $responseData = json_decode($output, true);
        $this->assertEquals('Usuario registrado correctamente', $responseData['message']);
    }

    public function testMissingInputData()
    {
        // Simulate missing input data
        $inputData = [
            'nombres' => 'John',
            // Other missing fields
        ];

        // Set Content-Type header
        header('Content-Type: application/json');

        // Simulate HTTP POST request
        $this->setInputData($inputData);

        // Verify sent data
        error_log("Input data sent: " . json_encode($inputData));

        // Include file to test
        include '../../backend/api/register.php';

        // Capture output
        $output = ob_get_clean();
        ob_start(); // Restart buffer for next test

        // Check for errors in response
        error_log("Server response: " . $output);

        // Verify error message
        $responseData = json_decode($output, true);
        $this->assertEquals('Todos los campos son obligatorios', $responseData['message']);
    }
}
