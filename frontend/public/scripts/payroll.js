document.addEventListener('DOMContentLoaded', () => {
    const runPayrollButton = document.querySelector('button.bg-blue-600');
    const payPeriodInput = document.getElementById('pay-month');
    const updateSlipButtons = document.querySelectorAll('a.text-indigo-600');

    // 1. Handle "Run Payroll" button click
    if (runPayrollButton && payPeriodInput) {
        runPayrollButton.addEventListener('click', async () => {
            const payPeriod = payPeriodInput.value;
            if (!payPeriod) {
                // Use a less intrusive notification if possible
                console.warn('Please select a pay period.');
                payPeriodInput.focus();
                return;
            }

            // Using a custom modal for confirmation is better than confirm()
            // For now, we'll log this. A real implementation should use a modal.
            console.log(`Are you sure you want to run payroll for ${payPeriod}?`);
            
            // We'll proceed for this example.
            console.log(`Running payroll for: ${payPeriod}`);
            
            try {
                // Get the auth token (assuming it was stored at login)
                const token = localStorage.getItem('authToken');

                const response = await fetch('/api/payroll/run', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Send the token for protected routes
                    },
                    body: JSON.stringify({ payPeriod: payPeriod })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    console.log('Payroll run successfully!');
                    // You would show a success message to the user here
                } else {
                    console.error(`Error: ${data.message || 'Failed to run payroll.'}`);
                }

            } catch (error) {
                console.error('Run Payroll request failed:', error);
                // Show an error message to the user
            }
        });
    }

    // 2. Handle "Update Slip" button clicks (example)
    if (updateSlipButtons) {
        updateSlipButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                // Find the closest row to get employee data
                const row = e.target.closest('tr');
                const employeeId = row.cells[0].textContent;
                
                console.log(`Request to update slip for Employee ID: ${employeeId}`);
                
                // Here you would typically open a modal (pop-up)
                // with a form to update this employee's slip details.
                alert(`Opening update form for Employee: ${employeeId}`);
                
                // Example of what you would do next:
                // 1. Open a modal.
                // 2. Fetch current slip details: GET /api/payroll/slips/${employeeId}?period=...
                // 3. Populate the modal form.
                // 4. On modal form submit, send data: POST /api/payroll/slips/update
            });
        });
    }
});