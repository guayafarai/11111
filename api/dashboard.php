<?php
require_once '../config.php';
verificarAuth();
header('Content-Type: application/json');

$pdo = getConnection();

// Estadísticas por sucursal si se especifica
$sucursal_id = $_GET['sucursal_id'] ?? null;

$stats = [];

if ($sucursal_id) {
    // Estadísticas de una sucursal específica
    
    // Total ventas hoy
    $stmt = $pdo->prepare("
        SELECT COALESCE(SUM(total), 0) as total 
        FROM ventas 
        WHERE DATE(fecha_venta) = CURDATE() AND sucursal_id = ?
    ");
    $stmt->execute([$sucursal_id]);
    $stats['ventas_hoy'] = $stmt->fetch()['total'];
    
    // Total ventas mes
    $stmt = $pdo->prepare("
        SELECT COALESCE(SUM(total), 0) as total 
        FROM ventas 
        WHERE MONTH(fecha_venta) = MONTH(CURDATE()) 
        AND YEAR(fecha_venta) = YEAR(CURDATE())
        AND sucursal_id = ?
    ");
    $stmt->execute([$sucursal_id]);
    $stats['ventas_mes'] = $stmt->fetch()['total'];
    
    // Productos con stock bajo
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total 
        FROM stock_sucursales ss
        JOIN productos p ON ss.producto_id = p.id
        WHERE ss.sucursal_id = ? AND ss.cantidad <= p.stock_minimo
    ");
    $stmt->execute([$sucursal_id]);
    $stats['stock_bajo'] = $stmt->fetch()['total'];
    
    // Total productos
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total 
        FROM stock_sucursales 
        WHERE sucursal_id = ?
    ");
    $stmt->execute([$sucursal_id]);
    $stats['total_productos'] = $stmt->fetch()['total'];
    
    // Productos más vendidos de esta sucursal
    $stmt = $pdo->prepare("
        SELECT p.nombre, SUM(dv.cantidad) as cantidad
        FROM detalle_ventas dv
        JOIN productos p ON dv.producto_id = p.id
        JOIN ventas v ON dv.venta_id = v.id
        WHERE v.sucursal_id = ? AND v.fecha_venta >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY p.id
        ORDER BY cantidad DESC
        LIMIT 5
    ");
    $stmt->execute([$sucursal_id]);
    $stats['productos_top'] = $stmt->fetchAll();
    
} else {
    // Estadísticas generales (todas las sucursales)
    
    // Ventas por sucursal (mes actual)
    $stmt = $pdo->query("
        SELECT s.nombre, COALESCE(SUM(v.total), 0) as total
        FROM sucursales s
        LEFT JOIN ventas v ON s.id = v.sucursal_id 
            AND MONTH(v.fecha_venta) = MONTH(CURDATE()) 
            AND YEAR(v.fecha_venta) = YEAR(CURDATE())
        WHERE s.estado = 1
        GROUP BY s.id
        ORDER BY total DESC
    ");
    $stats['ventas_por_sucursal'] = $stmt->fetchAll();
    
    // Stock total por sucursal
    $stmt = $pdo->query("
        SELECT s.nombre, s.codigo, COUNT(DISTINCT ss.producto_id) as productos, 
               SUM(ss.cantidad) as stock_total
        FROM sucursales s
        LEFT JOIN stock_sucursales ss ON s.id = ss.sucursal_id
        WHERE s.estado = 1
        GROUP BY s.id
        ORDER BY s.nombre
    ");
    $stats['stock_por_sucursal'] = $stmt->fetchAll();
    
    // Productos con stock crítico por sucursal
    $stmt = $pdo->query("
        SELECT s.nombre as sucursal, p.nombre as producto, ss.cantidad, p.stock_minimo
        FROM stock_sucursales ss
        JOIN sucursales s ON ss.sucursal_id = s.id
        JOIN productos p ON ss.producto_id = p.id
        WHERE ss.cantidad <= p.stock_minimo AND s.estado = 1
        ORDER BY ss.cantidad ASC
        LIMIT 10
    ");
    $stats['stock_critico'] = $stmt->fetchAll();
    
    // Últimas transferencias
    $stmt = $pdo->query("
        SELECT 
            ms.fecha,
            s1.nombre as origen,
            s2.nombre as destino,
            p.nombre as producto,
            ms.cantidad,
            u.nombre as usuario
        FROM movimientos_stock ms
        JOIN sucursales s1 ON ms.sucursal_id = s1.id
        JOIN productos p ON ms.producto_id = p.id
        JOIN usuarios u ON ms.usuario_id = u.id
        LEFT JOIN sucursales s2 ON ms.sucursal_destino_id = s2.id
        WHERE ms.tipo = 'salida' AND ms.sucursal_destino_id IS NOT NULL
        ORDER BY ms.fecha DESC
        LIMIT 10
    ");
    $stats['ultimas_transferencias'] = $stmt->fetchAll();
}

echo json_encode($stats);
?>
