const API = '/api';
const itemEmojis = { food: '🍎', treat: '🍪', toy: '🧶' };
const itemNames = { food: 'Pet food', treat: 'Treat', toy: 'Toy' };

let pets = [];
let pet = null;
let shopItems = [];
let busy = false;

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    let message = `Request failed (${response.status}). Please try again.`;
    try {
      const body = await response.json();
      message = body.detail || body.title || body.message || message;
    } catch { /* keep the fallback message */ }
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}

function showMessage(message, isError = false) {
  const status = document.querySelector('#status-message');
  status.textContent = message;
  status.classList.toggle('error', isError);
  window.clearTimeout(showMessage.timeout);
  showMessage.timeout = window.setTimeout(() => { status.textContent = ''; }, 4500);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function setMeter(id, value) {
  const meter = document.querySelector(`#${id}-meter`);
  const amount = Math.max(0, Math.min(100, Number(value) || 0));
  meter.style.width = `${amount}%`;
  meter.parentElement.setAttribute('aria-valuenow', amount);
  document.querySelector(`#${id}-value`).textContent = `${amount}%`;
}

function moodForPet() {
  if (pet.energy < 20) return { badge: 'sleepy', line: 'A little rest would feel lovely.', className: 'is-sleepy' };
  if (pet.hunger > 75) return { badge: 'ready to snack', line: 'A little snack would make their day.', className: 'is-hungry' };
  if (pet.happiness < 30) return { badge: 'needs a cuddle', line: 'Some playtime could cheer them up.', className: 'is-sad' };
  if (pet.happiness > 75) return { badge: 'over the moon', line: 'Your little friend is having the best day.', className: 'is-happy' };
  return { badge: 'your buddy', line: 'Your little friend is happy to see you.', className: '' };
}

function renderPetSwitcher() {
  const switcher = document.querySelector('#pet-switcher');
  switcher.hidden = pets.length < 2;
  switcher.innerHTML = pets.map(candidate => `
    <button class="pet-tab ${candidate.id === pet.id ? 'active' : ''}" type="button" data-pet-id="${candidate.id}" aria-pressed="${candidate.id === pet.id}">
      <span aria-hidden="true">🐰</span> ${escapeHtml(candidate.name)}
    </button>`).join('');
}

function renderInventory() {
  const list = document.querySelector('#inventory-list');
  const inventory = Object.entries(pet.inventory || {}).filter(([, count]) => count > 0);
  if (inventory.length === 0) {
    list.innerHTML = '<p class="empty-state">Your bag is empty. Pick up a little something at the shop!</p>';
    return;
  }
  list.innerHTML = inventory.map(([id, count]) => `
    <div class="item-row">
      <span class="item-emoji" aria-hidden="true">${itemEmojis[id] || '🎁'}</span>
      <span class="item-name">${escapeHtml(itemNames[id] || id)}</span>
      <span class="item-count">×${Number(count)}</span>
      <button class="small-button" type="button" data-use="${escapeHtml(id)}" aria-label="Use ${escapeHtml(itemNames[id] || id)}">Use</button>
    </div>`).join('');
}

function renderShop() {
  const list = document.querySelector('#shop-list');
  if (!pet) {
    list.innerHTML = '<p class="empty-state">Create a pet to visit the shop.</p>';
    return;
  }
  list.innerHTML = shopItems.map(item => `
    <div class="item-row shop-row">
      <span class="item-emoji" aria-hidden="true">${itemEmojis[item.id] || '🎁'}</span>
      <span class="item-description"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.description)}</small></span>
      <button class="small-button buy-button" type="button" data-buy="${escapeHtml(item.id)}" ${pet.coins < item.price ? 'disabled' : ''}>🪙 ${Number(item.price)}</button>
    </div>`).join('');
}

function render() {
  const hasPet = Boolean(pet);
  document.querySelector('#pet-section').hidden = !hasPet;
  document.querySelector('#welcome-panel').hidden = hasPet;
  if (!hasPet) {
    renderShop();
    return;
  }

  const mood = moodForPet();
  document.querySelector('#pet-name-display').textContent = pet.name;
  document.querySelector('#coin-count span').textContent = pet.coins;
  document.querySelector('#mood-badge').textContent = mood.badge;
  document.querySelector('#pet-mood-line').textContent = mood.line;
  document.querySelector('#pet-portrait').className = `pet-portrait ${mood.className}`;
  setMeter('hunger', pet.hunger);
  setMeter('happiness', pet.happiness);
  setMeter('energy', pet.energy);
  renderPetSwitcher();
  renderInventory();
  renderShop();
}

function rememberPet() {
  if (pet) localStorage.setItem('digital-pet-selected-id', String(pet.id));
}

function updatePet(updatedPet) {
  pet = updatedPet;
  const index = pets.findIndex(candidate => candidate.id === pet.id);
  if (index === -1) pets.push(pet);
  else pets[index] = pet;
  rememberPet();
  render();
}

async function createPet(name) {
  const createdPet = await request('/pets', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  pets.push(createdPet);
  updatePet(createdPet);
  document.querySelector('#pet-name').value = '';
  showMessage(`${createdPet.name} is excited to meet you!`);
}

async function doAction(action) {
  updatePet(await request(`/pets/${pet.id}/actions/${action}`, { method: 'POST' }));
  const messages = {
    feed: 'Yum! Your pet enjoyed the meal.',
    play: 'That was fun! Your pet had a lovely playtime.',
    sleep: 'Sweet dreams! Your pet feels rested.',
  };
  showMessage(messages[action]);
}

async function useItem(itemId) {
  updatePet(await request(`/pets/${pet.id}/inventory/${encodeURIComponent(itemId)}/use`, { method: 'POST' }));
  showMessage(`${itemNames[itemId] || 'Item'} used. Your pet appreciates it!`);
}

async function buyItem(itemId) {
  updatePet(await request(`/pets/${pet.id}/inventory/${encodeURIComponent(itemId)}/purchase`, { method: 'POST' }));
  showMessage(`${itemNames[itemId] || 'Item'} added to your inventory.`);
}

async function perform(action) {
  if (busy) return;
  busy = true;
  document.querySelectorAll('button').forEach(button => { button.disabled = true; });
  try { await action(); }
  catch (error) { showMessage(error.message, true); }
  finally {
    busy = false;
    render();
  }
}

document.querySelector('#pet-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = document.querySelector('#pet-name').value.trim();
  if (!name) return;
  perform(() => createPet(name));
});

document.querySelector('.actions').addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (button) perform(() => doAction(button.dataset.action));
});

document.querySelector('#inventory-list').addEventListener('click', event => {
  const button = event.target.closest('[data-use]');
  if (button) perform(() => useItem(button.dataset.use));
});

document.querySelector('#shop-list').addEventListener('click', event => {
  const button = event.target.closest('[data-buy]');
  if (button && !button.disabled) perform(() => buyItem(button.dataset.buy));
});

document.querySelector('#pet-switcher').addEventListener('click', event => {
  const button = event.target.closest('[data-pet-id]');
  if (!button) return;
  pet = pets.find(candidate => candidate.id === Number(button.dataset.petId)) || pet;
  rememberPet();
  render();
});

async function start() {
  try {
    const [loadedPets, loadedItems] = await Promise.all([request('/pets'), request('/items')]);
    pets = loadedPets;
    shopItems = loadedItems;
    const savedId = Number(localStorage.getItem('digital-pet-selected-id'));
    pet = pets.find(candidate => candidate.id === savedId) || pets[0] || null;
    rememberPet();
    render();
  } catch (error) {
    render();
    showMessage(`Couldn't connect to the pet garden: ${error.message}`, true);
  }
}

start();
