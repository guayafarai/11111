<?php
require_once '../config.php';
verificarAuth();
header('Content-Type: application/json');

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $search = $_GET['search'] ?? '';
    
    $sql = "SELECT * FROM clientes";
    if ($search) {
        $sql .= " WHERE nombre LIKE ? OR telefono LIKE ?";
    }
    $sql .= " ORDER BY nombre";
    
    $stmt = $pdo->prepare($sql);
    $search ? $stmt->execute(["%$search%", "%$search%"]) : $stmt->execute();
    
    echo json_encode($stmt->fetchAll());
}

elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("INSERT INTO clientes (nombre, telefono, email, direccion) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data['nombre'], $data['telefono'] ?? '', $data['email'] ?? '', $data['direccion'] ?? '']);
    
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
}

elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("UPDATE clientes SET nombre = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?");
    $stmt->execute([$data['nombre'], $data['telefono'], $data['email'], $data['direccion'], $data['id']]);
    
    echo json_encode(['success' => true]);
}

elseif ($method === 'DELETE') {
    verificarRol(['admin']);
    $id = $_GET['id'] ?? 0;
    
    $stmt = $pdo->prepare("DELETE FROM clientes WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true]);
}
?>