<?php
require_once 'config.php';

if (isset($_SESSION['usuario_id'])) {
    header('Location: index.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        $error = 'Por favor completa todos los campos';
    } else {
        $pdo = getConnection();
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ? AND estado = 1");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch();
        
        if ($usuario && password_verify($password, $usuario['password'])) {
            $_SESSION['usuario_id'] = $usuario['id'];
            $_SESSION['usuario_nombre'] = $usuario['nombre'];
            $_SESSION['usuario_email'] = $usuario['email'];
            $_SESSION['usuario_rol'] = $usuario['rol'];
            header('Location: index.php');
            exit;
        } else {
            $error = 'Credenciales incorrectas';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Sistema Tienda Celulares</title>
    <!-- ✅ CORREGIDO: Usar Tailwind compilado en lugar de CDN -->
    <link href="https://unpkg.com/tailwindcss@3.4.1/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .login-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
            animation: fadeIn 0.5s ease-out;
        }
    </style>
</head>
<body class="login-container">
    <div class="min-h-screen flex items-center justify-center px-4">
        <div class="w-full max-w-md fade-in">
            <div class="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
                <div class="text-center mb-8">
                    <div class="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-mobile-alt text-4xl text-white"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-white">Sistema Tienda</h1>
                    <p class="text-gray-400 mt-2">Inicia sesión para continuar</p>
                </div>
                
                <?php if (isset($error)): ?>
                    <div class="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
                        <i class="fas fa-exclamation-circle mr-2"></i><?= $error ?>
                    </div>
                <?php endif; ?>
                
                <form method="POST" class="space-y-6">
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">
                            <i class="fas fa-envelope mr-2"></i>Email
                        </label>
                        <input type="email" name="email" required 
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="tu@email.com"
                            value="<?= isset($_POST['email']) ? htmlspecialchars($_POST['email']) : '' ?>">
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">
                            <i class="fas fa-lock mr-2"></i>Contraseña
                        </label>
                        <input type="password" name="password" required 
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            placeholder="••••••••">
                    </div>
                    
                    <button type="submit" 
                        class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105">
                        <i class="fas fa-sign-in-alt mr-2"></i>Iniciar Sesión
                    </button>
                </form>
                
                <div class="mt-6 text-center text-sm text-gray-400">
                    <p class="mb-3">Usuarios de prueba:</p>
                    <div class="space-y-2 bg-gray-700 bg-opacity-50 rounded-lg p-4">
                        <p class="text-blue-400"><strong>Admin:</strong> admin@tienda.com / password</p>
                        <p class="text-green-400"><strong>Vendedor:</strong> vendedor@tienda.com / password</p>
                        <p class="text-purple-400"><strong>Técnico:</strong> tecnico@tienda.com / password</p>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 text-center text-gray-500 text-sm">
                <p>&copy; <?= date('Y') ?> TiendaTech. Todos los derechos reservados.</p>
            </div>
        </div>
    </div>
</body>
</html>
