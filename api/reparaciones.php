<?php
require_once '../config.php';
verificarAuth();
header('Content-Type: application/json');

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// GET - Listar reparaciones
if ($method === 'GET') {
    $estado = $_GET['estado'] ?? '';
    
    $sql = "SELECT r.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono, u.nombre as tecnico_nombre
            FROM reparaciones r
            JOIN clientes c ON r.cliente_id = c.id
            JOIN usuarios u ON r.usuario_id = u.id";
    
    if ($estado) {
        $sql .= " WHERE r.estado = ?";
    }
    
    $sql .= " ORDER BY r.id DESC";
    
    $stmt = $pdo->prepare($sql);
    $estado ? $stmt->execute([$estado]) : $stmt->execute();
    
    echo json_encode($stmt->fetchAll());
}

// POST - Crear reparación
elseif ($method === 'POST') {
    verificarRol(['admin', 'tecnico']);
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("
        INSERT INTO reparaciones (cliente_id, usuario_id, equipo, imei, problema, diagnostico, costo, abono, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $data['cliente_id'],
        $_SESSION['usuario_id'],
        $data['equipo'],
        $data['imei'] ?? '',
        $data['problema'],
        $data['diagnostico'] ?? '',
        $data['costo'],
        $data['abono'] ?? 0,
        $data['estado'] ?? 'pendiente'
    ]);
    
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
}

// PUT - Actualizar reparación
elseif ($method === 'PUT') {
    verificarRol(['admin', 'tecnico']);
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("
        UPDATE reparaciones SET 
        equipo = ?, imei = ?, problema = ?, diagnostico = ?, costo = ?, abono = ?, estado = ?, fecha_entrega = ?
        WHERE id = ?
    ");
    
    $fecha_entrega = ($data['estado'] === 'entregado' && empty($data['fecha_entrega'])) ? date('Y-m-d H:i:s') : $data['fecha_entrega'];
    
    $stmt->execute([
        $data['equipo'],
        $data['imei'],
        $data['problema'],
        $data['diagnostico'],
        $data['costo'],
        $data['abono'],
        $data['estado'],
        $fecha_entrega,
        $data['id']
    ]);
    
    echo json_encode(['success' => true]);
}

// DELETE - Eliminar reparación
elseif ($method === 'DELETE') {
    verificarRol(['admin']);
    $id = $_GET['id'] ?? 0;
    
    $stmt = $pdo->prepare("DELETE FROM reparaciones WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true]);
}
?>