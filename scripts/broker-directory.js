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

    // Clear any previous messages
    const uploadMessage = document.getElementById('uploadMessage');
    uploadMessage.textContent = '';
    uploadMessage.classList.remove('error', 'success');

    if (file) {
        // Show loading message
        showUploadMessage('Uploading...', 'loading');

        Papa.parse(file, {
            header: true,
            complete: function(results) {
                const brokers = results.data;
                
                if (brokers.length === 0) {
                    showUploadMessage('The CSV file is empty or invalid.', 'error');
                    return;
                }

                // Process brokers and upload to Firestore
                let uploadCount = 0;
                brokers.forEach(async (broker, index) => {
                    try {
                        await addDoc(collection(db, 'brokers'), {
                            company: broker.Company || 'N/A',
                            name: broker.Name || 'N/A',
                            email: broker.Email || 'N/A',
                            phone: broker.Phone || 'N/A',
                            city: broker.City || 'N/A',
                            state: broker.State || 'N/A',
                            latitude: parseFloat(broker.Latitude) || 0,
                            longitude: parseFloat(broker.Longitude) || 0,
                        });
                        uploadCount++;
                    } catch (error) {
                        console.error(`Error uploading broker: ${broker.Name}`, error);
                    }

                    // If it's the last broker, show success message
                    if (index === brokers.length - 1) {
                        showUploadMessage(`${uploadCount} brokers successfully uploaded!`, 'success');
                    }
                });
            },
            error: function(error) {
                showUploadMessage('Error parsing CSV file.', 'error');
                console.error('CSV parsing error:', error);
            }
        });
    } else {
        showUploadMessage('Please select a CSV file.', 'error');
    }
};

// Function to show upload messages (loading, success, error)
function showUploadMessage(message, type) {
    const uploadMessage = document.getElementById('uploadMessage');
    uploadMessage.textContent = message;
    uploadMessage.classList.remove('loading', 'error', 'success');
    
    if (type === 'loading') {
        uploadMessage.classList.add('loading');
    } else if (type === 'success') {
        uploadMessage.classList.add('success');
    } else if (type === 'error') {
        uploadMessage.classList.add('error');
    }
}


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
