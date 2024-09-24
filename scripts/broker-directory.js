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




// Constants for Google Sheets API
const googleSheetId = '1tfN_Ij1RU6ewTx3WpN787wVEoG0CIqWPOB-83YsjVxo';
const apiKey = 'AIzaSyALOLixHMInPOXN0x1PIzoUQkIn81Iq96g';
const sheetName = 'Sheet1';

// Google Sheets API endpoint
const sheetURL = `https://sheets.googleapis.com/v4/spreadsheets/${googleSheetId}/values/${sheetName}?key=${apiKey}`;

// Map initialization function
window.initMap = function () {
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 5,
    center: { lat: 39.8283, lng: -98.5795 }, // Center of the US
  });

  fetchBrokerData(map);
};

// Fetch broker data from Google Sheets and render markers on the map
window.fetchBrokerData = function (map) {
  fetch(sheetURL)
    .then((response) => response.json())
    .then((data) => {
      const brokers = data.values.slice(1); // Skip the header row
      brokers.forEach((broker) => {
        // Use columns correctly (A = Latitude, B = Longitude, C-H = Other details)
        const [latitude, longitude, name, phone, email, company, state, city] = broker;

        // Ensure latitude and longitude are valid numbers
        if (!isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
          const lat = parseFloat(latitude);
          const lng = parseFloat(longitude);

          // Create a new google.maps.Marker for each broker
          const marker = new google.maps.Marker({
            position: { lat: lat, lng: lng },
            map: map,
            title: name, // Tooltip title for the marker
          });

          // Info window content
          const infoWindow = new google.maps.InfoWindow({
            content: `<h3>${company}</h3><p>${name}<br>${email}<br>${phone}<br>${city}, ${state}</p>`,
          });

          // Add click event to show infoWindow
          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        }
      });
    })
    .catch((error) => {
      console.error('Error fetching broker data:', error);
    });
};

// Pagination and broker rendering
const brokersPerPage = 20;
let currentPage = 1;
let allBrokers = [];

window.renderBrokers = function (brokers, page = 1) {
  const tableBody = document.getElementById('brokerTableBody');
  tableBody.innerHTML = ''; // Clear previous rows

  const startIndex = (page - 1) * brokersPerPage;
  const endIndex = startIndex + brokersPerPage;

  brokers.slice(startIndex, endIndex).forEach((broker) => {
    const row = document.createElement('tr');
    const [company, name, email, phone, city, state] = broker;
    row.innerHTML = `
      <td>${company}</td>
      <td>${name}</td>
      <td>${email}</td>
      <td>${phone}</td>
      <td>${city}</td>
      <td>${state}</td>
    `;
    tableBody.appendChild(row);
  });

  renderPagination(brokers.length, page);
};

// Render pagination controls
function renderPagination(totalBrokers, currentPage) {
  const paginationDiv = document.getElementById('pagination');
  paginationDiv.innerHTML = ''; // Clear previous pagination

  const totalPages = Math.ceil(totalBrokers / brokersPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.className = i === currentPage ? 'active' : '';
    button.addEventListener('click', () => {
      renderBrokers(allBrokers, i);
    });
    paginationDiv.appendChild(button);
  }
}

// Search brokers
window.searchBrokers = function () {
  const searchQuery = document.getElementById('searchBrokerInput').value.toLowerCase();
  const filteredBrokers = allBrokers.filter(
    (broker) => broker[0].toLowerCase().includes(searchQuery) || broker[1].toLowerCase().includes(searchQuery)
  );
  renderBrokers(filteredBrokers, 1);
};

// Fetch broker data and render table on page load
window.fetchBrokers = function () {
  fetch(sheetURL)
    .then((response) => response.json())
    .then((data) => {
      allBrokers = data.values.slice(1); // Exclude header row
      renderBrokers(allBrokers, 1); // Render the first page
    });
};

// Initialize map and fetch brokers when the document is ready
document.addEventListener('DOMContentLoaded', fetchBrokers);
