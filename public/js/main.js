document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = window.location.origin; // Dynamic origin handling
    const STORAGE_KEY = 'BIKE_HIRE'
    const API_URL = `${BASE_URL}/api/sync`
    SYNC_INTERVAL = 60 * 1000 * 3

    const prices = {
        adult: 100,
        child: 50
    }

    // active trips

    let trips = [];
    let csrfToken;

    // Add an a click event listener to the form submit button
    document.getElementById('startTrip').addEventListener('click', startTrip)
    loadFromLocalStorage()
    setInterval(syncToBackend, SYNC_INTERVAL);
    // Fetch CSRF token
    fetch(`${BASE_URL}/auth/csrf-token`)
        .then(response => response.json())
        .then(data => {
            csrfToken = data.csrfToken;
        });

    // Handler for ending trips - using event delegation

    document.getElementById('activeTrips').addEventListener('click', function (event) {
        const button = event.target
        if (button.id && button.id.startsWith('end-trip-btn-')) {
            const tripId = button.dataset.tripId
            console.log(`trip id is : ${tripId}`);
            endTrip(tripId)
        }
    })


    // startTrip

    function startTrip() {
        // get data inputs
        const idNumber = document.getElementById('idNumber').value;
        const name = document.getElementById('name').value;
        const gender = document.getElementById('gender').value;
        const customerType = document.getElementById('customerType').value; // adult or child


        // validation

        if (!idNumber || !name) {
            alert('Please fill all mandatory details')
            return
        }

        // Define Trip entity

        const trip = {
            id: Date.now(),
            idNumber,
            name,
            gender,
            customerType,
            startTime: new Date(),
            endTime: new Date(),
            duration: 0,
            cost: 0.00,
            tripStatus: 'new',
            synced: false
        }

        trips.push(trip)
        updateActiveTripsTable()
        clearCustomerForm()
        saveToLocalStorage()

    }

    // clear the form : clearCustomerForm
    function clearCustomerForm() {
        document.getElementById('customerForm').reset()
    }


    // updateActiveTripsTable
    function updateActiveTripsTable() {
        const tbody = document.querySelector('#activeTrips tbody')
        tbody.innerHTML = trips
            .filter(trip => trip.tripStatus === 'new')
            .map(trip => `
            <tr>
                <td>${trip.idNumber}</td>
                <td>${trip.name}</td>
                <td>${trip.customerType}</td>
                <td>${formatDate(trip.startTime)}</td>
                <td class="time-counter" id="counter-${trip.id}"></td>
                <td><button class="btn btn-sm btn-danger" id="end-trip-btn-${trip.id}" data-trip-id="${trip.id}">End Trip</button></td>
            </tr>
            `).join('')

        trips
            .filter(trip => trip.tripStatus === 'new')
            .forEach(trip => startTimer(trip.id, trip.startTime))
    }

    // startTimer
    function startTimer(tripId, startTime) {
        setInterval(() => {
            const counter = document.getElementById(`counter-${tripId}`)
            if (counter) {
                const duration = moment.duration(moment().diff(moment(startTime)))
                counter.textContent = `${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`
            }
        }, 1000)
    }

    // endTrip

    function endTrip(tripId) {
        console.log(`Attempting to end trip..`)
        const tripIndex = trips.findIndex(trip => trip.id === +tripId);
        if (tripIndex === -1) return
        const trip = trips[tripIndex]
        trip.endTime = new Date()
        const duration = moment.duration(moment(trip.endTime).diff(moment(trip.startTime)))
        trip.duration = duration.asHours()
        trip.cost = trip.duration * prices[trip.customerType]
        trip.tripStatus = 'completed'

        updateTripInLocalStorage(trip)
        updateActiveTripsTable();
        updateCompletedTripsTable();
    }

    // updateCompletedTrips Table
    function updateCompletedTripsTable() {

        const tbody = document.querySelector('#completedTrips tbody')
        tbody.innerHTML = trips
            .filter(trip => trip.tripStatus === 'completed')
            .map(trip => `
            <tr>
                <td>${trip.idNumber}</td>
                <td>${trip.name}</td>
                <td>${formatDate(trip.startTime)}</td>
                <td>${formatDate(trip.endTime)}</td>
                <td>${formatDuration(trip.duration)}</td>
                <td>Ksh. ${trip.cost.toFixed(2)}</td>
                
            </tr>
            `).join('')
    }



    // Save Trip to Local Storage
    function saveToLocalStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
    }

    // Update Trip on Completion

    function updateTripInLocalStorage(updatedTrip) {
        const storedData = localStorage.getItem(STORAGE_KEY)
        if (storedData) {
            let trips = JSON.parse(storedData)
            const index = trips.findIndex(trip => trip.id === updatedTrip.id)
            if (index !== -1) {
                trips[index] = updatedTrip
                localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
            }
        }
    }

    // Load all entries from Local Storage

    function loadFromLocalStorage() {
        const storedData = localStorage.getItem(STORAGE_KEY)
        if (storedData) {
            trips = JSON.parse(storedData)
            // Convert datetime strings to js Date Objects
            trips.forEach(trip => {
                trip.startTime = new Date(trip.startTime)
                if (trip.endTime) {
                    trip.endTime = new Date(trip.endTime)
                }
            }); // end loop

            updateActiveTripsTable()
            updateCompletedTripsTable()

        }
    }

    function syncToBackend() {
        const unsynced = trips.filter(trip => trip.tripStatus === 'completed' && !trip.synced)
        if (unsynced.length === 0) return;

        console.log(`Syncing to backend ...`) // for test

        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            body: JSON.stringify(unsynced)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('There was a network error, try later .')
                }
                return response.json()
            })
            .then(data => {
                console.log(`Sync successful `, data)
                unsynced.forEach((trip) => {
                    trip.synced = true
                    updateTripInLocalStorage(trip)
                })
            })
            .catch(error => {
                console.log(`Error syncing to backend:  `, error)
            })
    }

    logoutLink = document.querySelector('#logout');
    logoutLink.addEventListener('click', async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${BASE_URL}/auth/logout`);
            if (response.ok) {
                const data = await response.json();
                console.log('Logout successful:', data);
                // Redirect only after successful logout
                window.location.href = '/';
            } else {
                console.error('Logout failed with status:', response.status);
            }
        } catch (error) {
            console.error('Network error during logout:', error);
        }
    });

    // formatDate
    function formatDate(dateString) {
        return moment(dateString).format('YYYY-MM-DD HH:mm:ss');
    }

    // formatDuration : hrs mm
    function formatDuration(hours) {
        const duration = moment.duration(hours, 'hours')
        return `${duration.hours()}h ${duration.minutes()}m`
    }



})

