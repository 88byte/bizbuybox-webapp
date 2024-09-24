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
const auth = getAuth(app);

// Function to check if the user is a superadmin and show/hide the upload section
async function checkIfSuperAdmin() {
    console.log('Checking if the user is superadmin...');
    // Listen for the authentication state to be ready
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('User authenticated:', user.uid); // Debug: Check if the user is authenticated
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    console.log('User role fetched:', userData.role); // Debug: Check the fetched role
                    if (userData.role === 'superadmin') {
                        console.log('User is superadmin. Showing the whitelist upload section.'); // Debug
                        // Show the whitelist upload section if the user is superadmin
                        document.querySelector('.whitelist-upload').style.display = 'block';
                    } else {
                        console.log('User is not superadmin. Hiding the whitelist upload section.'); // Debug
                        // Hide the whitelist upload section if the user is not superadmin
                        document.querySelector('.whitelist-upload').style.display = 'none';
                    }
                } else {
                    console.error('User document does not exist.');
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        } else {
            console.error('No authenticated user.');
            // Hide the whitelist upload section if no authenticated user
            document.querySelector('.whitelist-upload').style.display = 'none';
        }
    });
}

// Call this function after the page loads
document.addEventListener('DOMContentLoaded', function () {
    checkIfSuperAdmin();
});



// Function to upload whitelist CSV to Firestore
window.uploadWhitelist = function() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    if (file) {
        window.showToast('Uploading... Please wait.', true, true); // Persistent toast for ongoing upload

        Papa.parse(file, {
            header: true, // Ensures the first row is treated as header
            complete: function(results) {
                const emails = results.data;
                const totalEmails = emails.length;
                let uploadCount = 0;
                let failureCount = 0;

                emails.forEach(async (row, index) => {
                    const email = row['email'].trim(); // Make sure the email is properly formatted
                    const role = row['role'] ? row['role'].trim() : 'user'; // Use role from CSV, fallback to 'user'

                    if (email) {
                        try {
                            // Use setDoc to specify the email as the document ID
                            await setDoc(doc(db, 'whitelistedEmails', email), {
                                email: email,
                                role: role // Set role as specified in the CSV
                            });
                            uploadCount++;
                        } catch (error) {
                            console.error(`Error uploading email: ${email}`, error);
                            failureCount++;
                        }
                    } else {
                        failureCount++;
                        console.error('Invalid email or empty row.');
                    }

                    // After all rows are processed
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


// Function to upload deals CSV to Firestore and create deal cards
window.uploadDeals = function () {
    const fileInput = document.getElementById('dealCsvInput');
    const file = fileInput.files[0];

    if (file) {
        window.showToast('Uploading deals... Please wait.', true, true); // Persistent toast for ongoing upload

        Papa.parse(file, {
            header: true, // Ensures the first row is treated as header
            complete: function (results) {
                const deals = results.data;
                const totalDeals = deals.length;
                let uploadCount = 0;
                let failureCount = 0;

                // Iterate through each deal row from the CSV
                deals.forEach(async (row, index) => {
                    const mappedDeal = window.mapCsvToDealForm(row); // Map CSV data to webapp format

                    if (mappedDeal.businessName) { // Only proceed if business name exists
                        try {
                            // Save the mapped deal to Firestore
                            const docRef = await addDoc(collection(db, 'deals'), mappedDeal);
                            uploadCount++;

                            // Dynamically create deal card on the web page
                            window.createDealCard(mappedDeal, docRef.id); // Pass ID to use later for editing, if needed
                        } catch (error) {
                            console.error(`Error uploading deal: ${mappedDeal.businessName}`, error);
                            failureCount++;
                        }
                    } else {
                        failureCount++;
                        console.error('Invalid or empty row. Business name is required.');
                    }

                    // After all rows are processed, show final upload result
                    if (index === totalDeals - 1) {
                        window.hideToast(); // Hide persistent toast
                        window.showToast(`Upload complete. Success: ${uploadCount}, Failures: ${failureCount}`, true, false); // Final notification
                    }
                });
            },
            error: function (error) {
                window.hideToast(); // Hide toast on error
                window.showToast('Error parsing CSV file.', false); // Show error toast
                console.error('Error parsing CSV file:', error);
            }
        });
    } else {
        window.showToast('Please select a CSV file.', false); // Show error toast if no file selected
    }
};

// Function to dynamically create deal cards on the page
window.createDealCard = function(deal, dealId) {
    const dealCardsContainer = document.getElementById('dealCardsContainer');

    // Create a new div for the deal card
    const dealCard = document.createElement('div');
    dealCard.classList.add('deal-card');
    dealCard.setAttribute('data-deal-id', dealId); // Save the deal ID in case we need it later

    // Fill the card with deal details
    dealCard.innerHTML = `
        <h3>${deal.businessName}</h3>
        <p><strong>Status:</strong> ${deal.status}</p>
        <p><strong>Asking Price:</strong> ${deal.askingPrice}</p>
        <p><strong>Years in Business:</strong> ${deal.yearsInBusiness}</p>
        <p><strong>Full-time Employees:</strong> ${deal.fullTimeEmployees}</p>
        <p><strong>Part-time Employees:</strong> ${deal.partTimeEmployees}</p>
        <p><strong>Contractors:</strong> ${deal.contractors}</p>
        <p><strong>Business Address:</strong> ${deal.businessAddress}</p>
        <p><strong>Revenue and Cashflow:</strong></p>
        <ul>
            ${deal.revenueCashflowEntries.map(entry => `
                <li>Year: ${entry.year} | Revenue: ${entry.revenue} | Cashflow: ${entry.cashflow}</li>
            `).join('')}
        </ul>
        <p><strong>Notes:</strong> ${deal.notes}</p>
    `;

    // Append the card to the deal cards container
    dealCardsContainer.appendChild(dealCard);
};

// Utility function to parse numbers safely
window.parseNumber = function(value) {
    const number = parseFloat(value);
    return isNaN(number) ? 0 : number;
};

// Function to format price strings correctly
window.formatPrice = function(price) {
    return price ? `$${parseFloat(price).toLocaleString()}` : null;
};

// Function to map CSV data to the webapp deal form
window.mapCsvToDealForm = function(deal) {
    const statusMapping = {
        'New Deal': 'new-deal',
        'Review CIM': 'CIM Review',
        'Seller Meeting': 'Seller Meeting',
        'Kyle Review': 'Kyle Review',
        'LOI Submitted': 'LOI Submitted',
        'LOI Accepted': 'LOI Accepted',
        'LOI Rejected': 'Nurture',
        'Due Diligence': 'Due Diligence',
        'SBA Process': 'SBA Loan',
        'Business Won': 'Deal Closed (Won)',
        'Not Interested': 'No Longer Interested',
        'Nurture': 'Nurture'
    };

    const revenueCashflowEntries = [
        { revenue: window.parseNumber(deal['revenue1']), cashflow: window.parseNumber(deal['cashflow1']), year: 'Year' },
        { revenue: window.parseNumber(deal['revenue2']), cashflow: window.parseNumber(deal['cashflow2']), year: 'Year' },
        { revenue: window.parseNumber(deal['revenue3']), cashflow: window.parseNumber(deal['cashflow3']), year: 'Year' },
        { revenue: window.parseNumber(deal['revenue4']), cashflow: window.parseNumber(deal['cashflow4']), year: 'Year' }
    ];

    return {
        businessName: deal['businessName'] || '',
        status: statusMapping[deal['status']] || 'new-deal',
        yearsInBusiness: deal['yearsInBusiness'] || '',
        fullTimeEmployees: deal['fullTimeEmployees'] || '',
        partTimeEmployees: deal['partTimeEmployees'] || '',
        contractors: deal['contractors'] || '',
        businessAddress: deal['businessAddress'] || '',
        licenses: deal['licenses'] || '',
        notes: deal['notes'] || '',
        askingPrice: window.formatPrice(deal['askingPrice']),
        realEstatePrice: window.formatPrice(deal['realEstatePrice']),
        ffe: window.formatPrice(deal['ffe']),
        buyerSalary: window.formatPrice(deal['salary']),
        downPayment: window.formatPrice(deal['userDownPayment']),
        loanAmount2: window.formatPrice(deal['sellerFinanceAmount']),
        loanTerm: deal['loanTerm'] || '',
        loanTerm2: deal['sellerLoanTerm'] || '',
        interestRate: deal['interestRate'] || '',
        interestRate2: deal['sellerInterestRate'] || '',
        loanType: deal['loanType'] || 'SBA + Seller Finance',
        revenueCashflowEntries: revenueCashflowEntries,
        lastUpdate: new Date().toISOString(), // Date of import
        industry: 'retail' // Default industry
    };
};
