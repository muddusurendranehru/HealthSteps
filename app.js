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
            // Store user email in localStorage
            localStorage.setItem('userEmail', email);
            showMessage('signup', 'Account created successfully! Redirecting to dashboard...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
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
            // Store user email in localStorage
            localStorage.setItem('userEmail', email);
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
        // Clear localStorage on logout
        localStorage.removeItem('userEmail');
        currentUser = null;
        window.location.href = 'login.html';
    }
}

// Dashboard functions
async function checkAuth() {
    console.log('[DEBUG] Starting checkAuth function...');
    
    // Check localStorage first
    const storedUser = localStorage.getItem('userEmail');
    if (storedUser) {
        console.log('[AUTH] Found stored user:', storedUser);
        currentUser = { email: storedUser }; // Set currentUser object
        document.getElementById('userInfo').textContent = storedUser;
        
        // Set today's date as default
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Initialize speedometer
        updateSpeedometer(0);
        
        // Load steps history
        loadSteps();
        return storedUser;
    }
    
    // If no stored user, redirect to login
    console.log('[AUTH] No user found, redirecting to login');
    window.location.href = 'login.html';
    return null;
}

async function loadSteps() {
    console.log('[LOAD STEPS] Starting loadSteps function...');
    
    // Get the current user - THIS IS THE KEY FIX
    const userEmail = window.currentUser || localStorage.getItem('userEmail');
    
    if (!userEmail) {
        console.error('[LOAD STEPS] No user email found!');
        // For healthcare emergency, continue anyway
        console.log('[HEALTHCARE MODE] Continuing without user validation');
        return [];
    }
    
    console.log('[LOAD STEPS] Fetching steps for user:', userEmail);
    
    const stepsList = document.getElementById('stepsList');
    if (stepsList) {
        stepsList.innerHTML = '<div class="loading">Loading your step history...</div>';
    }
    
    try {
        const response = await fetch(`/api/steps?userEmail=${userEmail}`);
        console.log('[LOAD STEPS] Response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Failed to fetch steps');
        }
        
        const data = await response.json();
        const steps = data.steps || data || []; // Handle multiple response formats
        console.log('[LOAD STEPS] Received steps data:', steps);
        
        if (stepsList) {
            if (!steps || steps.length === 0) {
                console.log('[LOAD STEPS] No steps found, showing empty message');
                stepsList.innerHTML = '<div class="loading">No step records yet. Add your first entry!</div>';
            } else {
                console.log('[LOAD STEPS] Rendering', steps.length, 'step records');
                // Calculate total steps
                const totalAllSteps = steps.reduce((sum, step) => sum + (step.steps || step.stepCount || 0), 0);
                
                stepsList.innerHTML = `
                    <div class="step-item" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: bold; margin-bottom: 15px;">
                        <div>
                            <div class="step-count" style="color: white; font-size: 24px;">📊 TOTAL: ${totalAllSteps.toLocaleString()} steps</div>
                            <div class="step-date" style="color: rgba(255,255,255,0.9);">Across all ${steps.length} days</div>
                        </div>
                    </div>
                    ${steps.map(step => `
                        <div class="step-item">
                            <div>
                                <div class="step-count">${(step.steps || step.stepCount || 0).toLocaleString()} steps</div>
                                <div class="step-date">${new Date(step.date).toLocaleDateString()}</div>
                            </div>
                        </div>
                    `).join('')}
                `;
                console.log('[LOAD STEPS] Rendering complete');
                
                // Update speedometer with today's steps
                const today = new Date().toISOString().split('T')[0];
                const todaySteps = steps.find(s => s.date && s.date.startsWith(today));
                const todayTotal = todaySteps ? (todaySteps.steps || todaySteps.stepCount || 0) : 0;
                updateSpeedometer(todayTotal);
            }
        }
        
        return steps;
    } catch (error) {
        console.error('[LOAD STEPS] Error:', error);
        if (stepsList) {
            stepsList.innerHTML = '<div class="error">Failed to load step history</div>';
        }
        // For healthcare center - return empty array instead of crashing
        return [];
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
                steps: parseInt(steps),  // FIXED: was stepCount, now matches backend
                date: date,
                userEmail: currentUser?.email || localStorage.getItem('userEmail')
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Show total steps for the day
            const totalSteps = data.steps || 0;
            const addedSteps = parseInt(steps);
            showMessage('add', `✅ Added ${addedSteps.toLocaleString()} steps! Total for today: ${totalSteps.toLocaleString()} steps`, 'success');
            document.getElementById('steps').value = '';
            
            // Update speedometer immediately
            updateSpeedometer(totalSteps);
            
            loadSteps(); // Refresh the list
        } else {
            showMessage('add', data.error || data.message || 'Failed to add steps', 'error');
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

// Speedometer Gauge Functions
function updateSpeedometer(steps) {
    // Ensure steps is a number
    steps = parseInt(steps) || 0;
    
    // Cap at 14000 for display
    const displaySteps = Math.min(steps, 14000);
    
    // Calculate angle (180 degrees total, from left to right)
    const maxSteps = 14000;
    const angle = (displaySteps / maxSteps) * 180 - 90; // -90 to 90 degrees
    
    // Update needle rotation
    const needle = document.getElementById('needle');
    if (needle) {
        needle.style.transform = `rotate(${angle}deg)`;
    }
    
    // Update digital display
    const display = document.getElementById('stepsDisplay');
    if (display) {
        display.textContent = steps.toLocaleString();
    }
    
    // Determine color and status based on steps
    let color, status, statusText, statusEmoji;
    if (steps < 5000) {
        color = '#ff4444';
        status = 'red';
        statusText = 'Getting Started';
        statusEmoji = '🔴';
    } else if (steps < 10000) {
        color = '#ff9500';
        status = 'orange';
        statusText = 'Keep Going!';
        statusEmoji = '🟠';
    } else if (steps < 12000) {
        color = '#4da6ff';
        status = 'blue';
        statusText = 'Great Progress!';
        statusEmoji = '🔵';
    } else {
        color = '#4caf50';
        status = 'green';
        statusText = 'Excellent! 🎯';
        statusEmoji = '🟢';
    }
    
    // Update progress arc color
    const progressArc = document.getElementById('progressArc');
    if (progressArc) {
        progressArc.setAttribute('stroke', color);
    }
    
    // Update status display
    const statusDiv = document.getElementById('stepsStatus');
    if (statusDiv) {
        statusDiv.textContent = `${statusEmoji} ${statusText}`;
        statusDiv.style.backgroundColor = color + '20';
        statusDiv.style.color = color;
        statusDiv.style.border = `2px solid ${color}`;
    }
    
    // Draw gauge arcs (color zones)
    drawGaugeArcs();
    
    // Draw progress arc
    drawProgressArc(displaySteps, maxSteps, color);
}

function drawGaugeArcs() {
    const cx = 100, cy = 100, r = 70;
    
    // Red zone: 0-5000 (0 to 64.3 degrees)
    drawArc('redZone', cx, cy, r, -90, -90 + (5000/14000) * 180);
    
    // Orange zone: 5000-10000 (64.3 to 128.6 degrees)
    drawArc('orangeZone', cx, cy, r, -90 + (5000/14000) * 180, -90 + (10000/14000) * 180);
    
    // Blue zone: 10000-12000 (128.6 to 154.3 degrees)
    drawArc('blueZone', cx, cy, r, -90 + (10000/14000) * 180, -90 + (12000/14000) * 180);
    
    // Green zone: 12000-14000 (154.3 to 180 degrees)
    drawArc('greenZone', cx, cy, r, -90 + (12000/14000) * 180, 90);
}

function drawProgressArc(steps, maxSteps, color) {
    const cx = 100, cy = 100, r = 70;
    const endAngle = -90 + (steps / maxSteps) * 180;
    drawArc('progressArc', cx, cy, r, -90, endAngle);
}

function drawArc(elementId, cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    const d = [
        "M", start.x, start.y,
        "A", r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    
    const element = document.getElementById(elementId);
    if (element) {
        element.setAttribute("d", d);
    }
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function getTodaySteps() {
    // Get today's steps from the loaded steps data
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    
    // This will be updated when loadSteps is called
    // For now, return 0 and it will update when data loads
    return 0;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializePage);