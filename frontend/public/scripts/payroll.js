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
                        // --- ADDED ---
                        // Refresh the table after running payroll
                        loadAdminSlipTable();
                        // --- END ---
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

        // --- ADDED THIS ENTIRE SECTION ---
        // Load the admin table data
        loadAdminSlipTable();

        // Add click listener for the whole admin table
        const adminTable = document.getElementById('admin-slip-table-body');
        if (adminTable) {
            adminTable.addEventListener('click', async (e) => {
                e.preventDefault();
                
                const target = e.target;
                const employeeId = target.dataset.empId;
                const slipId = target.dataset.slipId;

                if (target.classList.contains('view-slip')) {
                    // Handle "View" click
                    await viewSlipDetails(employeeId, slipId);
                }

                if (target.classList.contains('update-slip')) {
                    // Handle "Update" click
                    // This is a placeholder. A real app would open a modal.
                    alert(`Update functionality for Slip ${slipId} is not fully implemented.\nYou would now build a form to PUT to /api/salary-slip/${employeeId}/${slipId}`);
                }
            });
        }
        // --- END OF ADDED SECTION ---
    }

    // --- ADDED THIS ENTIRE FUNCTION ---
    async function loadAdminSlipTable() {
        const tableBody = document.getElementById('admin-slip-table-body');
        if (!tableBody) return;

        try {
            const response = await fetch('/api/salary-slip/all-slips', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok && data.success && data.slips.length > 0) {
                tableBody.innerHTML = ''; // Clear loading message
                data.slips.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.employeeId}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${item.department}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${item.slip.payPeriod}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹ ${item.slip.netPay.toFixed(2)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <a href="#" class="view-slip text-blue-600 hover:text-blue-900" data-emp-id="${item.employeeId}" data-slip-id="${item.slip._id}">View</a>
                            <a href="#" class="update-slip ml-4 text-indigo-600 hover:text-indigo-900" data-emp-id="${item.employeeId}" data-slip-id="${item.slip._id}">Update Slip</a>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No salary slips found for any employee.</td></tr>`;
            }
        } catch (error) {
            console.error('Error loading admin slip table:', error);
            tableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Error loading data.</td></tr>`;
        }
    }

    // --- ADDED THIS ENTIRE FUNCTION ---
    async function viewSlipDetails(employeeId, slipId) {
        try {
            const response = await fetch(`/api/salary-slip/${employeeId}/${slipId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok && data.success) {
                // For this demo, we'll use a simple alert.
                // A real app would show this in a modal popup.
                const slip = data.slip;
                const allowances = slip.allowances.map(a => `  - ${a.name}: ₹ ${a.amount.toFixed(2)}`).join('\n');
                const deductions = slip.deductions.map(d => `  - ${d.name}: ₹ ${d.amount.toFixed(2)}`).join('\n');

                alert(
`--- Salary Slip Details ---
Pay Period: ${slip.payPeriod}
Generated: ${new Date(slip.generatedOn).toLocaleDateString()}

Basic Salary: ₹ ${slip.basicSalary.toFixed(2)}

Allowances:
${allowances || '  - None'}

Deductions:
${deductions || '  - None'}

-----------------------------
Net Pay: ₹ ${slip.netPay.toFixed(2)}`
                );
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error fetching slip details:', error);
            alert('A network error occurred while fetching slip details.');
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
        slips.sort((a, b) => new Date(b.generatedOn) - new Date(a.generatedOn));

        slips.forEach(slip => {
            const row = document.createElement('tr');
            
            const generatedDate = new Date(slip.generatedOn).toLocaleDateString();

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