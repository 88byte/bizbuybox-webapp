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
    setDoc, 
    getDoc, 
    deleteDoc, 
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
window.auth = getAuth(app); 
window.db = getFirestore(app); 
window.storage = getStorage(app); 
const provider = new GoogleAuthProvider();


// Function to fetch and display user profile data
window.displayUserProfile = function () {
    const user = auth.currentUser;

    if (user) {
        // Show loading placeholders
        document.querySelector('.profile-img').src = 'path/to/loading-placeholder.gif';
        document.querySelector('.profile-username').textContent = 'Loading...';

        // Fetch user profile data from Firestore
        getDoc(doc(db, "users", user.uid)).then((userDoc) => {
            if (userDoc.exists()) {
                const userData = userDoc.data();

                // Update username
                document.querySelector('.profile-username').textContent = userData.username || user.displayName || 'User';

                // Update profile picture
                if (userData.profilePicture) {
                    document.querySelector('.profile-img').src = userData.profilePicture;
                } else {
                    document.querySelector('.profile-img').src = 'path/to/default-avatar.png'; // Default image
                }
            } else {
                console.error('No user data found in Firestore.');
            }
        }).catch((error) => {
            console.error('Error fetching profile data:', error);
        });
    }
};

// Use Firebase's onAuthStateChanged to detect login state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in, load the profile
        loadUserProfile();
        fetchDeals();
    } else {
        console.log('User is not logged in');
    }
});

// Function to update user profile
window.updateProfile = async function () {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const profilePicFile = document.getElementById('profilePic').files[0];

    try {
        const user = auth.currentUser;

        let profilePicUrl = user.photoURL; 

        if (profilePicFile) {
            const profilePicRef = ref(storage, `profilePictures/${user.uid}/${profilePicFile.name}`);
            await uploadBytes(profilePicRef, profilePicFile);
            profilePicUrl = await getDownloadURL(profilePicRef);
            await updateProfile(user, { photoURL: profilePicUrl });
            document.querySelector('.profile-img').src = profilePicUrl;
        }

        if (username) {
            await updateProfile(user, { displayName: username });
            document.getElementById('profileUsername').textContent = username;
        }
        if (email) {
            await updateEmail(user, email);
        }
        if (password) {
            await updatePassword(user, password);
        }

        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            profilePicture: profilePicUrl
        }, { merge: true });

        alert('Profile updated successfully!');
        closeProfileModal();
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile: ' + error.message);
    }
};

// Function to load the user profile when page loads
window.onload = function() {
    showDashboard();
    renderDeals();
};


// Function to show the Dashboard
window.showDashboard = function() {
    setActiveSection('dashboard');
}

// Function to show the Quick Calculator
window.showQuickCalculator = function() {
    setActiveSection('quick-calculator');
}

// Function to show the LOI Generator
window.showLOIGenerator = function() {
    setActiveSection('loi-generator');
}

// Function to show the Broker Directory
window.showBrokerDirectory = function() {
    setActiveSection('broker-directory');
}

// Function to show the Resources section
window.showResources = function() {
    setActiveSection('resources');
}

// Function to show the Support section
window.showSupport = function() {
    setActiveSection('support');
}

// Function to set the active section
function setActiveSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');
    setActiveNav(sectionId);
}

// Function to set active navigation link
function setActiveNav(sectionId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.textContent.trim() === sectionId.replace('-', ' ')) {
            link.classList.add('active');
        }
    });
}

// Deal Management Functions
let deals = []; // Example array to hold deals

// Function to create a new deal
window.createDeal = function() {
    // Reset the form fields
    document.getElementById('dealForm').reset();
    // Set the modal to 'new' deal mode
    document.getElementById('dealId').value = ''; // No dealId for a new deal
    // Show the modal
    document.getElementById('dealModal').style.display = 'block';
};

// Function to close the deal modal
window.closeDealModal = function() {
    document.getElementById('dealModal').style.display = 'none';
};



// Function to edit a deal
window.editDeal = function(dealId) {
    const deal = deals.find(d => d.id === dealId);
    const newDealName = prompt('Edit Deal Name:', deal.name);
    if (newDealName) {
        deal.name = newDealName;
        renderDeals();
    }
}

// Function to delete a deal
window.deleteDeal = function(dealId) {
    deals = deals.filter(d => d.id !== dealId);
    renderDeals();
}

// Function to search deals
window.searchDeals = function() {
    const searchTerm = document.getElementById('searchDeals').value.toLowerCase();
    const filteredDeals = deals.filter(deal => deal.name.toLowerCase().includes(searchTerm));
    renderDeals(filteredDeals);
}





// Make functions globally accessible
window.openProfileModal = function () {
    document.getElementById('profileModal').style.display = 'flex';
    // Pre-fill the modal with the current user's information
    const user = auth.currentUser;
    if (user) {
        document.getElementById('username').value = user.displayName || '';
        document.getElementById('email').value = user.email || '';
    }
};

window.closeProfileModal = function () {
    document.getElementById('profileModal').style.display = 'none';
};

// Function to preview profile picture before upload
window.previewProfilePicture = function (event) {
    const reader = new FileReader();
    reader.onload = function () {
        const output = document.querySelector('.profile-img');
        output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
};




// Function to load the user profile
window.loadUserProfile = async function () {
    const user = auth.currentUser;
    if (!user) return;

    // Show a loading state for profile image and username
    document.querySelector('.profile-img').src = 'path/to/loading-placeholder.gif';
    document.querySelector('.profile-username').textContent = 'Loading...';

    try {
        // Fetch user profile data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();

            // Update username
            document.querySelector('.profile-username').textContent = userData.username || user.displayName || 'User';

            // Update profile picture
            if (user.photoURL) {
                document.querySelector('.profile-img').src = user.photoURL;
            } else {
                document.querySelector('.profile-img').src = 'path/to/default-avatar.png';
            }
        } else {
            console.error('No user data found in Firestore.');
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
        alert('Error loading profile data: ' + error.message);
    }
};



// Call loadUserProfile on page load or when the user logs in
window.onload = function() {
    loadUserProfile();
    showDashboard();
    renderDeals(); // Render deals on load
};


// Function to delete user account
window.deleteAccount = async function () {
    try {
        const user = auth.currentUser;
        await deleteDoc(doc(db, "users", user.uid)); // Remove user data from Firestore
        await deleteUser(user); // Delete user from Firebase Authentication
        alert('Account deleted successfully.');
        window.location.href = 'index.html'; // Redirect to landing page
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error deleting account: ' + error.message);
    }
};

// Function to open the deal modal
window.openDealModal = function(deal = null) {
    document.getElementById('cardModal').style.display = 'flex';
    
    if (deal) {
        // Populate modal with existing deal data
        document.getElementById('businessName').value = deal.businessName || '';
        document.getElementById('status').value = deal.status || '';
        document.getElementById('yearsInBusiness').value = deal.yearsInBusiness || '';
        // Populate other fields as needed...
    } else {
        // Clear modal fields for a new deal
        document.getElementById('dealForm').reset();
    }
};

// Function to close the deal modal
window.closeDealModal = function() {
    document.getElementById('cardModal').style.display = 'none';
};

// Function to save a new or edited deal
window.saveDeal = async function() {
    const user = auth.currentUser;
    if (!user) return; // Ensure the user is authenticated

    const dealId = document.getElementById('dealId').value || doc(collection(db, 'deals')).id; // Generate a new ID if not provided

    const dealData = {
        businessName: document.getElementById('businessName').value,
        status: document.getElementById('status').value,
        yearsInBusiness: document.getElementById('yearsInBusiness').value,
        fullTimeEmployees: document.getElementById('fullTimeEmployees').value,
        partTimeEmployees: document.getElementById('partTimeEmployees').value,
        contractors: document.getElementById('contractors').value,
        businessAddress: document.getElementById('businessAddress').value,
        licenses: document.getElementById('licenses').value,
        notes: document.getElementById('notes').value,
        askingPrice: document.getElementById('askingPrice').value,
        realEstatePrice: document.getElementById('realEstatePrice').value,
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        userId: user.uid, // Associate deal with the current user
        dealId: dealId // Ensure the dealId is saved
    };

    try {
        const dealsCollection = collection(db, 'deals'); // Reference to the 'deals' collection
        await setDoc(doc(dealsCollection, dealId), dealData); // Save deal data to Firestore

        alert('Deal saved successfully!');
        closeDealModal();
        fetchDeals(); // Refresh deals on the dashboard
    } catch (error) {
        console.error('Error saving deal:', error);
        alert('Error saving deal: ' + error.message);
    }
};

// Function to fetch and display deals
window.fetchDeals = async function() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const dealsCollection = collection(db, 'deals');
        const dealsSnapshot = await getDocs(query(dealsCollection, where("userId", "==", user.uid)));

        deals = dealsSnapshot.docs.map(doc => doc.data()); // Fetch all deals for the user

        renderDeals(); // Render deal cards on the dashboard
    } catch (error) {
        console.error('Error fetching deals:', error);
    }
};

// Function to fetch deals for the user
window.fetchDeals = async function() {
    const user = auth.currentUser;
    if (!user) return; // Ensure the user is authenticated

    const dealsCollection = collection(db, 'deals'); // Get reference to the deals collection
    const dealQuery = query(dealsCollection, where('userId', '==', user.uid));
    const dealSnapshot = await getDocs(dealQuery);
    deals = dealSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderDeals(); // Render the deals on the page
};

// Function to render deals on the dashboard
function renderDeals() {
    const dealGrid = document.getElementById('dealGrid');
    dealGrid.innerHTML = ''; // Clear the existing content

    deals.forEach(deal => {
        const dealCard = document.createElement('div');
        dealCard.className = 'deal-card';
        dealCard.innerHTML = `
            <h4>${deal.businessName}</h4>
            <p>Status: ${deal.status}</p>
            <p>Asking Price: ${deal.askingPrice}</p>
            <p>Last Updated: ${new Date(deal.lastUpdate).toLocaleDateString()}</p>
            <div class="deal-actions">
                <button onclick="editDeal('${deal.dealId}')">Edit</button>
                <button onclick="deleteDeal('${deal.dealId}')">Delete</button>
            </div>
        `;
        dealGrid.appendChild(dealCard);
    });
}





