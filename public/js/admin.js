document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
});

function setupEventListeners() {
    const loginForm = document.getElementById('adminLoginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const newPostBtn = document.getElementById('newPostBtn');
    const moderateCommentsBtn = document.getElementById('moderateCommentsBtn');

    loginForm?.addEventListener('submit', handleLogin);
    logoutBtn?.addEventListener('click', handleLogout);
    newPostBtn?.addEventListener('click', () => window.location.href = '/admin/posts/new');
    moderateCommentsBtn?.addEventListener('click', () => window.location.href = '/admin/comments');
}

async function checkAuthStatus() {
    const token = localStorage.getItem('adminToken');
    const loginForm = document.getElementById('loginForm');
    const dashboard = document.getElementById('dashboard');

    if (!token) {
        loginForm.classList.remove('hidden');
        dashboard.classList.add('hidden');
        return;
    }

    try {
        const response = await fetch('/api/admin/profile?adminId=' + localStorage.getItem('adminId'), {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loginForm.classList.add('hidden');
            dashboard.classList.remove('hidden');
            loadDashboardData();
        } else {
            throw new Error('Authentication failed');
        }
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
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminId', data.data._id);
            checkAuthStatus();
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
    window.location.href = '/admin';
}

async function loadDashboardData() {
    try {
        const [postsResponse, commentsResponse] = await Promise.all([
            fetch('/api/posts'),
            fetch('/api/comments')
        ]);

        const postsData = await postsResponse.json();
        const commentsData = await commentsResponse.json();

        document.getElementById('postCount').textContent = postsData.total || '0';
        document.getElementById('commentCount').textContent = commentsData.total || '0';
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
} 