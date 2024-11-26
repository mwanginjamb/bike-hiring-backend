// public/js/resetPassword.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetPasswordForm');
    const message = document.getElementById('message');
    const tokenInput = document.getElementById('token');
    const csrfTokenInput = document.getElementById('csrfToken');
    const BASE_URL = window.location.origin; // Dynamic origin handling

    // Extract token from URL
    //const urlParams = new URLSearchParams(window.location.search);
    //const token = urlParams.get('token');
    const path = window.location.pathname; // "/reset-password/32458f11d40060fb969d44eb59312f6c35dd7f1a"
    const token = path.split('/').pop(); // Extracts the token
    console.log(token);
    if (token) {
        tokenInput.value = token;
    }

    // Fetch CSRF token
    fetch(`${BASE_URL}/auth/csrf-token`)
        .then(response => response.json())
        .then(data => {
            csrfTokenInput.value = data.csrfToken;
        });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            message.textContent = 'Passwords do not match';
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/auth/reset/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfTokenInput.value
                },
                body: JSON.stringify({ password, confirmPassword })
            });

            const data = await response.json();

            if (response.ok) {
                message.textContent = data.message;
                // Redirect to login page after successful password reset
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            } else {
                message.textContent = data.message || 'An error occurred';
            }
        } catch (error) {
            console.error('Error:', error);
            message.textContent = 'An error occurred. Please try again.';
        }
    });
});