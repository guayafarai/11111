<?php
require_once '../config.php';
verificarAuth();
header('Content-Type: application/json');

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM proveedores ORDER BY nombre");
    echo json_encode($stmt->fetchAll());
}

elseif ($method === 'POST') {
    verificarRol(['admin']);
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$data['nombre'], $data['contacto'] ?? '', $data['telefono'] ?? '', $data['email'] ?? '', $data['direccion'] ?? '']);
    
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
}

elseif ($method === 'PUT') {
    verificarRol(['admin']);
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("UPDATE proveedores SET nombre = ?, contacto = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?");
    $stmt->execute([$data['nombre'], $data['contacto'], $data['telefono'], $data['email'], $data['direccion'], $data['id']]);
    
    echo json_encode(['success' => true]);
}

elseif ($method === 'DELETE') {
    verificarRol(['admin']);
    $id = $_GET['id'] ?? 0;
    
    $stmt = $pdo->prepare("DELETE FROM proveedores WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true]);
}
?>