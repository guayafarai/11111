<?php
session_start();

// Configuración de base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'chamotvs_sysnew');
define('DB_USER', 'chamotvs_newsys');
define('DB_PASS', 'Guayaba123!!@@');

// Conexión a base de datos
function getConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch(PDOException $e) {
        die(json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]));
    }
}

// Verificar autenticación
function verificarAuth() {
    if (!isset($_SESSION['usuario_id'])) {
        header('Location: login.php');
        exit;
    }
}

// Verificar rol
function verificarRol($rolesPermitidos) {
    if (!in_array($_SESSION['usuario_rol'], $rolesPermitidos)) {
        http_response_code(403);
        die(json_encode(['error' => 'No tienes permisos para esta acción']));
    }
}

// Respuesta JSON
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
?>