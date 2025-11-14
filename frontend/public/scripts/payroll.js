document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('ehrms_token');

    // Get page elements
    const loadingSpinner = document.getElementById('loading-spinner');
    const adminView = document.getElementById('admin-payroll-view');
    const employeeView = document.getElementById('employee-payroll-view');

    if (!token) {
        // If no token, redirect to login
        window.location.href = '../index.html';
        return;
    }

    // Function to fetch the user's role
    const checkUserRole = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                // If token is invalid, redirect to login
                localStorage.removeItem('ehrms_token');
                window.location.href = '../index.html';
                return;
            }

            const { data } = await response.json();
            const userRole = data.role;

            // --- THIS IS THE CORE LOGIC ---
            // Show the correct view based on the user's role
            if (userRole === 'hr' || userRole === 'admin') {
                showAdminView();
            } else {
                showEmployeeView();
            }

        } catch (error) {
            console.error('Error fetching user role:', error);
            if (loadingSpinner) loadingSpinner.innerHTML = 'Error loading page. Please try again.';
        }
    };

    // --- Admin View Functions ---
    function showAdminView() {
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        if (adminView) adminView.classList.remove('hidden');

        const runPayrollButton = document.getElementById('run-payroll-button');
        const payPeriodInput = document.getElementById('pay-month');
        const statusMessage = document.getElementById('payroll-status');

        if (runPayrollButton) {
            runPayrollButton.addEventListener('click', async () => {
                const payPeriod = payPeriodInput.value;
                if (!payPeriod) {
                    if (statusMessage) statusMessage.textContent = 'Please select a pay period.';
                    return;
                }

                if (statusMessage) {
                    statusMessage.textContent = 'Processing payroll...';
                    statusMessage.classList.remove('text-red-600', 'text-green-600');
                }

                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ payPeriod })
                };

                try {
                    const response = await fetch('/api/payroll/run', options);
                    const data = await response.json();

                    if (response.ok && data.success) {
                        if (statusMessage) {
                            statusMessage.textContent = data.message;
                            statusMessage.classList.add('text-green-600');
                        }
                    } else {
                        if (statusMessage) {
                            statusMessage.textContent = data.message || 'Failed to run payroll.';
                            statusMessage.classList.add('text-red-600');
                        }
                    }
                } catch (error) {
                    console.error('Payroll Run Error:', error);
                    if (statusMessage) {
                        statusMessage.textContent = 'A network error occurred.';
                        statusMessage.classList.add('text-red-600');
                    }
                }
            });
        }
    }

    // --- Employee View Functions ---
    async function showEmployeeView() {
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        if (employeeView) employeeView.classList.remove('hidden');

        const tableBody = document.getElementById('salary-slip-table-body');
        const noSlipsMessage = document.getElementById('no-slips-message');

        try {
            const response = await fetch('/api/salary-slip/my-slips', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok && data.success && data.slips.length > 0) {
                // Slips found, populate table
                if (noSlipsMessage) noSlipsMessage.classList.add('hidden');
                populateSlipTable(data.slips);
            } else {
                // No slips found
                if (noSlipsMessage) noSlipsMessage.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error fetching salary slips:', error);
            if (noSlipsMessage) {
                noSlipsMessage.textContent = 'Error loading salary slips.';
                noSlipsMessage.classList.remove('hidden');
            }
        }
    }

    function populateSlipTable(slips) {
        const tableBody = document.getElementById('salary-slip-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = ''; // Clear existing rows
        
        // Sort slips, newest first
        slips.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));

        slips.forEach(slip => {
            const row = document.createElement('tr');
            
            const generatedDate = new Date(slip.generatedAt).toLocaleDateString();

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${slip.payPeriod}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${generatedDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹ ${slip.netPay.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="#" class="text-blue-600 hover:text-blue-900">View</a>
                    <a href="#" class="ml-4 text-indigo-600 hover:text-indigo-900">Download</a>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // --- Start the process ---
    checkUserRole();
});