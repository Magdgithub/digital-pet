const API = '/api';
const itemNames = { food: 'Pet food', treat: 'Treat', toy: 'Toy' };
const animals = {
  cat: { label: 'Cat', fur: '#f39a45', light: '#ffd08a', inner: '#e98287', ears: 'pointy' },
  dog: { label: 'Dog', fur: '#c98c5c', light: '#f4d0a6', inner: '#bd7960', ears: 'floppy' },
  bunny: { label: 'Bunny', fur: '#f4eee5', light: '#fffaf3', inner: '#e8a4a8', ears: 'long' },
  bear: { label: 'Bear', fur: '#a97953', light: '#d9ae82', inner: '#a97953', ears: 'round' },
  fox: { label: 'Fox', fur: '#ec8738', light: '#fff0d6', inner: '#d47768', ears: 'pointy' },
  penguin: { label: 'Penguin', fur: '#394b5a', light: '#f7f5eb', inner: '#394b5a', ears: 'none' },
  frog: { label: 'Frog', fur: '#78bd5b', light: '#c6e99a', inner: '#78bd5b', ears: 'none' },
  panda: { label: 'Panda', fur: '#f8f6ef', light: '#fffefa', inner: '#333b43', ears: 'round' },
  turtle: { label: 'Turtle', fur: '#6cae61', light: '#b7d88e', inner: '#6cae61', ears: 'none' },
  unicorn: { label: 'Unicorn', fur: '#f6e8f4', light: '#fff9ff', inner: '#e7a5bc', ears: 'pointy' },
};
const accessories = [
  { id: 'none', name: 'None', shape: '' },
  { id: 'tiara', name: 'Tiara', shape: '<svg viewBox="0 0 52 34" aria-hidden="true"><path d="M5 26 9 8l12 12 5-17 6 17L44 8l3 18Z" fill="#ffd95c" stroke="#b57a23" stroke-width="2.5" stroke-linejoin="round"/><path d="M7 27h42v5H7z" rx="2" fill="#f2a83b" stroke="#b57a23" stroke-width="2"/><circle cx="26" cy="8" r="3" fill="#fff6c4"/></svg>' },
  { id: 'bow', name: 'Bow', shape: '<svg viewBox="0 0 52 34" aria-hidden="true"><path d="M25 17 7 5Q2 4 4 13l7 9 14-3Zm2 0L45 5q5-1 3 8l-7 9-14-3Z" fill="#f47c9a" stroke="#ae4667" stroke-width="2.5"/><circle cx="26" cy="17" r="5" fill="#ffd2df" stroke="#ae4667" stroke-width="2"/></svg>' },
  { id: 'scarf', name: 'Scarf', shape: '<svg viewBox="0 0 70 35" aria-hidden="true"><path d="M8 5q27 12 54 0v12q-27 12-54 0Z" fill="#6d9ce7" stroke="#4269a7" stroke-width="2.5"/><path d="M42 14h13l-2 20-9-5Z" fill="#85b4ff" stroke="#4269a7" stroke-width="2.5" stroke-linejoin="round"/><path d="M16 9q20 9 39 1" fill="none" stroke="#c9dcff" stroke-width="2"/></svg>' },
];
let pets = [];
let pet = null;
let shopItems = [];
let busy = false;
let effectTimer;

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  if (!response.ok) {
    let message = `Request failed (${response.status}). Please try again.`;
    try { const body = await response.json(); message = body.detail || body.title || body.message || message; } catch { /* use fallback */ }
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
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function itemDrawing(id) {
  if (id === 'food') return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M21 10q0-6 6-7" fill="none" stroke="#477943" stroke-width="3" stroke-linecap="round"/><path d="M22 8q7-7 12-2-2 7-11 6" fill="#78bd5b"/><path d="M20 11c-8-7-17 1-15 12 2 10 8 14 15 10 8 4 14 0 16-10 2-11-7-19-16-12Z" fill="#ed665f" stroke="#a94343" stroke-width="2"/><path d="M11 18q-2 7 2 10" fill="none" stroke="#ffb5a0" stroke-width="3" stroke-linecap="round"/></svg>';
  if (id === 'toy') return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 22q4-13 14 0t14 0" fill="none" stroke="#d58b54" stroke-width="4" stroke-linecap="round"/><circle cx="7" cy="23" r="4" fill="#ed9e63"/><circle cx="34" cy="23" r="4" fill="#ed9e63"/></svg>';
  return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 5c-8 9-13 14-13 21a13 13 0 0 0 26 0c0-7-5-12-13-21Z" fill="#f1bd76" stroke="#bf8452" stroke-width="2"/><path d="M13 25q2 8 9 8" fill="none" stroke="#fff0c8" stroke-width="3" stroke-linecap="round"/></svg>';
}

function petDrawing(species, accessory = 'none') {
  const animal = animals[species] || animals.cat;
  let ears = '';
  if (animal.ears === 'pointy') ears = '<path class="ear" d="M31 70 34 8q1-8 8-2l28 39m28 25 27-59q4-9 10 0l11 59Z"/><path class="inner-ear" d="m43 43 2-20 13 22m61 0 13-22 2 20Z"/>';
  else if (animal.ears === 'long') ears = '<path class="ear" d="M45 70Q20 25 42 3q22-7 27 60m24 7q-2-68 23-67 24 24-1 68Z"/><path class="inner-ear" d="M47 48Q36 17 46 12q12 6 13 42m42-1q2-36 14-40 11 13-2 42Z"/>';
  else if (animal.ears === 'round') ears = '<circle class="ear" cx="45" cy="43" r="25"/><circle class="ear" cx="123" cy="43" r="25"/><circle class="inner-ear" cx="45" cy="43" r="12"/><circle class="inner-ear" cx="123" cy="43" r="12"/>';
  else if (animal.ears === 'floppy') ears = '<path class="ear" d="M43 52Q1 28 11 67q8 33 37 17m68-32q42-24 32 15-8 33-37 17Z"/>';
  const facePatch = species === 'panda' || species === 'penguin' ? '<ellipse cx="57" cy="89" rx="18" ry="22" fill="#36414b"/><ellipse cx="111" cy="89" rx="18" ry="22" fill="#36414b"/>' : '';
  const muzzle = species === 'fox' || species === 'bear' || species === 'dog' ? '<ellipse cx="84" cy="112" rx="25" ry="17" fill="var(--pet-light)"/>' : '';
  const horn = species === 'unicorn' ? '<path d="m84 39 9-31 10 31Z" fill="#ffd35e" stroke="#c28d39" stroke-width="3" stroke-linejoin="round"/>' : '';
  let outfit = '';
  if (accessory === 'scarf') outfit = '<g class="wear-scarf"><path d="M41 126q43 24 86 0v14q-43 22-86 0Z" fill="#6d9ce7" stroke="#4269a7" stroke-width="3"/><path d="M94 139h18l-3 32-13-8Z" fill="#85b4ff" stroke="#4269a7" stroke-width="3" stroke-linejoin="round"/></g>';
  if (accessory === 'tiara') outfit = '<g class="wear-head"><path d="m57 39 5-20 16 15 7-28 8 28 17-15 4 20Z" fill="#ffd95c" stroke="#b57a23" stroke-width="3" stroke-linejoin="round"/><path d="M57 40h57v7H57Z" fill="#f2a83b" stroke="#b57a23" stroke-width="2"/></g>';
  if (accessory === 'bow') outfit = '<g class="wear-head"><path d="m83 38-25-16q-8-2-6 10l13 15 18-5Zm4 0 25-16q8-2 6 10l-13 15-18-5Z" fill="#f47c9a" stroke="#ae4667" stroke-width="3"/><circle cx="85" cy="40" r="7" fill="#ffd2df" stroke="#ae4667" stroke-width="2"/></g>';
  return `<svg class="animal-art species-${species}" viewBox="0 0 168 190" role="img" aria-label="Cute ${animal.label.toLowerCase()}" style="--pet-fur:${animal.fur};--pet-light:${animal.light};--pet-inner:${animal.inner}"><g class="animal-ears">${ears}</g>${horn}<ellipse class="animal-body" cx="84" cy="131" rx="57" ry="48"/><path class="belly" d="M52 136q32-32 64 0v25q-32 25-64 0Z"/><ellipse class="animal-head" cx="84" cy="87" rx="59" ry="55"/>${facePatch}<ellipse class="eye eye-left" cx="62" cy="85" rx="6" ry="8"/><ellipse class="eye eye-right" cx="106" cy="85" rx="6" ry="8"/><circle class="eye-glint" cx="64" cy="82" r="2"/><circle class="eye-glint" cx="108" cy="82" r="2"/><ellipse cx="48" cy="103" rx="10" ry="5" class="cheek"/><ellipse cx="120" cy="103" rx="10" ry="5" class="cheek"/>${muzzle}<path class="nose" d="M79 101q5-5 10 0l-5 5Z"/><path class="smile" d="M84 105v6m0 0q-8 9-15 0m15 0q8 9 15 0"/><path class="paw paw-left" d="M36 143q-15 3-13 17 3 12 22 5Z"/><path class="paw paw-right" d="M132 143q15 3 13 17-3 12-22 5Z"/>${outfit}</svg>`;
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
  switcher.innerHTML = pets.map(candidate => `<button class="pet-tab ${candidate.id === pet.id ? 'active' : ''}" type="button" data-pet-id="${candidate.id}" aria-pressed="${candidate.id === pet.id}"><span class="pet-tab-dot" aria-hidden="true"></span>${escapeHtml(candidate.name)} <small>${animals[candidate.species]?.label || 'Pet'}</small></button>`).join('');
}

function renderWardrobe() {
  const list = document.querySelector('#wardrobe-list');
  list.innerHTML = accessories.map(item => `<button type="button" class="wardrobe-item ${pet.accessory === item.id ? 'selected' : ''}" data-accessory="${item.id}" aria-pressed="${pet.accessory === item.id}" title="${item.name}"><span class="wardrobe-preview ${item.id}">${item.shape}</span><small>${item.name}</small></button>`).join('');
}

function renderInventory() {
  const list = document.querySelector('#inventory-list');
  const inventory = Object.entries(pet.inventory || {}).filter(([, count]) => count > 0);
  if (!inventory.length) { list.innerHTML = '<p class="empty-state">Your bag is empty. Pick up a little something at the shop.</p>'; return; }
  list.innerHTML = inventory.map(([id, count]) => `<div class="item-row"><span class="item-emoji">${itemDrawing(id)}</span><span class="item-name">${escapeHtml(itemNames[id] || id)}</span><span class="item-count">×${Number(count)}</span><button class="small-button" type="button" data-use="${escapeHtml(id)}" aria-label="Use ${escapeHtml(itemNames[id] || id)}">Use</button></div>`).join('');
}

function renderShop() {
  const list = document.querySelector('#shop-list');
  if (!pet) { list.innerHTML = '<p class="empty-state">Create a pet to visit the shop.</p>'; return; }
  list.innerHTML = shopItems.map(item => `<div class="item-row shop-row"><span class="item-emoji">${itemDrawing(item.id)}</span><span class="item-description"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.description)}</small></span><button class="small-button buy-button" type="button" data-buy="${escapeHtml(item.id)}" ${pet.coins < item.price ? 'disabled' : ''}>${Number(item.price)} coins</button></div>`).join('');
}

function render() {
  const hasPet = Boolean(pet);
  document.querySelector('#pet-section').hidden = !hasPet;
  document.querySelector('#welcome-panel').hidden = hasPet;
  if (!hasPet) { renderShop(); return; }
  const mood = moodForPet();
  const animal = animals[pet.species] || animals.cat;
  document.querySelector('#pet-name-display').textContent = pet.name;
  document.querySelector('#coin-count span').textContent = pet.coins;
  document.querySelector('#mood-badge').textContent = mood.badge;
  document.querySelector('#pet-mood-line').textContent = mood.line;
  document.querySelector('#pet-portrait').className = `pet-portrait ${mood.className}`;
  const character = document.querySelector('#pet-character');
  character.innerHTML = petDrawing(pet.species, pet.accessory || 'none');
  character.setAttribute('aria-label', `${pet.name}, ${animal.label.toLowerCase()} wearing ${pet.accessory === 'none' ? 'no accessory' : pet.accessory}`);
  setMeter('hunger', pet.hunger); setMeter('happiness', pet.happiness); setMeter('energy', pet.energy);
  renderPetSwitcher(); renderWardrobe(); renderInventory(); renderShop();
}

function rememberPet() { if (pet) localStorage.setItem('digital-pet-selected-id', String(pet.id)); }
function updatePet(updatedPet) {
  pet = updatedPet;
  const index = pets.findIndex(candidate => candidate.id === pet.id);
  if (index < 0) pets.push(pet); else pets[index] = pet;
  rememberPet(); render();
}

function effectMarkup(kind) {
  const apple = '<svg class="apple-prop" viewBox="0 0 64 72" aria-label="Apple"><path d="M32 17q0-12 11-15" fill="none" stroke="#477943" stroke-width="5" stroke-linecap="round"/><path d="M36 12Q47 0 59 8 55 21 38 20Z" fill="#78bd5b"/><path d="M31 20C18 9 2 20 5 41c3 21 15 29 27 22 13 7 25-1 28-22 3-21-13-32-29-21Z" fill="#ed665f" stroke="#a94343" stroke-width="3"/><path d="M15 37q-2 12 5 17" fill="none" stroke="#ffb5a0" stroke-width="4" stroke-linecap="round"/></svg>';
  const ball = '<svg class="toy-prop" viewBox="0 0 60 60" aria-label="Yarn ball"><circle cx="30" cy="30" r="23" fill="#f0a3b8" stroke="#bd6581" stroke-width="3"/><path d="M13 16q24 4 34 30M10 28q22 18 42 7M22 8q-8 24 15 44M41 9Q14 29 20 51" fill="none" stroke="#ffe2e8" stroke-width="3" stroke-linecap="round"/></svg>';
  const sparkles = '<span class="fx-spark spark-a">✦</span><span class="fx-spark spark-b">✧</span><span class="fx-spark spark-c">✦</span>';
  if (kind === 'feed') return `${apple}<span class="action-caption">Nom nom!</span>${sparkles}`;
  if (kind === 'play') return `${ball}<span class="action-caption">Come play!</span>${sparkles}`;
  return '<span class="sleep-z z-one">z</span><span class="sleep-z z-two">z</span><span class="sleep-z z-three">z</span><span class="action-caption">Sweet dreams</span>';
}

function playEffect(action) {
  const portrait = document.querySelector('#pet-portrait');
  const layer = document.querySelector('#action-fx');
  const kind = action === 'treat' ? 'feed' : action === 'toy' ? 'play' : action;
  portrait.classList.remove('animate-feed', 'animate-play', 'animate-sleep');
  void portrait.offsetWidth;
  portrait.classList.add(`animate-${kind}`);
  layer.innerHTML = effectMarkup(kind);
  const duration = kind === 'sleep' ? 5000 : kind === 'play' ? 3000 : 2100;
  window.clearTimeout(effectTimer);
  return new Promise(resolve => {
    effectTimer = window.setTimeout(() => {
      layer.innerHTML = '';
      portrait.classList.remove(`animate-${kind}`);
      resolve();
    }, duration);
  });
}

async function createPet(name, species) {
  const created = await request('/pets', { method: 'POST', body: JSON.stringify({ name, species }) });
  pets.push(created); updatePet(created);
  document.querySelector('#pet-name').value = '';
  showMessage(`${created.name} is excited to meet you!`);
  await playEffect('play');
}
async function doAction(action) {
  updatePet(await request(`/pets/${pet.id}/actions/${action}`, { method: 'POST' }));
  const messages = { feed: `${pet.name} is having a bite of apple.`, play: `${pet.name} is chasing the yarn ball!`, sleep: `${pet.name} is settling in for a five-second nap.` };
  showMessage(messages[action]);
  await playEffect(action);
}
async function useItem(itemId) {
  updatePet(await request(`/pets/${pet.id}/inventory/${encodeURIComponent(itemId)}/use`, { method: 'POST' }));
  showMessage(`${itemNames[itemId] || 'Item'} used. Your pet appreciates it!`);
  await playEffect(itemId === 'food' ? 'feed' : itemId === 'treat' ? 'treat' : 'toy');
}
async function buyItem(itemId) {
  updatePet(await request(`/pets/${pet.id}/inventory/${encodeURIComponent(itemId)}/purchase`, { method: 'POST' }));
  showMessage(`${itemNames[itemId] || 'Item'} added to your inventory.`);
}
async function setAccessory(accessoryId) {
  updatePet(await request(`/pets/${pet.id}/accessory`, { method: 'PUT', body: JSON.stringify({ accessoryId }) }));
  const outfit = accessories.find(item => item.id === accessoryId);
  showMessage(accessoryId === 'none' ? 'Accessory removed.' : `${pet.name} looks lovely in the ${outfit.name.toLowerCase()}.`);
}
async function perform(action) {
  if (busy) return;
  busy = true;
  document.querySelectorAll('button').forEach(button => { button.disabled = true; });
  try { await action(); } catch (error) { showMessage(error.message, true); }
  finally { busy = false; render(); }
}

document.querySelector('#pet-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = document.querySelector('#pet-name').value.trim();
  if (!name) return;
  perform(() => createPet(name, document.querySelector('#pet-species').value));
});
document.querySelector('.actions').addEventListener('click', event => { const button = event.target.closest('[data-action]'); if (button) perform(() => doAction(button.dataset.action)); });
document.querySelector('#inventory-list').addEventListener('click', event => { const button = event.target.closest('[data-use]'); if (button) perform(() => useItem(button.dataset.use)); });
document.querySelector('#shop-list').addEventListener('click', event => { const button = event.target.closest('[data-buy]'); if (button && !button.disabled) perform(() => buyItem(button.dataset.buy)); });
document.querySelector('#wardrobe-list').addEventListener('click', event => { const button = event.target.closest('[data-accessory]'); if (button) perform(() => setAccessory(button.dataset.accessory)); });
document.querySelector('#pet-switcher').addEventListener('click', event => {
  const button = event.target.closest('[data-pet-id]');
  if (!button) return;
  pet = pets.find(candidate => candidate.id === Number(button.dataset.petId)) || pet;
  rememberPet(); render();
});

async function start() {
  try {
    const [loadedPets, loadedItems] = await Promise.all([request('/pets'), request('/items')]);
    pets = loadedPets; shopItems = loadedItems;
    const savedId = Number(localStorage.getItem('digital-pet-selected-id'));
    pet = pets.find(candidate => candidate.id === savedId) || pets[0] || null;
    rememberPet(); render();
  } catch (error) { render(); showMessage(`Couldn't connect to the pet garden: ${error.message}`, true); }
}
start();
