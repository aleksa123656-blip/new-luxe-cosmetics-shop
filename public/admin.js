// Панель администратора
document.addEventListener('DOMContentLoaded', function() {
    loadAdminProducts();
    setupAdminForm();
});

// Показать секцию админ-панели
function showAdminSection(sectionId) {
    // Скрыть все секции
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Убрать активность со всех кнопок
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показать выбранную секцию
    document.getElementById(sectionId + '-section').classList.add('active');
    
    // Активировать кнопку
    event.target.classList.add('active');
}

// Настройка формы добавления товара
function setupAdminForm() {
    document.getElementById('add-product-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const productData = {
            name: formData.get('name'),
            price: formData.get('price'),
            category: formData.get('category'),
            description: formData.get('description'),
            image: formData.get('image')
        };
        
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Товар успешно добавлен!');
                this.reset();
                loadAdminProducts();
            } else {
                alert('Ошибка при добавлении товара');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при добавлении товара');
        }
    });
}

// Загрузка товаров для админ-панели
async function loadAdminProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        
        const container = document.getElementById('admin-products-list');
        container.innerHTML = products.map(product => `
            <div class="product-admin-item">
                <h4>${product.name}</h4>
                <p><strong>Цена:</strong> ${product.price.toLocaleString()} ₽</p>
                <p><strong>Категория:</strong> ${product.category}</p>
                <p><strong>Описание:</strong> ${product.description}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}