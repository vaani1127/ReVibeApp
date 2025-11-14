document.addEventListener('DOMContentLoaded', () => {
    const runPayrollButton = document.getElementById('run-payroll-button'); // Added an ID for the button
    const payPeriodInput = document.getElementById('pay-month');
    const statusMessage = document.getElementById('payroll-status'); // Added an ID for status messages

    if (runPayrollButton) {
        runPayrollButton.addEventListener('click', async () => {
            const payPeriod = payPeriodInput.value;
            if (!payPeriod) {
                if (statusMessage) statusMessage.textContent = 'Please select a pay period.';
                return;
            }

            // 1. Get the token from localStorage
            const token = localStorage.getItem('ehrms_token');
            if (!token) {
                if (statusMessage) statusMessage.textContent = 'Error: Not authenticated. Please log in again.';
                window.location.href = '../index.html'; // Redirect to login
                return;
            }

            // 2. Set API request options
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // 3. Add the Authorization header
                },
                body: JSON.stringify({ payPeriod })
            };

            // 4. Send the request
            try {
                const response = await fetch('/api/payroll/run', options);
                const data = await response.json();

                if (response.ok && data.success) {
                    if (statusMessage) statusMessage.textContent = data.message;
                } else {
                    if (statusMessage) statusMessage.textContent = data.message || 'Failed to run payroll.';
                }
            } catch (error) {
                console.error('Payroll Error:', error);
                if (statusMessage) statusMessage.textContent = 'An error occurred.';
            }
        });
    }
});