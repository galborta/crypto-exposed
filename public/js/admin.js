document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
});

function setupEventListeners() {
    const loginForm = document.getElementById('adminLoginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const newPostBtn = document.getElementById('newPostBtn');

    loginForm?.addEventListener('submit', handleLogin);
    logoutBtn?.addEventListener('click', handleLogout);
    newPostBtn?.addEventListener('click', () => window.location.href = '/admin/posts/new');
}

async function checkAuthStatus() {
    const token = localStorage.getItem('adminToken');
    const loginForm = document.getElementById('loginForm');
    const dashboard = document.getElementById('dashboard');

    try {
        // Try to fetch profile - the cookie will be sent automatically
        const response = await fetch('/api/admin/profile');
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                loginForm.classList.add('hidden');
                dashboard.classList.remove('hidden');
                loadDashboardData();
                return;
            }
        }
        
        // If we get here, authentication failed
        throw new Error('Authentication failed');
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminId');
        loginForm.classList.remove('hidden');
        dashboard.classList.add('hidden');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // This is important for cookies
        });

        const data = await response.json();

        if (data.success) {
            // Store in localStorage as backup
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminId', data.data._id);
            
            // Refresh the page to ensure all auth state is correct
            window.location.href = '/admin/dashboard';
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

function handleLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminId');
    
    // Clear the auth cookie
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    window.location.href = '/admin';
}

async function loadDashboardData() {
    try {
        const response = await fetch('/api/admin/posts/stats', {
            credentials: 'include' // This is important for cookies
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('postCount').textContent = data.data.total || '0';
            document.getElementById('publishedCount').textContent = data.data.published || '0';
            document.getElementById('draftCount').textContent = data.data.draft || '0';
        } else {
            throw new Error(data.message || 'Failed to load stats');
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Error loading dashboard data. Please try again.');
    }
} 