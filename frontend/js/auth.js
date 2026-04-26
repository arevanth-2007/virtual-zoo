const API_URL = 'https://virtual-zoo-backend.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    // If logged in, redirect to home
    if (localStorage.getItem('token')) {
        window.location.href = 'index.html';
    }

    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('message');

    async function handleAuth(endpoint) {
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            messageDiv.textContent = 'Please fill all fields';
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                messageDiv.textContent = data.message || 'Error occurred';
                return;
            }

            // Save token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect home
            window.location.href = 'index.html';

        } catch (err) {
            messageDiv.textContent = 'Network error, make sure backend is running';
        }
    }

    loginBtn.addEventListener('click', () => handleAuth('login'));
    signupBtn.addEventListener('click', () => handleAuth('signup'));
});
