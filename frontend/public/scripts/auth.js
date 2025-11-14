// This script runs when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // Get the login form and the error message area from index.html
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // Ensure the login form exists on the page
    if (loginForm) {
        
        // Add an event listener for the form's 'submit' event
        loginForm.addEventListener('submit', async (event) => {
            
            // 1. Prevent the form's default behavior (which is to reload the page)
            event.preventDefault();

            // 2. Clear any old error messages
            loginError.textContent = '';

            // 3. Get the values from the input fields
            // We use .value to get the text typed by the user
            const employeeId = document.getElementById('employee-id').value;
            const password = document.getElementById('password').value;

            // 4. Send the data to the backend API (POST /api/auth/login)
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // Tell the server we're sending JSON
                    },
                    body: JSON.stringify({ 
                        employeeId: employeeId, 
                        password: password 
                    }) // Convert the JS object to a JSON string
                });

                // 5. Parse the JSON response from the server
                const data = await response.json();

                // 6. Handle the response
                if (response.ok && data.success) {
                    // SUCCESS!
                    // The backend said the login was successful.
                    
                    // (Optional but recommended) Store the auth token for future requests
                    if (data.token) {
                        localStorage.setItem('authToken', data.token);
                    }
                    
                    // Redirect the user to the dashboard
                    window.location.href = 'pages/dashboard.html';
                    
                } else {
                    // FAILURE!
                    // The backend said the login failed (e.g., wrong password).
                    // Show the error message from the server.
                    loginError.textContent = data.message || 'Login failed. Please try again.';
                }

            } catch (error) {
                // NETWORK ERROR!
                // This happens if the server is down or can't be reached.
                console.error('Login request failed:', error);
                loginError.textContent = 'Cannot connect to server. Please try again later.';
            }
        });
    }
});