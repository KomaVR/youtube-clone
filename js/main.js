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

  // Additional page-specific logic can be added here later
});
