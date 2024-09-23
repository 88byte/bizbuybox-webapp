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
    apiKey: "AIzaSyAEeQ_qZOgR23KKh64_PrL73wv2kek3qtc",
    authDomain: "bizbuybox-webapp-d4772.firebaseapp.com",
    projectId: "bizbuybox-webapp-d4772",
    storageBucket: "bizbuybox-webapp-d4772.appspot.com",
    messagingSenderId: "822306028352",
    appId: "1:822306028352:web:3e410ae31890ba5d4658a5",
    measurementId: "G-CWHPBN196R"
};


// Initialize Firestore
const db = getFirestore();
window.auth = getAuth(); 
window.storage = getStorage(); 



auth.onAuthStateChanged(user => {
    if (user) {
        console.log("User is authenticated:", user.uid);
        // Allow Firestore operations since the user is authenticated
    } else {
        console.error("User is not authenticated");
        // Redirect to login page or show error
        window.location.href = 'login.html'; 
    }
});


// Function to upload CSV to Firestore
window.uploadCSV = function() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    if (file) {
        // Show persistent toast notification indicating that the upload is ongoing
        showToast('Uploading... Please wait.', true, true); // Pass true to make it persistent

        Papa.parse(file, {
            header: true,
            complete: function(results) {
                const brokers = results.data;
                const totalBrokers = brokers.length; // Get total number of brokers
                let uploadCount = 0; // Count how many were successfully uploaded
                let errorCount = 0; // Count any brokers that failed to upload

                if (totalBrokers === 0) {
                    showToast('The CSV file is empty or invalid.', false);
                    return;
                }

                // Process brokers and upload to Firestore
                brokers.forEach(async (broker, index) => {
                    // Normalize phone numbers (remove parentheses, spaces, and dashes), check if empty
                    let normalizedPhone = broker['Phone Number'] && broker['Phone Number'].trim() !== '' 
                        ? broker['Phone Number'].replace(/[\s()-]/g, '') 
                        : 'N/A';
                    
                    // Check if longitude and latitude are valid numbers
                    const latitude = broker.Latitude && !isNaN(parseFloat(broker.Latitude)) 
                        ? parseFloat(broker.Latitude) 
                        : null; // Use null instead of 0 to indicate missing latitude

                    const longitude = broker.Longitude && !isNaN(parseFloat(broker.Longitude)) 
                        ? parseFloat(broker.Longitude) 
                        : null; // Use null instead of 0 to indicate missing longitude

                    try {
                        await addDoc(collection(db, 'brokers'), {
                            company: broker['Company Name'] || 'N/A',
                            name: broker.Name || 'N/A',
                            email: broker.Email || 'N/A',
                            phone: normalizedPhone,
                            city: broker.City || 'N/A',
                            state: broker.State || 'N/A',
                            latitude: latitude,
                            longitude: longitude,
                        });
                        uploadCount++;
                    } catch (error) {
                        console.error(`Error uploading broker: ${broker.Name}`, error);
                        errorCount++; // Increment error count if upload fails
                    }

                    // If it's the last broker, show success toast notification with total counts
                    if (index === brokers.length - 1) {
                        // Update the toast to show success message
                        showToast(`Upload Complete! Uploaded: ${uploadCount} / ${totalBrokers} brokers. Errors: ${errorCount}`, true, false);
                    }
                });
            },
            error: function(error) {
                showToast('Error parsing CSV file.', false); // Show error toast notification
                console.error('CSV parsing error:', error);
            }
        });
    } else {
        showToast('Please select a CSV file.', false); // Show error toast notification
    }
};






// Function to render brokers on the page
window.renderBrokers = async function() {
    const brokerContainer = document.getElementById('brokerList');
    brokerContainer.innerHTML = ''; // Clear existing list

    const querySnapshot = await getDocs(collection(db, 'brokers'));

    querySnapshot.forEach((doc) => {
        const broker = doc.data();
        const brokerCard = document.createElement('div');
        brokerCard.classList.add('broker-card');
        brokerCard.innerHTML = `
            <h2>${broker.company}</h2>
            <p>Name: ${broker.name}</p>
            <p>Email: ${broker.email}</p>
            <p>Phone: ${broker.phone}</p>
            <p>City: ${broker.city}, ${broker.state}</p>
        `;
        brokerContainer.appendChild(brokerCard);
    });
};

// Call render function on page load to display existing brokers
document.addEventListener('DOMContentLoaded', () => {
    renderBrokers();
});
