document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
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
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        const role = document.getElementById('role').value;
        const csrfToken = document.getElementById('csrfToken').value;

        if (username.length < 3) {
            message.textContent = 'Username must be at least 3 characters long';
            return;
        }

        if (password.length < 8) {
            message.textContent = 'Password must be at least 8 characters long';
            return;
        }

        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({ username, password, passwordConfirm, role })
            });

            if (response.ok) {
                message.textContent = 'Registration successful! Redirecting to login...';
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                const data = await response.json();
                const { msg, path } = data.errors[0]
                console.log({ msg, path });

                message.textContent = msg || 'Registration failed';
            }
        } catch (error) {
            console.error('Error:', error);
            message.textContent = 'An error occurred. Please try again.';
        }
    });
});