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


// Function to map CSV fields to form fields
function mapCsvFieldsToForm(deal) {
    // Mapping CSV data to form fields
    document.getElementById('businessName').value = deal.businessName || '';
    document.getElementById('status').value = mapStatusToDropdown(deal.status) || 'new-deal'; // Map CSV status to dropdown value
    document.getElementById('yearsInBusiness').value = deal.yearsInBusiness || '';
    document.getElementById('fullTimeEmployees').value = deal.fullTimeEmployees || '';
    document.getElementById('partTimeEmployees').value = deal.partTimeEmployees || '';
    document.getElementById('contractors').value = deal.contractors || '';
    document.getElementById('businessAddress').value = deal.businessAddress || '';
    document.getElementById('askingPrice').value = deal.askingPrice || '';
    document.getElementById('realEstatePrice').value = deal.realEstatePrice || '';
    document.getElementById('ffe').value = deal.ffe || '';
    document.getElementById('licenses').value = deal.licenses || '';
    document.getElementById('notes').value = deal.notes || '';

    // Financial details (Revenue & Cashflow)
    mapRevenueCashflowFields(deal);

    // Funding details
    document.getElementById('loanType').value = deal.loanType || 'SBA';
    document.getElementById('interestRate1').value = deal.interestRate || '';
    document.getElementById('loanTerm1').value = deal.loanTerm || '';
    document.getElementById('downPayment').value = deal.kyleDownPayment || '';
    document.getElementById('buyerSalary').value = deal.salary || '';

    // Ensure status color is updated based on the mapped status
    updateStatusColor();
}

// Helper function to map status from CSV to dropdown value
function mapStatusToDropdown(status) {
    const statusMap = {
        'New Deal': 'new-deal',
        'CIM Review': 'cim-review',
        'Seller Meeting': 'seller-meeting',
        'LOI Submitted': 'loi-submitted',
        'LOI Accepted': 'loi-accepted',
        'Kyle Review': 'kyle-review',
        'SBA Loan': 'sba-loan',
        'Due Diligence': 'due-diligence',
        'Deal Closed (Won)': 'deal-closed-won',
        'No Longer Interested': 'no-longer-interested',
        'Nurture': 'nurture',
    };
    return statusMap[status] || 'new-deal'; // Default to 'new-deal' if status not recognized
}

// Map revenue and cashflow fields dynamically based on CSV data
function mapRevenueCashflowFields(deal) {
    // Assuming revenue/cashflow columns are named revenue1, revenue2, etc. in CSV
    const revenueFields = [deal.revenue1, deal.revenue2, deal.revenue3, deal.revenue4];
    const cashflowFields = [deal.cashflow1, deal.cashflow2, deal.cashflow3, deal.cashflow4];

    // Clear existing entries in revenue/cashflow section
    const section = document.getElementById('revenueCashflowSection');
    section.innerHTML = ''; // Clear old rows

    // Add rows dynamically
    revenueFields.forEach((revenue, index) => {
        const cashflow = cashflowFields[index] || '';
        if (revenue || cashflow) {
            addRevenueCashflowRow(revenue, cashflow);
        }
    });
}

// Function to add rows for Revenue & Cashflow with prefilled data
function addRevenueCashflowRow(revenue = '', cashflow = '') {
    const section = document.getElementById('revenueCashflowSection');
    const entry = document.createElement('div');
    entry.classList.add('revenue-cashflow-entry');

    entry.innerHTML = `
        <div class="revenue-cashflow-row">
            <div class="input-item button-container">
                <button type="button" class="btn-remove" onclick="removeRevenueCashflowRow(this)">−</button>
            </div>
            <div class="input-item year-text">
                <div contenteditable="true" class="editable-year">Year</div>
            </div>
            <div class="input-item small-input revenue-column">
                <input type="text" name="revenue[]" placeholder="$0" value="${revenue}" oninput="updateProfitMargin(this)">
            </div>
            <div class="input-item small-input cashflow-column">
                <input type="text" name="cashflow[]" placeholder="$0" value="${cashflow}" oninput="updateProfitMargin(this)">
            </div>
            <div class="input-item profit-column">
                <span>0%</span>
            </div>
        </div>
    `;

    // Append the new entry to the section
    section.appendChild(entry);
}

// Function to upload and parse deals from the older tool (modified to map data to form fields)
window.uploadDeals = function () {
    const fileInput = document.getElementById('dealCsvInput');
    const file = fileInput.files[0];

    if (file) {
        window.showToast('Uploading... Please wait.', true, true); // Persistent toast for ongoing upload

        // Parse CSV using PapaParse
        Papa.parse(file, {
            header: true, // Ensure first row is treated as header
            complete: function (results) {
                const deals = results.data; // Array of deal objects

                // Process each deal and create deal cards
                deals.forEach(async (deal) => {
                    // Save to Firestore
                    try {
                        const docRef = await addDoc(collection(db, 'deals'), deal);
                        console.log('Deal added with ID: ', docRef.id);

                        // Auto-fill form fields with the deal data
                        mapCsvFieldsToForm(deal);

                    } catch (error) {
                        console.error('Error adding deal:', error);
                    }
                });

                // Hide the toast when complete
                window.hideToast();
                window.showToast('Deals uploaded successfully!', true, false);
            },
            error: function (error) {
                window.hideToast(); // Hide toast on error
                window.showToast('Error parsing CSV file.', false);
                console.error('Error parsing CSV file:', error);
            }
        });
    } else {
        window.showToast('Please select a CSV file.', false); // Show error toast
    }
};


// Function to dynamically create deal cards in the UI
function createDealCard(deal) {
    const dealCardsContainer = document.getElementById('dealCardsContainer');

    const card = document.createElement('div');
    card.classList.add('deal-card');

    card.innerHTML = `
        <h3>${deal.businessName}</h3>
        <p><strong>Status:</strong> ${deal.status}</p>
        <p><strong>Years in Business:</strong> ${deal.yearsInBusiness}</p>
        <p><strong>Asking Price:</strong> ${deal.askingPrice}</p>
        <p><strong>Revenue:</strong> ${deal.revenue1}, ${deal.revenue2}, ${deal.revenue3}</p>
        <p><strong>Cash Flow:</strong> ${deal.cashflow1}, ${deal.cashflow2}, ${deal.cashflow3}</p>
        <p><strong>Loan Type:</strong> ${deal.loanType}</p>
    `;

    // Append card to container
    dealCardsContainer.appendChild(card);
}
