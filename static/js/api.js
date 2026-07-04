// ============================================
// API Configuration
// ============================================

// Your Render backend URL
const API_BASE_URL = 'https://olivintra-backend.onrender.com';

// ============================================
// Helper Functions
// ============================================

// Format price in Indian Rupees
function formatPrice(price) {
    return '₹' + parseFloat(price).toFixed(2);
}

// Create a product card HTML
function createProductCard(product) {
    const imageUrl = product.image 
        ? `static/uploads/${product.image}` 
        : 'static/images/placeholder.jpg';
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <a href="product.html?slug=${product.slug}">
                <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                <h3>${product.name}</h3>
                <p class="price">${formatPrice(product.price)}</p>
                ${product.original_price ? `<p class="original-price">${formatPrice(product.original_price)}</p>` : ''}
                ${product.in_stock ? '<span class="in-stock">In Stock</span>' : '<span class="out-of-stock">Out of Stock</span>'}
            </a>
        </div>
    `;
}

// ============================================
// API Functions
// ============================================

// Fetch all products
async function getProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Fetch a single product by slug
async function getProductBySlug(slug) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/product/${slug}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

// Fetch categories
async function getCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/categories`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// ============================================
// Display Functions
// ============================================

// Display products in a container
async function displayProducts(containerId, filter = null, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container with ID "${containerId}" not found`);
        return;
    }

    // Show loading state
    container.innerHTML = '<div class="loading">Loading products...</div>';

    const products = await getProducts();
    
    if (products.length === 0) {
        container.innerHTML = '<div class="no-products">No products available.</div>';
        return;
    }

    // Filter products if needed
    let filteredProducts = products;
    if (filter === 'new-arrivals') {
        filteredProducts = products.filter(p => p.is_new_arrival);
    } else if (filter === 'best-sellers') {
        filteredProducts = products.filter(p => p.is_best_seller);
    } else if (filter === 'featured') {
        filteredProducts = products.filter(p => p.is_featured);
    }

    // Limit the number of products
    if (limit && filteredProducts.length > limit) {
        filteredProducts = filteredProducts.slice(0, limit);
    }

    // Generate HTML for each product
    container.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
}

// Display categories
async function displayCategories(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container with ID "${containerId}" not found`);
        return;
    }

    // Show loading state
    container.innerHTML = '<div class="loading">Loading categories...</div>';

    const categories = await getCategories();
    
    if (categories.length === 0) {
        container.innerHTML = '<div class="no-categories">No categories available.</div>';
        return;
    }

    container.innerHTML = categories.map(category => `
        <div class="category-card group flex flex-col items-center flex-shrink-0 transition-all duration-300 hover:scale-105">
            <a href="shop.html?category=${category.slug}" class="flex flex-col items-center">
                <div class="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-300 group-hover:border-brand-accent transition bg-cover bg-center shadow-md hover:shadow-xl"
                     style="background-image: url('${category.image ? `static/uploads/${category.image}` : 'https://via.placeholder.com/150'}');">
                </div>
                <span class="text-[10px] sm:text-xs font-semibold tracking-wider text-gray-700 uppercase mt-2 text-center">${category.name}</span>
            </a>
        </div>
    `).join('');
}

// ============================================
// Initialize when page loads
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Display products in different sections
    displayProducts('new-arrivals-container', 'new-arrivals', 6);
    displayProducts('best-sellers-container', 'best-sellers', 6);
    displayProducts('featured-products-container', 'featured', 6);
    displayProducts('all-products-container', null, 12);
});
