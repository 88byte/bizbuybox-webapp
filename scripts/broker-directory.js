// Sample Data - replace with real API calls if necessary
const brokers = [
    { id: 1, name: 'Broker A', region: 'north', contact: 'brokerA@example.com' },
    { id: 2, name: 'Broker B', region: 'south', contact: 'brokerB@example.com' },
    // Add more brokers
];

// Function to render broker cards
function renderBrokers(brokerList) {
    const brokerContainer = document.getElementById('brokerList');
    brokerContainer.innerHTML = ''; // Clear the existing list

    brokerList.forEach(broker => {
        const brokerCard = document.createElement('div');
        brokerCard.classList.add('broker-card');
        brokerCard.innerHTML = `
            <h2>${broker.name}</h2>
            <p>Region: ${broker.region}</p>
            <p>Contact: ${broker.contact}</p>
        `;
        brokerContainer.appendChild(brokerCard);
    });
}

// Function to search/filter brokers
function searchBrokers() {
    const searchInput = document.getElementById('searchBroker').value.toLowerCase();
    const selectedRegion = document.getElementById('brokerRegion').value;

    const filteredBrokers = brokers.filter(broker => {
        const matchesSearch = broker.name.toLowerCase().includes(searchInput);
        const matchesRegion = selectedRegion ? broker.region === selectedRegion : true;
        return matchesSearch && matchesRegion;
    });

    renderBrokers(filteredBrokers);
}

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    renderBrokers(brokers); // Render all brokers initially
});
