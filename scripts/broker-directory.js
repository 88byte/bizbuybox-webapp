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
        const [latitude, longitude, company, name, email, phone, city, state] = broker;

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

          // Info window content with custom HTML and inline styling for dark theme
          const infoWindowContent = `
            <div style="max-width: 250px; background-color: white; padding: 10px; border-radius: 8px;">
              <h3 style="color: #333; font-size: 18px;">${company}</h3>
              <p style="color: #555; font-size: 14px;">
                <strong>${name}</strong><br>
                <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a><br>
                ${phone}<br>
                ${city}, ${state}
              </p>
            </div>`;

          const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent,
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


// Pagination settings
const brokersPerPage = 20;
let currentPage = 1;
let allBrokers = [];

// Render brokers into the table
window.renderBrokers = function (brokers, page = 1) {
    const tableBody = document.getElementById('brokerTableBody');
    tableBody.innerHTML = ''; // Clear previous rows

    const startIndex = (page - 1) * brokersPerPage;
    const endIndex = startIndex + brokersPerPage;

    brokers.slice(startIndex, endIndex).forEach((broker) => {
        const row = document.createElement('tr');
        const [latitude, longitude, company, name, email, phone, city, state] = broker; // Exclude lat/long
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
    const visiblePages = 5; // Limit visible page numbers
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);

    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.className = 'pagination-btn';
        prevButton.addEventListener('click', () => {
            renderBrokers(allBrokers, currentPage - 1);
        });
        paginationDiv.appendChild(prevButton);
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentPage ? 'active pagination-btn' : 'pagination-btn';
        button.addEventListener('click', () => {
            renderBrokers(allBrokers, i);
        });
        paginationDiv.appendChild(button);
    }

    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.className = 'pagination-btn';
        nextButton.addEventListener('click', () => {
            renderBrokers(allBrokers, currentPage + 1);
        });
        paginationDiv.appendChild(nextButton);
    }
}


// Search brokers
window.searchBrokers = function () {
    const searchQuery = document.getElementById('searchBrokerInput').value.toLowerCase();
    const filteredBrokers = allBrokers.filter(
        (broker) => broker[5].toLowerCase().includes(searchQuery) || broker[2].toLowerCase().includes(searchQuery)
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
