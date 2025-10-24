<?php
require_once '../config.php';
verificarAuth();
header('Content-Type: application/json');

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// GET - Listar productos
if ($method === 'GET') {
    $search = $_GET['search'] ?? '';
    $tipo = $_GET['tipo'] ?? '';
    
    $sql = "SELECT p.*, pr.nombre as proveedor_nombre 
            FROM productos p 
            LEFT JOIN proveedores pr ON p.proveedor_id = pr.id 
            WHERE p.estado = 1";
    
    if ($search) {
        $sql .= " AND (p.nombre LIKE ? OR p.codigo LIKE ?)";
    }
    if ($tipo) {
        $sql .= " AND p.tipo = ?";
    }
    
    $sql .= " ORDER BY p.id DESC";
    
    $stmt = $pdo->prepare($sql);
    
    if ($search && $tipo) {
        $stmt->execute(["%$search%", "%$search%", $tipo]);
    } elseif ($search) {
        $stmt->execute(["%$search%", "%$search%"]);
    } elseif ($tipo) {
        $stmt->execute([$tipo]);
    } else {
        $stmt->execute();
    }
    
    echo json_encode($stmt->fetchAll());
}

// POST - Crear producto
elseif ($method === 'POST') {
    verificarRol(['admin', 'vendedor']);
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("
        INSERT INTO productos (codigo, nombre, descripcion, tipo, precio_compra, precio_venta, stock, stock_minimo, proveedor_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $data['codigo'],
        $data['nombre'],
        $data['descripcion'] ?? '',
        $data['tipo'],
        $data['precio_compra'],
        $data['precio_venta'],
        $data['stock'] ?? 0,
        $data['stock_minimo'] ?? 5,
        $data['proveedor_id'] ?? null
    ]);
    
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
}

// PUT - Actualizar producto
elseif ($method === 'PUT') {
    verificarRol(['admin', 'vendedor']);
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("
        UPDATE productos SET 
        nombre = ?, descripcion = ?, tipo = ?, precio_compra = ?, precio_venta = ?, 
        stock = ?, stock_minimo = ?, proveedor_id = ?
        WHERE id = ?
    ");
    
    $stmt->execute([
        $data['nombre'],
        $data['descripcion'],
        $data['tipo'],
        $data['precio_compra'],
        $data['precio_venta'],
        $data['stock'],
        $data['stock_minimo'],
        $data['proveedor_id'] ?? null,
        $data['id']
    ]);
    
    echo json_encode(['success' => true]);
}

// DELETE - Eliminar producto (lógico)
elseif ($method === 'DELETE') {
    verificarRol(['admin']);
    $id = $_GET['id'] ?? 0;
    
    $stmt = $pdo->prepare("UPDATE productos SET estado = 0 WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true]);
}
?>