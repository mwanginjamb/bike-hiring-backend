// public/js/forgotPassword.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('request-password-reset');
    const message = document.getElementById('message');
    const csrfTokenInput = document.getElementById('csrfToken');
    const BASE_URL = window.location.origin; // Dynamic origin handling

    // Fetch CSRF token
    fetch(`${BASE_URL}/auth/csrf-token`)
        .then(response => response.json())
        .then(data => {
            csrfTokenInput.value = data.csrfToken;
        });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;

        try {
            const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfTokenInput.value
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                message.textContent = data.message;
            } else {
                message.textContent = data.message || 'An error occurred while requesting password reset';
            }
        } catch (error) {
            console.error('Error:', error);
            message.textContent = 'An error occurred. Please try again.';
        }
    });
});