// Глобальные переменные
let allProducts = [];
let currentCategory = 'all';
let currentSearch = '';

// Загрузка при старте
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
});

function setupEventListeners() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            filterProducts();
        });
    });

    document.getElementById('search-input').addEventListener('input', function(e) {
        currentSearch = e.target.value.toLowerCase();
        filterProducts();
    });
}

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        allProducts = await response.json();
        displayProducts(allProducts);
        updateCartCount();
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    
    if (products.length === 0) {
        container.innerHTML = '<div class="no-products">Товары не найдены</div>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image" style="background-image: url('${product.image}')">
                ${!product.image.includes('http') ? '🛍️' : ''}
            </div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">${product.price.toLocaleString()} ₽</div>
            <div class="product-description">${product.description}</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                В корзину
            </button>
        </div>
    `).join('');
}

function filterProducts() {
    let filtered = allProducts;

    if (currentCategory !== 'all') {
        filtered = filtered.filter(product => product.category === currentCategory);
    }

    if (currentSearch) {
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(currentSearch) ||
            product.description.toLowerCase().includes(currentSearch)
        );
    }

    displayProducts(filtered);
}

async function addToCart(productId) {
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId })
        });
        
        const result = await response.json();
        if (result.success) {
            updateCartCount(result.cartCount);
            showNotification('Товар добавлен в корзину!');
        }
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
    }
}

async function updateCartCount() {
    try {
        const response = await fetch('/api/cart');
        const cartData = await response.json();
        document.getElementById('cart-count').textContent = cartData.cartCount;
    } catch (error) {
        console.error('Ошибка обновления корзины:', error);
    }
}

async function openCartModal() {
    try {
        const response = await fetch('/api/cart');
        const cartData = await response.json();
        
        const cartItems = document.getElementById('cart-items');
        const totalPrice = document.getElementById('cart-total-price');
        
        if (cartData.items.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        } else {
            cartItems.innerHTML = cartData.items.map(item => `
                <div class="cart-item">
                    <strong>${item.name}</strong>
                    <div>${item.price.toLocaleString()} ₽ × ${item.quantity}</div>
                    <div>${(item.price * item.quantity).toLocaleString()} ₽</div>
                </div>
            `).join('');
        }
        
        totalPrice.textContent = cartData.total.toLocaleString();
        document.getElementById('cart-modal').style.display = 'block';
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
    }
}

function closeCartModal() {
    document.getElementById('cart-modal').style.display = 'none';
}

async function clearCart() {
    try {
        const response = await fetch('/api/cart/clear', { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
            updateCartCount();
            closeCartModal();
            showNotification('Корзина очищена');
        }
    } catch (error) {
        console.error('Ошибка очистки корзины:', error);
    }
}

function checkout() {
    const cartCount = parseInt(document.getElementById('cart-count').textContent);
    
    if (cartCount === 0) {
        alert('Корзина пуста!');
        return;
    }
    
    alert(`Заказ оформлен! Товаров: ${cartCount}\n\nС вами свяжется наш менеджер для подтверждения заказа.`);
    clearCart();
    closeCartModal();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 3000;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

window.onclick = function(event) {
    const modal = document.getElementById('cart-modal');
    if (event.target === modal) {
        closeCartModal();
    }
}