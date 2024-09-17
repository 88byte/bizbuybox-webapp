// JavaScript to handle content switching and deal management

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
    const dealName = prompt('Enter Deal Name:');
    if (dealName) {
        const newDeal = {
            id: Date.now(),
            name: dealName,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        deals.push(newDeal);
        renderDeals();
    }
}

// Function to render deals
function renderDeals() {
    const dealGrid = document.getElementById('dealGrid');
    dealGrid.innerHTML = '';
    deals.forEach(deal => {
        const dealCard = document.createElement('div');
        dealCard.className = 'deal-card';
        dealCard.innerHTML = `
            <h4>${deal.name}</h4>
            <p>Status: ${deal.status}</p>
            <div class="deal-actions">
                <button onclick="editDeal(${deal.id})">Edit</button>
                <button onclick="deleteDeal(${deal.id})">Delete</button>
            </div>
        `;
        dealGrid.appendChild(dealCard);
    });
}

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

// Initial default section
window.onload = function() {
    showDashboard();
    renderDeals(); // Render deals on load
}


// Make functions globally accessible
window.openProfileModal = function () {
    document.getElementById('profileModal').style.display = 'flex';
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

// Function to update user profile
window.updateProfile = async function () {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const profilePicFile = document.getElementById('profilePic').files[0];

    try {
        const user = auth.currentUser;

        // Update profile picture if a new file is selected
        if (profilePicFile) {
            const storageRef = firebase.storage().ref();
            const profilePicRef = storageRef.child('profilePictures/' + user.uid);
            await profilePicRef.put(profilePicFile);
            const profilePicUrl = await profilePicRef.getDownloadURL();
            await user.updateProfile({ photoURL: profilePicUrl });
            document.querySelector('.profile-img').src = profilePicUrl;
        }

        // Update user profile details
        if (username) {
            await user.updateProfile({ displayName: username });
        }
        if (email) {
            await user.updateEmail(email);
        }
        if (password) {
            await user.updatePassword(password);
        }

        // Update Firestore with new user data
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
        }, { merge: true });

        alert('Profile updated successfully!');
        closeProfileModal();
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile: ' + error.message);
    }
};

// Function to confirm account deletion
window.confirmDeleteAccount = function () {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        deleteAccount();
    }
};

// Function to delete user account
window.deleteAccount = async function () {
    try {
        const user = auth.currentUser;
        await deleteDoc(doc(db, "users", user.uid)); // Remove user data from Firestore
        await user.delete(); // Delete user from Firebase Authentication
        alert('Account deleted successfully.');
        window.location.href = 'index.html'; // Redirect to landing page
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error deleting account: ' + error.message);
    }
};
