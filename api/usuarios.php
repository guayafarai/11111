<?php
require_once '../config.php';
verificarAuth();
verificarRol(['admin']);
header('Content-Type: application/json');

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, nombre, email, rol, estado, created_at FROM usuarios ORDER BY nombre");
    echo json_encode($stmt->fetchAll());
}

elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data['nombre'], $data['email'], $password_hash, $data['rol']]);
    
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
}

elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!empty($data['password'])) {
        $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE usuarios SET nombre = ?, email = ?, password = ?, rol = ?, estado = ? WHERE id = ?");
        $stmt->execute([$data['nombre'], $data['email'], $password_hash, $data['rol'], $data['estado'], $data['id']]);
    } else {
        $stmt = $pdo->prepare("UPDATE usuarios SET nombre = ?, email = ?, rol = ?, estado = ? WHERE id = ?");
        $stmt->execute([$data['nombre'], $data['email'], $data['rol'], $data['estado'], $data['id']]);
    }
    
    echo json_encode(['success' => true]);
}

elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    
    if ($id == $_SESSION['usuario_id']) {
        echo json_encode(['error' => 'No puedes eliminar tu propio usuario']);
        exit;
    }
    
    $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true]);
}
?>