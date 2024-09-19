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





// Deal Management Functions
let deals = []; // Example array to hold deals

// Function to open the deal creation modal
window.createDeal = function() {
    document.getElementById('dealForm').reset(); // Reset the form fields
    document.getElementById('dealId').value = ''; // Clear dealId for a new deal
    document.getElementById('modalTitle').textContent = 'Create a New Deal'; // Set modal title
    
    // Open the modal using the new animation method
    openCardModal();
};

// Function to close the card modal
window.closeCardModal = function() {
    document.getElementById('cardModal').style.display = 'none';
};






// Function to search deals
window.searchDeals = function() {
    const searchTerm = document.getElementById('searchDeals').value.toLowerCase();
    const filteredDeals = deals.filter(deal => deal.name.toLowerCase().includes(searchTerm));
    renderDeals(filteredDeals);
}


// Function to open the deal modal
window.openCardModal = function() {
    const modal = document.getElementById('cardModal');
    modal.style.display = 'flex'; // Ensure the modal is visible
    setTimeout(() => {
        modal.classList.add('show'); // Add the 'show' class for animation
    }, 10); // Slight delay for transition
};

// Function to close the deal modal with animation
window.closeCardModal = function() {
    const modal = document.getElementById('cardModal');
    modal.classList.remove('show'); // Remove the 'show' class for fade-out
    setTimeout(() => {
        modal.style.display = 'none'; // Hide the modal after transition
    }, 500); // Wait for the animation to finish (0.5s)
};








// Function to edit a deal (opens the modal pre-filled with the deal data)
window.editDeal = function(dealId) {
    const deal = deals.find(d => d.dealId === dealId); // Find deal by its Firestore ID
    if (deal) {
        // Populate the modal with existing deal data
        document.getElementById('dealId').value = deal.dealId; // Store the deal ID in a hidden field
        document.getElementById('businessName').value = deal.businessName;
        document.getElementById('status').value = deal.status;
        document.getElementById('yearsInBusiness').value = deal.yearsInBusiness;
        document.getElementById('fullTimeEmployees').value = deal.fullTimeEmployees;
        document.getElementById('partTimeEmployees').value = deal.partTimeEmployees;
        document.getElementById('contractors').value = deal.contractors;
        document.getElementById('businessAddress').value = deal.businessAddress;
        document.getElementById('licenses').value = deal.licenses;
        document.getElementById('notes').value = deal.notes;
        document.getElementById('askingPrice').value = deal.askingPrice;
        document.getElementById('realEstatePrice').value = deal.realEstatePrice;

        // Update the modal title
        document.getElementById('modalTitle').textContent = 'Edit Deal';

        // Open the modal using the new animation method
        openCardModal(); 
    } else {
        console.error('Deal not found.');
    }
};

// Function to save a new or edited deal
window.saveDeal = async function() {
    const user = auth.currentUser;
    if (!user) return;

    const dealId = document.getElementById('dealId').value || doc(collection(db, 'deals')).id;

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
        lastUpdate: new Date().toISOString(),
        userId: user.uid,
        dealId: dealId
    };

    try {
        const dealsCollection = collection(db, 'deals');
        await setDoc(doc(dealsCollection, dealId), dealData);

        showToast('Deal saved successfully!');
        closeCardModal();
        fetchDeals(); // Refresh deals on the dashboard
    } catch (error) {
        console.error('Error saving deal:', error);
        showToast('Error saving deal: ' + error.message, false);
    }
};


// Function to handle loan type changes
window.handleLoanTypeChange = function() {
    const loanType = document.getElementById('loanType').value;

    // Reset interest rate, loan term, and loan amount for the first row
    const interestRate1 = document.getElementById('interestRate1');
    const loanTerm1 = document.getElementById('loanTerm1');
    const loanAmount1 = document.getElementById('loanAmount1');

    if (loanType === 'SBA') {
        interestRate1.value = '11.5';
        loanTerm1.value = '10';
        loanAmount1.value = '0';
    } else if (loanType === 'Seller Finance') {
        interestRate1.value = '11.5';
        loanTerm1.value = '10';
        loanAmount1.value = '0';
    } else if (loanType === 'Blended') {
        interestRate1.value = '11.5';
        loanTerm1.value = '15';
        loanAmount1.value = '0';
    } else if (loanType === 'SBA + Seller Finance') {
        // For SBA + Seller Finance, pre-fill first row and add a second row
        interestRate1.value = '11.5';
        loanTerm1.value = '10';
        loanAmount1.value = '0';
        window.addSecondLoanRow();
    } else {
        // Clear the fields when selecting other loan types
        interestRate1.value = '';
        loanTerm1.value = '';
        loanAmount1.value = '';
        window.removeSecondLoanRow(); // Ensure second row is removed if any
    }
}

// Function to add second loan details row (for SBA + Seller Finance)
window.addSecondLoanRow = function() {
    if (!document.getElementById('loanDetailsRow2')) {
        const additionalLoanDetails = document.getElementById('additionalLoanDetails');

        const newRow = document.createElement('div');
        newRow.classList.add('three-column');
        newRow.id = 'loanDetailsRow2'; // Second loan row

        newRow.innerHTML = `
            <div class="input-item">
                <input type="text" id="interestRate2" placeholder="Interest Rate (%)" value="11.5" />
            </div>
            <div class="input-item">
                <input type="text" id="loanTerm2" placeholder="Loan Term (Years)" value="10" />
            </div>
            <div class="input-item">
                <input type="text" id="loanAmount2" placeholder="Loan Amount ($)" value="0" />
            </div>
        `;

        additionalLoanDetails.appendChild(newRow);
    }
}

// Function to remove the second loan details row
window.removeSecondLoanRow = function() {
    const secondRow = document.getElementById('loanDetailsRow2');
    if (secondRow) {
        secondRow.remove();
    }
}







let dealToDelete = null;

// Function to open the delete confirmation modal
window.openConfirmationModal = function(dealId) {
    dealToDelete = dealId; // Store the deal ID to be deleted
    document.getElementById('confirmationModal').style.display = 'flex'; // Show the delete modal
};

// Function to close the delete confirmation modal
window.closeConfirmationModal = function() {
    dealToDelete = null; // Reset the deal ID
    document.getElementById('confirmationModal').style.display = 'none'; // Hide the delete modal
};

// Function to confirm the deletion of the deal
window.confirmDeleteDeal = async function() {
    if (!dealToDelete) return; // Ensure there's a deal to delete

    const user = auth.currentUser;
    if (!user) return;

    try {
        // Remove the deal from Firestore
        await deleteDoc(doc(db, 'deals', dealToDelete));

        // Remove the deal from the local array
        deals = deals.filter(d => d.dealId !== dealToDelete);

        showToast('Deal deleted successfully.');
        renderDeals(); // Re-render the deal cards on the dashboard
        closeConfirmationModal(); // Close the modal after successful deletion
    } catch (error) {
        console.error('Error deleting deal:', error);
        showToast('Error deleting deal: ' + error.message, false);
    }
};

// Function to delete a deal
window.deleteDeal = async function(dealId) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // Remove the deal from Firestore
        await deleteDoc(doc(db, 'deals', dealId));

        // Remove the deal from the local array
        deals = deals.filter(d => d.dealId !== dealId);

        showToast('Deal deleted successfully.');
        renderDeals(); // Re-render the deal cards on the dashboard
    } catch (error) {
        console.error('Error deleting deal:', error);
        showToast('Error deleting deal: ' + error.message, false);
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
                <button onclick="openConfirmationModal('${deal.dealId}')">Delete</button>
            </div>
        `;
        dealGrid.appendChild(dealCard);
    });
}


// Function to format numbers as dollar amounts with commas and no decimals
window.formatAsCurrency = function(input) {
    // Remove any non-digit characters, except for commas
    let value = input.value.replace(/[^\d]/g, '');

    if (value === '') {
        input.value = ''; // Set input to an empty string to show placeholder
    } else {
        // Format value as currency with commas and no decimals
        input.value = parseInt(value, 10).toLocaleString('en-US');
    }
}

// Add event listeners for each field
window.addCurrencyFormattingListeners = function() {
    const fields = [
        'askingPrice', 
        'ffe', 
        'realEstatePrice', 
        'downPayment', 
        'buyerSalary', 
        'loanAmount1', 
        'loanAmount2'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                formatAsCurrency(field);
            });
        }
    });
}

// Call this function when the modal opens to apply formatting listeners
document.addEventListener('DOMContentLoaded', function() {
    addCurrencyFormattingListeners();
});





let revenueCashflowCount = 1;

// Function to add a new row
window.addRevenueCashflowRow = function() {
    revenueCashflowCount++;

    const newRow = document.createElement('div');
    newRow.classList.add('revenue-cashflow-row');

    newRow.innerHTML = `
        <div class="button-container">
            <button class="btn-remove" onclick="removeRevenueCashflowRow(this)">−</button>
        </div>
        <div class="input-item year-text">
            <div contenteditable="true" class="editable-year" name="revenueYear[]" id="revenueYear${revenueCashflowCount}">Year</div>
        </div>
        <div class="input-item small-input">
            <input type="text" name="revenue[]" id="revenue${revenueCashflowCount}"  oninput="updateProfitMargin(this)">
        </div>
        <div class="input-item small-input">
            <input type="text" name="cashflow[]" id="cashflow${revenueCashflowCount}"  oninput="updateProfitMargin(this)">
        </div>
        <div class="input-item profit-margin">
            <span id="profitMargin${revenueCashflowCount}">0%</span>
        </div>
    `;

    document.getElementById('revenueCashflowSection').appendChild(newRow);
};


// Function to remove a row
window.removeRevenueCashflowRow = function(button) {
    const rowToRemove = button.closest('.revenue-cashflow-row');
    rowToRemove.remove();
};

// Function to format numbers as currency without decimals
function formatCurrency(value) {
    
    const number = parseFloat(value.replace(/[^\d]/g, ''));
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(number || 0);
}

// Function to update profit margin
window.updateProfitMargin = function(inputElement) {
    const row = inputElement.closest('.revenue-cashflow-row');
    const revenueInput = row.querySelector('input[name="revenue[]"]');
    const cashflowInput = row.querySelector('input[name="cashflow[]"]');
    const profitMarginElement = row.querySelector('.profit-margin span');

    const revenue = parseFloat(revenueInput.value.replace(/[^\d]/g, '')) || 0;
    const cashflow = parseFloat(cashflowInput.value.replace(/[^\d]/g, '')) || 0;

    const profitMargin = revenue > 0 ? ((cashflow / revenue) * 100).toFixed(0) : 0;
    profitMarginElement.textContent = `${profitMargin}%`;

    revenueInput.value = formatCurrency(revenueInput.value);
    cashflowInput.value = formatCurrency(cashflowInput.value);
};


// Function to re-index the Revenue and Cashflow rows
function reindexRows() {
    const rows = document.querySelectorAll('.revenue-cashflow-entry');
    rows.forEach((row, index) => {
        const rowNumber = index + 1;

        const revenueYearInput = row.querySelector('.editable-year[name="revenueYear[]"]');
        const revenueInput = row.querySelector('input[name="revenue[]"]');
        const cashflowYearInput = row.querySelector('.editable-year[name="cashflowYear[]"]');
        const cashflowInput = row.querySelector('input[name="cashflow[]"]');

        // Update input IDs and placeholders for dynamic re-indexing
        revenueYearInput.id = `revenueYear${rowNumber}`;
        revenueInput.id = `revenue${rowNumber}`;
        cashflowYearInput.id = `cashflowYear${rowNumber}`;
        cashflowInput.id = `cashflow${rowNumber}`;
    });
}








