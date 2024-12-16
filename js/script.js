// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "app-dokan.firebaseapp.com",
    databaseURL: "https://app-dokan-default-rtdb.firebaseio.com",
    projectId: "app-dokan",
    storageBucket: "app-dokan.appspot.com",
    messagingSenderId: "388747703289",
    appId: "1:388747703289:web:162085a1c25790bd954328",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM Elements
const menuContainer = document.querySelector('.menu');
const productContainer = document.querySelector('.products');
const loadingElement = document.getElementById('loading');

// Variables to store product data for later use
let productDataStore = [];

// Function to get product tags and render the menu
async function getProductTags() {
    const dbRef = ref(database);
    loadingElement.style.display = 'block'; // Show loading animation
    try {
        const snapshot = await get(child(dbRef, `product`));
        if (snapshot.exists()) {
            const productData = snapshot.val();
            const tags = Object.keys(productData);

            let allTags = tags;
            renderMenu(['All product', ...allTags]);

            showProducts(allTags);

            menuContainer.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    const selectedTag = e.target.innerText;
                    if (selectedTag === "All product") {
                        showProducts(allTags);
                    } else {
                        showProducts([selectedTag]);
                    }
                    updateMenuSelection(e.target);
                }
            });
        } else {
            console.log("No data available");
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
    } finally {
        loadingElement.style.display = 'none'; // Hide loading animation
    }
}


// Function to render the menu
function renderMenu(tags) {
    menuContainer.innerHTML = '';
    tags.forEach(tag => {
        const button = document.createElement('button');
        button.innerText = tag;
        button.classList.add('menu-button');
        if (tag === "All product") {
            button.classList.add('selected'); // Set "All product" as initially selected
        }
        menuContainer.appendChild(button);
    });
}

// Function to update menu selection
function updateMenuSelection(selectedButton) {
    const menuButtons = document.querySelectorAll('.menu button');
    menuButtons.forEach(button => {
        button.classList.remove('selected');
    });
    selectedButton.classList.add('selected');
}

// Function to show products from Firebase
async function showProducts(tags) {
    productContainer.innerHTML = ''; // Clear current products
    const dbRef = ref(database);
    for (const tag of tags) {
        try {
            const snapshot = await get(child(dbRef, `product/${tag}`));
            if (snapshot.exists()) {
                const products = snapshot.val();
                Object.keys(products).forEach(variant => {
                    const product = products[variant];
                    const image1 = product.images?.image1 || ''; // Get only image1
                    productDataStore.push({
                        title: product.title,
                        price: product.price,
                        stoke: product.stoke,
                        image: image1,
                        subtitle: product.subtitle // Fetch subtitle
                    });
                    renderProduct(
                        product.title,
                        product.price,
                        product.stoke,
                        image1,
                        product.subtitle,
                        productDataStore.length - 1
                    );
                });
            }
        } catch (error) {
            console.error(`Error fetching products for tag: ${tag}`, error);
        }
    }
}

// Function to render a product card
function renderProduct(title, price, stoke, image, subtitle, position) {
    const productContainerDiv = document.createElement('div');
    productContainerDiv.classList.add('product-container');

    productContainerDiv.innerHTML = `
        <div class="product-card">
            <img src="${image}" alt="${title}" onclick="openDetailsPage(${position})">
            <h3>${title}</h3>
            <div class="price-stock">
                <p class="price-text">৳ ${price}</p>
                <p class="stoke-text">Stoke: ${stoke}</p>
            </div>
        </div>
        <button class="product-button" onclick="openDetailsPage(${position})">Buy Now</button>
    `;

    productContainer.appendChild(productContainerDiv);
}

// Function to redirect to view-product.html with subtitle only
window.openDetailsPage = function (position) {
    const product = productDataStore[position];
    const url = `view-product.html?subtitle=${encodeURIComponent(product.subtitle)}`;
    window.location.href = url;
};

// Initialize the menu and product list on page load
getProductTags();
