const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Добавляем CORS для Telegram
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Данные магазина
let products = [
    {
        id: 1,
        name: "Крем La Mer",
        price: 42500,
        category: "Уход за кожей",
        image: "https://via.placeholder.com/300x300/667eea/white?text=La+Mer",
        description: "Легендарный крем для лица с целебными свойствами"
    },
    {
        id: 2,
        name: "Помада Chanel",
        price: 4200,
        category: "Макияж", 
        image: "https://via.placeholder.com/300x300/e74c3c/white?text=Chanel",
        description: "Стойкая помада премиум-класса"
    },
    {
        id: 3,
        name: "Сыворотка La Prairie",
        price: 68000,
        category: "Уход за кожей",
        image: "https://via.placeholder.com/300x300/27ae60/white?text=La+Prairie",
        description: "Инновационная антивозрастная сыворотка"
    }
];

let cart = [];
let categories = ["Уход за кожей", "Макияж", "Парфюмерия", "Волосы"];

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Страница администратора
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API: Получить все товары
app.get('/api/products', (req, res) => {
    res.json(products);
});

// API: Получить категории
app.get('/api/categories', (req, res) => {
    res.json(categories);
});

// API: Добавить товар (админ)
app.post('/api/products', (req, res) => {
    const { name, price, category, description, image } = req.body;
    
    const newProduct = {
        id: products.length + 1,
        name,
        price: parseInt(price),
        category,
        description,
        image: image || `https://via.placeholder.com/300x300/3498db/white?text=${encodeURIComponent(name)}`
    };
    
    products.push(newProduct);
    res.json({ success: true, product: newProduct });
});

// API: Добавить в корзину
app.post('/api/cart/add', (req, res) => {
    const { productId } = req.body;
    const product = products.find(p => p.id == productId);
    
    if (product) {
        const existingItem = cart.find(item => item.productId == productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        }
        res.json({ 
            success: true, 
            cartCount: cart.reduce((sum, item) => sum + item.quantity, 0) 
        });
    } else {
        res.status(404).json({ success: false, error: 'Товар не найден' });
    }
});

// API: Получить корзину
app.get('/api/cart', (req, res) => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.json({ 
        items: cart, 
        total,
        cartCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    });
});

// API: Очистить корзину
app.delete('/api/cart/clear', (req, res) => {
    cart = [];
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🛍️ Магазин Luxe Cosmetics запущен!`);
    console.log(`📍 Ссылка: http://localhost:${PORT}`);
    console.log(`👑 Админ-панель: http://localhost:${PORT}/admin`);
});