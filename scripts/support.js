// Import Firebase functions from SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    updateProfile, 
    updateEmail, 
    updatePassword, 
    deleteUser,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    addDoc, 
    setDoc, 
    getDoc, 
    deleteDoc, 
    onSnapshot,
    updateDoc,
    collection, // Import collection
    query,      // Import query
    where,      // Import where
    getDocs     // Import getDocs
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

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



// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);



// Function to check if the user is a superadmin and show/hide the upload section
async function checkIfSuperAdmin() {
    // Listen for the authentication state to be ready
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.role === 'superadmin') {
                        // Show the whitelist upload section if the user is superadmin
                        document.querySelector('.whitelist-upload').style.display = 'block';
                    } else {
                        // Hide the whitelist upload section if the user is not superadmin
                        document.querySelector('.whitelist-upload').style.display = 'none';
                    }
                } else {
                    console.error('User document does not exist.');
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        } else {
            console.error('No authenticated user.');
            // Hide the whitelist upload section if no authenticated user
            document.querySelector('.whitelist-upload').style.display = 'none';
        }
    });
}

// Call this function after the page loads
document.addEventListener('DOMContentLoaded', function () {
    checkIfSuperAdmin();
});

// Function to upload whitelist CSV to Firestore
window.uploadWhitelist = function() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    if (file) {
        window.showToast('Uploading... Please wait.', true, true); // Persistent toast for ongoing upload

        Papa.parse(file, {
            header: true, // Ensures the first row is treated as header
            complete: function(results) {
                const emails = results.data;
                const totalEmails = emails.length;
                let uploadCount = 0;
                let failureCount = 0;

                emails.forEach(async (row, index) => {
                    const email = row['email'].trim(); // Make sure the email is properly formatted
                    const role = row['role'] ? row['role'].trim() : 'user'; // Use role from CSV, fallback to 'user'

                    if (email) {
                        try {
                            // Use setDoc to specify the email as the document ID
                            await setDoc(doc(db, 'whitelistedEmails', email), {
                                email: email,
                                role: role // Set role as specified in the CSV
                            });
                            uploadCount++;
                        } catch (error) {
                            console.error(`Error uploading email: ${email}`, error);
                            failureCount++;
                        }
                    } else {
                        failureCount++;
                        console.error('Invalid email or empty row.');
                    }

                    // After all rows are processed
                    if (index === totalEmails - 1) {
                        window.hideToast(); // Hide persistent toast
                        window.showToast(`Upload complete. Success: ${uploadCount}, Failures: ${failureCount}`, true, false); // Final notification
                    }
                });
            },
            error: function(error) {
                window.hideToast(); // Hide toast on error
                window.showToast('Error parsing CSV file.', false);
                console.error('Error parsing CSV file:', error);
            }
        });
    } else {
        window.showToast('Please select a CSV file.', false); // Show error toast
    }
};






window.showToast = function (message, isSuccess = true, isPersistent = false) {
    const toast = document.getElementById('toastNotification');
    toast.textContent = message;
    toast.style.backgroundColor = isSuccess ? '#28a745' : '#dc3545'; // Green for success, red for error
    toast.classList.remove('hidden');

    if (!isPersistent) {
        // Hide the toast after 3 seconds if it's not persistent
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
};

window.hideToast = function () {
    const toast = document.getElementById('toastNotification');
    toast.classList.add('hidden');
};
