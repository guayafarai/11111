<?php
require_once 'config.php';
verificarAuth();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema Tienda Celulares</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        .sidebar { transition: transform 0.3s ease; }
        @media (max-width: 768px) {
            .sidebar { transform: translateX(-100%); position: fixed; z-index: 50; }
            .sidebar.open { transform: translateX(0); }
        }
        .modal { display: none; }
        .modal.active { display: flex; }
    </style>
</head>
<body class="bg-gray-900 text-gray-100">
    
    <!-- Sidebar -->
    <aside id="sidebar" class="sidebar fixed left-0 top-0 h-screen w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div class="p-6 border-b border-gray-700">
            <h1 class="text-2xl font-bold text-blue-400"><i class="fas fa-mobile-alt mr-2"></i>TiendaTech</h1>
        </div>
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
            <a href="#" data-section="dashboard" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white">
                <i class="fas fa-home"></i><span>Dashboard</span>
            </a>
            <a href="#" data-section="productos" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition">
                <i class="fas fa-box"></i><span>Productos</span>
            </a>
            <a href="#" data-section="ventas" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition">
                <i class="fas fa-shopping-cart"></i><span>Ventas</span>
            </a>
            <a href="#" data-section="reparaciones" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition">
                <i class="fas fa-tools"></i><span>Reparaciones</span>
            </a>
            <a href="#" data-section="clientes" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition">
                <i class="fas fa-users"></i><span>Clientes</span>
            </a>
            <a href="#" data-section="proveedores" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition">
                <i class="fas fa-truck"></i><span>Proveedores</span>
            </a>
            
            <!-- Nuevas secciones -->
            <?php if ($_SESSION['usuario_rol'] === 'admin'): ?>
            <div class="border-t border-gray-700 my-2"></div>
            <p class="px-4 py-2 text-xs text-gray-400 uppercase font-semibold">Administración</p>
            
            <a href="#" data-section="sucursales" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition">
                <i class="fas fa-store"></i><span>Sucursales</span>
            </a>
            <a href="#" data-section="usuarios" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition">
                <i class="fas fa-user-shield"></i><span>Usuarios</span>
            </a>
            <a href="#" data-section="configuracion" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition">
                <i class="fas fa-cog"></i><span>Configuración</span>
            </a>
            <?php endif; ?>
        </nav>
        <div class="p-4 border-t border-gray-700">
            <a href="logout.php" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition text-red-400 hover:text-white">
                <i class="fas fa-sign-out-alt"></i><span>Cerrar Sesión</span>
            </a>
        </div>
    </aside>

    <!-- Main Content -->
    <div class="md:ml-64">
        <!-- Header -->
        <header class="sticky top-0 z-40 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
            <button id="menuBtn" class="md:hidden text-gray-300 text-2xl">
                <i class="fas fa-bars"></i>
            </button>
            <div class="flex-1 max-w-xl mx-4">
                <h2 id="pageTitle" class="text-xl font-bold text-white">Dashboard</h2>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        <?= strtoupper(substr($_SESSION['usuario_nombre'], 0, 2)) ?>
                    </div>
                    <div class="hidden md:block">
                        <p class="text-sm font-medium"><?= $_SESSION['usuario_nombre'] ?></p>
                        <p class="text-xs text-gray-400"><?= ucfirst($_SESSION['usuario_rol']) ?></p>
                    </div>
                </div>
            </div>
        </header>

        <!-- Content Area -->
        <main id="contentArea" class="p-6"></main>
    </div>

    <!-- Scripts -->
    <script src="assets/js/app.js"></script>
    <script src="assets/js/configuracion_sucursales.js"></script>
</body>
</html>
