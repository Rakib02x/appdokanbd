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
const sliderContainer = document.querySelector('.slider-container');

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

    // Fetch notifications and slider images after loading products
    await getNotificationData();
    await getSliderImages();
}

// Function to get notification data
async function getNotificationData() {
    const dbRef = ref(database);
    try {
        const snapshot = await get(child(dbRef, 'notification'));
        if (snapshot.exists()) {
            const notificationData = snapshot.val();
            const sms = notificationData.sms; // Get the SMS value
            updateScrollingText(sms); // Update the scrolling text
        } else {
            console.log("No notification data available");
        }
    } catch (error) {
        console.error("Error fetching notification data: ", error);
    }
}

// Function to get slider images from Firebase
async function getSliderImages() {
    const sliderContainer = document.querySelector(".slider-container");
    const dotsContainer = document.querySelector(".slider-dots");
    let currentIndex = 0;

    const dbRef = ref(database);

    try {
        const snapshot = await get(child(dbRef, 'slider')); // Adjust path if needed
        if (snapshot.exists()) {
            const sliderData = snapshot.val();
            const images = Object.values(sliderData);

            setupSlider(images);
        } else {
            console.log("No slider data available");
        }
    } catch (error) {
        console.error("Error fetching slider data: ", error);
    }

    // Function to set up the slider
    function setupSlider(images) {
        sliderContainer.innerHTML = "";
        dotsContainer.innerHTML = "";

        // Create image elements and dots
        images.forEach((item, index) => {
            const imgElement = document.createElement("img");
            imgElement.src = item.image; // Ensure your Firebase data has 'image' and 'link' fields
            imgElement.alt = `Slide ${index + 1}`;
            imgElement.onclick = () => window.open(item.link, "_blank");
            sliderContainer.appendChild(imgElement);

            const dot = document.createElement("span");
            dot.classList.add("slider-dot");
            if (index === 0) dot.classList.add("active");
            dot.addEventListener("click", () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        // Start auto-sliding
        setInterval(() => {
            goToSlide((currentIndex + 1) % images.length);
        }, 5000);
    }

    // Function to go to a specific slide
    function goToSlide(index) {
        currentIndex = index;
        const slideWidth = sliderContainer.children[0].clientWidth;
        sliderContainer.style.transform = `translateX(-${index * slideWidth}px)`;

        // Update dots
        document.querySelectorAll(".slider-dot").forEach((dot, i) => {
            dot.classList.toggle("active", i === index);
        });
    }
}

// Function to update the scrolling text container
function updateScrollingText(sms) {
    const scrollingTextContainer = document.querySelector('.scrolling-text');
    scrollingTextContainer.innerText = sms; // Set the SMS text in the scrolling container
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
                    const image1 = product.images ? product.images.image1 : ''; // Only get image1
                    const subtitle = product.subtitle || ''; // Handle subtitle only

                    productDataStore.push({
                        title: product.title,
                        price: product.price,
                        stoke: product.stoke,
                        images: image1,
                        subtitle: subtitle // Store subtitle only
                    });

                    renderProduct(product.title, product.price, product.stoke, image1, subtitle, productDataStore.length - 1);
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

// Function to redirect to details.html with only subtitle
window.openDetailsPage = function (position) {
    const product = productDataStore[position];
    const url = `view-product.html?subtitle=${encodeURIComponent(product.subtitle)}`;
    window.location.href = url;
};

// Initialize the menu and product list on page load
getProductTags();

// Sidebar toggle functionality
const menuIcon = document.getElementById('menu-icon'); // Menu icon in the title bar
const sidebar = document.getElementById('sidebar'); // Sidebar element
const closeSidebar = document.getElementById('close-sidebar'); // Close button in the sidebar

// Open the sidebar when the menu icon is clicked
menuIcon.addEventListener('click', () => {
    sidebar.classList.add('active'); // Add 'active' class to slide the sidebar in
});

// Close the sidebar when the close button is clicked
closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('active'); // Remove 'active' class to slide the sidebar out
});

// Search bar and history navigation functionality
document.addEventListener("DOMContentLoaded", () => {
    const toggleSearchBtn = document.getElementById("toggle-search");
    const searchBar = document.getElementById("search-bar");
    const closeBtn = document.getElementById("close-btn");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const suggestionsList = document.getElementById("suggestions-list");

    // Fetch product titles from Firebase for suggestions
    async function fetchProductTitles() {
        const dbRef = ref(database);
        try {
            const snapshot = await get(child(dbRef, `product`));
            if (snapshot.exists()) {
                const productData = snapshot.val();
                Object.keys(productData).forEach((tag) => {
                    const products = productData[tag];
                    Object.keys(products).forEach((variant) => {
                        productTitles.push(products[variant].title);
                    });
                });
            } else {
                console.log("No product data available");
            }
        } catch (error) {
            console.error("Error fetching product titles: ", error);
        }
    }

    fetchProductTitles();
});



// Add a click event listener to the element with ID "history"
document.getElementById("history").addEventListener("click", function() {
    // Navigate to the "history.html" page
    window.location.href = "history.html";
});

// Add a click event listener to the element with ID "history"
document.getElementById("myorder").addEventListener("click", function() {
    // Navigate to the "history.html" page
    window.location.href = "myorder.html";
});

// Add a click event listener to the element with ID "history"
document.getElementById("home").addEventListener("click", function() {
    // Navigate to the "history.html" page
    window.location.href = "index.html";
});

// Add a click event listener to the element with ID "history"
document.getElementById("offer").addEventListener("click", function() {
    // Navigate to the "history.html" page
    window.location.href = "offer.html";
});

// Add a click event listener to the element with ID "history"
document.getElementById("support").addEventListener("click", function() {
    // Navigate to the "history.html" page
    window.location.href = "support.html";
});
