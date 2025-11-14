document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const statusMessage = document.getElementById('status-message');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent the form from submitting normally

            // Clear previous status messages
            statusMessage.textContent = '';
            statusMessage.className = 'mt-4 text-center text-sm';

            // 1. Get all the values from the form
            const formData = {
                employeeId: document.getElementById('employeeId').value,
                password: document.getElementById('password').value,
                role: document.getElementById('role').value,
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                designation: document.getElementById('designation').value,
                department: document.getElementById('department').value,
                basicSalary: parseFloat(document.getElementById('basicSalary').value)
            };

            // 2. Set API request options
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            };

            // 3. Send the data to the /api/auth/register endpoint
            try {
                const response = await fetch('/api/auth/register', options);
                const data = await response.json();

                if (response.ok && data.success) {
                    // --- SUCCESS ---
                    statusMessage.textContent = 'Success! User created. Redirecting to login...';
                    statusMessage.classList.add('text-green-600');
                    
                    // Redirect to login page after 2 seconds
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 2000);

                } else {
                    // --- FAIL ---
                    const message = data.message || 'Registration failed. Please try again.';
                    statusMessage.textContent = message;
                    statusMessage.classList.add('text-red-600');
                }
            } catch (error) {
                console.error('Registration Error:', error);
                statusMessage.textContent = 'An error occurred. Please check the console.';
                statusMessage.classList.add('text-red-600');
            }
        });
    }
});