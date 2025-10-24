<?php
require_once '../config.php';
verificarAuth();
header('Content-Type: application/json');

$pdo = getConnection();

// Estadísticas generales
$stats = [];

// Total ventas hoy
$stmt = $pdo->query("SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE DATE(fecha_venta) = CURDATE()");
$stats['ventas_hoy'] = $stmt->fetch()['total'];

// Total ventas mes
$stmt = $pdo->query("SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE MONTH(fecha_venta) = MONTH(CURDATE()) AND YEAR(fecha_venta) = YEAR(CURDATE())");
$stats['ventas_mes'] = $stmt->fetch()['total'];

// Productos con stock bajo
$stmt = $pdo->query("SELECT COUNT(*) as total FROM productos WHERE stock <= stock_minimo AND estado = 1");
$stats['stock_bajo'] = $stmt->fetch()['total'];

// Reparaciones pendientes
$stmt = $pdo->query("SELECT COUNT(*) as total FROM reparaciones WHERE estado IN ('pendiente', 'en_proceso')");
$stats['reparaciones_pendientes'] = $stmt->fetch()['total'];

// Ventas por mes (últimos 6 meses)
$stmt = $pdo->query("
    SELECT DATE_FORMAT(fecha_venta, '%Y-%m') as mes, SUM(total) as total
    FROM ventas
    WHERE fecha_venta >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(fecha_venta, '%Y-%m')
    ORDER BY mes
");
$stats['ventas_mensuales'] = $stmt->fetchAll();

// Productos más vendidos
$stmt = $pdo->query("
    SELECT p.nombre, SUM(dv.cantidad) as cantidad
    FROM detalle_ventas dv
    JOIN productos p ON dv.producto_id = p.id
    JOIN ventas v ON dv.venta_id = v.id
    WHERE v.fecha_venta >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY p.id
    ORDER BY cantidad DESC
    LIMIT 5
");
$stats['productos_top'] = $stmt->fetchAll();

echo json_encode($stats);
?>