// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAEeQ_qZOgR23KKh64_PrL73wv2kek3qtc",
  authDomain: "bizbuybox-webapp-d4772.firebaseapp.com",
  projectId: "bizbuybox-webapp-d4772",
  storageBucket: "bizbuybox-webapp-d4772.appspot.com",
  messagingSenderId: "822306028352",
  appId: "1:822306028352:web:3e410ae31890ba5d4658a5",
  measurementId: "G-CWHPBN196R"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function() {
    initializeGapiClient();
    createParticles();
    populateNavbar();

    // Ensure elements are ready before attaching event listeners
    const loginForm = document.getElementById('loginForm');
    const signUpForm = document.getElementById('signUpForm');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const signUpFormContainer = document.getElementById('signUpFormContainer');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleLogin();
        });
    }

    if (signUpForm) {
        signUpForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleSignUp();
        });
    }

    // Functions to show/hide forms only if the elements exist
    if (loginFormContainer && signUpFormContainer) {
        window.showLoginForm = function () {
            loginFormContainer.style.display = 'block';
            signUpFormContainer.style.display = 'none';
            document.getElementById('modalTitle').textContent = 'Login or Sign Up';
        };

        window.showSignUpForm = function () {
            loginFormContainer.style.display = 'none';
            signUpFormContainer.style.display = 'block';
            document.getElementById('modalTitle').textContent = 'Create an Account';
        };
    }
}); // <--- Ensure the function is properly closed here.


// Function to initialize the Google API client using Google Sign-In
function initializeGapiClient() {
    google.accounts.id.initialize({
        client_id: '275304965510-fj6ueht6b3nm3he25ce2ctald6kq61vc.apps.googleusercontent.com', // Your actual client ID
        callback: handleCredentialResponse, // Function to handle the ID token
        ux_mode: 'popup', // Use 'popup' mode for a traditional login flow
        auto_select: false // Avoid auto-login to reduce user friction
    });

    // Render the Google Sign-In button inside the modal
    google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        { theme: "outline", size: "large" } // Customize button style
    );
}

// Function to handle the ID token from Google Identity Services
function handleCredentialResponse(response) {
    console.log('Encoded JWT ID token: ' + response.credential);

    // Handle successful login here, for example by calling your backend with the token
    authenticateUser(response.credential);

    // Hide the sign-in button and show the log-out button after successful login
    document.getElementById("google-signin-button").style.display = "none";
    document.getElementById("logout-button").style.display = "block";
}

// Function to open the login modal
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    showLoginForm(); // Default to showing the login form
}

// Function to close the login modal
function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
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
    initializeGapiClient();
    createParticles();
    populateNavbar();
});
    
// Show the login form and hide the sign-up form
function showLoginForm() {
    document.getElementById('loginFormContainer').style.display = 'block';
    document.getElementById('signUpFormContainer').style.display = 'none';
    document.getElementById('modalTitle').textContent = 'Login or Sign Up';
}

// Show the sign-up form and hide the login form
function showSignUpForm() {
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('signUpFormContainer').style.display = 'block';
    document.getElementById('modalTitle').textContent = 'Create an Account';
}

// Function to handle the login form submission
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    // Implement your login logic here (e.g., call to backend API)
    console.log('Logging in with', username, password);
    closeLoginModal();
});

// Function to handle the sign-up form submission
document.getElementById('signUpForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('signUpUsername').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    // Implement your sign-up logic here (e.g., call to backend API)
    console.log('Signing up with', username, email, password);
    closeLoginModal();
});


// JavaScript: Add this to app.js

function handleStart() {
    // Smooth scroll to the Features section
    document.querySelector('.features-section').scrollIntoView({ behavior: 'smooth' });
}



// JavaScript to create and animate particles
function createParticles() {
    const particleContainer = document.getElementById('particle-container');
    for (let i = 0; i < 300; i++) { // Number of particles
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = 8 + Math.random() * 12 + 's'; // Random duration between 8s and 20s
        particleContainer.appendChild(particle);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    createParticles();
    populateNavbar();
    initializeGapiClient();
});


// Function to handle Google Login
function handleGoogleLogin() {
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log('User signed in with Google:', result.user);
            closeLoginModal(); // Close the modal upon successful login
        })
        .catch((error) => {
            console.error('Error during Google login:', error);
        });
}

// Function to handle Email/Password Sign-Up
function handleSignUp() {
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User signed up:', userCredential.user);
            closeLoginModal(); // Close the modal upon successful sign-up
        })
        .catch((error) => {
            console.error('Error during sign-up:', error);
        });
}

// Function to handle Email/Password Login
function handleLogin() {
    const email = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User logged in:', userCredential.user);
            closeLoginModal(); // Close the modal upon successful login
        })
        .catch((error) => {
            console.error('Error during login:', error);
        });
}

// Function to handle Logout
function handleLogout() {
    auth.signOut()
        .then(() => {
            console.log('User logged out');
        })
        .catch((error) => {
            console.error('Error during logout:', error);
        });
}



// Initialize app components
function initializeApp() {
    loadClient().then(function () {
        console.log("App Initialized");

        populateNavbar(); // Populate the navigation bar here

        // Load default page
        loadPage(null, "Dashboard");
    }).catch(function (err) {
        console.error("Error initializing app", err);
    });
}

// Function to populate the navigation menu
function populateNavbar() {
    const navbar = document.querySelector(".navbar ul");

    const navItems = [
        { name: "Dashboard", onclick: "loadPage(event, 'Dashboard')" },
        { name: "Task Tracker", onclick: "loadPage(event, 'TaskTracker')" },
        { name: "Quick Calculator", onclick: "loadPage(event, 'QuickCalculator')" },
        { name: "LOI Generator", onclick: "loadPage(event, 'LOIGenerator')" },
        { name: "Brokers", onclick: "loadPage(event, 'Brokers')" },
        { name: "Notifications", onclick: "loadPage(event, 'Notifications')" },
        { name: "Support", onclick: "loadPage(event, 'Support')" }
    ];

    navItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = "#";
        a.className = "nav-item";
        a.setAttribute("onclick", item.onclick);
        a.textContent = item.name;
        li.appendChild(a);
        navbar.appendChild(li);
    });

    // Re-add event listeners for dynamically created nav items
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", function (event) {
            event.preventDefault();
            loadPage(event, item.getAttribute("onclick").split("'")[1]);
        });
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