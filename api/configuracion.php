<?php
require_once '../config.php';
verificarAuth();
verificarRol(['admin']);
header('Content-Type: application/json');

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// GET - Obtener configuración
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM configuracion WHERE id = 1");
    $config = $stmt->fetch();
    
    if (!$config) {
        // Crear configuración por defecto
        $stmt = $pdo->prepare("
            INSERT INTO configuracion (
                nombre_empresa, ruc, direccion, telefono, email, 
                moneda, simbolo_moneda, logo_url, color_primario, color_secundario,
                igv_porcentaje, tipo_comprobante_default
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            'Mi Tienda Tech',
            '12345678901',
            'Av. Principal 123',
            '999999999',
            'info@tienda.com',
            'PEN',
            'S/',
            '',
            '#3b82f6',
            '#8b5cf6',
            18,
            'boleta'
        ]);
        $config = $pdo->query("SELECT * FROM configuracion WHERE id = 1")->fetch();
    }
    
    echo json_encode($config);
}

// PUT - Actualizar configuración
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("
        UPDATE configuracion SET 
        nombre_empresa = ?, ruc = ?, direccion = ?, telefono = ?, email = ?,
        moneda = ?, simbolo_moneda = ?, logo_url = ?, 
        color_primario = ?, color_secundario = ?,
        igv_porcentaje = ?, tipo_comprobante_default = ?
        WHERE id = 1
    ");
    
    $stmt->execute([
        $data['nombre_empresa'],
        $data['ruc'],
        $data['direccion'],
        $data['telefono'],
        $data['email'],
        $data['moneda'],
        $data['simbolo_moneda'],
        $data['logo_url'] ?? '',
        $data['color_primario'],
        $data['color_secundario'],
        $data['igv_porcentaje'],
        $data['tipo_comprobante_default']
    ]);
    
    echo json_encode(['success' => true]);
}

// POST - Subir logo
elseif ($method === 'POST' && isset($_FILES['logo'])) {
    $allowed = ['image/jpeg', 'image/png', 'image/gif'];
    $file = $_FILES['logo'];
    
    if (!in_array($file['type'], $allowed)) {
        echo json_encode(['error' => 'Tipo de archivo no permitido']);
        exit;
    }
    
    if ($file['size'] > 2 * 1024 * 1024) { // 2MB
        echo json_encode(['error' => 'El archivo es muy grande (máx 2MB)']);
        exit;
    }
    
    $upload_dir = '../uploads/logos/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'logo_' . time() . '.' . $extension;
    $filepath = $upload_dir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        $logo_url = 'uploads/logos/' . $filename;
        
        // Actualizar en BD
        $stmt = $pdo->prepare("UPDATE configuracion SET logo_url = ? WHERE id = 1");
        $stmt->execute([$logo_url]);
        
        echo json_encode(['success' => true, 'logo_url' => $logo_url]);
    } else {
        echo json_encode(['error' => 'Error al subir el archivo']);
    }
}
?>
