const FETCH_API_URL = 'http://localhost:3300/api/trips'

getHistoricalTrips();
function getHistoricalTrips() {
    fetch(FETCH_API_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            updateHistoryTable(data)
        })
}

function updateHistoryTable(tripData) {
    const tbody = document.querySelector('#history tbody')
    tbody.innerHTML = tripData
        .map(trip => `
        <tr>
            <td>${trip.idNumber}</td>
            <td>${trip.name}</td>
            <td>${trip.gender}</td>
            <td>${trip.customerType}</td>
            <td>${formatDate(trip.startTime)}</td>
            <td>${formatDate(trip.endTime)}</td>
            <td>${formatDuration(trip.duration)}</td>
            <td>Ksh. ${trip.cost.toFixed(2)}</td>
            
        </tr>
        `).join('')
}