document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('ehrms_token');

    // --- Get All Page Elements ---
    const searchSection = document.getElementById('search-section');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchStatus = document.getElementById('search-status');

    const promotionSection = document.getElementById('promotion-section');

    // Form: Personal Info
    const inputFullName = document.getElementById('full-name');
    const inputEmail = document.getElementById('email');
    const inputEmployeeId = document.getElementById('employee-id');

    // Form: Job Profile
    const inputDepartment = document.getElementById('department');
    const inputDesignation = document.getElementById('designation');
    const inputReportingManager = document.getElementById('reporting-manager');
    const updateProfileButton = document.getElementById('update-profile-button');
    const profileStatus = document.getElementById('profile-status');

    // Form: Promotion
    const inputCurrentPayScale = document.getElementById('current-pay-scale');
    const inputCurrentBasicSalary = document.getElementById('current-basic-salary');
    const inputNewDesignation = document.getElementById('new-designation');
    const inputNewPayScale = document.getElementById('new-pay-scale');
    const inputNewBasicSalary = document.getElementById('new-basic-salary');
    const processPromotionButton = document.getElementById('process-promotion-button');
    const promotionStatus = document.getElementById('promotion-status');
    
    // Header
    const userWelcomeName = document.getElementById('user-welcome-name');

    // State variable to store the ID of the user being managed
    let currentManagingEmployeeId = null;
    let userRole = null;

    if (!token) {
        window.location.href = '../index.html';
        return;
    }

    // --- 1. Check User Role and Initialize Page ---
    const initializePage = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                localStorage.removeItem('ehrms_token');
                window.location.href = '../index.html';
                return;
            }
            const { data } = await response.json();
            userRole = data.role;
            const myEmployeeId = data.employeeId;
            
            if (userWelcomeName) {
                userWelcomeName.textContent = `Welcome, ${myEmployeeId}`;
            }

            if (userRole === 'hr' || userRole === 'admin') {
                // --- ADMIN / HR VIEW ---
                searchSection.classList.remove('hidden');
                promotionSection.classList.remove('hidden');
                // All inputs remain enabled
            } else {
                // --- EMPLOYEE (SELF-VIEW) ---
                // Load their own profile
                await loadProfileData(myEmployeeId);
                
                // Disable all inputs and buttons
                inputDepartment.disabled = true;
                inputDesignation.disabled = true;
                inputReportingManager.disabled = true;
                updateProfileButton.disabled = true;
                updateProfileButton.textContent = 'Only HR can update your profile';
            }
        } catch (error) {
            console.error('Initialization Error:', error);
            searchStatus.textContent = 'Error loading page.';
        }
    };

    // --- 2. Function to Fetch and Load Profile Data ---
    const loadProfileData = async (employeeId) => {
        try {
            const res = await fetch(`/api/job-profile/${employeeId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const { message } = await res.json();
                throw new Error(message || 'Employee not found');
            }

            const { data } = await res.json();
            
            // Set the state
            currentManagingEmployeeId = data.employeeId;

            // Populate Personal Info
            inputFullName.value = `${data.personalInfo.firstName} ${data.personalInfo.lastName}`;
            inputEmail.value = data.personalInfo.email;
            inputEmployeeId.value = data.employeeId;

            // Populate Job Profile
            inputDepartment.value = data.jobProfile.department;
            inputDesignation.value = data.jobProfile.designation;
            inputReportingManager.value = data.jobProfile.reportingManager || '';

            // Populate Compensation (for HR)
            if (userRole === 'hr' || userRole === 'admin') {
                inputCurrentPayScale.value = data.compensation.payScale || 'N/A';
                inputCurrentBasicSalary.value = data.compensation.basicSalary || '0';
                
                // Pre-fill new designation for promotion
                inputNewDesignation.value = data.jobProfile.designation;
            }
            
            return true; // Success

        } catch (error) {
            searchStatus.textContent = `Error: ${error.message}`;
            searchStatus.classList.add('text-red-600');
            return false; // Failure
        }
    };

    // --- 3. Event Listeners (for HR/Admin) ---

    // Search Button
    if (searchButton) {
        searchButton.addEventListener('click', async () => {
            const employeeId = searchInput.value.trim();
            if (!employeeId) {
                searchStatus.textContent = 'Please enter an Employee ID.';
                return;
            }
            searchStatus.textContent = 'Searching...';
            searchStatus.classList.remove('text-red-600', 'text-green-600');
            
            const success = await loadProfileData(employeeId);
            if (success) {
                searchStatus.textContent = `Successfully loaded profile for ${employeeId}.`;
                searchStatus.classList.add('text-green-600');
            }
        });
    }

    // Update Job Profile Button
    if (updateProfileButton) {
        updateProfileButton.addEventListener('click', async () => {
            if (!currentManagingEmployeeId) {
                profileStatus.textContent = 'Please search for and load an employee profile first.';
                profileStatus.classList.add('text-red-600');
                return;
            }

            const profileData = {
                department: inputDepartment.value,
                designation: inputDesignation.value,
                reportingManager: inputReportingManager.value
            };

            profileStatus.textContent = 'Updating...';
            profileStatus.classList.remove('text-red-600', 'text-green-600');

            try {
                const res = await fetch(`/api/job-profile/${currentManagingEmployeeId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(profileData)
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Failed to update profile');
                }

                profileStatus.textContent = 'Job profile updated successfully!';
                profileStatus.classList.add('text-green-600');

            } catch (error) {
                profileStatus.textContent = `Error: ${error.message}`;
                profileStatus.classList.add('text-red-600');
            }
        });
    }

    // Process Promotion Button
    if (processPromotionButton) {
        processPromotionButton.addEventListener('click', async () => {
            if (!currentManagingEmployeeId) {
                promotionStatus.textContent = 'Please search for and load an employee profile first.';
                promotionStatus.classList.add('text-red-600');
                return;
            }

            const promotionData = {
                newDesignation: inputNewDesignation.value,
                newPayScale: inputNewPayScale.value,
                newBasicSalary: parseFloat(inputNewBasicSalary.value)
            };

            if (!promotionData.newDesignation || !promotionData.newPayScale || !promotionData.newBasicSalary) {
                promotionStatus.textContent = 'Please fill out all new promotion fields.';
                promotionStatus.classList.add('text-red-600');
                return;
            }
            
            promotionStatus.textContent = 'Processing...';
            promotionStatus.classList.remove('text-red-600', 'text-green-600');

            try {
                const res = await fetch(`/api/promotion/${currentManagingEmployeeId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(promotionData)
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Failed to process promotion');
                }

                promotionStatus.textContent = 'Promotion processed successfully! Profile is updated.';
                promotionStatus.classList.add('text-green-600');

                // Refresh the data on the page to show new values
                await loadProfileData(currentManagingEmployeeId);
                
                // Clear the 'new' fields
                inputNewDesignation.value = '';
                inputNewPayScale.value = '';
                inputNewBasicSalary.value = '';


            } catch (error) {
                promotionStatus.textContent = `Error: ${error.message}`;
                promotionStatus.classList.add('text-red-600');
            }
        });
    }

    // --- 4. Start the Page ---
    initializePage();
});