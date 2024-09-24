support.js
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
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                const emails = results.data;
                const totalEmails = emails.length;
                let uploadCount = 0;

                emails.forEach(async (row, index) => {
                    const email = row['email']; // Replace with your CSV column name
                    const role = row['role'] || 'user'; // Default to 'user' if role isn't provided

                    try {
                        await setDoc(doc(db, 'whitelistedEmails', email), {
                            email: email,
                            role: role
                        });
                        uploadCount++;
                    } catch (error) {
                        console.error(`Error uploading email: ${email}`, error);
                    }

                    if (index === totalEmails - 1) {
                        alert(`Upload complete. ${uploadCount} emails uploaded.`);
                    }
                });
            },
            error: function(error) {
                console.error('Error parsing CSV file:', error);
            }
        });
    } else {
        alert('Please select a CSV file.');
    }
};
