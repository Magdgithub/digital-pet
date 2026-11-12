const API = '/api';
const itemEmojis = { food: '🍎', treat: '🍪', toy: '🧶' };
const itemNames = { food: 'Pet food', treat: 'Treat', toy: 'Toy' };

let pet = null;
let shopItems = [];

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    let message = 'Something went wrong. Please try again.';
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch { /* use the default message */ }
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

function setMeter(id, value) {
  document.querySelector(`#${id}-meter`).style.width = `${value}%`;
  document.querySelector(`#${id}-value`).textContent = `${value}%`;
}

function renderPet() {
  if (!pet) return;
  document.querySelector('#pet-section').hidden = false;
  document.querySelector('#create-panel').hidden = true;
  document.querySelector('#pet-name-display').textContent = pet.name;
  document.querySelector('#coin-count span').textContent = pet.coins;
  setMeter('hunger', pet.hunger);
  setMeter('happiness', pet.happiness);
  setMeter('energy', pet.energy);
  renderInventory();
  renderShop();
}

function renderInventory() {
  const list = document.querySelector('#inventory-list');
  const inventory = Object.entries(pet.inventory).filter(([, count]) => count > 0);
  if (inventory.length === 0) {
    list.innerHTML = '<p class="empty-state">Your bag is empty. Pick up a little something at the shop!</p>';
    return;
  }
  list.innerHTML = inventory.map(([id, count]) => `
    <div class="item-row">
      <span class="item-emoji">${itemEmojis[id] || '🎁'}</span>
      <span class="item-name">${itemNames[id] || id}</span>
      <span class="item-count">×${count}</span>
      <button class="small-button" data-use="${id}" aria-label="Use ${itemNames[id] || id}">Use</button>
    </div>`).join('');
}

function renderShop() {
  const list = document.querySelector('#shop-list');
  list.innerHTML = shopItems.map(item => `
    <div class="item-row shop-row">
      <span class="item-emoji">${itemEmojis[item.id] || '🎁'}</span>
      <span class="item-description"><strong>${item.name}</strong><small>${item.description}</small></span>
      <button class="small-button buy-button" data-buy="${item.id}" ${pet.coins < item.price ? 'disabled' : ''}>🪙 ${item.price}</button>
    </div>`).join('');
}

async function refreshPet() {
  pet = await request(`/pets/${pet.id}`);
  renderPet();
}

async function createPet(name) {
  pet = await request('/pets', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  renderPet();
  showMessage(`${pet.name} is excited to meet you!`);
}

async function doAction(action) {
  pet = await request(`/pets/${pet.id}/actions/${action}`, { method: 'POST' });
  renderPet();
  const messages = { feed: 'Yum! Your pet enjoyed the meal.', play: 'That was fun! Your pet had a lovely playtime.', sleep: 'Sweet dreams! Your pet feels rested.' };
  showMessage(messages[action]);
}

async function useItem(itemId) {
  pet = await request(`/pets/${pet.id}/inventory/${itemId}/use`, { method: 'POST' });
  renderPet();
  showMessage(`${itemNames[itemId] || 'Item'} used. Your pet appreciates it!`);
}

async function buyItem(itemId) {
  pet = await request(`/pets/${pet.id}/inventory/${itemId}/purchase`, { method: 'POST' });
  renderPet();
  showMessage(`${itemNames[itemId] || 'Item'} added to your inventory.`);
}

document.querySelector('#pet-form').addEventListener('submit', async event => {
  event.preventDefault();
  const input = document.querySelector('#pet-name');
  try {
    await createPet(input.value.trim());
  } catch (error) {
    showMessage(error.message, true);
  }
});

document.querySelector('.actions').addEventListener('click', async event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  try { await doAction(button.dataset.action); }
  catch (error) { showMessage(error.message, true); }
});

document.querySelector('#inventory-list').addEventListener('click', async event => {
  const button = event.target.closest('[data-use]');
  if (!button) return;
  try { await useItem(button.dataset.use); }
  catch (error) { showMessage(error.message, true); }
});

document.querySelector('#shop-list').addEventListener('click', async event => {
  const button = event.target.closest('[data-buy]');
  if (!button || button.disabled) return;
  try { await buyItem(button.dataset.buy); }
  catch (error) { showMessage(error.message, true); }
});

try {
  shopItems = await request('/items');
  renderShop();
} catch (error) {
  showMessage(`Couldn't connect to the pet shop: ${error.message}`, true);
}
