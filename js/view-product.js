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

// Get URL parameter
const urlParams = new URLSearchParams(window.location.search);
const subtitle = urlParams.get("subtitle"); // Example: "catagory1/item 1 for 1 month"

// Fetch product data from Firebase
const fetchProductData = async (subtitlePath) => {
    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `product/${subtitlePath}`)); // Fetch data using the full subtitle path
        if (snapshot.exists()) {
            const productData = snapshot.val();

            // Set product details
            document.getElementById("product-title").innerText = productData.title;
            document.getElementById("product-price").innerText = `Price: ${productData.price} Tk`;
            document.getElementById("product-info").innerHTML = productData.info;

            // Set main product image
            const productImageDiv = document.getElementById("product-image");
            productImageDiv.innerHTML = `<img src="${productData.images.image1}" alt="${productData.title}" />`;

            // Populate product gallery
            const productGalleryDiv = document.getElementById("product-gallery");
            productGalleryDiv.innerHTML = ""; // Clear existing thumbnails
            Object.values(productData.images).forEach((image) => {
                const imgElement = document.createElement("img");
                imgElement.src = image;
                imgElement.alt = productData.title;
                imgElement.addEventListener("click", () => {
                    productImageDiv.innerHTML = `<img src="${image}" alt="${productData.title}" />`;
                });
                productGalleryDiv.appendChild(imgElement);
            });

            // Handle Buy Now button click
            document.getElementById("buy-now-btn").addEventListener("click", () => {
                const url = `payment.html?title=${encodeURIComponent(productData.title)}&price=${encodeURIComponent(productData.price)}&image=${encodeURIComponent(productData.images.image1)}`;
                window.location.href = url;
            });

            // Handle Share button click
            document.getElementById("share-icon").addEventListener("click", () => {
                const currentUrl = `${window.location.origin}${window.location.pathname}?subtitle=${encodeURIComponent(subtitlePath)}`;
                if (navigator.share) {
                    navigator.share({
                        title: "Check out this product!",
                        text: `Check out ${productData.title} for ${productData.price} Tk.`,
                        url: currentUrl,
                    }).catch((error) => {
                        console.error("Error sharing:", error);
                    });
                } else {
                    alert("Sharing is not supported on this device.");
                }
            });

            // Handle Copy Link button click
            document.getElementById("copy-icon").addEventListener("click", () => {
                const currentUrl = `${window.location.origin}${window.location.pathname}?subtitle=${encodeURIComponent(subtitlePath)}`;
                navigator.clipboard
                    .writeText(currentUrl)
                    .then(() => {
                        alert("Link copied to clipboard!");
                    })
                    .catch(() => {
                        alert("Failed to copy the link.");
                    });
            });
        } else {
            console.error("No data available for the specified subtitle.");
        }
    } catch (error) {
        console.error("Error fetching product data:", error);
    }
};

// Fetch data for the given subtitle
fetchProductData(subtitle);