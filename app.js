// Function to initialize the Google API client using Google Sign-In
function initializeGapiClient() {
    google.accounts.id.initialize({
        client_id: '275304965510-fj6ueht6b3nm3he25ce2ctald6kq61vc.apps.googleusercontent.com', // Your actual client ID
        callback: handleCredentialResponse, // Function to handle the ID token
        ux_mode: 'popup', // Use 'popup' mode for a traditional login flow
        auto_select: false // Avoid auto-login to reduce user friction
    });

    // Render the Google Sign-In button
    google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        { theme: "outline", size: "large" } // Customize button style
    );

    // Add click event for the log-out button
    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", function () {
        logout();
    });
}

// Function to handle the ID token from Google Identity Services
function handleCredentialResponse(response) {
    console.log('Encoded JWT ID token: ' + response.credential);

    // Hide the sign-in button and show the log-out button after successful login
    document.getElementById("google-signin-button").style.display = "none";
    document.getElementById("logout-button").style.display = "block";

    // Initialize GAPI client with the obtained token
    gapi.load("client", function () {
        gapi.client.init({
            apiKey: "AIzaSyAGM1ZHnCXELvKavsi07IObNIzo6fmylMA", // Your actual API key
            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        }).then(function () {
            console.log("GAPI client initialized.");
            initializeApp(); // Initialize your app after GAPI client is ready
        }, function (error) {
            console.error("Error initializing GAPI client", error);
        });
    });
}

// Function to log out the user
function logout() {
    google.accounts.id.disableAutoSelect(); // Disable auto-login
    google.accounts.id.revoke(localStorage.getItem('email'), done => {
        console.log('User signed out.');

        // Hide the log-out button and show the sign-in button
        document.getElementById("logout-button").style.display = "none";
        document.getElementById("google-signin-button").style.display = "block";
    });

    localStorage.removeItem('email');
}

// Initialize GAPI client when the DOM is ready
document.addEventListener("DOMContentLoaded", function () {
    console.log("Document is ready, initializing Google Identity Services.");
    initializeGapiClient();
});


// Initialize app components
function initializeApp() {
    loadClient().then(function () {
        console.log("App Initialized");

        // Add click events for navigation items
        const navItems = document.querySelectorAll(".nav-item");
        navItems.forEach(item => {
            item.addEventListener("click", function (event) {
                event.preventDefault();
                loadPage(event, item.getAttribute("onclick").split("'")[1]);
            });
        });

        // Load default page
        loadPage(null, "Dashboard");
    }).catch(function (err) {
        console.error("Error initializing app", err);
    });
}

// Load Google Sheets API client
function loadClient() {
    return gapi.client.load("sheets", "v4").then(function () {
        console.log("GAPI client loaded for API");
    }, function (err) {
        console.error("Error loading GAPI client for API", err);
    });
}

// Fetch data from the spreadsheet
function execute() {
    return gapi.client.sheets.spreadsheets.values.get({
        "spreadsheetId": "1huv1uelTeftXD-yw94k-K1Fhb8QKkiiHK0hmSKcvp2U", // Replace with your actual spreadsheet ID
        "range": "Businesses!A:AM"
    }).then(function (response) {
        console.log("Response", response);
    }, function (err) {
        console.error("Execute error", err);
    });
}

// Function to load pages dynamically
function loadPage(event, page) {
    if (event) event.preventDefault();
    const content = document.getElementById("content");
    content.innerHTML = ""; // Clear existing content

    switch (page) {
        case "Dashboard":
            loadDashboard();
            break;
        case "TaskTracker":
            loadTaskTracker();
            break;
        case "QuickCalculator":
            loadQuickCalculator();
            break;
        case "LOIGenerator":
            loadLOIGenerator();
            break;
        case "Brokers":
            loadBrokers();
            break;
        case "Notifications":
            loadNotifications();
            break;
        case "Support":
            loadSupport();
            break;
        default:
            loadDashboard();
    }
}

// Example of dynamically loading content
function loadDashboard() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <h2>Dashboard</h2>
        <div id="dealsContainer"></div>
        <button id="loadDealsButton">Load Deals</button>
    `;
    document.getElementById("loadDealsButton").addEventListener("click", loadDeals);
}

// Load deals from Google Sheets
function loadDeals() {
    execute().then(function (response) {
        const deals = response.result.values;
        console.log(deals);  // Display the deals
        // Render deals in your UI
    }).catch(function (err) {
        console.error("Error loading deals", err);
    });
}
