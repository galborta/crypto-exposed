document.addEventListener('DOMContentLoaded', () => {
    console.log('[ADMIN EDITOR] Initializing editor');
    initializeEditor();
    setupFormHandlers();
});

let quill;

function initializeEditor() {
    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean'],
        ['link', 'image']
    ];

    quill = new Quill('#content', {
        modules: {
            toolbar: toolbarOptions
        },
        theme: 'snow'
    });

    const form = document.getElementById('post-form');
    const slug = form.dataset.slug;
    
    if (slug) {
        loadPost(slug);
    }
}

function setupFormHandlers() {
    const form = document.getElementById('post-form');
    const saveDraftButton = document.getElementById('save-draft');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSubmit(false);
    });

    saveDraftButton.addEventListener('click', () => {
        handleSubmit(true);
    });

    // Auto-generate slug from title
    document.getElementById('title').addEventListener('input', (e) => {
        const slug = e.target.value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        document.getElementById('slug').value = slug;
    });

    // Handle logout
    document.getElementById('logout-button').addEventListener('click', () => {
        console.log('[ADMIN EDITOR] Logging out');
        localStorage.removeItem('adminToken');
        window.location.href = '/admin';
    });
}

async function handleSubmit(isDraft = false) {
    console.log(`[ADMIN EDITOR] ${isDraft ? 'Saving draft' : 'Publishing post'}`);
    
    try {
        const form = document.getElementById('post-form');
        const formData = {
            title: document.getElementById('title').value,
            slug: document.getElementById('slug').value,
            excerpt: document.getElementById('excerpt').value,
            content: quill.root.innerHTML,
            tags: document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(Boolean),
            published: !isDraft
        };

        console.log('[ADMIN EDITOR] Form data:', formData);

        // Get CSRF token from cookie
        const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];

        if (!csrfToken) {
            throw new Error('CSRF token not found in cookies');
        }

        console.log('[ADMIN EDITOR] Using CSRF token:', csrfToken);
        
        // Determine if we're creating or updating
        const slug = form.dataset.slug;
        const url = slug ? `/api/admin/posts/${slug}` : '/api/admin/posts';
        const method = slug ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
                'X-XSRF-TOKEN': csrfToken
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('[ADMIN EDITOR] Server error:', error);
            throw new Error(error.message || `Server returned ${response.status}`);
        }

        const result = await response.json();
        console.log('[ADMIN EDITOR] Save successful:', result);

        // Redirect to posts list on success
        window.location.href = '/admin/posts';
    } catch (error) {
        console.error('[ADMIN EDITOR] Error:', error);
        alert(`Error saving post: ${error.message}`);
    }
}

async function loadPost(slug) {
    console.log(`[ADMIN EDITOR] Loading post data for slug: ${slug}`);
    try {
        const response = await fetch(`/api/admin/posts/${slug}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load post');
        }

        const data = await response.json();
        
        if (data.success) {
            console.log('[ADMIN EDITOR] Post data loaded successfully');
            const post = data.data;
            document.getElementById('title').value = post.title;
            document.getElementById('slug').value = post.slug;
            document.getElementById('excerpt').value = post.excerpt;
            document.getElementById('tags').value = post.tags?.join(', ') || '';
            quill.root.innerHTML = post.content;
        } else {
            console.error('[ADMIN EDITOR] Error loading post:', data.message);
            alert('Error loading post data');
        }
    } catch (error) {
        console.error('[ADMIN EDITOR] Error fetching post:', error);
        alert('Error loading post data');
    }
} 