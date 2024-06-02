PHP
<?php

class User
{
    private $conn;
    private $table_name = "users"; // Change this to your actual table name

    public $id;
    public $nombre;
    public $apellido;
    public $direccion;
    public $ciudad;
    public $email;
    public $password;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function register()
    {
        $query = "INSERT INTO " . $this->table_name . " SET nombre=:nombre, apellido=:apellido, direccion=:direccion, ciudad=:ciudad, email=:email, password=:password";
        $stmt = $this->conn->prepare($query);

        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->apellido = htmlspecialchars(strip_tags($this->apellido));
        $this->direccion = htmlspecialchars(strip_tags($this->direccion));
        $this->ciudad = htmlspecialchars(strip_tags($this->ciudad));
        $this->email = filter_var($this->email, FILTER_SANITIZE_EMAIL);
        $this->password = password_hash($this->password, PASSWORD_DEFAULT); // Hash password

        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":apellido", $this->apellido);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":ciudad", $this->ciudad);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $this->password);

        if ($stmt->execute()) {
            return true;
        } else {
            echo json_encode(array('message' => 'Error: ' . $stmt->error));
            return false;
        }
    }
}
