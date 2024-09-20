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
    console.log(deals); // Inspect the deals array

    const deal = deals.find(d => d.dealId === dealId); // Find deal by its Firestore ID
    if (deal) {
        // Clear any existing revenue and cashflow rows
        document.getElementById('revenueCashflowSection').innerHTML = '';

        // Populate the modal with existing deal data
        document.getElementById('dealId').value = deal.dealId;
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
        document.getElementById('ffe').value = deal.ffe;

        // Populate funding section
        document.getElementById('downPayment').value = deal.downPayment;
        document.getElementById('buyerSalary').value = deal.buyerSalary;
        document.getElementById('loanType').value = deal.loanType;
        document.getElementById('interestRate1').value = deal.interestRate || '';
        document.getElementById('loanTerm1').value = deal.loanTerm || '';
        document.getElementById('loanAmount1').value = deal.loanAmount || '';

        // Populate broker contact info
        if (deal.brokerContact) {
            const brokerBtn = document.querySelector('button[onclick="window.openBrokerContactModal()"]');
            brokerBtn.setAttribute('data-tooltip', `Company: ${deal.brokerContact.company}\nPhone: ${deal.brokerContact.phone}\nEmail: ${deal.brokerContact.email}`);
            // Optionally open modal if needed
            document.getElementById('brokerCompany').value = deal.brokerContact.company;
            document.getElementById('brokerName').value = deal.brokerContact.name;
            document.getElementById('brokerPhone').value = deal.brokerContact.phone;
            document.getElementById('brokerEmail').value = deal.brokerContact.email;
        }

        // Populate seller contact info
        if (deal.sellerContact) {
            const sellerBtn = document.querySelector('button[onclick="window.openSellerContactModal()"]');
            sellerBtn.setAttribute('data-tooltip', `Phone: ${deal.sellerContact.phone}\nEmail: ${deal.sellerContact.email}`);
            // Optionally open modal if needed
            document.getElementById('sellerName').value = deal.sellerContact.name;
            document.getElementById('sellerPhone').value = deal.sellerContact.phone;
            document.getElementById('sellerEmail').value = deal.sellerContact.email;
        }

         // Populate Revenue and Cashflow rows
        revenueCashflowCount = 0; // Reset the counter before adding rows
        if (deal.revenueCashflowEntries) {
            deal.revenueCashflowEntries.forEach((entry, index) => {
                addRevenueCashflowRow(); // Adds a new row
                const revenueInput = document.getElementById(`revenue${revenueCashflowCount}`);
                const cashflowInput = document.getElementById(`cashflow${revenueCashflowCount}`);
                const revenueYearInput = document.getElementById(`revenueYear${revenueCashflowCount}`);

                if (revenueInput && cashflowInput && revenueYearInput) {
                    revenueYearInput.textContent = entry.year;
                    
                    // Ensure the revenue and cashflow are formatted correctly
                    revenueInput.value = formatCurrency(entry.revenue);  // Format the revenue as currency
                    cashflowInput.value = formatCurrency(entry.cashflow); // Format the cashflow as currency

                    // Update profit margin for each row
                    updateProfitMargin(revenueInput);
                } else {
                    console.error('Error: Unable to populate revenue/cashflow row.');
                }
            });

        }



        // Populate documents
        const documentList = document.getElementById('documentList');
        documentList.innerHTML = ''; // Clear current documents

        if (deal.documents) {
            deal.documents.forEach((doc, index) => {
                const docElement = document.createElement('div');
                docElement.classList.add('document-item');

                // View link for the document
                const docLink = document.createElement('a');
                docLink.href = doc.url;  // Firebase Storage URL
                docLink.target = '_blank';  // Open in new tab
                docLink.textContent = doc.name;  // Display the document name
                docElement.appendChild(docLink);

                // Delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-doc-button');
                deleteButton.onclick = function() {
                    deleteDocument(deal.dealId, doc.name, index); // Pass name and index to deleteDocument
                };
                docElement.appendChild(deleteButton);

                documentList.appendChild(docElement);
            });
        }

        // Update the modal title
        document.getElementById('modalTitle').textContent = 'Edit Deal';

        // Call updateBuyBoxChecklist with the current deal data
        window.updateBuyBoxChecklist(deal);

        // Add real-time event listeners for updating calculations
        window.addRealTimeChecklistUpdates();
        window.setupRealTimeUpdates();

        // Ensure the form has loaded before calculating
        setTimeout(() => {
            window.updateAskingPrice(); // Calculate asking price
            window.calculateDebtService(); // Calculate debt service
        }, 0); // A slight delay ensures that the form elements are rendered

        // Open the modal using the new method
        openCardModal();
    } else {
        console.error('Deal not found.');
    }
};


// Function to delete a document from Firebase Storage and Firestore
async function deleteDocument(dealId, docName, index) {
    try {
        // Reference to the document in Firebase Storage
        const docRef = ref(storage, `deals/${dealId}/documents/${docName}`);
        
        // Delete the file from Firebase Storage
        await deleteObject(docRef);

        // Optionally, remove the document reference from Firestore (adjust the path to your Firestore structure)
        const dealRef = doc(db, 'deals', dealId);
        
        // Fetch the deal data
        const dealDoc = await getDoc(dealRef);
        if (dealDoc.exists()) {
            const dealData = dealDoc.data();
            
            // Remove the deleted document from the documents array
            dealData.documents.splice(index, 1);  // Remove the document at the specified index

            // Update Firestore with the new documents array
            await setDoc(dealRef, { documents: dealData.documents }, { merge: true });

            showToast('Document deleted successfully!');
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        showToast('Error deleting document: ' + error.message, false);
    }
}



// Function to upload documents to Firebase Storage and return the file URLs
async function uploadDocuments(dealId) {
    const storageRef = ref(storage, `deals/${dealId}/documents/`);
    const uploadedURLs = [];

    for (const file of window.uploadedDocuments) {
        const fileRef = ref(storageRef, file.name);
        await uploadBytes(fileRef, file);
        const fileURL = await getDownloadURL(fileRef);
        uploadedURLs.push({ name: file.name, url: fileURL });
    }

    return uploadedURLs;
}


// Function to save a new or edited deal
window.saveDeal = async function() {
    const user = auth.currentUser;
    if (!user) return;

    const dealId = document.getElementById('dealId').value || doc(collection(db, 'deals')).id;

    // Gather broker contact information
    const brokerContact = {
        company: document.getElementById('brokerCompany')?.value || '',
        name: document.getElementById('brokerName')?.value || '',
        phone: document.getElementById('brokerPhone')?.value || '',
        email: document.getElementById('brokerEmail')?.value || ''
    };

    // Gather seller contact information
    const sellerContact = {
        name: document.getElementById('sellerName')?.value || '',
        phone: document.getElementById('sellerPhone')?.value || '',
        email: document.getElementById('sellerEmail')?.value || ''
    };

    // Gather revenue and cashflow data
    const revenueCashflowEntries = [];
	const revenueRows = document.querySelectorAll('.revenue-cashflow-row');
	revenueRows.forEach((row, index) => {
	    const year = row.querySelector('.editable-year').textContent;
	    const revenue = row.querySelector('input[name="revenue[]"]').value.replace(/[^0-9.-]+/g, ''); // Strip non-numeric characters
	    const cashflow = row.querySelector('input[name="cashflow[]"]').value.replace(/[^0-9.-]+/g, ''); // Strip non-numeric characters

	    revenueCashflowEntries.push({
	        year,
	        revenue: parseFloat(revenue), // Ensure it's a number
	        cashflow: parseFloat(cashflow), // Ensure it's a number
	    });
	});


    // Create deal data object
    const dealData = {
        businessName: document.getElementById('businessName').value,
        industry: document.getElementById('industry').value,
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
        ffe: document.getElementById('ffe').value,
        downPayment: document.getElementById('downPayment').value,
        buyerSalary: document.getElementById('buyerSalary').value,
        loanType: document.getElementById('loanType').value,
        interestRate: document.getElementById('interestRate1').value,
        loanTerm: document.getElementById('loanTerm1').value,
        loanAmount: document.getElementById('loanAmount1').value,
        revenueCashflowEntries, // Add financials
        brokerContact, // Add broker contact info
        sellerContact, // Add seller contact info
        lastUpdate: new Date().toISOString(),
        userId: user.uid,
    };

    try {
        // Step 1: Save the deal data first
        const dealsCollection = collection(db, 'deals');
        await setDoc(doc(dealsCollection, dealId), dealData);

        // Step 2: Upload the documents after the deal is saved
        const uploadedDocumentURLs = await uploadDocuments(dealId);

        // Step 3: Merge the document URLs into the deal document in Firestore
        await setDoc(doc(dealsCollection, dealId), { documents: uploadedDocumentURLs }, { merge: true });

        // Refresh the deals array by calling fetchDeals() to make sure we have the latest data
        await fetchDeals();  // Fetch the updated list of deals from Firestore

        showToast('Deal saved successfully!');
        closeCardModal();
    } catch (error) {
        console.error('Error saving deal:', error);
        showToast('Error saving deal: ' + error.message, false);
    }
};


// Function to fetch and display deals
window.fetchDeals = async function() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const dealsCollection = collection(db, 'deals');
        const dealsSnapshot = await getDocs(query(dealsCollection, where("userId", "==", user.uid)));

        // Add dealId from Firestore document metadata
        deals = dealsSnapshot.docs.map(doc => ({ dealId: doc.id, ...doc.data() })); // Include dealId
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
                <button onclick="editDeal('${deal.dealId}')">Edit</button> <!-- Ensure dealId is correct -->
                <button onclick="openConfirmationModal('${deal.dealId}')">Delete</button>
            </div>
        `;
        dealGrid.appendChild(dealCard);
    });
}




// Global object to store uploaded documents
window.uploadedDocuments = [];

// Function to handle the document upload in the modal (before saving to Firebase)
window.uploadDocument = function() {
    const documentList = document.getElementById('documentList');
    const fileInput = document.getElementById('documentFile');
    const files = fileInput.files;

    // Iterate through the files and display them in the modal
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileElement = document.createElement('div');
        fileElement.textContent = `${file.name}`;

        // Add view button next to the file name
        const viewButton = document.createElement('button');
        viewButton.textContent = 'View';
        viewButton.classList.add('view-document');
        viewButton.onclick = function() {
            // Create a URL for the file and open it in a new tab
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
        };
        fileElement.appendChild(viewButton);

        // Add delete button next to the file name
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-document');
        deleteButton.onclick = function() {
            documentList.removeChild(fileElement);
            window.uploadedDocuments = window.uploadedDocuments.filter(doc => doc !== file);
        };
        fileElement.appendChild(deleteButton);

        documentList.appendChild(fileElement);
        window.uploadedDocuments.push(file); // Add to global list of uploaded documents
    }

    // Clear the file input after uploading
    fileInput.value = '';
};






// Function to handle loan type changes
window.handleLoanTypeChange = function() {
    const loanType = document.getElementById('loanType').value;

    // Reset interest rate, loan term, and loan amount for the first row
    const interestRate1 = document.getElementById('interestRate1');
    const loanTerm1 = document.getElementById('loanTerm1');
    const loanAmount1 = document.getElementById('loanAmount1');

    // Always remove the second loan row before applying new loan type values
    window.removeSecondLoanRow(); 

    // Apply new loan type settings
    if (loanType === 'SBA') {
        interestRate1.value = '11.5';
        loanTerm1.value = '10';
        loanAmount1.value = '0'; // You might want to update this based on user input
    } else if (loanType === 'Seller Finance') {
        interestRate1.value = '11.5';
        loanTerm1.value = '10';
        loanAmount1.value = '0'; // Update based on user input
    } else if (loanType === 'Blended') {
        interestRate1.value = '11.5';
        loanTerm1.value = '15';
        loanAmount1.value = '0'; // Update based on user input
    } else if (loanType === 'SBA + Seller Finance') {
        // Pre-fill first row and add a second row for SBA + Seller Finance
        interestRate1.value = '11.5';
        loanTerm1.value = '10';
        loanAmount1.value = '0'; // Update based on user input
        window.addSecondLoanRow(); // Add second loan row for Seller Finance
    } else {
        // Clear the fields for other loan types
        interestRate1.value = '';
        loanTerm1.value = '';
        loanAmount1.value = '';
    }
};

// Function to add second loan details row (for SBA + Seller Finance)
window.addSecondLoanRow = function() {
    if (!document.getElementById('loanDetailsRow2')) {
        const additionalLoanDetails = document.getElementById('additionalLoanDetails');

        const newRow = document.createElement('div');
        newRow.classList.add('loan-input-row'); // Match the same class as loanDetailsRow1
        newRow.id = 'loanDetailsRow2'; // Second loan row

        newRow.innerHTML = `
            <div class="loan-input-item">
                <input type="text" id="interestRate2" placeholder="Interest Rate (%)" value="11.5" />
            </div>
            <div class="loan-input-item">
                <input type="text" id="loanTerm2" placeholder="Loan Term (Years)" value="10" />
            </div>
            <div class="loan-input-item">
                <input type="text" id="loanAmount2" placeholder="Loan Amount ($)" value="0" />
            </div>
        `;

        additionalLoanDetails.appendChild(newRow);
    }
};



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
    const confirmationModal = document.getElementById('confirmationModal');
    confirmationModal.style.display = 'flex'; // Show the delete modal
};

// Function to close the delete confirmation modal
window.closeConfirmationModal = function() {
    dealToDelete = null; // Reset the deal ID
    const confirmationModal = document.getElementById('confirmationModal');
    confirmationModal.style.display = 'none'; // Hide the delete modal
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





// Function to format numbers as dollar amounts with commas, no decimals, and a dollar sign
window.formatAsCurrency = function(input) {
    // Check if input is an object and has a value property, if not assume input is a number or string
    let value = typeof input === 'object' && input !== null ? input.value : input;

    if (typeof value === 'string') {
        // Remove any non-digit characters, except for commas
        value = value.replace(/[^\d]/g, '');
    }

    if (value === '' || isNaN(value)) {
        value = ''; // Set to empty string if invalid
    } else {
        // Format value as currency with dollar sign and commas
        value = '$' + parseInt(value, 10).toLocaleString('en-US');
    }

    // If input is an object, update its value
    if (typeof input === 'object' && input !== null) {
        input.value = value;
    } 

    // Return the formatted value in case it's needed for display elsewhere
    return value;
};


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
            <input type="text" name="revenue[]" id="revenue${revenueCashflowCount}" oninput="updateProfitMargin(this)">
        </div>
        <div class="input-item small-input">
            <input type="text" name="cashflow[]" id="cashflow${revenueCashflowCount}" oninput="updateProfitMargin(this)">
        </div>
        <div class="input-item profit-column">
            <span id="profitMargin${revenueCashflowCount}">0%</span>
        </div>
    `;

    document.getElementById('revenueCashflowSection').appendChild(newRow);

    // Attach event listeners to the newly added revenue and cashflow inputs
    const newRevenueInput = document.getElementById(`revenue${revenueCashflowCount}`);
    const newCashflowInput = document.getElementById(`cashflow${revenueCashflowCount}`);

    newRevenueInput.addEventListener('input', triggerBuyBoxUpdate);
    newCashflowInput.addEventListener('input', triggerBuyBoxUpdate);

    // Ensure real-time profit margin calculation
    updateProfitMargin(newRevenueInput);
};

// Function to remove a row and reindex the remaining rows
window.removeRevenueCashflowRow = function(button) {
    const rowToRemove = button.closest('.revenue-cashflow-row');
    rowToRemove.remove();
    reindexRows(); // Re-index rows after removing one
    triggerBuyBoxUpdate(); // Recalculate Buy Box Checklist after removing a row
};


// Function to format numbers as currency without decimals
function formatCurrency(value) {
    // Check if the value is already a number, if not, convert it to a string
    if (typeof value === 'number') {
        value = value.toString();
    }

    // Remove any non-digit characters (except for "." for decimals and "-" for negative numbers)
    const number = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;

    // Format as USD currency
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 0 
    }).format(number);
}


// Function to update profit margin
window.updateProfitMargin = function(inputElement) {
    const row = inputElement.closest('.revenue-cashflow-row');
    if (!row) {
        console.error('Error: Cannot find the closest row.');
        return;
    }

    const revenueInput = row.querySelector('input[name="revenue[]"]');
    const cashflowInput = row.querySelector('input[name="cashflow[]"]');
    const profitMarginElement = row.querySelector('.profit-column span');

    if (!revenueInput || !cashflowInput || !profitMarginElement) {
        console.error('Error: Required input elements not found.');
        return;
    }

    // Perform the profit margin calculation
    const revenue = parseFloat(revenueInput.value.replace(/[^\d.-]/g, '')) || 0;
    const cashflow = parseFloat(cashflowInput.value.replace(/[^\d.-]/g, '')) || 0;
    const profitMargin = revenue > 0 ? ((cashflow / revenue) * 100).toFixed(2) : 0;
    
    // Update the profit margin display
    profitMarginElement.textContent = `${profitMargin}%`;

    // Reformat the inputs for display
    revenueInput.value = formatCurrency(revenueInput.value);
    cashflowInput.value = formatCurrency(cashflowInput.value);
};


// Function to re-index the Revenue and Cashflow rows
function reindexRows() {
    const rows = document.querySelectorAll('.revenue-cashflow-row');
    rows.forEach((row, index) => {
        const rowNumber = index + 1;

        const revenueYearInput = row.querySelector('.editable-year[name="revenueYear[]"]');
        const revenueInput = row.querySelector('input[name="revenue[]"]');
        const cashflowInput = row.querySelector('input[name="cashflow[]"]');
        const profitMarginElement = row.querySelector('.profit-column span');

        if (!revenueYearInput || !revenueInput || !cashflowInput || !profitMarginElement) {
            console.error(`Error: Missing elements in row ${rowNumber}`);
            return;
        }

        // Update input IDs and placeholders for dynamic re-indexing
        revenueYearInput.id = `revenueYear${rowNumber}`;
        revenueInput.id = `revenue${rowNumber}`;
        cashflowInput.id = `cashflow${rowNumber}`;
        profitMarginElement.id = `profitMargin${rowNumber}`;

        // Remove any existing event listeners to avoid duplicates
        revenueInput.removeEventListener('input', updateProfitMargin);
        cashflowInput.removeEventListener('input', updateProfitMargin);

        // Attach event listeners to update profit margin and Buy Box dynamically
        revenueInput.addEventListener('input', () => {
            updateProfitMargin(revenueInput);
            triggerBuyBoxUpdate(); // Dynamically update the Buy Box when values change
        });

        cashflowInput.addEventListener('input', () => {
            updateProfitMargin(cashflowInput);
            triggerBuyBoxUpdate(); // Dynamically update the Buy Box when values change
        });
    });
}




// Open and Close Contact Modals
window.openBrokerContactModal = function() {
    document.getElementById('brokerContactModal').style.display = 'flex';  // Use flex to center
}

window.closeBrokerContactModal = function() {
    document.getElementById('brokerContactModal').style.display = 'none';
}

window.openSellerContactModal = function() {
    document.getElementById('sellerContactModal').style.display = 'flex';  // Use flex to center
}

window.closeSellerContactModal = function() {
    document.getElementById('sellerContactModal').style.display = 'none';
}

// Save Broker Contact Information
window.saveBrokerContact = function() {
    const name = document.getElementById('brokerName').value;
    const company = document.getElementById('brokerCompany').value;
    const phone = document.getElementById('brokerPhone').value;
    const email = document.getElementById('brokerEmail').value;

    const brokerButton = document.querySelector('button[onclick="window.openBrokerContactModal()"]');

    if (name && company && phone && email) {
        // Set the tooltip content only if contact info is filled
        brokerButton.setAttribute('data-tooltip', `Company: ${company}\nPhone: ${phone}\nEmail: ${email}`);
    } else {
        // Remove tooltip if no contact info is provided
        brokerButton.removeAttribute('data-tooltip');
    }
    closeBrokerContactModal();
}

// Save Seller Contact Information
window.saveSellerContact = function() {
    const name = document.getElementById('sellerName').value;
    const phone = document.getElementById('sellerPhone').value;
    const email = document.getElementById('sellerEmail').value;

    const sellerButton = document.querySelector('button[onclick="window.openSellerContactModal()"]');

    if (name && phone && email) {
        // Set the tooltip content only if contact info is filled
        sellerButton.setAttribute('data-tooltip', `Phone: ${phone}\nEmail: ${email}`);
    } else {
        // Remove tooltip if no contact info is provided
        sellerButton.removeAttribute('data-tooltip');
    }
    closeSellerContactModal();
}

// Function to open the document modal
window.openDocModal = function() {
    document.getElementById('docModal').style.display = 'flex';
}

// Function to close the document modal
window.closeDocModal = function() {
    document.getElementById('docModal').style.display = 'none';
}







//RESULTS SECTION - BUYBOX CHECKLIST

// Add real-time update event listeners
window.addRealTimeChecklistUpdates = function() {
    const revenueInputs = document.querySelectorAll('input[name="revenue[]"]');
    const cashflowInputs = document.querySelectorAll('input[name="cashflow[]"]');
    const yearsInBusinessInput = document.getElementById('yearsInBusiness');
    const fullTimeEmployeesInput = document.getElementById('fullTimeEmployees');

    // Update when revenue, cashflow, years in business, or full-time employees change
    revenueInputs.forEach(input => input.addEventListener('input', triggerBuyBoxUpdate));
    cashflowInputs.forEach(input => input.addEventListener('input', triggerBuyBoxUpdate));
    yearsInBusinessInput.addEventListener('input', triggerBuyBoxUpdate);
    fullTimeEmployeesInput.addEventListener('input', triggerBuyBoxUpdate);

    // Attach listeners for newly added rows dynamically
    document.getElementById('revenueCashflowSection').addEventListener('input', triggerBuyBoxUpdate);
};
// Function to get deal data from the form (for real-time updates)
window.getDealDataFromForm = function() {
    const yearsInBusiness = document.getElementById('yearsInBusiness').value;
    const fullTimeEmployees = document.getElementById('fullTimeEmployees').value;
    const revenueCashflowEntries = [];

    const revenueInputs = document.querySelectorAll('input[name="revenue[]"]');
    const cashflowInputs = document.querySelectorAll('input[name="cashflow[]"]');

    revenueInputs.forEach((input, index) => {
        const revenue = input.value;
        const cashflow = cashflowInputs[index].value;
        revenueCashflowEntries.push({
            revenue: parseFloat(revenue.replace(/[^\d.-]/g, '')) || 0,
            cashflow: parseFloat(cashflow.replace(/[^\d.-]/g, '')) || 0
        });
    });

    return {
        yearsInBusiness,
        fullTimeEmployees,
        revenueCashflowEntries
    };
};


// Function to update the Buy Box Checklist
window.updateBuyBoxChecklist = function(deal) {
    // 1. Check for 10+ years in business
    const yearsInBusiness = parseInt(deal.yearsInBusiness, 10);
    const yearsInBusinessCheck = yearsInBusiness >= 10;
    const yearsIcon = document.getElementById('checkYearsInBusiness');
    yearsIcon.classList.toggle('success', yearsInBusinessCheck);
    yearsIcon.classList.toggle('error', !yearsInBusinessCheck);

    // 2. Check for 10+ full-time employees
    const fullTimeEmployees = parseInt(deal.fullTimeEmployees, 10);
    const fullTimeEmployeesCheck = fullTimeEmployees >= 10;
    const employeesIcon = document.getElementById('checkFullTimeEmployees');
    employeesIcon.classList.toggle('success', fullTimeEmployeesCheck);
    employeesIcon.classList.toggle('error', !fullTimeEmployeesCheck);

    // 3. Check if average revenue is between $1M and $5M (orange if over $5M)
    let totalRevenue = 0;
    if (deal.revenueCashflowEntries && deal.revenueCashflowEntries.length > 0) {
        totalRevenue = deal.revenueCashflowEntries.reduce((sum, entry) => sum + parseFloat(entry.revenue || 0), 0);
    }
    const avgRevenue = totalRevenue / deal.revenueCashflowEntries.length;
    const revenueIcon = document.getElementById('checkRevenue');

    revenueIcon.classList.remove('success', 'warning', 'error');
    if (avgRevenue >= 1000000 && avgRevenue <= 5000000) {
        revenueIcon.classList.add('success');
    } else if (avgRevenue > 5000000) {
        revenueIcon.classList.add('warning');
    } else {
        revenueIcon.classList.add('error');
    }

    // 4. Check if average profit margin is categorized properly (red <16%, orange 17-19%, green >=20%)
    let totalCashflow = 0;
    if (deal.revenueCashflowEntries && deal.revenueCashflowEntries.length > 0) {
        totalCashflow = deal.revenueCashflowEntries.reduce((sum, entry) => sum + parseFloat(entry.cashflow || 0), 0);
    }

    const avgProfitMargin = totalRevenue > 0 ? (totalCashflow / totalRevenue) * 100 : 0;
    const profitMarginIcon = document.getElementById('checkProfitMargin');

    profitMarginIcon.classList.remove('success', 'warning', 'error');
    if (avgProfitMargin >= 20) {
        profitMarginIcon.classList.add('success');
    } else if (avgProfitMargin >= 17 && avgProfitMargin <= 19) {
        profitMarginIcon.classList.add('warning');
    } else {
        profitMarginIcon.classList.add('error');
    }

    // 5. Check if revenue is growing year over year (green if growing, orange within 5%, red if declining)
    let revenueGrowthCheck = true;
    let revenueGrowthStatus = 'success'; // Default to growing

    if (deal.revenueCashflowEntries && deal.revenueCashflowEntries.length > 1) {
        for (let i = 1; i < deal.revenueCashflowEntries.length; i++) {
            const currentYearRevenue = parseFloat(deal.revenueCashflowEntries[i].revenue || 0);
            const previousYearRevenue = parseFloat(deal.revenueCashflowEntries[i - 1].revenue || 0);

            const revenueDifference = ((currentYearRevenue - previousYearRevenue) / previousYearRevenue) * 100;

            if (revenueDifference > 0) {
                revenueGrowthStatus = 'success';
            } else if (Math.abs(revenueDifference) <= 5) {
                revenueGrowthStatus = 'warning';
            } else {
                revenueGrowthStatus = 'error';
                break;
            }
        }
    }
    const revenueGrowthIcon = document.getElementById('checkRevenueGrowth');
    revenueGrowthIcon.classList.remove('success', 'warning', 'error');
    revenueGrowthIcon.classList.add(revenueGrowthStatus);
};


// Function to trigger Buy Box Checklist update in real-time
window.triggerBuyBoxUpdate = function() {
    const deal = window.getDealDataFromForm();  // Collect current form data
    window.updateBuyBoxChecklist(deal);  // Update the Buy Box Checklist
};

// Function to collect current deal data (used to trigger updates in real-time)
window.collectCurrentDealData = function() {
    const revenueCashflowEntries = [];
    const revenueInputs = document.querySelectorAll('input[name="revenue[]"]');
    const cashflowInputs = document.querySelectorAll('input[name="cashflow[]"]');
    const yearInputs = document.querySelectorAll('.editable-year');

    revenueInputs.forEach((input, index) => {
        revenueCashflowEntries.push({
            revenue: parseFloat(input.value.replace(/[^\d.-]/g, '')) || 0,
            cashflow: parseFloat(cashflowInputs[index].value.replace(/[^\d.-]/g, '')) || 0,
            year: yearInputs[index].textContent || "Year"
        });
    });

    return {
        yearsInBusiness: document.getElementById('yearsInBusiness').value,
        fullTimeEmployees: document.getElementById('fullTimeEmployees').value,
        revenueCashflowEntries
    };
};

// Call this when the modal opens to add real-time event listeners
window.addRealTimeChecklistUpdates();


// Ensure this function is defined globally (outside any other function)
window.updateAskingPrice = function() {
    let askingPrice = document.getElementById('askingPrice').value;
    let realEstatePrice = document.getElementById('realEstatePrice').value;

    askingPrice = parseFloat(askingPrice.replace(/[^\d.-]/g, '')) || 0;
    realEstatePrice = parseFloat(realEstatePrice.replace(/[^\d.-]/g, '')) || 0;

    const includeRealEstate = document.getElementById('toggleRealEstate').value === 'with';
    const adjustedAskingPrice = includeRealEstate ? askingPrice : askingPrice - realEstatePrice;

    document.getElementById('displayAskingPrice').textContent = adjustedAskingPrice.toLocaleString('en-US');
    window.calculateDebtService(adjustedAskingPrice);  // Recalculate debt service
};




// Function to calculate debt service dynamically based on the loan amount, interest rate, and term
window.calculateDebtService = function() {
    let totalDebtService = 0;
    let loanBreakdown = '';

    const loanType = document.getElementById('loanType').value;
    const interestRate1 = parseFloat(document.getElementById('interestRate1').value) || 0;
    const loanTerm1 = parseInt(document.getElementById('loanTerm1').value, 10) || 0;
    let loanAmount1 = parseFloat(document.getElementById('loanAmount1').value.replace(/[^\d.-]/g, '')) || 0; // SBA Loan Amount

    if (loanType === 'SBA' || loanType === 'Seller Finance' || loanType === 'Blended') {
        // For single loan types, just calculate debt service for loanAmount1
        const annualDebtService1 = window.calculateAnnualDebtService(loanAmount1, interestRate1, loanTerm1);
        totalDebtService += annualDebtService1;
        loanBreakdown += `<p>${loanType} Loan Payment: $${annualDebtService1.toLocaleString('en-US')}</p>`;
    } else if (loanType === 'SBA + Seller Finance') {
        // For SBA + Seller Finance, we handle two separate loans

        // SBA Loan Calculation
        const sbaLoanAmount = parseFloat(document.getElementById('loanAmount1').value.replace(/[^\d.-]/g, '')) || 0;
        const sbaDebtService = window.calculateAnnualDebtService(sbaLoanAmount, interestRate1, loanTerm1);
        totalDebtService += sbaDebtService;
        loanBreakdown += `<p>SBA Loan Payment: $${sbaDebtService.toLocaleString('en-US')}</p>`;

        // Seller Finance Loan Calculation
        const interestRate2 = parseFloat(document.getElementById('interestRate2').value) || 0;
        const loanTerm2 = parseInt(document.getElementById('loanTerm2').value, 10) || 0;
        const sellerLoanAmount = parseFloat(document.getElementById('loanAmount2').value.replace(/[^\d.-]/g, '')) || 0; // Seller Finance Loan Amount
        const sellerDebtService = window.calculateAnnualDebtService(sellerLoanAmount, interestRate2, loanTerm2);
        totalDebtService += sellerDebtService;
        loanBreakdown += `<p>Seller Finance Loan Payment: $${sellerDebtService.toLocaleString('en-US')}</p>`;
    }

    document.getElementById('loanBreakdown').innerHTML = loanBreakdown;
    document.getElementById('totalDebtService').textContent = totalDebtService.toLocaleString('en-US');
    window.calculateEarnings(totalDebtService);  // Recalculate earnings
};

// Function to calculate annual debt service
window.calculateAnnualDebtService = function(amount, interestRate, termYears) {
    if (interestRate <= 0 || termYears <= 0 || amount <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = termYears * 12;
    const monthlyPayment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments));
    return monthlyPayment * 12; // Annual payment
};


// Function to calculate earnings section
window.calculateEarnings = function(totalDebtService) {
    let totalCashflow = 0;

    // Calculate total and average cashflow from the form
    const cashflows = document.querySelectorAll('input[name="cashflow[]"]');
    cashflows.forEach(input => {
        totalCashflow += parseFloat(input.value.replace(/[^\d.-]/g, '')) || 0;
    });
    const avgCashflow = totalCashflow / cashflows.length;

    // Calculate cashflow after debt service
    const cashflowAfterDebt = avgCashflow - totalDebtService;

    // Placeholder for cashflow after debt and investor pay (will update this logic later)
    const cashflowAfterDebtAndInvestor = cashflowAfterDebt; // Assuming no investor pay yet

    // Update the display
    document.getElementById('avgProfitMarginDisplay').textContent = (avgCashflow / totalCashflow * 100).toFixed(2) + '%';
    document.getElementById('avgCashflowDisplay').textContent = avgCashflow.toLocaleString('en-US');
    document.getElementById('cashflowAfterDebt').textContent = cashflowAfterDebt.toLocaleString('en-US');
    document.getElementById('cashflowAfterDebtAndInvestor').textContent = cashflowAfterDebtAndInvestor.toLocaleString('en-US');
};

// Real-time update triggers for dynamic updates
window.setupRealTimeUpdates = function() {
    // Update debt service calculations dynamically based on loan amount, interest rate, and term
    document.getElementById('loanAmount1').addEventListener('input', window.calculateDebtService);
    document.getElementById('interestRate1').addEventListener('input', window.calculateDebtService);
    document.getElementById('loanTerm1').addEventListener('input', window.calculateDebtService);
    document.getElementById('loanType').addEventListener('change', window.calculateDebtService);

    // Update other dynamic updates for BuyBoxChecklist
    document.getElementById('askingPrice').addEventListener('input', window.updateAskingPrice);
    document.getElementById('realEstatePrice').addEventListener('input', window.updateAskingPrice);
    document.getElementById('downPayment').addEventListener('input', window.updateAskingPrice);

    // Add listeners for revenue and cashflow changes
    document.querySelectorAll('input[name="cashflow[]"]').forEach(input => {
        input.addEventListener('input', triggerBuyBoxUpdate);
    });
    document.getElementById('revenueCashflowSection').addEventListener('input', triggerBuyBoxUpdate);
};

// Ensure event listeners are added when the modal is opened
window.addRealTimeChecklistUpdates();
window.setupRealTimeUpdates();
window.updateAskingPrice();
window.calculateDebtService();