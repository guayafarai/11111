<?php
require_once '../config.php';
verificarAuth();
header('Content-Type: application/json');

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// GET - Listar ventas
if ($method === 'GET') {
    $fecha_inicio = $_GET['fecha_inicio'] ?? date('Y-m-01');
    $fecha_fin = $_GET['fecha_fin'] ?? date('Y-m-d');
    
    $stmt = $pdo->prepare("
        SELECT v.*, c.nombre as cliente_nombre, u.nombre as vendedor_nombre
        FROM ventas v
        LEFT JOIN clientes c ON v.cliente_id = c.id
        JOIN usuarios u ON v.usuario_id = u.id
        WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        ORDER BY v.id DESC
    ");
    
    $stmt->execute([$fecha_inicio, $fecha_fin]);
    echo json_encode($stmt->fetchAll());
}

// POST - Crear venta
elseif ($method === 'POST') {
    verificarRol(['admin', 'vendedor']);
    $data = json_decode(file_get_contents('php://input'), true);
    
    $pdo->beginTransaction();
    
    try {
        // Insertar venta
        $stmt = $pdo->prepare("
            INSERT INTO ventas (cliente_id, usuario_id, subtotal, descuento, total, metodo_pago)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['cliente_id'] ?? null,
            $_SESSION['usuario_id'],
            $data['subtotal'],
            $data['descuento'] ?? 0,
            $data['total'],
            $data['metodo_pago']
        ]);
        
        $venta_id = $pdo->lastInsertId();
        
        // Insertar detalles y actualizar stock
        foreach ($data['productos'] as $item) {
            $stmt = $pdo->prepare("
                INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
                VALUES (?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $venta_id,
                $item['producto_id'],
                $item['cantidad'],
                $item['precio_unitario'],
                $item['subtotal']
            ]);
            
            // Actualizar stock
            $stmt = $pdo->prepare("UPDATE productos SET stock = stock - ? WHERE id = ?");
            $stmt->execute([$item['cantidad'], $item['producto_id']]);
        }
        
        $pdo->commit();
        echo json_encode(['success' => true, 'venta_id' => $venta_id]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// GET detalles de una venta
elseif ($method === 'GET' && isset($_GET['id'])) {
    $stmt = $pdo->prepare("
        SELECT dv.*, p.nombre as producto_nombre
        FROM detalle_ventas dv
        JOIN productos p ON dv.producto_id = p.id
        WHERE dv.venta_id = ?
    ");
    
    $stmt->execute([$_GET['id']]);
    echo json_encode($stmt->fetchAll());
}
?>