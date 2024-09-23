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



let brokers = []; // Array to store broker data
let currentPage = 1;
const brokersPerPage = 20;

// Function to initialize Google Map
window.initMap = function() {
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: { lat: 39.8283, lng: -98.5795 } // Center of the US
    });

    renderBrokersOnMap(map);
};



// Function to render brokers on the map
window.renderBrokersOnMap = async function(map) {
    const querySnapshot = await getDocs(collection(db, 'brokers'));

    querySnapshot.forEach((doc) => {
        const broker = doc.data();
        const marker = new google.maps.Marker({
            position: { lat: broker.latitude, lng: broker.longitude },
            map: map,
            title: broker.name
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `<h3>${broker.company}</h3><p>${broker.name}<br>${broker.email}<br>${broker.phone}</p>`
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    });
};


// Fetch all brokers from Firestore and store them
async function fetchBrokers() {
    const querySnapshot = await getDocs(collection(db, 'brokers'));
    brokers = querySnapshot.docs.map(doc => doc.data());
    renderBrokers();
}

// Function to search and filter brokers
window.searchAndRenderBrokers = function() {
    const searchTerm = document.getElementById('searchBrokerInput').value.toLowerCase();
    const filteredBrokers = brokers.filter(broker => 
        broker.company.toLowerCase().includes(searchTerm) ||
        broker.name.toLowerCase().includes(searchTerm) ||
        broker.city.toLowerCase().includes(searchTerm) ||
        broker.state.toLowerCase().includes(searchTerm)
    );
    renderBrokerTable(filteredBrokers);
};


// Function to render broker table with pagination
window.renderBrokers = function() {
    renderBrokerTable(brokers);
};

function renderBrokerTable(brokerList) {
    const brokerTableBody = document.getElementById('brokerTableBody');
    const startIndex = (currentPage - 1) * brokersPerPage;
    const endIndex = startIndex + brokersPerPage;

    const currentBrokers = brokerList.slice(startIndex, endIndex);
    brokerTableBody.innerHTML = ''; // Clear table body

    currentBrokers.forEach(broker => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${broker.company}</td>
            <td>${broker.name}</td>
            <td>${broker.email}</td>
            <td>${broker.phone}</td>
            <td>${broker.city}</td>
            <td>${broker.state}</td>
        `;
        brokerTableBody.appendChild(row);
    });

    updatePagination(brokerList.length);
}

// Function to update pagination information
function updatePagination(totalBrokers) {
    const totalPages = Math.ceil(totalBrokers / brokersPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;

    // Disable/Enable buttons based on the current page
    document.getElementById('prevPageBtn').disabled = currentPage === 1;
    document.getElementById('nextPageBtn').disabled = currentPage === totalPages;
}

// Function to change pages
window.changePage = function(direction) {
    currentPage += direction;
    searchAndRenderBrokers(); // Re-render based on the current search/filter
};

// Fetch brokers on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchBrokers();
});