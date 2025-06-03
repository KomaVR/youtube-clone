'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = searchInput.value.trim();

      clearError();

      if (!query) {
        displayError('Please enter a search query.');
        return;
      }

      // Redirect to search.html with query parameter
      window.location.href = `search.html?query=${encodeURIComponent(query)}`;
    });
  }

  function displayError(message) {
    let errorEl = document.querySelector('.error-message');
    if (!errorEl && searchForm) {
      errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      errorEl.style.color = 'red';
      errorEl.style.marginTop = '8px';
      errorEl.style.fontSize = '14px';
      searchForm.appendChild(errorEl);
    }
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  function clearError() {
    const errorEl = document.querySelector('.error-message');
    if (errorEl) {
      errorEl.textContent = '';
    }
  }

  // User session management
  const loggedInUser = getLoggedInUser();
  updateUIForUser(loggedInUser);

  function getLoggedInUser() {
    const userId = localStorage.getItem('loggedInUserId');
    if (!userId) return null;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.id === userId) || null;
  }

  function updateUIForUser(user) {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;

    // Clear existing user-specific buttons
    const uploadBtn = document.getElementById('uploadBtn');
    const profileBtn = document.getElementById('profileBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (uploadBtn) uploadBtn.remove();
    if (profileBtn) profileBtn.remove();
    if (logoutBtn) logoutBtn.remove();

    if (user) {
      // Add Upload button
      const uploadButton = document.createElement('a');
      uploadButton.href = 'upload.html';
      uploadButton.id = 'uploadBtn';
      uploadButton.className = 'header-btn';
      uploadButton.textContent = 'Upload';
      uploadButton.style.marginRight = '10px';
      headerRight.insertBefore(uploadButton, headerRight.firstChild);

      // Add Profile button
      const profileButton = document.createElement('a');
      profileButton.href = 'profile.html';
      profileButton.id = 'profileBtn';
      profileButton.className = 'header-btn';
      profileButton.textContent = user.username;
      profileButton.style.marginRight = '10px';
      headerRight.insertBefore(profileButton, headerRight.firstChild);

      // Add Logout button
      const logoutButton = document.createElement('button');
      logoutButton.id = 'logoutBtn';
      logoutButton.className = 'header-btn';
      logoutButton.textContent = 'Logout';
      logoutButton.style.marginRight = '10px';
      logoutButton.addEventListener('click', () => {
        localStorage.removeItem('loggedInUserId');
        window.location.reload();
      });
      headerRight.insertBefore(logoutButton, headerRight.firstChild);

      // Hide Sign In button
      const signInBtn = headerRight.querySelector('.sign-in-btn');
      if (signInBtn) signInBtn.style.display = 'none';
    } else {
      // Show Sign In button
      const signInBtn = headerRight.querySelector('.sign-in-btn');
      if (signInBtn) signInBtn.style.display = 'inline-block';
    }
  }

  // Page-specific initialization
  const currentPage = window.location.pathname.split('/').pop();

  if (currentPage === 'index.html' || currentPage === '') {
    initHomePage();
  } else if (currentPage === 'video.html') {
    initVideoPage();
  } else if (currentPage === 'search.html') {
    initSearchPage();
  } else if (currentPage === 'login.html') {
    initLoginPage();
  } else if (currentPage === 'signup.html') {
    initSignupPage();
  } else if (currentPage === 'upload.html') {
    initUploadPage();
  } else if (currentPage === 'profile.html') {
    initProfilePage();
  }

  // Helper functions for page initialization

  function initHomePage() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const videos = getAllVideos();
    const user = getLoggedInUser();

    // Filter videos uploaded by users
    const userVideos = videos.filter(v => v.uploaderId);

    if (userVideos.length === 0) {
      mainContent.innerHTML = '<p>No videos available. Upload your first video!</p>';
      return;
    }

    // Optionally, apply recommendation algorithm if user logged in
    const videosToShow = user ? recommendVideosForUser(user.id) : userVideos;

    mainContent.innerHTML = '<section class="video-grid" aria-label="User uploaded videos">' +
      videosToShow.map(video => `
        <a href="video.html?videoId=${video.id}" class="video-card" tabindex="0" data-video-id="${video.id}">
          <img src="${video.thumbnailUrl}" alt="Video thumbnail" class="thumbnail" />
          <div class="video-info">
            <h3 class="video-title">${video.title}</h3>
            <p class="channel-name">${getUserNameById(video.uploaderId)}</p>
            <p class="video-meta">${new Date(video.uploadDate).toLocaleDateString()}</p>
          </div>
        </a>
      `).join('') + '</section>';
  }

  function initVideoPage() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('videoId');
    if (!videoId) {
      mainContent.innerHTML = '<p>Video ID is missing. Please go back and select a video.</p>';
      return;
    }

    const videos = getAllVideos();
    const video = videos.find(v => v.id === videoId);
    if (!video) {
      mainContent.innerHTML = '<p>Video not found. Please go back and select a valid video.</p>';
      return;
    }

    const uploaderName = getUserNameById(video.uploaderId);

    mainContent.innerHTML = `
      <button onclick="window.history.back()" class="back-btn">← Back</button>
      <div class="video-player-container">
        <video controls width="100%" src="${video.videoUrl}" poster="${video.thumbnailUrl}">
          Sorry, your browser doesn't support embedded videos.
        </video>
      </div>
      <h2>${video.title}</h2>
      <p class="channel-name">${uploaderName}</p>
      <p class="video-meta">${new Date(video.uploadDate).toLocaleDateString()}</p>
      <p class="video-description">${video.description}</p>
      <h3>Recommended Videos</h3>
      <section class="video-grid" aria-label="Recommended videos">
        ${videos.filter(v => v.id !== videoId).map(v => `
          <a href="video.html?videoId=${v.id}" class="video-card" tabindex="0" data-video-id="${v.id}">
            <img src="${v.thumbnailUrl}" alt="Video thumbnail" class="thumbnail" />
            <div class="video-info">
              <h3 class="video-title">${v.title}</h3>
              <p class="channel-name">${getUserNameById(v.uploaderId)}</p>
              <p class="video-meta">${new Date(v.uploadDate).toLocaleDateString()}</p>
            </div>
          </a>
        `).join('')}
      </section>
    `;
  }

  function initSearchPage() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    if (!query) {
      mainContent.innerHTML = '<p>Please enter a search query.</p>';
      return;
    }

    const videos = getAllVideos();
    const filteredVideos = videos.filter(video =>
      video.title.toLowerCase().includes(query.toLowerCase()) ||
      video.description.toLowerCase().includes(query.toLowerCase()) ||
      video.tags.preset.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
      video.tags.custom.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    if (filteredVideos.length === 0) {
      mainContent.innerHTML = `<p>No results found for "<strong>${query}</strong>". Please try a different search.</p>`;
      return;
    }

    mainContent.innerHTML = `<h2>Search results for "<strong>${query}</strong>":</h2><section class="video-grid" aria-label="Search results">` +
      filteredVideos.map(video => `
        <a href="video.html?videoId=${video.id}" class="video-card" tabindex="0" data-video-id="${video.id}">
          <img src="${video.thumbnailUrl}" alt="Video thumbnail" class="thumbnail" />
          <div class="video-info">
            <h3 class="video-title">${video.title}</h3>
            <p class="channel-name">${getUserNameById(video.uploaderId)}</p>
            <p class="video-meta">${new Date(video.uploadDate).toLocaleDateString()}</p>
          </div>
        </a>
      `).join('') + '</section>';
  }

  function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      errorMessage.textContent = '';

      const username = loginForm.username.value.trim();
      const password = loginForm.password.value.trim();

      if (!username || !password) {
        errorMessage.textContent = 'Please enter both username and password.';
        return;
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        localStorage.setItem('loggedInUserId', user.id);
        window.location.href = 'index.html';
      } else {
        errorMessage.textContent = 'Invalid username or password.';
      }
    });
  }

  function initSignupPage() {
    // Signup page logic is handled inline in signup.html
  }

  function initUploadPage() {
    // Upload page logic is handled inline in upload.html
  }

  function initProfilePage() {
    // Profile page logic is handled inline in profile.html
  }

  // Helper to get username by user ID
  function getUserNameById(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unknown';
  }

  // Video data management and recommendation algorithm

  // Get all videos from localStorage
  function getAllVideos() {
    return JSON.parse(localStorage.getItem('videos') || '[]');
  }

  // Save videos to localStorage
  function saveVideos(videos) {
    localStorage.setItem('videos', JSON.stringify(videos));
  }

  // Recommendation algorithm based on tags and user preferences
  function recommendVideosForUser(userId) {
    const videos = getAllVideos();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    if (!user) return videos;

    // Build tag preference map from liked videos
    const likedVideos = videos.filter(v => v.likes && v.likes.includes(userId));
    const tagScores = {};

    likedVideos.forEach(video => {
      video.tags.preset.forEach(tag => {
        tagScores[tag] = (tagScores[tag] || 0) + 1;
      });
      video.tags.custom.forEach(tag => {
        tagScores[tag] = (tagScores[tag] || 0) + 1;
      });
    });

    // Score videos based on tag matches
    const scoredVideos = videos.map(video => {
      let score = 0;
      video.tags.preset.forEach(tag => {
        score += tagScores[tag] || 0;
      });
      video.tags.custom.forEach(tag => {
        score += tagScores[tag] || 0;
      });
      return { video, score };
    });

    // Sort videos by score descending
    scoredVideos.sort((a, b) => b.score - a.score);

    // Return sorted videos
    return scoredVideos.map(sv => sv.video);
  }

  // Expose functions globally for other scripts/pages
  window.app = {
    getAllVideos,
    saveVideos,
    recommendVideosForUser,
    getLoggedInUser
  };

  // Comment handling for video page
  document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'video.html') return;

    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('videoId');
    if (!videoId) return;

    const commentForm = document.getElementById('commentForm');
    const commentInput = document.getElementById('commentInput');
    const commentsList = document.getElementById('commentsList');

    function loadComments() {
      const videos = getAllVideos();
      const video = videos.find(v => v.id === videoId);
      if (!video) return;

      commentsList.innerHTML = '';
      if (!video.comments || video.comments.length === 0) {
        commentsList.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
        return;
      }

      video.comments.forEach(comment => {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment';
        commentEl.style.borderBottom = '1px solid #ddd';
        commentEl.style.padding = '8px 0';

        const userName = getUserNameById(comment.userId) || 'Unknown';

        commentEl.innerHTML = `
          <p><strong>${userName}</strong> <small>${new Date(comment.date).toLocaleString()}</small></p>
          <p>${comment.text}</p>
        `;
        commentsList.appendChild(commentEl);
      });
    }

    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = commentInput.value.trim();
      if (!text) return;

      const loggedInUser = getLoggedInUser();
      if (!loggedInUser) {
        alert('You must be logged in to post comments.');
        return;
      }

      const videos = getAllVideos();
      const video = videos.find(v => v.id === videoId);
      if (!video) return;

      if (!video.comments) video.comments = [];

      video.comments.push({
        userId: loggedInUser.id,
        text,
        date: new Date().toISOString()
      });

      saveVideos(videos);
      commentInput.value = '';
      loadComments();
    });

    loadComments();
  });
});
