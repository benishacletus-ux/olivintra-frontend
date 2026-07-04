// ============================================
// API Configuration
// ============================================

// Your Render backend URL
const API_BASE_URL = 'https://olivintra-backend.onrender.com';

console.log('✅ api.js loaded!');

// ============================================
// Helper Functions
// ============================================

function formatPrice(price) {
    return '₹' + parseFloat(price).toFixed(2);
}

function createProductCard(product) {
    // Use backend URL for images
    const imageUrl = product.image 
        ? `${API_BASE_URL}/static/uploads/${product.image}` 
        : 'https://via.placeholder.com/300x400/cccccc/333333?text=Olivintra';
    
    return `
        <div class="group cursor-pointer">
            <a href="product.html?slug=${product.slug}">
                <div class="bg-white border border-gray-100 aspect-[3/4] mb-2 relative overflow-hidden rounded-lg">
                    <div class="w-full h-full bg-cover bg-center transition-transform group-hover:scale-105"
                         style="background-image: url('${imageUrl}');">
                    </div>
                    ${product.original_price ? `<span class="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded">Sale</span>` : ''}
                    ${!product.in_stock ? `
                    <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span class="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transform -rotate-12 shadow-lg">
                            Out of Stock
                        </span>
                    </div>` : ''}
                </div>
                <h4 class="text-[11px] sm:text-xs font-bold uppercase text-brand-dark tracking-wide truncate">${product.name}</h4>
                <p class="text-[11px] sm:text-xs text-gray-500 font-medium">
                    ${formatPrice(product.price)}
                    ${product.original_price ? `<span class="line-through text-gray-400 ml-1">${formatPrice(product.original_price)}</span>` : ''}
                </p>
                <div class="mt-1">
                    ${product.in_stock ? '<span class="text-[9px] text-green-600 font-medium"><i class="fas fa-check-circle"></i> In Stock</span>' : '<span class="text-[9px] text-red-600 font-medium"><i class="fas fa-times-circle"></i> Out of Stock</span>'}
                </div>
            </a>
        </div>
    `;
}

// ============================================
// API Functions
// ============================================

async function getProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log(`✅ ${data.length} products fetched`);
        return data;
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        return [];
    }
}

async function getProductBySlug(slug) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/product/${slug}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

async function getCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/categories`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// ============================================
// Display Functions
// ============================================

async function displayProducts(containerId, filter = null, limit = null) {
    console.log(`📦 displayProducts: ${containerId}, filter: ${filter || 'none'}`);
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`❌ Container "${containerId}" not found`);
        return;
    }

    container.innerHTML = '<div class="text-center text-gray-500 text-sm py-10 col-span-full">Loading products...</div>';

    const products = await getProducts();
    
    if (products.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 text-sm py-10 col-span-full">No products available.</div>';
        return;
    }

    let filteredProducts = products;
    if (filter === 'new-arrivals') {
        filteredProducts = products.filter(p => p.is_new_arrival === true);
        if (filteredProducts.length === 0) filteredProducts = products;
    } else if (filter === 'best-sellers') {
        filteredProducts = products.filter(p => p.is_best_seller === true);
        if (filteredProducts.length === 0) filteredProducts = products;
    } else if (filter === 'featured') {
        filteredProducts = products.filter(p => p.is_featured === true);
        if (filteredProducts.length === 0) filteredProducts = products;
    }

    if (limit && filteredProducts.length > limit) {
        filteredProducts = filteredProducts.slice(0, limit);
    }

    if (filteredProducts.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-500 text-sm py-10 col-span-full">No products in "${filter || 'all'}" category.</div>`;
        return;
    }

    container.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
    console.log(`✅ Displayed ${filteredProducts.length} products in ${containerId}`);
}

async function displayCategories(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container "${containerId}" not found`);
        return;
    }

    container.innerHTML = '<div class="flex-shrink-0 text-center text-gray-500 text-sm py-10 w-full">Loading categories...</div>';

    const categories = await getCategories();
    
    if (categories.length === 0) {
        container.innerHTML = '<div class="flex-shrink-0 text-center text-gray-500 text-sm py-10 w-full">No categories available.</div>';
        return;
    }

    container.innerHTML = categories.map(category => `
        <a href="shop.html?category=${category.slug}" class="flex flex-col items-center group flex-shrink-0 transition-all duration-300 hover:scale-105">
            <div class="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-300 group-hover:border-brand-accent transition bg-cover bg-center shadow-md hover:shadow-xl"
                 style="background-image: url('${category.image ? `${API_BASE_URL}/static/uploads/${category.image}` : 'https://via.placeholder.com/150'}');">
            </div>
            <span class="text-[10px] sm:text-xs font-semibold tracking-wider text-gray-700 uppercase mt-2 text-center">${category.name}</span>
        </a>
    `).join('');
}
