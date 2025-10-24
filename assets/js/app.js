// Variables globales
let currentSection = 'dashboard';
let chartInstance = null;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Toggle sidebar mobile
    document.getElementById('menuBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.dataset.section;
            loadSection(section);
            
            // Update active state
            document.querySelectorAll('.nav-link').forEach(l => {
                l.classList.remove('bg-blue-600', 'text-white');
                l.classList.add('hover:bg-gray-700');
            });
            e.currentTarget.classList.add('bg-blue-600', 'text-white');
            
            // Close sidebar on mobile
            if (window.innerWidth < 768) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });
    });
    
    // Load dashboard by default
    loadSection('dashboard');
}

// Load section
async function loadSection(section) {
    currentSection = section;
    const titles = {
        dashboard: 'Dashboard',
        productos: 'Productos',
        ventas: 'Ventas',
        reparaciones: 'Reparaciones',
        clientes: 'Clientes',
        proveedores: 'Proveedores',
        usuarios: 'Usuarios'
    };
    
    document.getElementById('pageTitle').textContent = titles[section] || section;
    
    switch(section) {
        case 'dashboard': loadDashboard(); break;
        case 'productos': loadProductos(); break;
        case 'ventas': loadVentas(); break;
        case 'reparaciones': loadReparaciones(); break;
        case 'clientes': loadClientes(); break;
        case 'proveedores': loadProveedores(); break;
        case 'usuarios': loadUsuarios(); break;
    }
}

// ============ DASHBOARD ============
async function loadDashboard() {
    try {
        const res = await fetch('api/dashboard.php');
        const data = await res.json();
        
        const html = `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">Ventas Hoy</p>
                            <h3 class="text-3xl font-bold text-white mt-2">S/ ${parseFloat(data.ventas_hoy).toFixed(2)}</h3>
                        </div>
                        <div class="w-14 h-14 rounded-full bg-blue-600 bg-opacity-20 flex items-center justify-center">
                            <i class="fas fa-dollar-sign text-2xl text-blue-400"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">Ventas Mes</p>
                            <h3 class="text-3xl font-bold text-white mt-2">S/ ${parseFloat(data.ventas_mes).toFixed(2)}</h3>
                        </div>
                        <div class="w-14 h-14 rounded-full bg-green-600 bg-opacity-20 flex items-center justify-center">
                            <i class="fas fa-chart-line text-2xl text-green-400"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">Stock Bajo</p>
                            <h3 class="text-3xl font-bold text-white mt-2">${data.stock_bajo}</h3>
                        </div>
                        <div class="w-14 h-14 rounded-full bg-orange-600 bg-opacity-20 flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-2xl text-orange-400"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-400 text-sm">Reparaciones</p>
                            <h3 class="text-3xl font-bold text-white mt-2">${data.reparaciones_pendientes}</h3>
                        </div>
                        <div class="w-14 h-14 rounded-full bg-purple-600 bg-opacity-20 flex items-center justify-center">
                            <i class="fas fa-tools text-2xl text-purple-400"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 class="text-xl font-bold mb-4">Ventas Mensuales</h3>
                    <canvas id="salesChart"></canvas>
                </div>
                
                <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 class="text-xl font-bold mb-4">Productos Más Vendidos</h3>
                    <div class="space-y-3">
                        ${data.productos_top.map(p => `
                            <div class="flex items-center justify-between pb-3 border-b border-gray-700">
                                <span class="text-sm text-gray-300">${p.nombre}</span>
                                <span class="text-sm font-bold text-blue-400">${p.cantidad}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('contentArea').innerHTML = html;
        
        // Chart
        const ctx = document.getElementById('salesChart').getContext('2d');
        if (chartInstance) chartInstance.destroy();
        
        const labels = data.ventas_mensuales.map(v => {
            const [year, month] = v.mes.split('-');
            return new Date(year, month - 1).toLocaleDateString('es', { month: 'short' });
        });
        const values = data.ventas_mensuales.map(v => parseFloat(v.total));
        
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas',
                    data: values,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#9ca3af' } } },
                scales: {
                    y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============ PRODUCTOS ============
async function loadProductos() {
    const res = await fetch('api/productos.php');
    const productos = await res.json();
    
    const html = `
        <div class="mb-6 flex flex-col sm:flex-row gap-4">
            <input type="text" id="searchProducto" placeholder="Buscar producto..." 
                class="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <select id="filterTipo" class="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700">
                <option value="">Todos los tipos</option>
                <option value="celular_nuevo">Celular Nuevo</option>
                <option value="celular_usado">Celular Usado</option>
                <option value="repuesto">Repuesto</option>
                <option value="accesorio">Accesorio</option>
            </select>
            <button onclick="showProductoModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                <i class="fas fa-plus mr-2"></i>Nuevo Producto
            </button>
        </div>
        
        <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Código</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nombre</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tipo</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Stock</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">P. Compra</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">P. Venta</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="productosTable" class="divide-y divide-gray-700">
                        ${productos.map(p => `
                            <tr class="hover:bg-gray-700">
                                <td class="px-6 py-4 text-sm text-gray-300">${p.codigo}</td>
                                <td class="px-6 py-4 text-sm text-white">${p.nombre}</td>
                                <td class="px-6 py-4 text-sm">
                                    <span class="px-2 py-1 rounded text-xs ${getTipoClass(p.tipo)}">${formatTipo(p.tipo)}</span>
                                </td>
                                <td class="px-6 py-4 text-sm ${p.stock <= p.stock_minimo ? 'text-red-400 font-bold' : 'text-gray-300'}">${p.stock}</td>
                                <td class="px-6 py-4 text-sm text-gray-300">S/ ${parseFloat(p.precio_compra).toFixed(2)}</td>
                                <td class="px-6 py-4 text-sm text-green-400">S/ ${parseFloat(p.precio_venta).toFixed(2)}</td>
                                <td class="px-6 py-4 text-sm">
                                    <button onclick='editProducto(${JSON.stringify(p)})' class="text-blue-400 hover:text-blue-300 mr-3">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteProducto(${p.id})" class="text-red-400 hover:text-red-300">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        ${getProductoModal()}
    `;
    
    document.getElementById('contentArea').innerHTML = html;
    
    // Search and filter
    document.getElementById('searchProducto').addEventListener('input', filterProductos);
    document.getElementById('filterTipo').addEventListener('change', filterProductos);
}

async function filterProductos() {
    const search = document.getElementById('searchProducto').value;
    const tipo = document.getElementById('filterTipo').value;
    const res = await fetch(`api/productos.php?search=${search}&tipo=${tipo}`);
    const productos = await res.json();
    
    document.getElementById('productosTable').innerHTML = productos.map(p => `
        <tr class="hover:bg-gray-700">
            <td class="px-6 py-4 text-sm text-gray-300">${p.codigo}</td>
            <td class="px-6 py-4 text-sm text-white">${p.nombre}</td>
            <td class="px-6 py-4 text-sm">
                <span class="px-2 py-1 rounded text-xs ${getTipoClass(p.tipo)}">${formatTipo(p.tipo)}</span>
            </td>
            <td class="px-6 py-4 text-sm ${p.stock <= p.stock_minimo ? 'text-red-400 font-bold' : 'text-gray-300'}">${p.stock}</td>
            <td class="px-6 py-4 text-sm text-gray-300">S/ ${parseFloat(p.precio_compra).toFixed(2)}</td>
            <td class="px-6 py-4 text-sm text-green-400">S/ ${parseFloat(p.precio_venta).toFixed(2)}</td>
            <td class="px-6 py-4 text-sm">
                <button onclick='editProducto(${JSON.stringify(p)})' class="text-blue-400 hover:text-blue-300 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteProducto(${p.id})" class="text-red-400 hover:text-red-300">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getProductoModal() {
    return `
        <div id="productoModal" class="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
            <div class="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-white">
                        <i class="fas fa-box mr-2"></i><span id="modalTitle">Nuevo Producto</span>
                    </h3>
                    <button onclick="closeModal('productoModal')" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="productoForm" class="space-y-4">
                    <input type="hidden" id="productoId">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Código *</label>
                            <input type="text" id="productoCodigo" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Tipo *</label>
                            <select id="productoTipo" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="celular_nuevo">Celular Nuevo</option>
                                <option value="celular_usado">Celular Usado</option>
                                <option value="repuesto">Repuesto</option>
                                <option value="accesorio">Accesorio</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Nombre *</label>
                        <input type="text" id="productoNombre" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Descripción</label>
                        <textarea id="productoDescripcion" rows="2" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">P. Compra *</label>
                            <input type="number" step="0.01" id="productoPrecioCompra" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">P. Venta *</label>
                            <input type="number" step="0.01" id="productoPrecioVenta" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Stock *</label>
                            <input type="number" id="productoStock" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div class="flex gap-4 pt-4">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                            <i class="fas fa-save mr-2"></i>Guardar
                        </button>
                        <button type="button" onclick="closeModal('productoModal')" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function showProductoModal(producto = null) {
    document.getElementById('productoModal').classList.add('active');
    document.getElementById('productoForm').reset();
    
    if (producto) {
        document.getElementById('modalTitle').textContent = 'Editar Producto';
        document.getElementById('productoId').value = producto.id;
        document.getElementById('productoCodigo').value = producto.codigo;
        document.getElementById('productoNombre').value = producto.nombre;
        document.getElementById('productoDescripcion').value = producto.descripcion || '';
        document.getElementById('productoTipo').value = producto.tipo;
        document.getElementById('productoPrecioCompra').value = producto.precio_compra;
        document.getElementById('productoPrecioVenta').value = producto.precio_venta;
        document.getElementById('productoStock').value = producto.stock;
    } else {
        document.getElementById('modalTitle').textContent = 'Nuevo Producto';
    }
}

function editProducto(producto) {
    showProductoModal(producto);
}

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'productoForm') {
        e.preventDefault();
        
        const id = document.getElementById('productoId').value;
        const data = {
            id: id || undefined,
            codigo: document.getElementById('productoCodigo').value,
            nombre: document.getElementById('productoNombre').value,
            descripcion: document.getElementById('productoDescripcion').value,
            tipo: document.getElementById('productoTipo').value,
            precio_compra: document.getElementById('productoPrecioCompra').value,
            precio_venta: document.getElementById('productoPrecioVenta').value,
            stock: document.getElementById('productoStock').value,
            stock_minimo: 5
        };
        
        const method = id ? 'PUT' : 'POST';
        const res = await fetch('api/productos.php', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            closeModal('productoModal');
            loadProductos();
            showNotification('Producto guardado exitosamente', 'success');
        }
    }
});

async function deleteProducto(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    const res = await fetch(`api/productos.php?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
        loadProductos();
        showNotification('Producto eliminado', 'success');
    }
}

// ============ VENTAS ============
async function loadVentas() {
    const res = await fetch('api/ventas.php');
    const ventas = await res.json();
    
    const html = `
        <div class="mb-6 flex flex-col sm:flex-row gap-4">
            <button onclick="showVentaModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                <i class="fas fa-plus mr-2"></i>Nueva Venta
            </button>
        </div>
        
        <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">#</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cliente</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Vendedor</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Método</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fecha</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-700">
                        ${ventas.map(v => `
                            <tr class="hover:bg-gray-700">
                                <td class="px-6 py-4 text-sm text-gray-300">${v.id}</td>
                                <td class="px-6 py-4 text-sm text-white">${v.cliente_nombre || 'Público'}</td>
                                <td class="px-6 py-4 text-sm text-gray-300">${v.vendedor_nombre}</td>
                                <td class="px-6 py-4 text-sm text-green-400 font-bold">S/ ${parseFloat(v.total).toFixed(2)}</td>
                                <td class="px-6 py-4 text-sm text-gray-300">${v.metodo_pago}</td>
                                <td class="px-6 py-4 text-sm text-gray-300">${new Date(v.fecha_venta).toLocaleString('es')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        ${getVentaModal()}
    `;
    
    document.getElementById('contentArea').innerHTML = html;
}

function getVentaModal() {
    return `
        <div id="ventaModal" class="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
            <div class="bg-gray-800 rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-white">
                        <i class="fas fa-shopping-cart mr-2"></i>Nueva Venta
                    </h3>
                    <button onclick="closeModal('ventaModal')" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="ventaForm" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Cliente (Opcional)</label>
                            <select id="ventaCliente" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Público General</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Método de Pago *</label>
                            <select id="ventaMetodo" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="efectivo">Efectivo</option>
                                <option value="tarjeta">Tarjeta</option>
                                <option value="transferencia">Transferencia</option>
                                <option value="yape">Yape</option>
                                <option value="plin">Plin</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="bg-gray-700 rounded-lg p-4">
                        <div class="flex gap-4 mb-4">
                            <select id="ventaProducto" class="flex-1 bg-gray-600 text-white rounded-lg px-4 py-2">
                                <option value="">Seleccionar producto...</option>
                            </select>
                            <input type="number" id="ventaCantidad" min="1" value="1" placeholder="Cant." class="w-24 bg-gray-600 text-white rounded-lg px-4 py-2">
                            <button type="button" onclick="agregarProductoVenta()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        
                        <div id="ventaProductos" class="space-y-2"></div>
                    </div>
                    
                    <div class="bg-gray-700 rounded-lg p-4">
                        <div class="flex justify-between text-lg mb-2">
                            <span class="text-gray-300">Subtotal:</span>
                            <span class="text-white font-bold" id="ventaSubtotal">S/ 0.00</span>
                        </div>
                        <div class="flex justify-between text-lg mb-2">
                            <span class="text-gray-300">Descuento:</span>
                            <input type="number" step="0.01" id="ventaDescuento" value="0" min="0" 
                                onchange="calcularTotalVenta()" 
                                class="w-32 bg-gray-600 text-white rounded-lg px-4 py-1 text-right">
                        </div>
                        <div class="flex justify-between text-2xl border-t border-gray-600 pt-2">
                            <span class="text-gray-300">Total:</span>
                            <span class="text-green-400 font-bold" id="ventaTotal">S/ 0.00</span>
                        </div>
                    </div>
                    
                    <div class="flex gap-4">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                            <i class="fas fa-check mr-2"></i>Procesar Venta
                        </button>
                        <button type="button" onclick="closeModal('ventaModal')" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

let productosVenta = [];

async function showVentaModal() {
    document.getElementById('ventaModal').classList.add('active');
    productosVenta = [];
    
    // Load clientes
    const resClientes = await fetch('api/clientes.php');
    const clientes = await resClientes.json();
    const selectCliente = document.getElementById('ventaCliente');
    selectCliente.innerHTML = '<option value="">Público General</option>' + 
        clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    
    // Load productos
    const resProductos = await fetch('api/productos.php');
    const productos = await resProductos.json();
    const selectProducto = document.getElementById('ventaProducto');
    selectProducto.innerHTML = '<option value="">Seleccionar producto...</option>' + 
        productos.filter(p => p.stock > 0).map(p => 
            `<option value="${p.id}" data-precio="${p.precio_venta}" data-stock="${p.stock}">${p.nombre} (Stock: ${p.stock}) - S/ ${p.precio_venta}</option>`
        ).join('');
    
    calcularTotalVenta();
}

function agregarProductoVenta() {
    const select = document.getElementById('ventaProducto');
    const option = select.selectedOptions[0];
    const cantidad = parseInt(document.getElementById('ventaCantidad').value);
    
    if (!option.value) {
        alert('Selecciona un producto');
        return;
    }
    
    const stock = parseInt(option.dataset.stock);
    if (cantidad > stock) {
        alert(`Stock insuficiente. Disponible: ${stock}`);
        return;
    }
    
    const producto = {
        producto_id: option.value,
        nombre: option.text.split(' (Stock')[0],
        cantidad: cantidad,
        precio_unitario: parseFloat(option.dataset.precio),
        subtotal: cantidad * parseFloat(option.dataset.precio)
    };
    
    productosVenta.push(producto);
    renderProductosVenta();
    calcularTotalVenta();
    
    select.value = '';
    document.getElementById('ventaCantidad').value = 1;
}

function renderProductosVenta() {
    const html = productosVenta.map((p, i) => `
        <div class="flex justify-between items-center bg-gray-600 rounded-lg p-3">
            <div class="flex-1">
                <p class="text-white font-medium">${p.nombre}</p>
                <p class="text-gray-300 text-sm">${p.cantidad} x S/ ${p.precio_unitario.toFixed(2)}</p>
            </div>
            <div class="flex items-center gap-4">
                <span class="text-white font-bold">S/ ${p.subtotal.toFixed(2)}</span>
                <button type="button" onclick="eliminarProductoVenta(${i})" class="text-red-400 hover:text-red-300">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('ventaProductos').innerHTML = html || '<p class="text-gray-400 text-center py-4">No hay productos agregados</p>';
}

function eliminarProductoVenta(index) {
    productosVenta.splice(index, 1);
    renderProductosVenta();
    calcularTotalVenta();
}

function calcularTotalVenta() {
    const subtotal = productosVenta.reduce((sum, p) => sum + p.subtotal, 0);
    const descuento = parseFloat(document.getElementById('ventaDescuento')?.value || 0);
    const total = subtotal - descuento;
    
    if (document.getElementById('ventaSubtotal')) {
        document.getElementById('ventaSubtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
        document.getElementById('ventaTotal').textContent = `S/ ${total.toFixed(2)}`;
    }
}

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'ventaForm') {
        e.preventDefault();
        
        if (productosVenta.length === 0) {
            alert('Agrega al menos un producto');
            return;
        }
        
        const subtotal = productosVenta.reduce((sum, p) => sum + p.subtotal, 0);
        const descuento = parseFloat(document.getElementById('ventaDescuento').value);
        const total = subtotal - descuento;
        
        const data = {
            cliente_id: document.getElementById('ventaCliente').value || null,
            metodo_pago: document.getElementById('ventaMetodo').value,
            subtotal: subtotal,
            descuento: descuento,
            total: total,
            productos: productosVenta
        };
        
        const res = await fetch('api/ventas.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            closeModal('ventaModal');
            loadVentas();
            showNotification('Venta registrada exitosamente', 'success');
        }
    }
});

// ============ REPARACIONES ============
async function loadReparaciones() {
    const res = await fetch('api/reparaciones.php');
    const reparaciones = await res.json();
    
    const html = `
        <div class="mb-6 flex flex-col sm:flex-row gap-4">
            <select id="filterEstado" onchange="filterReparaciones()" class="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700">
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="reparado">Reparado</option>
                <option value="entregado">Entregado</option>
            </select>
            <button onclick="showReparacionModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                <i class="fas fa-plus mr-2"></i>Nueva Reparación
            </button>
        </div>
        
        <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">#</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cliente</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Equipo</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Problema</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Costo</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Estado</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="reparacionesTable" class="divide-y divide-gray-700">
                        ${reparaciones.map(r => `
                            <tr class="hover:bg-gray-700">
                                <td class="px-6 py-4 text-sm text-gray-300">${r.id}</td>
                                <td class="px-6 py-4 text-sm text-white">${r.cliente_nombre}</td>
                                <td class="px-6 py-4 text-sm text-gray-300">${r.equipo}</td>
                                <td class="px-6 py-4 text-sm text-gray-300">${r.problema.substring(0, 30)}...</td>
                                <td class="px-6 py-4 text-sm text-green-400">S/ ${parseFloat(r.costo).toFixed(2)}</td>
                                <td class="px-6 py-4 text-sm">
                                    <span class="px-2 py-1 rounded text-xs ${getEstadoClass(r.estado)}">${formatEstado(r.estado)}</span>
                                </td>
                                <td class="px-6 py-4 text-sm">
                                    <button onclick='editReparacion(${JSON.stringify(r)})' class="text-blue-400 hover:text-blue-300">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        ${getReparacionModal()}
    `;
    
    document.getElementById('contentArea').innerHTML = html;
}

async function filterReparaciones() {
    const estado = document.getElementById('filterEstado').value;
    const res = await fetch(`api/reparaciones.php?estado=${estado}`);
    const reparaciones = await res.json();
    
    document.getElementById('reparacionesTable').innerHTML = reparaciones.map(r => `
        <tr class="hover:bg-gray-700">
            <td class="px-6 py-4 text-sm text-gray-300">${r.id}</td>
            <td class="px-6 py-4 text-sm text-white">${r.cliente_nombre}</td>
            <td class="px-6 py-4 text-sm text-gray-300">${r.equipo}</td>
            <td class="px-6 py-4 text-sm text-gray-300">${r.problema.substring(0, 30)}...</td>
            <td class="px-6 py-4 text-sm text-green-400">S/ ${parseFloat(r.costo).toFixed(2)}</td>
            <td class="px-6 py-4 text-sm">
                <span class="px-2 py-1 rounded text-xs ${getEstadoClass(r.estado)}">${formatEstado(r.estado)}</span>
            </td>
            <td class="px-6 py-4 text-sm">
                <button onclick='editReparacion(${JSON.stringify(r)})' class="text-blue-400 hover:text-blue-300">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getReparacionModal() {
    return `
        <div id="reparacionModal" class="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
            <div class="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-white">
                        <i class="fas fa-tools mr-2"></i><span id="modalTitleReparacion">Nueva Reparación</span>
                    </h3>
                    <button onclick="closeModal('reparacionModal')" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="reparacionForm" class="space-y-4">
                    <input type="hidden" id="reparacionId">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Cliente *</label>
                            <select id="reparacionCliente" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Seleccionar cliente...</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Equipo *</label>
                            <input type="text" id="reparacionEquipo" required placeholder="Ej: iPhone 15 Pro" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">IMEI (Opcional)</label>
                        <input type="text" id="reparacionImei" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Problema Reportado *</label>
                        <textarea id="reparacionProblema" required rows="3" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Diagnóstico</label>
                        <textarea id="reparacionDiagnostico" rows="3" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Costo *</label>
                            <input type="number" step="0.01" id="reparacionCosto" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Abono</label>
                            <input type="number" step="0.01" id="reparacionAbono" value="0" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Estado *</label>
                            <select id="reparacionEstado" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="pendiente">Pendiente</option>
                                <option value="en_proceso">En Proceso</option>
                                <option value="reparado">Reparado</option>
                                <option value="entregado">Entregado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="flex gap-4 pt-4">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                            <i class="fas fa-save mr-2"></i>Guardar
                        </button>
                        <button type="button" onclick="closeModal('reparacionModal')" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

async function showReparacionModal(reparacion = null) {
    document.getElementById('reparacionModal').classList.add('active');
    document.getElementById('reparacionForm').reset();
    
    // Load clientes
    const res = await fetch('api/clientes.php');
    const clientes = await res.json();
    const select = document.getElementById('reparacionCliente');
    select.innerHTML = '<option value="">Seleccionar cliente...</option>' + 
        clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    
    if (reparacion) {
        document.getElementById('modalTitleReparacion').textContent = 'Editar Reparación';
        document.getElementById('reparacionId').value = reparacion.id;
        document.getElementById('reparacionCliente').value = reparacion.cliente_id;
        document.getElementById('reparacionEquipo').value = reparacion.equipo;
        document.getElementById('reparacionImei').value = reparacion.imei || '';
        document.getElementById('reparacionProblema').value = reparacion.problema;
        document.getElementById('reparacionDiagnostico').value = reparacion.diagnostico || '';
        document.getElementById('reparacionCosto').value = reparacion.costo;
        document.getElementById('reparacionAbono').value = reparacion.abono;
        document.getElementById('reparacionEstado').value = reparacion.estado;
    } else {
        document.getElementById('modalTitleReparacion').textContent = 'Nueva Reparación';
    }
}

function editReparacion(reparacion) {
    showReparacionModal(reparacion);
}

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'reparacionForm') {
        e.preventDefault();
        
        const id = document.getElementById('reparacionId').value;
        const data = {
            id: id || undefined,
            cliente_id: document.getElementById('reparacionCliente').value,
            equipo: document.getElementById('reparacionEquipo').value,
            imei: document.getElementById('reparacionImei').value,
            problema: document.getElementById('reparacionProblema').value,
            diagnostico: document.getElementById('reparacionDiagnostico').value,
            costo: document.getElementById('reparacionCosto').value,
            abono: document.getElementById('reparacionAbono').value,
            estado: document.getElementById('reparacionEstado').value,
            fecha_entrega: null
        };
        
        const method = id ? 'PUT' : 'POST';
        const res = await fetch('api/reparaciones.php', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            closeModal('reparacionModal');
            loadReparaciones();
            showNotification('Reparación guardada exitosamente', 'success');
        }
    }
});

// ============ CLIENTES ============
async function loadClientes() {
    const res = await fetch('api/clientes.php');
    const clientes = await res.json();
    
    const html = `
        <div class="mb-6 flex flex-col sm:flex-row gap-4">
            <input type="text" id="searchCliente" onkeyup="searchClientes()" placeholder="Buscar cliente..." 
                class="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <button onclick="showClienteModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                <i class="fas fa-plus mr-2"></i>Nuevo Cliente
            </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="clientesGrid">
            ${clientes.map(c => `
                <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            ${c.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div class="flex gap-2">
                            <button onclick='editCliente(${JSON.stringify(c)})' class="text-blue-400 hover:text-blue-300">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteCliente(${c.id})" class="text-red-400 hover:text-red-300">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <h3 class="text-lg font-bold text-white mb-2">${c.nombre}</h3>
                    <div class="space-y-2 text-sm text-gray-300">
                        <p><i class="fas fa-phone mr-2 text-blue-400"></i>${c.telefono || 'Sin teléfono'}</p>
                        <p><i class="fas fa-envelope mr-2 text-blue-400"></i>${c.email || 'Sin email'}</p>
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${getClienteModal()}
    `;
    
    document.getElementById('contentArea').innerHTML = html;
}

async function searchClientes() {
    const search = document.getElementById('searchCliente').value;
    const res = await fetch(`api/clientes.php?search=${search}`);
    const clientes = await res.json();
    
    document.getElementById('clientesGrid').innerHTML = clientes.map(c => `
        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    ${c.nombre.charAt(0).toUpperCase()}
                </div>
                <div class="flex gap-2">
                    <button onclick='editCliente(${JSON.stringify(c)})' class="text-blue-400 hover:text-blue-300">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteCliente(${c.id})" class="text-red-400 hover:text-red-300">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">${c.nombre}</h3>
            <div class="space-y-2 text-sm text-gray-300">
                <p><i class="fas fa-phone mr-2 text-blue-400"></i>${c.telefono || 'Sin teléfono'}</p>
                <p><i class="fas fa-envelope mr-2 text-blue-400"></i>${c.email || 'Sin email'}</p>
            </div>
        </div>
    `).join('');
}

function getClienteModal() {
    return `
        <div id="clienteModal" class="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
            <div class="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-white">
                        <i class="fas fa-user mr-2"></i><span id="modalTitleCliente">Nuevo Cliente</span>
                    </h3>
                    <button onclick="closeModal('clienteModal')" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="clienteForm" class="space-y-4">
                    <input type="hidden" id="clienteId">
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Nombre *</label>
                        <input type="text" id="clienteNombre" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Teléfono</label>
                            <input type="tel" id="clienteTelefono" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Email</label>
                            <input type="email" id="clienteEmail" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Dirección</label>
                        <textarea id="clienteDireccion" rows="2" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    
                    <div class="flex gap-4 pt-4">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                            <i class="fas fa-save mr-2"></i>Guardar
                        </button>
                        <button type="button" onclick="closeModal('clienteModal')" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function showClienteModal(cliente = null) {
    document.getElementById('clienteModal').classList.add('active');
    document.getElementById('clienteForm').reset();
    
    if (cliente) {
        document.getElementById('modalTitleCliente').textContent = 'Editar Cliente';
        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('clienteNombre').value = cliente.nombre;
        document.getElementById('clienteTelefono').value = cliente.telefono || '';
        document.getElementById('clienteEmail').value = cliente.email || '';
        document.getElementById('clienteDireccion').value = cliente.direccion || '';
    } else {
        document.getElementById('modalTitleCliente').textContent = 'Nuevo Cliente';
    }
}

function editCliente(cliente) {
    showClienteModal(cliente);
}

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'clienteForm') {
        e.preventDefault();
        
        const id = document.getElementById('clienteId').value;
        const data = {
            id: id || undefined,
            nombre: document.getElementById('clienteNombre').value,
            telefono: document.getElementById('clienteTelefono').value,
            email: document.getElementById('clienteEmail').value,
            direccion: document.getElementById('clienteDireccion').value
        };
        
        const method = id ? 'PUT' : 'POST';
        const res = await fetch('api/clientes.php', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            closeModal('clienteModal');
            loadClientes();
            showNotification('Cliente guardado exitosamente', 'success');
        }
    }
});

async function deleteCliente(id) {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    
    const res = await fetch(`api/clientes.php?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
        loadClientes();
        showNotification('Cliente eliminado', 'success');
    }
}

// ============ PROVEEDORES ============
async function loadProveedores() {
    const res = await fetch('api/proveedores.php');
    const proveedores = await res.json();
    
    const html = `
        <div class="mb-6">
            <button onclick="showProveedorModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                <i class="fas fa-plus mr-2"></i>Nuevo Proveedor
            </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${proveedores.map(p => `
                <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white">
                            <i class="fas fa-truck text-xl"></i>
                        </div>
                        <div class="flex gap-2">
                            <button onclick='editProveedor(${JSON.stringify(p)})' class="text-blue-400 hover:text-blue-300">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteProveedor(${p.id})" class="text-red-400 hover:text-red-300">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <h3 class="text-lg font-bold text-white mb-2">${p.nombre}</h3>
                    <div class="space-y-2 text-sm text-gray-300">
                        <p><i class="fas fa-user mr-2 text-green-400"></i>${p.contacto || 'Sin contacto'}</p>
                        <p><i class="fas fa-phone mr-2 text-green-400"></i>${p.telefono || 'Sin teléfono'}</p>
                        <p><i class="fas fa-envelope mr-2 text-green-400"></i>${p.email || 'Sin email'}</p>
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${getProveedorModal()}
    `;
    
    document.getElementById('contentArea').innerHTML = html;
}

function getProveedorModal() {
    return `
        <div id="proveedorModal" class="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
            <div class="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-white">
                        <i class="fas fa-truck mr-2"></i><span id="modalTitleProveedor">Nuevo Proveedor</span>
                    </h3>
                    <button onclick="closeModal('proveedorModal')" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="proveedorForm" class="space-y-4">
                    <input type="hidden" id="proveedorId">
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Nombre de Empresa *</label>
                        <input type="text" id="proveedorNombre" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Persona de Contacto</label>
                            <input type="text" id="proveedorContacto" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Teléfono</label>
                            <input type="tel" id="proveedorTelefono" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Email</label>
                        <input type="email" id="proveedorEmail" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Dirección</label>
                        <textarea id="proveedorDireccion" rows="2" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    
                    <div class="flex gap-4 pt-4">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                            <i class="fas fa-save mr-2"></i>Guardar
                        </button>
                        <button type="button" onclick="closeModal('proveedorModal')" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function showProveedorModal(proveedor = null) {
    document.getElementById('proveedorModal').classList.add('active');
    document.getElementById('proveedorForm').reset();
    
    if (proveedor) {
        document.getElementById('modalTitleProveedor').textContent = 'Editar Proveedor';
        document.getElementById('proveedorId').value = proveedor.id;
        document.getElementById('proveedorNombre').value = proveedor.nombre;
        document.getElementById('proveedorContacto').value = proveedor.contacto || '';
        document.getElementById('proveedorTelefono').value = proveedor.telefono || '';
        document.getElementById('proveedorEmail').value = proveedor.email || '';
        document.getElementById('proveedorDireccion').value = proveedor.direccion || '';
    } else {
        document.getElementById('modalTitleProveedor').textContent = 'Nuevo Proveedor';
    }
}

function editProveedor(proveedor) {
    showProveedorModal(proveedor);
}

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'proveedorForm') {
        e.preventDefault();
        
        const id = document.getElementById('proveedorId').value;
        const data = {
            id: id || undefined,
            nombre: document.getElementById('proveedorNombre').value,
            contacto: document.getElementById('proveedorContacto').value,
            telefono: document.getElementById('proveedorTelefono').value,
            email: document.getElementById('proveedorEmail').value,
            direccion: document.getElementById('proveedorDireccion').value
        };
        
        const method = id ? 'PUT' : 'POST';
        const res = await fetch('api/proveedores.php', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            closeModal('proveedorModal');
            loadProveedores();
            showNotification('Proveedor guardado exitosamente', 'success');
        }
    }
});

async function deleteProveedor(id) {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    
    const res = await fetch(`api/proveedores.php?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
        loadProveedores();
        showNotification('Proveedor eliminado', 'success');
    }
}

// ============ USUARIOS ============
async function loadUsuarios() {
    const res = await fetch('api/usuarios.php');
    const usuarios = await res.json();
    
    const html = `
        <div class="mb-6">
            <button onclick="showUsuarioModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                <i class="fas fa-plus mr-2"></i>Nuevo Usuario
            </button>
        </div>
        
        <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nombre</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Rol</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Estado</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-700">
                        ${usuarios.map(u => `
                            <tr class="hover:bg-gray-700">
                                <td class="px-6 py-4 text-sm text-white">${u.nombre}</td>
                                <td class="px-6 py-4 text-sm text-gray-300">${u.email}</td>
                                <td class="px-6 py-4 text-sm">
                                    <span class="px-2 py-1 rounded text-xs ${getRolClass(u.rol)}">${ucfirst(u.rol)}</span>
                                </td>
                                <td class="px-6 py-4 text-sm">
                                    <span class="px-2 py-1 rounded text-xs ${u.estado ? 'bg-green-600 bg-opacity-20 text-green-400' : 'bg-red-600 bg-opacity-20 text-red-400'}">
                                        ${u.estado ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm">
                                    <button onclick='editUsuario(${JSON.stringify(u)})' class="text-blue-400 hover:text-blue-300 mr-3">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteUsuario(${u.id})" class="text-red-400 hover:text-red-300">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        ${getUsuarioModal()}
    `;
    
    document.getElementById('contentArea').innerHTML = html;
}

function getUsuarioModal() {
    return `
        <div id="usuarioModal" class="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
            <div class="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-white">
                        <i class="fas fa-user-shield mr-2"></i><span id="modalTitleUsuario">Nuevo Usuario</span>
                    </h3>
                    <button onclick="closeModal('usuarioModal')" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="usuarioForm" class="space-y-4">
                    <input type="hidden" id="usuarioId">
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Nombre *</label>
                        <input type="text" id="usuarioNombre" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Email *</label>
                            <input type="email" id="usuarioEmail" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Contraseña <span id="passwordRequired">*</span></label>
                            <input type="password" id="usuarioPassword" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <p class="text-xs text-gray-400 mt-1" id="passwordHelp">Mínimo 6 caracteres</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Rol *</label>
                            <select id="usuarioRol" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="vendedor">Vendedor</option>
                                <option value="tecnico">Técnico</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Estado *</label>
                            <select id="usuarioEstado" required class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="flex gap-4 pt-4">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                            <i class="fas fa-save mr-2"></i>Guardar
                        </button>
                        <button type="button" onclick="closeModal('usuarioModal')" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function showUsuarioModal(usuario = null) {
    document.getElementById('usuarioModal').classList.add('active');
    document.getElementById('usuarioForm').reset();
    
    const passwordField = document.getElementById('usuarioPassword');
    const passwordRequired = document.getElementById('passwordRequired');
    const passwordHelp = document.getElementById('passwordHelp');
    
    if (usuario) {
        document.getElementById('modalTitleUsuario').textContent = 'Editar Usuario';
        document.getElementById('usuarioId').value = usuario.id;
        document.getElementById('usuarioNombre').value = usuario.nombre;
        document.getElementById('usuarioEmail').value = usuario.email;
        document.getElementById('usuarioRol').value = usuario.rol;
        document.getElementById('usuarioEstado').value = usuario.estado;
        passwordField.removeAttribute('required');
        passwordRequired.textContent = '(Dejar vacío para no cambiar)';
        passwordHelp.textContent = 'Dejar vacío para mantener la contraseña actual';
    } else {
        document.getElementById('modalTitleUsuario').textContent = 'Nuevo Usuario';
        passwordField.setAttribute('required', 'required');
        passwordRequired.textContent = '*';
        passwordHelp.textContent = 'Mínimo 6 caracteres';
    }
}

function editUsuario(usuario) {
    showUsuarioModal(usuario);
}

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'usuarioForm') {
        e.preventDefault();
        
        const id = document.getElementById('usuarioId').value;
        const password = document.getElementById('usuarioPassword').value;
        
        if (!id && password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        const data = {
            id: id || undefined,
            nombre: document.getElementById('usuarioNombre').value,
            email: document.getElementById('usuarioEmail').value,
            password: password,
            rol: document.getElementById('usuarioRol').value,
            estado: document.getElementById('usuarioEstado').value
        };
        
        const method = id ? 'PUT' : 'POST';
        const res = await fetch('api/usuarios.php', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            closeModal('usuarioModal');
            loadUsuarios();
            showNotification('Usuario guardado exitosamente', 'success');
        }
    }
});

async function deleteUsuario(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    const res = await fetch(`api/usuarios.php?id=${id}`, { method: 'DELETE' });
    const result = await res.json();
    
    if (result.error) {
        alert(result.error);
    } else {
        loadUsuarios();
        showNotification('Usuario eliminado', 'success');
    }
}

// ============ UTILIDADES ============
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showNotification(message, type = 'success') {
    const color = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${color} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function getTipoClass(tipo) {
    const classes = {
        celular_nuevo: 'bg-blue-600 bg-opacity-20 text-blue-400',
        celular_usado: 'bg-purple-600 bg-opacity-20 text-purple-400',
        repuesto: 'bg-orange-600 bg-opacity-20 text-orange-400',
        accesorio: 'bg-green-600 bg-opacity-20 text-green-400'
    };
    return classes[tipo] || 'bg-gray-600 bg-opacity-20 text-gray-400';
}

function formatTipo(tipo) {
    const nombres = {
        celular_nuevo: 'Celular Nuevo',
        celular_usado: 'Celular Usado',
        repuesto: 'Repuesto',
        accesorio: 'Accesorio'
    };
    return nombres[tipo] || tipo;
}

function getEstadoClass(estado) {
    const classes = {
        pendiente: 'bg-yellow-600 bg-opacity-20 text-yellow-400',
        en_proceso: 'bg-blue-600 bg-opacity-20 text-blue-400',
        reparado: 'bg-green-600 bg-opacity-20 text-green-400',
        entregado: 'bg-purple-600 bg-opacity-20 text-purple-400',
        cancelado: 'bg-red-600 bg-opacity-20 text-red-400'
    };
    return classes[estado] || 'bg-gray-600 bg-opacity-20 text-gray-400';
}

function formatEstado(estado) {
    const nombres = {
        pendiente: 'Pendiente',
        en_proceso: 'En Proceso',
        reparado: 'Reparado',
        entregado: 'Entregado',
        cancelado: 'Cancelado'
    };
    return nombres[estado] || estado;
}

function getRolClass(rol) {
    const classes = {
        admin: 'bg-red-600 bg-opacity-20 text-red-400',
        vendedor: 'bg-blue-600 bg-opacity-20 text-blue-400',
        tecnico: 'bg-green-600 bg-opacity-20 text-green-400'
    };
    return classes[rol] || 'bg-gray-600 bg-opacity-20 text-gray-400';
}

function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}