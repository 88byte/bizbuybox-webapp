// Import Firebase functions from SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";



// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALOLixHMInPOXN0x1PIzoUQkIn81Iq96g",
  authDomain: "bizbuybox-webapp-d4772.firebaseapp.com",
  projectId: "bizbuybox-webapp-d4772",
  storageBucket: "bizbuybox-webapp-d4772.appspot.com",
  messagingSenderId: "822306028352",
  appId: "1:822306028352:web:3e410ae31890ba5d4658a5",
  measurementId: "G-CWHPBN196R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
window.auth = getAuth(app); // Make auth globally accessible
window.db = getFirestore(app); // Make Firestore globally accessible
window.storage = getStorage(app); // Make Storage globally accessible
const provider = new GoogleAuthProvider();

// Function to handle Logout
window.handleLogout = function () {
    signOut(auth)
        .then(() => {
            console.log('User logged out');
            localStorage.removeItem('username');
            localStorage.removeItem('profilePicUrl');
            alert('You have been logged out!');
            // Redirect to the landing page
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error during logout:', error);
        });
};

// Make functions globally accessible
window.openLoginModal = function () {
    document.getElementById('loginModal').style.display = 'flex';
    showLoginForm(); // Default to showing the login form
};

window.closeLoginModal = function () {
    document.getElementById('loginModal').style.display = 'none';
};

// Show login form and hide sign-up form
window.showLoginForm = function () {
    const loginFormContainer = document.getElementById('loginFormContainer');
    const signUpFormContainer = document.getElementById('signUpFormContainer');

    if (loginFormContainer && signUpFormContainer) {
        loginFormContainer.style.display = 'block';
        signUpFormContainer.style.display = 'none';
        document.getElementById('modalTitle').textContent = 'Login or Sign Up';
    }
};

// Show sign-up form and hide login form
window.showSignUpForm = function () {
    const loginFormContainer = document.getElementById('loginFormContainer');
    const signUpFormContainer = document.getElementById('signUpFormContainer');

    if (loginFormContainer && signUpFormContainer) {
        loginFormContainer.style.display = 'none';
        signUpFormContainer.style.display = 'block';
        document.getElementById('modalTitle').textContent = 'Create an Account';
    }
};

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function() {
    initializeGapiClient();
    createParticles();

    // Ensure elements are ready before attaching event listeners
    const loginForm = document.getElementById('loginForm');
    const signUpForm = document.getElementById('signUpForm');

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
});


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
document.getElementById('signUpForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent the default form submission behavior

    // Get form values
    const username = document.getElementById('signUpUsername').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;

    console.log('Attempting to sign up with:', username, email); // Debug log

    // Check if email, password, and username are provided
    if (!email || !password || !username) {
        console.error('Error: Email, password, or username not provided.');
        alert('Please fill in all fields.');
        return;
    }

    try {
        // Step 1: Check if the email is in the whitelist
        const emailDoc = await getDoc(doc(db, 'whitelistedEmails', email));
        
        if (!emailDoc.exists()) {
            // If email is not found in the whitelist, deny registration
            alert('Your email is not whitelisted. Please contact support.');
            return;
        }

        // Step 2: Proceed with creating the user account if email is whitelisted
        // Firebase automatically checks if the email is already in use
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User signed up successfully:', user);

        // Step 3: Get role from the whitelist (default to "user" if no role specified)
        const userRole = emailDoc.data().role || 'user';

        // Step 4: Save user data and role to Firestore
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            role: userRole,   // Save the role from the whitelist
            createdAt: new Date().toISOString()
        });

        console.log('User data successfully written to Firestore');
        alert('Sign-up successful! Welcome, ' + username);
        closeLoginModal();

    } catch (error) {
        console.error('Error during sign-up:', error);

        // Firebase specific error handling for existing email
        if (error.code === 'auth/email-already-in-use') {
            alert('This email is already in use. Please use a different email.');
        } else if (error.code === 'auth/invalid-email') {
            alert('The email address is invalid.');
        } else if (error.code === 'auth/weak-password') {
            alert('The password is too weak. Please choose a stronger password.');
        } else {
            alert('Error during sign-up: ' + error.message);
        }
    }
});





// JavaScript: Add this to app.js

function handleStart() {
    // Smooth scroll to the Features section
    document.querySelector('.features-section').scrollIntoView({ behavior: 'smooth' });
}



// Function to handle Google Login using Popup
window.handleGoogleLogin = function () {
    signInWithPopup(auth, provider)
        .then(async (result) => {
            const user = result.user;
            console.log('User signed in with Google:', user);

            try {
                // Step 1: Check if the user's email is whitelisted
                const emailDoc = await getDoc(doc(db, 'whitelistedEmails', user.email));

                if (!emailDoc.exists()) {
                    // If email is not found in the whitelist, deny access
                    alert('Your email is not whitelisted. Please contact support.');
                    // Optionally sign out the user
                    signOut(auth);
                    return;
                }

                // Step 2: Get the user's role from the whitelist (default to "user" if not specified)
                const userRole = emailDoc.data().role || 'user';

                // Step 3: Proceed with saving the user's data in Firestore
                const userRef = doc(db, "users", user.uid);
                await setDoc(userRef, {
                    username: user.displayName || 'Google User',
                    email: user.email,
                    role: userRole,   // Save the role from the whitelist
                    createdAt: new Date().toISOString()
                }, { merge: true }); // Merging to ensure existing data isn't overwritten

                console.log('User data successfully written to Firestore');
                alert('Sign-in successful! Welcome, ' + user.email);

                // Close the login modal and redirect to the main app page
                closeLoginModal();
                window.location.href = 'main-app.html'; // Redirect to the main app page

            } catch (error) {
                console.error('Error handling Google login or fetching whitelist:', error);
                alert('There was an error during login. Please try again.');
            }
        })
        .catch((error) => {
            console.error('Error during Google login:', error);
            alert('Error during Google login: ' + error.message);
        });
};




// Function to handle Email/Password Login
async function handleLogin() {
    const email = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    console.log('Attempting to log in with:', email);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 🔄 Force reload to ensure `auth.currentUser` is ready
        await user.reload();
        console.log('User successfully logged in and reloaded:', user.email);

        closeLoginModal();
        window.location.href = 'main-app.html';
    } catch (error) {
        console.error('Error during login:', error);
        alert(error.message);
    }
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
    initializeGapiClient();
});


