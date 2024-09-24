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

// Function to upload whitelist CSV to Firestore
window.uploadWhitelist = function() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    if (file) {
        window.showToast('Uploading... Please wait.', true, true); // Persistent toast for ongoing upload

        Papa.parse(file, {
            header: true,
            complete: function(results) {
                const emails = results.data;
                const totalEmails = emails.length;
                let uploadCount = 0;
                let failureCount = 0;

                emails.forEach(async (row, index) => {
                    const email = row['email']?.trim(); // Safely access and trim the email field
                    let role = row['role']?.toLowerCase() || 'user'; // Default to 'user', make role case-insensitive

                    // Ensure role is either 'user', 'admin', or 'superadmin'
                    const allowedRoles = ['user', 'admin', 'superadmin'];
                    if (!allowedRoles.includes(role)) {
                        role = 'user'; // Default to 'user' if role is not valid
                    }

                    if (email && email.length > 0) { // Check if email exists and is valid
                        try {
                            await setDoc(doc(db, 'whitelistedEmails', email), {
                                email: email,
                                role: role
                            });
                            uploadCount++;
                        } catch (error) {
                            console.error(`Error uploading email: ${email}`, error);
                            failureCount++;
                        }
                    } else {
                        console.error(`Skipping row due to missing or invalid email:`, row);
                        failureCount++;
                    }

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
