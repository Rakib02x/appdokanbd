// Add a click event listener to the element with ID "back"
document.getElementById("back-icon").addEventListener("click", function() {
    // Go back in history
    history.back();
});
    
    // Add a click event listener to the element with ID "back"
document.getElementById("help").addEventListener("click", function() {
    // Go back in history
    window.location.href = "/support";
});
    
    // logo icon click"
document.getElementById("logo-click").addEventListener("click", function() {
    // Navigate to the "history.html" page
    window.location.href = "/index";
});
