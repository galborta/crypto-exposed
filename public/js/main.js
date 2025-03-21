document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    setupEventListeners();
});

// Get CSRF token from meta tag
function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
}

// Common fetch options with CSRF token
function getFetchOptions(method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'CSRF-Token': getCsrfToken()
        },
        credentials: 'include'
    };

    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    return options;
}

function setupEventListeners() {
    const modal = document.getElementById('postModal');
    const closeModal = document.getElementById('closeModal');
    const commentForm = document.getElementById('commentForm');

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmit);
    }
}

async function loadPosts() {
    console.log('[FRONTEND] Loading posts');
    try {
        const response = await fetch('/api/posts', getFetchOptions());
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error loading posts');
        }

        console.log(`[FRONTEND] Loaded ${data.count} posts`);
        const postsContainer = document.getElementById('posts-container');
        
        if (!postsContainer) {
            console.error('[FRONTEND] Posts container element not found');
            return;
        }

        if (data.data.length === 0) {
            postsContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-600 dark:text-gray-400">No posts available yet.</p>
                </div>
            `;
            return;
        }

        postsContainer.innerHTML = data.data.map(post => `
            <article class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div class="p-6">
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        <a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400" data-slug="${post.slug}">
                            ${post.title}
                        </a>
                    </h2>
                    <p class="text-gray-600 dark:text-gray-300 mb-4">${post.excerpt}</p>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <time datetime="${new Date(post.publishedAt || post.createdAt).toISOString()}">
                                ${new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                            </time>
                        </div>
                        ${post.tags && post.tags.length > 0 ? `
                            <div class="flex flex-wrap gap-2">
                                ${post.tags.map(tag => `
                                    <span class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                        ${tag}
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </article>
        `).join('');

        // Add click event listeners to post titles
        document.querySelectorAll('[data-slug]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openPost(link.dataset.slug);
            });
        });
    } catch (error) {
        console.error('[FRONTEND] Error loading posts:', error);
        const postsContainer = document.getElementById('posts-container');
        if (postsContainer) {
            postsContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-600 dark:text-red-400">Error loading posts. Please try again later.</p>
                </div>
            `;
        }
    }
}

async function openPost(slug) {
    console.log(`[FRONTEND] Opening post: ${slug}`);
    try {
        const response = await fetch(`/api/posts/${slug}`, getFetchOptions());
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error loading post');
        }

        const post = data.data;
        console.log('[FRONTEND] Post loaded successfully');
        
        const postContent = document.getElementById('postContent');
        if (!postContent) {
            console.error('[FRONTEND] Post content element not found');
            return;
        }

        postContent.innerHTML = `
            <h1 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">${post.title}</h1>
            <div class="mb-4 text-sm text-gray-500 dark:text-gray-400">
                <time datetime="${new Date(post.publishedAt || post.createdAt).toISOString()}">
                    ${new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                </time>
            </div>
            <div class="prose dark:prose-invert max-w-none">${post.content}</div>
            ${post.tags && post.tags.length > 0 ? `
                <div class="mt-6 flex flex-wrap gap-2">
                    ${post.tags.map(tag => `
                        <span class="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            ` : ''}
        `;

        // Store the current post ID for commenting
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            commentForm.dataset.postId = post._id;
            // Load comments
            loadComments(post._id);
        }

        // Show modal
        const modal = document.getElementById('postModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('[FRONTEND] Error loading post:', error);
        alert('Error loading post. Please try again later.');
    }
}

async function loadComments(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/comments`, getFetchOptions());
        const data = await response.json();
        
        const commentsContainer = document.getElementById('comments');
        commentsContainer.innerHTML = data.comments.map(comment => `
            <div class="comment bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div class="flex items-center mb-2">
                    <span class="font-medium text-gray-900 dark:text-white">
                        ${comment.name || 'Anonymous'}
                    </span>
                    <span class="mx-2 text-gray-400">•</span>
                    <time class="text-sm text-gray-500 dark:text-gray-400">
                        ${new Date(comment.createdAt).toLocaleDateString()}
                    </time>
                </div>
                <p class="text-gray-600 dark:text-gray-300">${comment.content}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

async function handleCommentSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const postId = form.dataset.postId;
    const nameInput = form.querySelector('#name');
    const commentInput = form.querySelector('#comment');

    try {
        const response = await fetch(`/api/posts/${postId}/comments`, 
            getFetchOptions('POST', {
                name: nameInput.value || 'Anonymous',
                content: commentInput.value
            })
        );

        if (response.ok) {
            // Clear form
            form.reset();
            
            // Reload comments
            loadComments(postId);
        } else {
            const error = await response.json();
            alert(error.message || 'Error submitting comment');
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('Error submitting comment. Please try again.');
    }
} 