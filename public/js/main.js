document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    setupEventListeners();
});

function setupEventListeners() {
    const modal = document.getElementById('postModal');
    const closeModal = document.getElementById('closeModal');
    const commentForm = document.getElementById('commentForm');

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    commentForm.addEventListener('submit', handleCommentSubmit);
}

async function loadPosts() {
    try {
        const response = await fetch('/api/posts');
        const data = await response.json();
        
        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = data.posts.map(post => `
            <article class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div class="p-6">
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        <a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400" data-slug="${post.slug}">
                            ${post.title}
                        </a>
                    </h2>
                    <p class="text-gray-600 dark:text-gray-300 mb-4">${post.excerpt}</p>
                    <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <time datetime="${new Date(post.createdAt).toISOString()}">
                            ${new Date(post.createdAt).toLocaleDateString()}
                        </time>
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
        console.error('Error loading posts:', error);
    }
}

async function openPost(slug) {
    try {
        const response = await fetch(`/api/posts/${slug}`);
        const post = await response.json();
        
        const postContent = document.getElementById('postContent');
        postContent.innerHTML = `
            <h1 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">${post.title}</h1>
            <div class="mb-4 text-sm text-gray-500 dark:text-gray-400">
                <time datetime="${new Date(post.createdAt).toISOString()}">
                    ${new Date(post.createdAt).toLocaleDateString()}
                </time>
            </div>
            <div class="prose dark:prose-invert">${post.content}</div>
        `;

        // Store the current post ID for commenting
        document.getElementById('commentForm').dataset.postId = post._id;

        // Load comments
        loadComments(post._id);

        // Show modal
        document.getElementById('postModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading post:', error);
    }
}

async function loadComments(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/comments`);
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
        const response = await fetch(`/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: nameInput.value || 'Anonymous',
                content: commentInput.value
            }),
        });

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