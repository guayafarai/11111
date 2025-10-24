<?php
require_once '../config.php';
verificarAuth();
header('Content-Type: application/json');

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// GET - Obtener historial de movimientos
if ($method === 'GET') {
    $sucursal_id = $_GET['sucursal_id'] ?? null;
    $producto_id = $_GET['producto_id'] ?? null;
    $fecha_inicio = $_GET['fecha_inicio'] ?? date('Y-m-01');
    $fecha_fin = $_GET['fecha_fin'] ?? date('Y-m-d');
    
    $sql = "
        SELECT 
            ms.*,
            s.nombre as sucursal_nombre,
            p.nombre as producto_nombre,
            p.codigo as producto_codigo,
            u.nombre as usuario_nombre,
            sd.nombre as sucursal_destino_nombre
        FROM movimientos_stock ms
        JOIN sucursales s ON ms.sucursal_id = s.id
        JOIN productos p ON ms.producto_id = p.id
        JOIN usuarios u ON ms.usuario_id = u.id
        LEFT JOIN sucursales sd ON ms.sucursal_destino_id = sd.id
        WHERE DATE(ms.fecha) BETWEEN ? AND ?
    ";
    
    $params = [$fecha_inicio, $fecha_fin];
    
    if ($sucursal_id) {
        $sql .= " AND (ms.sucursal_id = ? OR ms.sucursal_destino_id = ?)";
        $params[] = $sucursal_id;
        $params[] = $sucursal_id;
    }
    
    if ($producto_id) {
        $sql .= " AND ms.producto_id = ?";
        $params[] = $producto_id;
    }
    
    $sql .= " ORDER BY ms.fecha DESC LIMIT 100";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    echo json_encode($stmt->fetchAll());
}
?>
