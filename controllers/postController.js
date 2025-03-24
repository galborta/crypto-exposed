const Post = require('../models/Post');

// Helper function to generate unique slug
async function generateUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  let exists = true;

  while (exists) {
    const post = await Post.findOne({ slug });
    if (!post) {
      exists = false;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  return slug;
}

// @desc    Get all published posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    console.log('[POSTS] Fetching published posts');
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // If admin is requesting, show all posts
    const isAdmin = req.admin;
    const query = isAdmin ? {} : { published: true };
    
    console.log('[POSTS] Query parameters:', {
      isAdmin,
      query,
      page,
      limit,
      skip
    });
    
    const posts = await Post.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug excerpt content publishedAt tags published createdAt updatedAt');
    
    const total = await Post.countDocuments(query);
    
    console.log('[POSTS] Database results:', {
      totalPosts: total,
      fetchedPosts: posts.length,
      postsData: posts.map(p => ({
        title: p.title,
        slug: p.slug,
        published: p.published
      }))
    });
    
    // Format the response data
    const formattedPosts = posts.map(post => ({
      ...post.toObject(),
      excerpt: post.excerpt || post.content.substring(0, 150) + '...',
      publishedAt: post.publishedAt || post.createdAt
    }));
    
    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        pages: Math.ceil(total / limit),
        page,
        limit
      },
      data: formattedPosts
    });
  } catch (error) {
    console.error('[POSTS] Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single post by slug
// @route   GET /api/posts/:slug
// @access  Public
exports.getPostBySlug = async (req, res) => {
  try {
    console.log(`[POSTS] Fetching post with slug: ${req.params.slug}`);
    const query = req.admin ? { slug: req.params.slug } : { slug: req.params.slug, published: true };
    const post = await Post.findOne(query);
    
    if (!post) {
      console.log(`[POSTS] No post found with slug: ${req.params.slug}`);
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    console.log(`[POSTS] Successfully retrieved post: ${post.title}`);
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('[POSTS] Error fetching post by slug:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new post (Admin)
// @route   POST /api/admin/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    console.log('[POSTS] Creating new post:', req.body.title);
    const postData = { ...req.body };
    
    // Generate unique slug if needed
    postData.slug = await generateUniqueSlug(postData.slug);
    console.log(`[POSTS] Using slug: ${postData.slug}`);
    
    // Set publishedAt if post is published
    if (postData.published) {
      console.log('[POSTS] Setting publishedAt for published post');
      postData.publishedAt = new Date();
    }
    
    const post = await Post.create(postData);
    
    console.log(`[POSTS] Successfully created post: ${post.title} (${post._id})`);
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.log('[POSTS] Validation error creating post:', messages);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    if (error.code === 11000) {
      console.log('[POSTS] Duplicate key error, attempting to generate unique slug');
      try {
        const uniqueSlug = await generateUniqueSlug(req.body.slug);
        return res.status(400).json({
          success: false,
          message: 'A post with this slug already exists. Try using: ' + uniqueSlug
        });
      } catch (slugError) {
        console.error('[POSTS] Error generating unique slug:', slugError);
        return res.status(500).json({
          success: false,
          message: 'Error generating unique slug'
        });
      }
    }
    
    console.error('[POSTS] Error creating post:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update post (Admin)
// @route   PUT /api/admin/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    console.log(`[POSTS] Updating post: ${req.params.id}`);
    const postData = { ...req.body };
    
    // Handle publishing status change
    const existingPost = await Post.findById(req.params.id);
    if (!existingPost) {
      console.log(`[POSTS] No post found with id: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if slug is being changed and ensure it's unique
    if (postData.slug && postData.slug !== existingPost.slug) {
      postData.slug = await generateUniqueSlug(postData.slug);
      console.log(`[POSTS] Using new slug: ${postData.slug}`);
    }
    
    // Set publishedAt when publishing for the first time
    if (postData.published && !existingPost.publishedAt) {
      console.log('[POSTS] Setting publishedAt for newly published post');
      postData.publishedAt = new Date();
    }
    // Remove publishedAt when unpublishing
    else if (!postData.published && existingPost.published) {
      console.log('[POSTS] Removing publishedAt for unpublished post');
      postData.publishedAt = null;
    }
    
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      postData,
      { new: true, runValidators: true }
    );
    
    console.log(`[POSTS] Successfully updated post: ${post.title}`);
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.log('[POSTS] Validation error updating post:', messages);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    if (error.code === 11000) {
      console.log('[POSTS] Duplicate key error while updating');
      return res.status(400).json({
        success: false,
        message: 'A post with this slug already exists'
      });
    }
    
    console.error('[POSTS] Error updating post:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete post (Admin)
// @route   DELETE /api/admin/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    console.log(`[POSTS] Deleting post: ${req.params.id}`);
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      console.log(`[POSTS] No post found with id: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    console.log(`[POSTS] Successfully deleted post: ${post.title}`);
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('[POSTS] Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get post statistics
// @route   GET /api/admin/posts/stats
// @access  Private
exports.getPostStats = async (req, res) => {
  try {
    console.log('[POSTS] Fetching post statistics');
    
    const [total, published, draft] = await Promise.all([
      Post.countDocuments({}),
      Post.countDocuments({ published: true }),
      Post.countDocuments({ published: false })
    ]);
    
    console.log(`[POSTS] Stats - Total: ${total}, Published: ${published}, Draft: ${draft}`);
    
    res.status(200).json({
      success: true,
      data: {
        total,
        published,
        draft
      }
    });
  } catch (error) {
    console.error('[POSTS] Error fetching post statistics:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 