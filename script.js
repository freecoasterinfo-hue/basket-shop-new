// Структура категорий для BASKET
const categories = {
    main: [
        { id: "new", name: "NEW", hasSubcategories: true },
        { id: "clothing", name: "👕 Одежда", hasSubcategories: true },
        { id: "shoes", name: "👟 Обувь", hasSubcategories: true },
        { id: "accessories", name: "Аксессуары", hasSubcategories: true },
        { id: "sale", name: "SALE", hasSubcategories: false }
    ],
    
    subcategories: {
        new: [
            { id: "new_men", name: "Мужское" },
            { id: "new_women", name: "Женское" }
        ],
        clothing: [
            { id: "clothing_men", name: "Мужское" },
            { id: "clothing_women", name: "Женское" }
        ],
        shoes: [
            { id: "shoes_men", name: "Мужская обувь" },
            { id: "shoes_women", name: "Женская обувь" }
        ],
        accessories: [
            { id: "socks", name: "Носки" },
            { id: "bags", name: "Сумки" },
            { id: "backpacks", name: "Рюкзаки" },
            { id: "caps", name: "Кепки" },
            { id: "hats", name: "Шапки" },
            { id: "belts", name: "Ремни" }
        ]
    },
    
    productGroups: {
        clothing_men: [
            "Куртки", "Худи/Толстовки", "Брюки", "Джинсы", "Футболки", "Лонгслив", "Шорты"
        ],
        clothing_women: [
            "Куртки", "Худи/Толстовки", "Брюки", "Джинсы", "Футболки", "Лонгслив", 
            "Шорты", "Топы", "Костюмы"
        ]
    }
};

// Базовые товары (используются только при первом запуске)
const defaultProducts = [
    {
        id: 1,
        name: "Куртка кожаная черная",
        price: 12990,
        category: "clothing_men",
        group: "Куртки",
        image: "https://via.placeholder.com/300x300/4a5568/ffffff?text=Leather+Jacket",
        description: "Кожаная куртка премиум-класса"
    },
    {
        id: 2,
        name: "Куртка джинсовая",
        price: 7990,
        category: "clothing_men", 
        group: "Куртки",
        image: "https://via.placeholder.com/300x300/718096/ffffff?text=Denim+Jacket",
        description: "Стильная джинсовая куртка"
    },
    {
        id: 3,
        name: "Куртка утепленная",
        price: 14990,
        category: "clothing_men",
        group: "Куртки",
        image: "https://via.placeholder.com/300x300/2d3748/ffffff?text=Winter+Jacket",
        description: "Теплая куртка для зимы"
    },
    {
        id: 4,
        name: "Куртка ветровка",
        price: 5990,
        category: "clothing_women",
        group: "Куртки", 
        image: "https://via.placeholder.com/300x300/ed8936/ffffff?text=Windbreaker",
        description: "Легкая ветровка"
    },
    {
        id: 5,
        name: "Куртка косуха",
        price: 11990,
        category: "clothing_women",
        group: "Куртки",
        image: "https://via.placeholder.com/300x300/9f7aea/ffffff?text=Biker+Jacket",
        description: "Стильная косуха"
    },
    {
        id: 6,
        name: "Куртка парка",
        price: 16990,
        category: "new_men",
        group: "Куртки",
        image: "https://via.placeholder.com/300x300/ed64a6/ffffff?text=Parka",
        description: "Новая модель парки"
    }
];

// Основной массив товаров (будет загружаться из localStorage)
let products = [];

// Переменные состояния
let cart = [];
let currentMainCategory = null;
let currentSubcategory = null;
let currentProductGroup = null;

// Инициализация приложения
function initApp() {
    console.log("BASKET магазин запущен! ПРИНУДИТЕЛЬНЫЙ СБРОС");
    
    // ПРИНУДИТЕЛЬНЫЙ СБРОС СТАРЫХ ДАННЫХ
    if (window.Telegram && Telegram.WebApp) {
        const resetKey = 'telegram_reset_done';
        if (!localStorage.getItem(resetKey)) {
            localStorage.removeItem('basket_products');
            localStorage.removeItem('cart');
            localStorage.setItem(resetKey, 'true');
            console.log('🔥 Принудительный сброс данных для Telegram');
        }
    }
    
    loadProductsFromStorage();
    renderMainCategories();
    renderProducts(products.filter(p => p.group === "Куртки"));
    loadCartFromStorage();
    setupEventListeners();
    
    // Показываем сообщение о сбросе
    setTimeout(() => {
        showNotification('Данные сброшены! Товары обновлены. 🔄');
    }, 1000);
}
// Загрузка товаров из localStorage
function loadProductsFromStorage() {
    const savedProducts = localStorage.getItem('basket_products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
        console.log("Загружены товары из localStorage:", products.length);
    } else {
        // Первый запуск - используем базовые товары
        products = [...defaultProducts];
        saveProductsToStorage();
        console.log("Использованы базовые товары");
    }
}

// Сохранение товаров в localStorage
function saveProductsToStorage() {
    localStorage.setItem('basket_products', JSON.stringify(products));
    console.log("Товары сохранены в localStorage");
}

// Рендер основных категорий
function renderMainCategories() {
    const categoriesContainer = document.getElementById('main-categories');
    categoriesContainer.innerHTML = categories.main.map(category => `
        <button class="main-category-btn ${category.id === 'sale' ? 'sale' : ''}" 
                onclick="selectMainCategory('${category.id}')">
            ${category.name}
        </button>
    `).join('');
}

// Рендер подкатегорий
function renderSubcategories(mainCategoryId) {
    const subcategoriesContainer = document.getElementById('subcategories');
    const subcats = categories.subcategories[mainCategoryId];
    
    if (subcats && subcats.length > 0) {
        subcategoriesContainer.innerHTML = subcats.map(subcat => `
            <button class="subcategory-btn" onclick="selectSubcategory('${subcat.id}')">
                ${subcat.name}
            </button>
        `).join('');
        subcategoriesContainer.style.display = 'flex';
    } else {
        subcategoriesContainer.style.display = 'none';
    }
    
    document.getElementById('product-groups').style.display = 'none';
    currentSubcategory = null;
    currentProductGroup = null;
}

// Рендер товарных групп
function renderProductGroups(subcategoryId) {
    const groupsContainer = document.getElementById('product-groups');
    const groups = categories.productGroups[subcategoryId];
    
    if (groups && groups.length > 0) {
        groupsContainer.innerHTML = groups.map(group => `
            <button class="product-group-btn" onclick="selectProductGroup('${group}')">
                ${group}
            </button>
        `).join('');
        groupsContainer.style.display = 'flex';
    } else {
        groupsContainer.style.display = 'none';
    }
    
    currentProductGroup = null;
}

// Выбор основной категории
function selectMainCategory(categoryId) {
    currentMainCategory = categoryId;
    currentSubcategory = null;
    currentProductGroup = null;
    
    renderMainCategories();
    renderSubcategories(categoryId);
    
    if (categoryId === 'sale') {
        const saleProducts = products.filter(p => p.category === 'sale');
        renderProducts(saleProducts);
    } else {
        document.getElementById('products').innerHTML = '<div class="no-products">Выберите подкатегорию</div>';
    }
}

// Выбор подкатегории
function selectSubcategory(subcategoryId) {
    currentSubcategory = subcategoryId;
    currentProductGroup = null;
    
    renderProductGroups(subcategoryId);
    
    const subcategoryProducts = products.filter(p => p.category === subcategoryId && p.group === "Куртки");
    renderProducts(subcategoryProducts);
}

// Выбор товарной группы
function selectProductGroup(group) {
    currentProductGroup = group;
    
    const groupProducts = products.filter(p => p.category === currentSubcategory && p.group === group);
    renderProducts(groupProducts);
}

// Рендер товаров
function renderProducts(productsToRender) {
    const productsContainer = document.getElementById('products');
    
    if (productsToRender.length === 0) {
        productsContainer.innerHTML = '<div class="no-products">Товары не найдены</div>';
        return;
    }

    productsContainer.innerHTML = productsToRender.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-category">${product.group}</div>
            <div class="product-title">${product.name}</div>
            <div class="product-description">${product.description}</div>
            <div class="product-price">
                ${formatPrice(product.price)} руб.
            </div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                🛒 Добавить в корзину
            </button>
        </div>
    `).join('');
}

// Форматирование цены
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Работа с корзиной
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`"${product.name}" добавлен в корзину! ✅`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
        }
    }
}

function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartModal();
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

function updateCartModal() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('total-price').textContent = formatPrice(totalPrice);
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-category">${item.group}</div>
                <div class="cart-item-price">${formatPrice(item.price)} руб. × ${item.quantity}</div>
            </div>
            <div class="cart-item-actions">
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                <span style="margin: 0 10px; font-weight: bold;">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Удалить</button>
            </div>
        </div>
    `).join('');
}

// Управление модальным окном корзины
function openCart() {
    document.getElementById('cart-modal').style.display = 'block';
}

function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста! ❌');
        return;
    }
    
    const orderData = {
        products: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: new Date().toISOString(),
        store: "BASKET"
    };
    
    console.log('Заказ BASKET:', orderData);
    
    showNotification('Заказ оформлен! ✅ С вами свяжется менеджер BASKET.');
    
    cart = [];
    updateCart();
    closeCart();
}

// Уведомления
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Настройка обработчиков событий
function setupEventListeners() {
    document.getElementById('cart-btn').addEventListener('click', openCart);
    document.getElementById('close-cart').addEventListener('click', closeCart);
    
    document.getElementById('cart-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCart();
        }
    });
}

// АДМИНКА С СОХРАНЕНИЕМ ИЗМЕНЕНИЙ И ОБНОВЛЕНИЕМ
function openSimpleAdmin() {
    const password = prompt('🔐 Введите пароль админа:');
    
    if (password === 'basket123') {
        // Показываем расширенное меню
        const action = prompt('Выберите действие:\n1 - Добавить товар\n2 - Редактировать товар\n3 - Удалить товар\n4 - Просмотреть все товары\n5 - 🔄 ОБНОВИТЬ КЭШ (для Telegram)');
        
        if (action === '1') {
            addNewProduct();
        } else if (action === '2') {
            editProduct();
        } else if (action === '3') {
            deleteProduct();
        } else if (action === '4') {
            viewAllProducts();
        } else if (action === '5') {
            clearTelegramCache();
        } else {
            showNotification('Действие отменено');
        }
    } else if (password !== null) {
        showNotification('Неверный пароль! ❌');
    }
}

// Функция очистки кэша Telegram
function clearTelegramCache() {
    if (confirm('Это принудительно обновит кэш в Telegram. Продолжить?')) {
        // Добавляем параметр версии к URL
        const newUrl = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'v=' + Date.now();
        window.location.href = newUrl;
    }
}

// Добавление нового товара
function addNewProduct() {
    const productName = prompt('Введите название товара:');
    if (!productName) return;
    
    const productPrice = prompt('Введите цену товара:');
    if (!productPrice) return;
    
    const productCategory = prompt('Введите категорию (clothing_men, clothing_women, shoes_men, shoes_women, socks, bags, backpacks, caps, hats, belts, sale):');
    if (!productCategory) return;
    
    const productGroup = prompt('Введите группу (Куртки, Футболки, Брюки, Джинсы, Худи/Толстовки, Лонгслив, Шорты, Топы, Костюмы, Кроссовки, Кеды, Носки, Сумки, Рюкзаки, Кепки, Шапки, Ремни):');
    if (!productGroup) return;
    
    const productDescription = prompt('Введите описание:') || '';
    const productImage = prompt('Введите URL изображения (или оставьте пустым для авто-генерации):') || '';

    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: productName,
        price: parseInt(productPrice),
        category: productCategory,
        group: productGroup,
        image: productImage || `https://via.placeholder.com/300x300/4a5568/ffffff?text=${encodeURIComponent(productName.substring(0, 20))}`,
        description: productDescription
    };
    
    products.push(newProduct);
    saveProductsToStorage(); // Сохраняем изменения
    renderProducts(products.filter(p => p.group === "Куртки"));
    showNotification('Товар добавлен! ✅');
}

// Редактирование товара
function editProduct() {
    if (products.length === 0) {
        alert('Нет товаров для редактирования!');
        return;
    }
    
    // Показываем список товаров
    let productList = 'Выберите товар для редактирования:\n\n';
    products.forEach((product, index) => {
        productList += `${index + 1}. ${product.name} - ${product.price} руб. (${product.group})\n`;
    });
    
    const productIndex = prompt(productList);
    const index = parseInt(productIndex) - 1;
    
    if (index >= 0 && index < products.length) {
        const product = products[index];
        
        // Запрашиваем новые данные
        const newName = prompt('Новое название товара:', product.name) || product.name;
        const newPrice = prompt('Новая цена:', product.price) || product.price;
        const newCategory = prompt('Новая категория:', product.category) || product.category;
        const newGroup = prompt('Новая группа:', product.group) || product.group;
        const newDescription = prompt('Новое описание:', product.description) || product.description;
        const newImage = prompt('Новый URL изображения:', product.image) || product.image;
        
        // Обновляем товар
        products[index] = {
            ...product,
            name: newName,
            price: parseInt(newPrice),
            category: newCategory,
            group: newGroup,
            description: newDescription,
            image: newImage
        };
        
        saveProductsToStorage(); // Сохраняем изменения
        renderProducts(products.filter(p => p.group === "Куртки"));
        showNotification('Товар обновлен! ✏️');
    } else if (productIndex !== null) {
        showNotification('Неверный номер товара! ❌');
    }
}

// Удаление товара
function deleteProduct() {
    if (products.length === 0) {
        alert('Нет товаров для удаления!');
        return;
    }
    
    // Показываем список товаров
    let productList = 'Выберите товар для удаления:\n\n';
    products.forEach((product, index) => {
        productList += `${index + 1}. ${product.name} - ${product.price} руб.\n`;
    });
    
    const productIndex = prompt(productList);
    const index = parseInt(productIndex) - 1;
    
    if (index >= 0 && index < products.length) {
        const productName = products[index].name;
        if (confirm(`Удалить товар "${productName}"?`)) {
            products.splice(index, 1);
            saveProductsToStorage(); // Сохраняем изменения
            renderProducts(products.filter(p => p.group === "Куртки"));
            showNotification('Товар удален! 🗑️');
        }
    } else if (productIndex !== null) {
        showNotification('Неверный номер товара! ❌');
    }
}

// Просмотр всех товаров
function viewAllProducts() {
    if (products.length === 0) {
        alert('Нет товаров для просмотра!');
        return;
    }
    
    let productList = 'Все товары в магазине:\n\n';
    products.forEach((product, index) => {
        productList += `${index + 1}. ${product.name} - ${product.price} руб. (${product.category}, ${product.group})\n`;
    });
    
    alert(productList);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initApp);