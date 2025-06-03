'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  if (!searchForm || !searchInput) {
    console.error('Search form or input not found in the DOM.');
    return;
  }

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

  function displayError(message) {
    let errorEl = document.querySelector('.error-message');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      errorEl.style.color = 'red';
      errorEl.style.marginTop = '8px';
      errorEl.style.fontSize = '14px';
      searchForm.appendChild(errorEl);
    }
    errorEl.textContent = message;
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

  // Video data management and recommendation algorithm

  // Get all videos from localStorage
  function getAllVideos() {
    return JSON.parse(localStorage.getItem('videos') || '[]');
  }

  // Save videos to localStorage
  function saveVideos(videos) {
    localStorage.setItem('videos', JSON.stringify(videos));
  }

  // Update video likes/dislikes
  function updateVideoLikes(videoId, userId, like = true) {
    const videos = getAllVideos();
    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    // Remove user from both likes and dislikes first
    video.likes = video.likes.filter(id => id !== userId);
    video.dislikes = video.dislikes.filter(id => id !== userId);

    if (like) {
      video.likes.push(userId);
    } else {
      video.dislikes.push(userId);
    }

    saveVideos(videos);
  }

  // Subscribe/unsubscribe to a user
  function toggleSubscription(subscriberId, channelId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const subscriber = users.find(u => u.id === subscriberId);
    const channel = users.find(u => u.id === channelId);
    if (!subscriber || !channel) return;

    if (subscriber.subscribedTo.includes(channelId)) {
      subscriber.subscribedTo = subscriber.subscribedTo.filter(id => id !== channelId);
      channel.subscribers = Math.max(0, (channel.subscribers || 1) - 1);
    } else {
      subscriber.subscribedTo.push(channelId);
      channel.subscribers = (channel.subscribers || 0) + 1;
    }

    localStorage.setItem('users', JSON.stringify(users));
  }

  // Recommendation algorithm based on tags and user preferences
  function recommendVideosForUser(userId) {
    const videos = getAllVideos();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    if (!user) return videos;

    // Build tag preference map from liked videos
    const likedVideos = videos.filter(v => v.likes.includes(userId));
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
    updateVideoLikes,
    toggleSubscription,
    recommendVideosForUser,
    getLoggedInUser
  };
});
