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
});
