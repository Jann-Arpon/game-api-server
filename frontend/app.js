const API_URL = 'http://127.0.0.1:5000/games';

document.addEventListener('DOMContentLoaded', () => {
  fetchGames();
  document.getElementById('game-form').addEventListener('submit', handleFormSubmit);
});

async function fetchGames() {
  showLoading(true);
  clearAlert();

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const games = await res.json();
    renderGames(games);
  } catch (err) {
    showAlert(`Failed to load games: ${err.message}`, 'error');
  } finally {
    showLoading(false);
  }
}

function renderGames(games) {
  const container = document.getElementById('games-container');
  container.innerHTML = '';

  if (games.length === 0) {
    container.innerHTML = '<p style="color:#94a3b8;">No games found in database.</p>';
    return;
  }

  games.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-item';
    card.innerHTML = `
      <div class="game-info">
        <h3>${escapeHtml(game.title)}</h3>
        <p>${escapeHtml(game.genre)} (${game.release_year}) • ⭐ ${game.rating}/10</p>
        <span class="badge">${escapeHtml(game.platform)}</span>
      </div>
      <div class="actions">
        <button onclick="viewGameDetail(${game.id})" class="btn btn-small btn-view">View</button>
        <button onclick="editGame(${game.id})" class="btn btn-small btn-edit">Edit</button>
        <button onclick="deleteGame(${game.id})" class="btn btn-small btn-danger">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

async function viewGameDetail(id) {
  clearAlert();
  try {
    const res = await fetch(`${API_URL}/${id}`);
    
    if (res.status === 404) {
      showAlert(`Game ID #${id} not found on server (404).`, 'error');
      return;
    }
    if (!res.ok) throw new Error('Could not fetch game details.');

    const game = await res.json();
    document.getElementById('detail-title').textContent = game.title;
    document.getElementById('detail-genre').textContent = game.genre;
    document.getElementById('detail-year').textContent = game.release_year;
    document.getElementById('detail-platform').textContent = game.platform;
    document.getElementById('detail-rating').textContent = game.rating;

    document.getElementById('detail-view').classList.remove('hidden');
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

function closeDetailView() {
  document.getElementById('detail-view').classList.add('hidden');
}

async function handleFormSubmit(e) {
  e.preventDefault();
  clearAlert();

  const id = document.getElementById('game-id').value;
  const payload = {
    title: document.getElementById('title').value.trim(),
    genre: document.getElementById('genre').value.trim(),
    release_year: parseInt(document.getElementById('release_year').value),
    platform: document.getElementById('platform').value.trim(),
    rating: parseFloat(document.getElementById('rating').value)
  };

  const isEdit = Boolean(id);
  const url = isEdit ? `${API_URL}/${id}` : API_URL;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.status === 400) {
      showAlert(`API Error (400 Bad Request): ${data.error || data.message || 'Validation failed'}`, 'error');
      return;
    }

    if (!res.ok) throw new Error(data.message || 'Server error encountered.');

    showAlert(`Game successfully ${isEdit ? 'updated' : 'created'}!`, 'success');
    resetForm();
    fetchGames();
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

async function editGame(id) {
  clearAlert();
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (res.status === 404) {
      showAlert('Game not found (404).', 'error');
      return;
    }
    const game = await res.json();

    document.getElementById('game-id').value = game.id;
    document.getElementById('title').value = game.title;
    document.getElementById('genre').value = game.genre;
    document.getElementById('release_year').value = game.release_year;
    document.getElementById('platform').value = game.platform;
    document.getElementById('rating').value = game.rating;

    document.getElementById('form-title').textContent = `Edit Game #${game.id}`;
    document.getElementById('submit-btn').textContent = 'Update Game';
    document.getElementById('cancel-btn').classList.remove('hidden');
  } catch (err) {
    showAlert(`Failed to fetch game details: ${err.message}`, 'error');
  }
}

async function deleteGame(id) {
  if (!confirm(`Are you sure you want to delete game #${id}?`)) return;
  clearAlert();

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (res.status === 404) {
      showAlert('Game not found (404).', 'error');
      return;
    }

    showAlert(data.message || 'Game deleted successfully!', 'success');
    fetchGames();
  } catch (err) {
    showAlert(`Delete failed: ${err.message}`, 'error');
  }
}

function resetForm() {
  document.getElementById('game-form').reset();
  document.getElementById('game-id').value = '';
  document.getElementById('form-title').textContent = 'Add New Game';
  document.getElementById('submit-btn').textContent = 'Save Game';
  document.getElementById('cancel-btn').classList.add('hidden');
}

function showLoading(isLoading) {
  const loading = document.getElementById('loading');
  if (isLoading) loading.classList.remove('hidden');
  else loading.classList.add('hidden');
}

function showAlert(message, type) {
  const box = document.getElementById('alert-box');
  box.textContent = message;
  box.className = `alert alert-${type}`;
  box.classList.remove('hidden');
}

function clearAlert() {
  const box = document.getElementById('alert-box');
  box.classList.add('hidden');
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}