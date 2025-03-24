// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Document loaded');
    
    // Get the posts container
    const postsContainer = document.getElementById('posts');
    console.log('[DEBUG] Posts container found:', !!postsContainer);
    
    if (postsContainer) {
        console.log('[DEBUG] Posts container HTML:', postsContainer.innerHTML);
        
        // Count the number of articles (posts)
        const posts = postsContainer.getElementsByTagName('article');
        console.log('[DEBUG] Number of posts found:', posts.length);
        
        // Add click listeners to posts if needed
        Array.from(posts).forEach((post, index) => {
            console.log(`[DEBUG] Post ${index + 1} content:`, post.innerHTML);
        });
    } else {
        console.error('[DEBUG] Posts container not found! DOM structure:', document.body.innerHTML);
    }
    
    // Log the debug information div content
    const debugInfo = document.querySelector('.bg-yellow-100');
    if (debugInfo) {
        console.log('[DEBUG] Debug information:', debugInfo.innerHTML);
    } else {
        console.error('[DEBUG] Debug information div not found!');
    }
}); 