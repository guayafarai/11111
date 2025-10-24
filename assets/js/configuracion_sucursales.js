// ============ CONFIGURACIÓN ============
async function loadConfiguracion() {
    const res = await fetch('api/configuracion.php');
    const config = await res.json();
    
    const html = `
        <div class="max-w-4xl mx-auto">
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 class="text-2xl font-bold mb-6 flex items-center gap-2">
                    <i class="fas fa-cog text-blue-400"></i>
                    Configuración del Sistema
                </h3>
                
                <form id="configForm" class="space-y-6">
                    <!-- Logo -->
                    <div class="bg-gray-700 rounded-lg p-6">
                        <h4 class="text-lg font-bold mb-4 text-blue-400">Logo de la Empresa</h4>
                        <div class="flex items-center gap-6">
                            <div id="logoPreview" class="w-32 h-32 bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                                ${config.logo_url ? 
                                    `<img src="${config.logo_url}" alt="Logo" class="w-full h-full object-contain">` :
                                    '<i class="fas fa-image text-4xl text-gray-400"></i>'
                                }
                            </div>
                            <div class="flex-1">
                                <input type="file" id="logoFile" accept="image/*" class="hidden">
                                <button type="button" onclick="document.getElementById('logoFile').click()" 
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                                    <i class="fas fa-upload mr-2"></i>Subir Logo
                                </button>
                                <p class="text-sm text-gray-400 mt-2">Formatos: JPG, PNG, GIF. Máximo 2MB</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Datos de la Empresa -->
                    <div class="bg-gray-700 rounded-lg p-6">
                        <h4 class="text-lg font-bold mb-4 text-blue-400">Datos de la Empresa</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-300 text-sm font-medium mb-2">Nombre de la Empresa *</label>
                                <input type="text" id="configNombre" value="${config.nombre_empresa}" required 
                                    class="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-300 text-sm font-medium mb-2">RUC / NIT</label>
                                <input type="text" id="configRuc" value="${config.ruc || ''}" 
                                    class="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-300 text-sm font-medium mb-2">Teléfono</label>
                                <input type="text" id="configTelefono" value="${config.telefono || ''}" 
                                    class="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-300 text-sm font-medium mb-2">Email</label>
                                <input type="email" id="configEmail" value="${config.email || ''}" 
                                    class="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div class="md:col-span-2">
                                <label class="block text-gray-300 text-sm font-medium mb-2">Dirección</label>
                                <textarea id="configDireccion" rows="2" 
                                    class="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">${config.direccion || ''}</textarea>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Configuración Regional -->
                    <div class="bg-gray-700 rounded-lg p-6">
                        <h4 class="text-lg font-bold mb-4 text-blue-400">Configuración Regional</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-gray-300 text-sm font-medium mb-2">Moneda</label>
                                <select id="configMoneda" class="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="PEN" ${config.moneda === 'PEN' ? 'selected' : ''}>Soles Peruanos (PEN)</option>
                                    <option value="USD" ${config.moneda === 'USD' ? 'selected' : ''}>Dólares (USD)</option>
                                    <option value="EUR" ${config.moneda === 'EUR' ? 'selected' : ''}>Euros (EUR)</option>
                                    <option value="MXN" ${config.moneda === 'MXN' ? 'selected' : ''}>Pesos Mexicanos (MXN)</option>
                                    <option value="COP" ${config.moneda === 'COP' ? 'selected' : ''}>Pesos Colombianos (COP)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-gray-300 text-sm font-medium mb-2">Símbolo</label>
                                <input type="text" id="configSimbolo" value="${config.simbolo_moneda}" 
                                    class="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-300 text-sm font-medium mb-2">IGV / IVA (%)</label>
                                <input type="number" step="0.01" id="configIgv" value="${config.igv_porcentaje}" 
                                    class="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Comprobantes -->
                    <div class="bg-gray-700 rounded-lg p-6">
                        <h4 class="text-lg font-bold mb-4 text-blue-400">Comprobantes</h4>
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Tipo de Comprobante por Defecto</label>
                            <select id="configComprobante" class="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="boleta" ${config.tipo_comprobante_default === 'boleta' ? 'selected' : ''}>Boleta de Venta</option>
                                <option value="factura" ${config.tipo_comprobante_default === 'factura' ? 'selected' : ''}>Factura</option>
                                <option value="ticket" ${config.tipo_comprobante_default === 'ticket' ? 'selected' : ''}>Ticket</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Personalización -->
                    <div class="bg-gray-700 rounded-lg p-6">
                        <h4 class="text-lg font-bold mb-4 text-blue-400">Colores Personalizados</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-300 text-sm font-medium mb-2">Color Primario</label>
                                <div class="flex gap-2">
                                    <input type="color" id="configColorPrimario" value="${config.color_primario}" 
                                        class="w-16 h-10 rounded cursor-pointer">
                                    <input type="text" value="${config.color_primario}" readonly
                                        class="flex-1 bg-gray-600 text-white rounded-lg px-4 py-2">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-gray-300 text-sm font-medium mb-2">Color Secundario</label>
                                <div class="flex gap-2">
                                    <input type="color" id="configColorSecundario" value="${config.color_secundario}" 
                                        class="w-16 h-10 rounded cursor-pointer">
                                    <input type="text" value="${config.color_secundario}" readonly
                                        class="flex-1 bg-gray-600 text-white rounded-lg px-4 py-2">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex gap-4">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                            <i class="fas fa-save mr-2"></i>Guardar Configuración
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('contentArea').innerHTML = html;
    
    // Upload logo
    document.getElementById('logoFile').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('logo', file);
        
        const res = await fetch('api/configuracion.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await res.json();
        if (result.success) {
            document.getElementById('logoPreview').innerHTML = 
                `<img src="${result.logo_url}" alt="Logo" class="w-full h-full object-contain">`;
            showNotification('Logo subido exitosamente', 'success');
        } else {
            alert(result.error);
        }
    });
    
    // Update color previews
    document.getElementById('configColorPrimario').addEventListener('input', (e) => {
        e.target.nextElementSibling.value = e.target.value;
    });
    document.getElementById('configColorSecundario').addEventListener('input', (e) => {
        e.target.nextElementSibling.value = e.target.value;
    });
}

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'configForm') {
        e.preventDefault();
        
        const data = {
            nombre_empresa: document.getElementById('configNombre').value,
            ruc: document.getElementById('configRuc').value,
            direccion: document.getElementById('configDireccion').value,
            telefono: document.getElementById('configTelefono').value,
            email: document.getElementById('configEmail').value,
            moneda: document.getElementById('configMoneda').value,
            simbolo_moneda: document.getElementById('configSimbolo').value,
            color_primario: document.getElementById('configColorPrimario').value,
            color_secundario: document.getElementById('configColorSecundario').value,
            igv_porcentaje: document.getElementById('configIgv').value,
            tipo_comprobante_default: document.getElementById('configComprobante').value
        };
        
        const res = await fetch('api/configuracion.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            showNotification('Configuración guardada exitosamente', 'success');
        }
    }
});

// ============ SUCURSALES ============
async function loadSucursales() {
    const res = await fetch('api/sucursales.php');
    const sucursales = await res.json();
    
    const html = `
        <div class="mb-6">
            <button onclick="showSucursalModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                <i class="fas fa-plus mr-2"></i>Nueva Sucursal
            </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${sucursales.map(s => `
                <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
                            <i class="fas fa-store text-xl"></i>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="verStockSucursal(${s.id})" class="text-green-400 hover:text-green-300" title="Ver Stock">
                                <i class="fas fa-boxes"></i>
                            </button>
                            <button onclick='editSucursal(${JSON.stringify(s)})' class="text-blue-400 hover:text-blue-300">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteSucursal(${s.id})" class="text-red-400 hover:text-red-300">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <h3 class="text-lg font-bold text-white mb-1">${s.nombre}</h3>
                    <p class="text-sm text-gray-400 mb-3">${s.codigo}</p>
                    <div class="space-y-2 text-sm text-gray-300">
                        <p><i class="fas fa-map-marker-alt mr-2 text-blue-400"></i>${s.direccion || 'Sin dirección'}</p>
                        <p><i class="fas fa-phone mr-2 text-blue-400"></i>${s.telefono || 'Sin teléfono'}</p>
                        <p><i class="fas fa-user mr-2 text-blue-400"></i>${s.encargado || 'Sin encargado'}</p>
                    </div>
                    <div class="mt-4">
                        <span class="px-3 py-1 rounded-full text-xs ${s.estado ? 'bg-green-600 bg-opacity-20 text-green-400' : 'bg-red-600 bg-opacity-20 text-red-400'}">
                            ${s.estado ? 'Activa' : 'Inactiva'}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${getSucursalModal()}
    `;
    
    document.getElementById('contentArea').innerHTML = html;
}

function getSucursalModal() {
    return `
        <div id="sucursalModal" class="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
            <div class="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-white">
                        <i class="fas fa-store mr-2"></i><span id="modalTitleSucursal">Nueva Sucursal</span>
                    </h3>
                    <button onclick="closeModal('sucursalModal')" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="sucursalForm" class="space-y-4">
                    <input type="hidden" id="sucursalId">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Código *</label>
                            <input type="text" id="sucursalCodigo" required placeholder="SUC001" 
                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Nombre *</label>
                            <input type="text" id="sucursalNombre" required 
                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Dirección</label>
                        <textarea id="sucursalDireccion" rows="2" 
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Teléfono</label>
                            <input type="tel" id="sucursalTelefono" 
                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Email</label>
                            <input type="email" id="sucursalEmail" 
                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Encargado</label>
                            <input type="text" id="sucursalEncargado" 
                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 text-sm font-medium mb-2">Estado</label>
                            <select id="sucursalEstado" 
                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="1">Activa</option>
                                <option value="0">Inactiva</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="flex gap-4 pt-4">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                            <i class="fas fa-save mr-2"></i>Guardar
                        </button>
                        <button type="button" onclick="closeModal('sucursalModal')" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function showSucursalModal(sucursal = null) {
    document.getElementById('sucursalModal').classList.add('active');
    document.getElementById('sucursalForm').reset();
    
    if (sucursal) {
        document.getElementById('modalTitleSucursal').textContent = 'Editar Sucursal';
        document.getElementById('sucursalId').value = sucursal.id;
        document.getElementById('sucursalCodigo').value = sucursal.codigo;
        document.getElementById('sucursalNombre').value = sucursal.nombre;
        document.getElementById('sucursalDireccion').value = sucursal.direccion || '';
        document.getElementById('sucursalTelefono').value = sucursal.telefono || '';
        document.getElementById('sucursalEmail').value = sucursal.email || '';
        document.getElementById('sucursalEncargado').value = sucursal.encargado || '';
        document.getElementById('sucursalEstado').value = sucursal.estado;
    } else {
        document.getElementById('modalTitleSucursal').textContent = 'Nueva Sucursal';
    }
}

function editSucursal(sucursal) {
    showSucursalModal(sucursal);
}

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'sucursalForm') {
        e.preventDefault();
        
        const id = document.getElementById('sucursalId').value;
        const data = {
            id: id || undefined,
            codigo: document.getElementById('sucursalCodigo').value,
            nombre: document.getElementById('sucursalNombre').value,
            direccion: document.getElementById('sucursalDireccion').value,
            telefono: document.getElementById('sucursalTelefono').value,
            email: document.getElementById('sucursalEmail').value,
            encargado: document.getElementById('sucursalEncargado').value,
            estado: document.getElementById('sucursalEstado').value
        };
        
        const method = id ? 'PUT' : 'POST';
        const res = await fetch('api/sucursales.php', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            closeModal('sucursalModal');
            loadSucursales();
            showNotification('Sucursal guardada exitosamente', 'success');
        }
    }
});

async function deleteSucursal(id) {
    if (!confirm('¿Estás seguro de eliminar esta sucursal?')) return;
    
    const res = await fetch(`api/sucursales.php?id=${id}`, { method: 'DELETE' });
    const result = await res.json();
    
    if (result.error) {
        alert(result.error);
    } else {
        loadSucursales();
        showNotification('Sucursal eliminada', 'success');
    }
}

// ============ STOCK POR SUCURSAL ============
async function verStockSucursal(sucursalId) {
    const [resSucursal, resStock] = await Promise.all([
        fetch(`api/sucursales.php?id=${sucursalId}`),
        fetch(`api/stock_sucursales.php?sucursal_id=${sucursalId}`)
    ]);
    
    const sucursal = await resSucursal.json();
    const stock = await resStock.json();
    
    const html = `
        <div class="mb-6">
            <button onclick="loadSucursales()" class="text-blue-400 hover:text-blue-300 mb-4">
                <i class="fas fa-arrow-left mr-2"></i>Volver a Sucursales
            </button>
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 class="text-2xl font-bold text-white">${sucursal.nombre}</h3>
                    <p class="text-gray-400">${sucursal.codigo}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="showAsignarStockModal(${sucursalId})" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>Asignar Stock
                    </button>
                    <button onclick="showTransferenciaModal(${sucursalId})" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                        <i class="fas fa-exchange-alt mr-2"></i>Transferir
                    </button>
                </div>
            </div>
        </div>
        
        <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Código</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Producto</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cantidad</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Precio</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-700">
                        ${stock.length > 0 ? stock.map(s => `
                            <tr class="hover:bg-gray-700">
                                <td class="px-6 py-4 text-sm text-gray-300">${s.codigo}</td>
                                <td class="px-6 py-4 text-sm text-white">${s.producto_nombre}</td>
                                <td class="px-6 py-4 text-sm ${s.cantidad <= 5 ? 'text-red-400 font-bold' : 'text-gray-300'}">${s.cantidad}</td>
                                <td class="px-6 py-4 text-sm text-green-400">S/ ${parseFloat(s.precio_venta).toFixed(2)}</td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="4" class="px-6 py-8 text-center text-gray-400">
                                    <i class="fas fa-box-open text-4xl mb-2"></i>
                                    <p>No hay stock asignado a esta sucursal</p>
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
        
        ${getAsignarStockModal()}
        ${getTransferenciaModal()}
    `;
    
    document.getElementById('contentArea').innerHTML = html;
}

function getAsignarStockModal() {
    return `
        <div id="asignarStockModal" class="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
            <div class="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-white">
                        <i class="fas fa-box mr-2"></i>Asignar Stock
                    </h3>
                    <button onclick="closeModal('asignarStockModal')" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="asignarStockForm" class="space-y-4">
                    <input type="hidden" id="asignarSucursalId">
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Producto *</label>
                        <select id="asignarProductoId" required 
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Seleccionar producto...</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Cantidad *</label>
                        <input type="number" id="asignarCantidad" required min="1" 
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Observaciones</label>
                        <textarea id="asignarObservaciones" rows="2" 
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    
                    <div class="flex gap-4">
                        <button type="submit" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg">
                            <i class="fas fa-check mr-2"></i>Asignar
                        </button>
                        <button type="button" onclick="closeModal('asignarStockModal')" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function getTransferenciaModal() {
    return `
        <div id="transferenciaModal" class="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
            <div class="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-white">
                        <i class="fas fa-exchange-alt mr-2"></i>Transferir Stock
                    </h3>
                    <button onclick="closeModal('transferenciaModal')" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="transferenciaForm" class="space-y-4">
                    <input type="hidden" id="transferenciaOrigenId">
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Sucursal Destino *</label>
                        <select id="transferenciaDestinoId" required 
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Seleccionar sucursal...</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Producto *</label>
                        <select id="transferenciaProductoId" required 
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Seleccionar producto...</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Cantidad *</label>
                        <input type="number" id="transferenciaCantidad" required min="1" 
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <p id="stockDisponible" class="text-sm text-gray-400 mt-1"></p>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-medium mb-2">Observaciones</label>
                        <textarea id="transferenciaObservaciones" rows="2" 
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    
                    <div class="flex gap-4">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                            <i class="fas fa-exchange-alt mr-2"></i>Transferir
                        </button>
                        <button type="button" onclick="closeModal('transferenciaModal')" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

async function showAsignarStockModal(sucursalId) {
    document.getElementById('asignarStockModal').classList.add('active');
    document.getElementById('asignarSucursalId').value = sucursalId;
    
    // Cargar productos
    const res = await fetch('api/productos.php');
    const productos = await res.json();
    
    const select = document.getElementById('asignarProductoId');
    select.innerHTML = '<option value="">Seleccionar producto...</option>' + 
        productos.map(p => `<option value="${p.id}">${p.nombre} (${p.codigo})</option>`).join('');
}

async function showTransferenciaModal(sucursalIdOrigen) {
    document.getElementById('transferenciaModal').classList.add('active');
    document.getElementById('transferenciaOrigenId').value = sucursalIdOrigen;
    
    // Cargar sucursales (excepto la origen)
    const resSucursales = await fetch('api/sucursales.php');
    const sucursales = await resSucursales.json();
    
    const selectSucursal = document.getElementById('transferenciaDestinoId');
    selectSucursal.innerHTML = '<option value="">Seleccionar sucursal...</option>' + 
        sucursales.filter(s => s.id != sucursalIdOrigen && s.estado).map(s => 
            `<option value="${s.id}">${s.nombre}</option>`
        ).join('');
    
    // Cargar productos con stock en esta sucursal
    const resStock = await fetch(`api/stock_sucursales.php?sucursal_id=${sucursalIdOrigen}`);
    const stock = await resStock.json();
    
    const selectProducto = document.getElementById('transferenciaProductoId');
    selectProducto.innerHTML = '<option value="">Seleccionar producto...</option>' + 
        stock.filter(s => s.cantidad > 0).map(s => 
            `<option value="${s.producto_id}" data-stock="${s.cantidad}">${s.producto_nombre} (Stock: ${s.cantidad})</option>`
        ).join('');
    
    // Mostrar stock disponible
    selectProducto.addEventListener('change', (e) => {
        const option = e.target.selectedOptions[0];
        if (option && option.dataset.stock) {
            document.getElementById('stockDisponible').textContent = 
                `Stock disponible: ${option.dataset.stock} unidades`;
        }
    });
}

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'asignarStockForm') {
        e.preventDefault();
        
        const data = {
            sucursal_id: document.getElementById('asignarSucursalId').value,
            producto_id: document.getElementById('asignarProductoId').value,
            cantidad: parseInt(document.getElementById('asignarCantidad').value),
            observaciones: document.getElementById('asignarObservaciones').value
        };
        
        const res = await fetch('api/stock_sucursales.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await res.json();
        if (result.success) {
            closeModal('asignarStockModal');
            verStockSucursal(data.sucursal_id);
            showNotification('Stock asignado exitosamente', 'success');
        } else {
            alert(result.error);
        }
    }
    
    if (e.target.id === 'transferenciaForm') {
        e.preventDefault();
        
        const data = {
            tipo: 'transferencia',
            sucursal_origen_id: parseInt(document.getElementById('transferenciaOrigenId').value),
            sucursal_destino_id: parseInt(document.getElementById('transferenciaDestinoId').value),
            producto_id: parseInt(document.getElementById('transferenciaProductoId').value),
            cantidad: parseInt(document.getElementById('transferenciaCantidad').value),
            observaciones: document.getElementById('transferenciaObservaciones').value
        };
        
        const res = await fetch('api/stock_sucursales.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await res.json();
        if (result.success) {
            closeModal('transferenciaModal');
            verStockSucursal(data.sucursal_origen_id);
            showNotification('Transferencia realizada exitosamente', 'success');
        } else {
            alert(result.error);
        }
    }
});
