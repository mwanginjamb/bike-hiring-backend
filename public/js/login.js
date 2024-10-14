document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const message = document.getElementById('message');

    // Fetch CSRF token
    fetch('/auth/csrf-token')
        .then(response => response.json())
        .then(data => {
            document.getElementById('csrfToken').value = data.csrfToken;
        });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const csrfToken = document.getElementById('csrfToken').value;

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                message.textContent = 'Login successful! Redirecting...';
                setTimeout(() => {
                    window.location.href = '/'; // Redirect to home or dashboard
                }, 2000);
            } else {
                const data = await response.json();
                message.textContent = data.error || 'Login failed';
            }
        } catch (error) {
            console.error('Error:', error);
            message.textContent = 'An error occurred. Please try again.';
        }
    });
});
