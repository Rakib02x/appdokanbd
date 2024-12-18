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
    
    
const sliderContainer = document.getElementById('sliderContainer');
let prevBtn, nextBtn; // Declare buttons
let cards = [];
let currentIndex = 0;

// Fetch Images from Firebase
async function fetchImages() {
    const dbRef = ref(database);
    try {
        const snapshot = await get(child(dbRef, "review"));
        if (snapshot.exists()) {
            const imageURLs = Object.values(snapshot.val());
            createCards(imageURLs);
        } else {
            console.log("No images available.");
        }
    } catch (error) {
        console.error("Error fetching images:", error);
    }
}

// Dynamically Create Cards
function createCards(imageURLs) {
    sliderContainer.innerHTML = ''; // Clear existing content
    cards = []; // Reset cards array

    // Create cards
    imageURLs.forEach((url) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.style.backgroundImage = `url('${url}')`;
        sliderContainer.appendChild(card);
        cards.push(card);
    });

    // Add navigation buttons back
    addNavigationButtons();

    updateCards();
    startAutoSlide();
}

// Add Navigation Buttons
function addNavigationButtons() {
    const navigation = document.createElement('div');
    navigation.classList.add('navigation');
    navigation.innerHTML = `
        <button class="nav-btn" id="prevBtn">&#10094;</button>
        <button class="nav-btn" id="nextBtn">&#10095;</button>
    `;
    sliderContainer.appendChild(navigation);

    // Update button references
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');

    // Add event listeners
    prevBtn.addEventListener('click', () => {
        stopAutoSlide();
        goToPrevCard();
        startAutoSlide();
    });

    nextBtn.addEventListener('click', () => {
        stopAutoSlide();
        goToNextCard();
        startAutoSlide();
    });
}

// Update Card Positions
function updateCards() {
    cards.forEach((card) => card.classList.remove('active', 'prev', 'next'));

    if (cards.length > 0) {
        cards[currentIndex].classList.add('active');
        cards[(currentIndex - 1 + cards.length) % cards.length].classList.add('prev');
        cards[(currentIndex + 1) % cards.length].classList.add('next');
    }
}

// Navigation Functions
function goToNextCard() {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCards();
}

function goToPrevCard() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCards();
}

// Auto-Slide
let autoSlideInterval;
function startAutoSlide() {
    autoSlideInterval = setInterval(goToNextCard, 3000);
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

// Initialize
fetchImages();
