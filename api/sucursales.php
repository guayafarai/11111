<?php
require_once '../config.php';
verificarAuth();
header('Content-Type: application/json');

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// GET - Listar sucursales
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM sucursales WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode($stmt->fetch());
    } else {
        $stmt = $pdo->query("SELECT * FROM sucursales ORDER BY nombre");
        echo json_encode($stmt->fetchAll());
    }
}

// POST - Crear sucursal
elseif ($method === 'POST') {
    verificarRol(['admin']);
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("
        INSERT INTO sucursales (codigo, nombre, direccion, telefono, email, encargado, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $data['codigo'],
        $data['nombre'],
        $data['direccion'],
        $data['telefono'] ?? '',
        $data['email'] ?? '',
        $data['encargado'] ?? '',
        $data['estado'] ?? 1
    ]);
    
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
}

// PUT - Actualizar sucursal
elseif ($method === 'PUT') {
    verificarRol(['admin']);
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("
        UPDATE sucursales SET 
        codigo = ?, nombre = ?, direccion = ?, telefono = ?, 
        email = ?, encargado = ?, estado = ?
        WHERE id = ?
    ");
    
    $stmt->execute([
        $data['codigo'],
        $data['nombre'],
        $data['direccion'],
        $data['telefono'],
        $data['email'],
        $data['encargado'],
        $data['estado'],
        $data['id']
    ]);
    
    echo json_encode(['success' => true]);
}

// DELETE - Eliminar sucursal
elseif ($method === 'DELETE') {
    verificarRol(['admin']);
    $id = $_GET['id'] ?? 0;
    
    // Verificar si tiene stock
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM stock_sucursales WHERE sucursal_id = ?");
    $stmt->execute([$id]);
    $result = $stmt->fetch();
    
    if ($result['total'] > 0) {
        echo json_encode(['error' => 'No se puede eliminar una sucursal con stock asignado']);
        exit;
    }
    
    $stmt = $pdo->prepare("DELETE FROM sucursales WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true]);
}
?>
