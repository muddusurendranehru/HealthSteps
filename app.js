// HealthStep - Healthcare Center JavaScript

// Global variables
let currentUser = null;
let csrfToken = null;

// Authentication functions
async function signup(email, password, confirmPassword) {
    if (password !== confirmPassword) {
        showMessage('signup', 'Passwords do not match', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('signup', 'Account created successfully! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showMessage('signup', data.error || data.message || 'Signup failed', 'error');
        }
    } catch (error) {
        showMessage('signup', 'Network error. Please try again.', 'error');
    }
}

async function login(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('login', 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showMessage('login', data.error || data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('login', 'Network error. Please try again.', 'error');
    }
}

async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (!response.ok) {
            console.error('Logout failed:', response.status, response.statusText);
            const errorData = await response.json().catch(() => ({}));
            console.error('Logout error details:', errorData);
        } else {
            console.log('Logout successful');
        }
    } catch (error) {
        console.error('Logout network error:', error);
    } finally {
        window.location.href = 'login.html';
    }
}

// Dashboard functions
async function checkAuth() {
    console.log('[DEBUG] Starting checkAuth function...');
    try {
        const response = await fetch('/api/user', {
            credentials: 'include'
        });

        if (!response.ok) {
            window.location.href = 'login.html';
            return;
        }

        currentUser = await response.json();
        document.getElementById('userInfo').textContent = currentUser.email;

        // Set today's date as default
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Load steps history
        loadSteps();

    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = 'login.html';
    }
}

async function loadSteps() {
    console.log('[LOAD STEPS] Starting loadSteps function...');
    if (!currentUser) {
        console.log('[LOAD STEPS] No current user, returning');
        return;
    }

    const stepsList = document.getElementById('stepsList');
    if (!stepsList) return;

    stepsList.innerHTML = '<div class="loading">Loading your step history...</div>';

    try {
        console.log('[LOAD STEPS] Fetching steps for user:', currentUser.email);
        const response = await fetch(`/api/steps?userEmail=${encodeURIComponent(currentUser.email)}`, {
            credentials: 'include'
        });

        console.log('[LOAD STEPS] Response status:', response.status);
        console.log('[LOAD STEPS] Response headers:', response.headers.get('content-type'));

        if (!response.ok) {
            throw new Error('Failed to fetch steps');
        }

        const steps = await response.json();
        console.log('[LOAD STEPS] Received steps data:', steps);
        console.log('[LOAD STEPS] Number of steps:', steps.length);

        if (steps.length === 0) {
            console.log('[LOAD STEPS] No steps found, showing empty message');
            stepsList.innerHTML = '<div class="loading">No step records yet. Add your first entry!</div>';
            return;
        }

        console.log('[LOAD STEPS] Rendering', steps.length, 'step records');
        stepsList.innerHTML = steps.map(step => `
            <div class="step-item">
                <div>
                    <div class="step-count">${step.steps.toLocaleString()} steps</div>
                    <div class="step-date">${new Date(step.date).toLocaleDateString()}</div>
                </div>
            </div>
        `).join('');
        console.log('[LOAD STEPS] Rendering complete');

    } catch (error) {
        console.error('[LOAD STEPS] Error loading steps:', error);
        stepsList.innerHTML = '<div class="error">Failed to load step history</div>';
    }
}

async function addSteps(steps, date) {
    if (!currentUser) {
        showMessage('add', 'Please log in first', 'error');
        return;
    }

    const addBtn = document.getElementById('addBtn');
    const messageDiv = document.getElementById('addMessage');

    addBtn.disabled = true;
    addBtn.textContent = 'Adding...';
    messageDiv.innerHTML = '';

    try {
        console.log('[SECURITY BYPASSED] Submitting steps for small healthcare center');

        const response = await fetch('/api/steps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                steps: parseInt(steps),
                date: date,
                userEmail: currentUser.email
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('add', 'Steps added successfully!', 'success');
            document.getElementById('steps').value = '';
            loadSteps(); // Refresh the list
        } else {
            showMessage('add', data.message || 'Failed to add steps', 'error');
        }
    } catch (error) {
        showMessage('add', 'Network error. Please try again.', 'error');
    } finally {
        addBtn.disabled = false;
        addBtn.textContent = 'Save Steps';
    }
}

// Utility functions
function showMessage(type, message, status) {
    const messageId = type + 'Message';
    const messageDiv = document.getElementById(messageId);
    if (messageDiv) {
        messageDiv.innerHTML = `<div class="${status}">${message}</div>`;
    }
}

function quickAdd(stepCount) {
    const stepsInput = document.getElementById('steps');
    if (stepsInput) {
        stepsInput.value = stepCount;
    }
}

// Form event handlers
function setupSignupForm() {
    const form = document.getElementById('signupForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            await signup(email, password, confirmPassword);
        });
    }
}

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await login(email, password);
        });
    }
}

function setupDashboardForm() {
    const form = document.getElementById('addStepsForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const steps = document.getElementById('steps').value;
            const date = document.getElementById('date').value;
            await addSteps(steps, date);
        });
    }
}

// Page initialization
function initializePage() {
    // Setup forms based on current page
    setupSignupForm();
    setupLoginForm();
    setupDashboardForm();

    // Initialize dashboard if we're on that page
    if (document.getElementById('userInfo')) {
        checkAuth();
    }

    console.log('[DEBUG] Page initialized');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializePage);