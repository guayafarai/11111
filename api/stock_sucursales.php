<?php
require_once '../config.php';
verificarAuth();
header('Content-Type: application/json');

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// GET - Obtener stock por sucursal
if ($method === 'GET') {
    $sucursal_id = $_GET['sucursal_id'] ?? null;
    $producto_id = $_GET['producto_id'] ?? null;
    
    if ($sucursal_id && $producto_id) {
        // Stock específico de un producto en una sucursal
        $stmt = $pdo->prepare("
            SELECT ss.*, p.nombre as producto_nombre, s.nombre as sucursal_nombre
            FROM stock_sucursales ss
            JOIN productos p ON ss.producto_id = p.id
            JOIN sucursales s ON ss.sucursal_id = s.id
            WHERE ss.sucursal_id = ? AND ss.producto_id = ?
        ");
        $stmt->execute([$sucursal_id, $producto_id]);
        echo json_encode($stmt->fetch());
    } elseif ($sucursal_id) {
        // Todo el stock de una sucursal
        $stmt = $pdo->prepare("
            SELECT ss.*, p.nombre as producto_nombre, p.codigo, p.precio_venta
            FROM stock_sucursales ss
            JOIN productos p ON ss.producto_id = p.id
            WHERE ss.sucursal_id = ?
            ORDER BY p.nombre
        ");
        $stmt->execute([$sucursal_id]);
        echo json_encode($stmt->fetchAll());
    } elseif ($producto_id) {
        // Stock de un producto en todas las sucursales
        $stmt = $pdo->prepare("
            SELECT ss.*, s.nombre as sucursal_nombre, s.codigo as sucursal_codigo
            FROM stock_sucursales ss
            JOIN sucursales s ON ss.sucursal_id = s.id
            WHERE ss.producto_id = ?
            ORDER BY s.nombre
        ");
        $stmt->execute([$producto_id]);
        echo json_encode($stmt->fetchAll());
    } else {
        // Consolidado general
        $stmt = $pdo->query("
            SELECT 
                p.id as producto_id,
                p.nombre as producto_nombre,
                p.codigo,
                SUM(ss.cantidad) as stock_total,
                GROUP_CONCAT(CONCAT(s.nombre, ': ', ss.cantidad) SEPARATOR ' | ') as detalle
            FROM productos p
            LEFT JOIN stock_sucursales ss ON p.id = ss.producto_id
            LEFT JOIN sucursales s ON ss.sucursal_id = s.id
            WHERE p.estado = 1
            GROUP BY p.id
            ORDER BY p.nombre
        ");
        echo json_encode($stmt->fetchAll());
    }
}

// POST - Asignar stock a sucursal
elseif ($method === 'POST') {
    verificarRol(['admin']);
    $data = json_decode(file_get_contents('php://input'), true);
    
    $pdo->beginTransaction();
    
    try {
        // Verificar si ya existe
        $stmt = $pdo->prepare("
            SELECT * FROM stock_sucursales 
            WHERE sucursal_id = ? AND producto_id = ?
        ");
        $stmt->execute([$data['sucursal_id'], $data['producto_id']]);
        $exists = $stmt->fetch();
        
        if ($exists) {
            // Actualizar
            $stmt = $pdo->prepare("
                UPDATE stock_sucursales 
                SET cantidad = cantidad + ?
                WHERE sucursal_id = ? AND producto_id = ?
            ");
            $stmt->execute([
                $data['cantidad'],
                $data['sucursal_id'],
                $data['producto_id']
            ]);
        } else {
            // Insertar
            $stmt = $pdo->prepare("
                INSERT INTO stock_sucursales (sucursal_id, producto_id, cantidad)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([
                $data['sucursal_id'],
                $data['producto_id'],
                $data['cantidad']
            ]);
        }
        
        // Registrar movimiento
        $stmt = $pdo->prepare("
            INSERT INTO movimientos_stock (
                sucursal_id, producto_id, tipo, cantidad, 
                usuario_id, observaciones
            ) VALUES (?, ?, 'entrada', ?, ?, ?)
        ");
        $stmt->execute([
            $data['sucursal_id'],
            $data['producto_id'],
            $data['cantidad'],
            $_SESSION['usuario_id'],
            $data['observaciones'] ?? 'Asignación de stock'
        ]);
        
        $pdo->commit();
        echo json_encode(['success' => true]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// PUT - Actualizar stock (transferencia entre sucursales)
elseif ($method === 'PUT') {
    verificarRol(['admin']);
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($data['tipo'] === 'transferencia') {
        $pdo->beginTransaction();
        
        try {
            // Reducir stock origen
            $stmt = $pdo->prepare("
                UPDATE stock_sucursales 
                SET cantidad = cantidad - ?
                WHERE sucursal_id = ? AND producto_id = ? AND cantidad >= ?
            ");
            $stmt->execute([
                $data['cantidad'],
                $data['sucursal_origen_id'],
                $data['producto_id'],
                $data['cantidad']
            ]);
            
            if ($stmt->rowCount() === 0) {
                throw new Exception('Stock insuficiente en sucursal origen');
            }
            
            // Aumentar stock destino
            $stmt = $pdo->prepare("
                SELECT * FROM stock_sucursales 
                WHERE sucursal_id = ? AND producto_id = ?
            ");
            $stmt->execute([$data['sucursal_destino_id'], $data['producto_id']]);
            
            if ($stmt->fetch()) {
                $stmt = $pdo->prepare("
                    UPDATE stock_sucursales 
                    SET cantidad = cantidad + ?
                    WHERE sucursal_id = ? AND producto_id = ?
                ");
            } else {
                $stmt = $pdo->prepare("
                    INSERT INTO stock_sucursales (sucursal_id, producto_id, cantidad)
                    VALUES (?, ?, ?)
                ");
            }
            
            $stmt->execute([
                $data['cantidad'],
                $data['sucursal_destino_id'],
                $data['producto_id']
            ]);
            
            // Registrar movimientos
            $stmt = $pdo->prepare("
                INSERT INTO movimientos_stock (
                    sucursal_id, producto_id, tipo, cantidad, 
                    sucursal_destino_id, usuario_id, observaciones
                ) VALUES (?, ?, 'salida', ?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['sucursal_origen_id'],
                $data['producto_id'],
                $data['cantidad'],
                $data['sucursal_destino_id'],
                $_SESSION['usuario_id'],
                'Transferencia: ' . ($data['observaciones'] ?? '')
            ]);
            
            $stmt = $pdo->prepare("
                INSERT INTO movimientos_stock (
                    sucursal_id, producto_id, tipo, cantidad, 
                    usuario_id, observaciones
                ) VALUES (?, ?, 'entrada', ?, ?, ?)
            ");
            $stmt->execute([
                $data['sucursal_destino_id'],
                $data['producto_id'],
                $data['cantidad'],
                $_SESSION['usuario_id'],
                'Transferencia desde: ' . $data['sucursal_origen_id']
            ]);
            
            $pdo->commit();
            echo json_encode(['success' => true]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
?>
