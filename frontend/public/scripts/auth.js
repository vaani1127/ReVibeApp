document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const loginButton = loginForm.querySelector('button[type="submit"]');

    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Clear previous errors
        if (loginError) loginError.textContent = '';
        const originalButtonText = loginButton.innerHTML;
        loginButton.disabled = true;
        loginButton.innerHTML = 'Signing In...';

        const employeeId = document.getElementById('employee-id').value;
        const password = document.getElementById('password').value;

        // This is the correct API path
        const fetchURL = '/api/auth/login';

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ employeeId, password }),
        };

        try {
            const response = await fetch(fetchURL, options);
            const data = await response.json();

            if (response.ok && data.success) {
                // --- SUCCESS ---
                // Save the token to localStorage
                localStorage.setItem('ehrms_token', data.token);
                
                // Redirect to the dashboard
                window.location.href = '/pages/dashboard.html'; // Use root-relative path

            } else {
                // --- FAIL ---
                const message = data.message || 'Login failed. Please try again.';
                if (loginError) loginError.textContent = message;
                loginButton.disabled = false;
                loginButton.innerHTML = originalButtonText;
            }
        } catch (error) {
            console.error('Login Error:', error);
            if (loginError) loginError.textContent = 'An error occurred. Please check console.';
            loginButton.disabled = false;
            loginButton.innerHTML = originalButtonText;
        }
    });
});