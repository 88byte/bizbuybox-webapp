// Function to load the Google API Client Library and initialize it
function loadGapiClient() {
    gapi.load("client:auth2", function () {
        // Initialize the Google API client with only the necessary parameters
        gapi.auth2.init({
            client_id: "275304965510-fj6ueht6b3nm3he25ce2ctald6kq61vc.apps.googleusercontent.com"
        }).then(function () {
            console.log("GAPI client initialized.");
            initializeApp();  // Call your app initialization after GAPI is ready
        }).catch(function (err) {
            console.error("Error initializing GAPI client", err);
        });
    });
}

// Load GAPI client when the DOM is ready
document.addEventListener("DOMContentLoaded", function () {
    console.log("Document is ready, loading GAPI client.");
    loadGapiClient();
});



// Function to authenticate the user
function authenticate() {
    return gapi.auth2.getAuthInstance()
        .signIn({ scope: "https://www.googleapis.com/auth/spreadsheets" })
        .then(function () { console.log("Sign-in successful"); },
            function (err) { console.error("Error signing in", err); });
}

// Load Google Sheets API client
function loadClient() {
    gapi.client.setApiKey("AIzaSyAGM1ZHnCXELvKavsi07IObNIzo6fmylMA");
    return gapi.client.load("https://sheets.googleapis.com/$discovery/rest?version=v4")
        .then(function () { console.log("GAPI client loaded for API"); },
            function (err) { console.error("Error loading GAPI client for API", err); });
}

// Fetch data from the spreadsheet
function execute() {
    return gapi.client.sheets.spreadsheets.values.get({
        "spreadsheetId": "1huv1uelTeftXD-yw94k-K1Fhb8QKkiiHK0hmSKcvp2U",
        "range": "Businesses!A:AM"
    })
        .then(function (response) {
            console.log("Response", response);
        },
            function (err) { console.error("Execute error", err); });
}

// Initialize app components
function initializeApp() {
    authenticate().then(loadClient).then(function () {
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