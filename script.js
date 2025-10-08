const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

document.documentElement.style.setProperty('--primary-rgb', '25, 42, 86'); // 192A56
document.documentElement.style.setProperty('--accent-rgb', '232, 74, 95'); // E84A5F

function loadTheme() {
  const saved = localStorage.getItem("theme") || "light";
  if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
  localStorage.setItem("theme", isDark ? "light" : "dark");
}

function setAuthMessage(text, kind = "info") {
  const el = $("#auth-status");
  const form = $("#login-form");
  if (!el || !form) return;
  
  el.textContent = text;
  el.className = `helper status-${kind}`; 

  const btn = $("#login-btn");
  if (btn) {
    if (kind === "loading") {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> Authenticating...`;
    } else {
      btn.disabled = false;
      btn.textContent = "Login";
    }
  }
}

function saveUserName(name, remember) {
  try {
    // save ke loval storagre
    localStorage.setItem("firstName", name);
    if (remember) {
      sessionStorage.setItem("firstName", name);
    } else {
      sessionStorage.removeItem("firstName");
    }
  } catch {}
}


function getUserName() {
  return localStorage.getItem("firstName") || sessionStorage.getItem("firstName") || null;
}

function clearUser() {
  localStorage.removeItem("firstName");
  sessionStorage.removeItem("firstName");
}

function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// Login Page Logic
async function handleLoginSubmit(e) {
  e.preventDefault();
  const username = $("#username").value.trim();
  const password = $("#password").value;
  const remember = $("#remember").checked;

  if (!password) {
    setAuthMessage("The password can't be blank.", "error");
    return;
  }
  
  setAuthMessage("Authenticating…", "loading"); 

  try {
    const res = await fetch("https://dummyjson.com/users");
    if (!res.ok) throw new Error("bad_status");
    const data = await res.json();
    const users = Array.isArray(data?.users) ? data.users : [];
    const user = users.find(u => String(u.username).toLowerCase() === username.toLowerCase());

    if (!user) {
      setAuthMessage("Username not found!", "error");
      return;
    }

    saveUserName(user.firstName, remember);
    setAuthMessage("Login successful! Redirecting...", "success"); 
    setTimeout(() => {
      window.location.href = "./recipes.html";
    }, 1200);
  } catch (err) {
    setAuthMessage("Failed to connect to the server. Please try again.", "error");
  }
}

function initLoginPage() {
  const form = $("#login-form");
  if (!form) return;
  form.addEventListener("submit", handleLoginSubmit);
  
  setAuthMessage("Enter your username and password.", "info");
}


let allRecipes = [];
let filteredRecipes = [];
let visibleCount = 9; 
let favoritesSet = new Set();
let showFavoritesOnly = false;

function favoritesKey() {
  const name = getUserName() || "guest";
  return `favorites:${name}`;
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(favoritesKey());
    favoritesSet = new Set(raw ? JSON.parse(raw) : []);
  } catch {
    favoritesSet = new Set();
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(favoritesKey(), JSON.stringify(Array.from(favoritesSet)));
  } catch {}
}

function requireAuth() {
  const name = getUserName();
  if (!name) {
    window.location.replace("./index.html");
    return null;
  }
  return name;
}

function renderWelcome(name) {
  const el = $("#welcome-text");
  if (el) el.textContent = `Selamat datang, ${name}`;
}

function stars(rating) {
  const full = Math.round(Number(rating) || 0);
  return "⭐".repeat(Math.max(0, Math.min(5, full)));
}

function createRecipeCard(r) {
  const li = document.createElement("article");
  li.className = "card recipe-card fade-in";
  li.innerHTML = `
    <img class="recipe-image" src="${r.image}" alt="${r.name}" />
    <div class="recipe-body">
      <h3 class="recipe-title">${r.name}</h3>
      <div class="meta">⏱️ ${r.cookTimeMinutes} min • ${r.difficulty} • ${r.cuisine}</div>
      <div class="badges">
        <span class="badge">${stars(r.rating)}</span>
        ${(r.tags || []).slice(0, 3).map(t => `<span class="badge">#${t}</span>`).join("")}
      </div>
      <ul class="ingredients">
        ${(r.ingredients || []).slice(0, 5).map(i => `<li>${i}</li>`).join("")}
      </ul>
    </div>
    <div class="card-actions">
      <button class="btn-gold" data-view="${r.id}">View Full Recipe</button>
      <button class="fav-btn" data-fav="${r.id}" aria-pressed="${favoritesSet.has(r.id)}">${favoritesSet.has(r.id) ? "♥ Favorit" : "♡ Favorit"}</button>
    </div>
  `;
  return li;
}

function renderGrid() {
  const grid = $("#recipes-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const items = filteredRecipes.slice(0, visibleCount);
  items.forEach(r => grid.appendChild(createRecipeCard(r)));
  const btn = $("#show-more");
  
  if (btn) btn.hidden = visibleCount >= filteredRecipes.length;
}

function applyFilters() {
  const q = $("#search")?.value.trim().toLowerCase() || "";
  const cuisine = $("#cuisine-filter")?.value || "";
  filteredRecipes = allRecipes.filter(r => {
    const matchesCuisine = cuisine ? r.cuisine === cuisine : true;
    const matchesFav = showFavoritesOnly ? favoritesSet.has(r.id) : true;
    if (!q) return matchesCuisine && matchesFav;
    const hay = [
      r.name,
      r.cuisine,
      ...(r.ingredients || []),
      ...(r.tags || []),
    ].join(" ").toLowerCase();
    return matchesCuisine && matchesFav && hay.includes(q);
  });
  visibleCount = 10;
  renderGrid();
}

function populateCuisineFilter(recipes) {
  const sel = $("#cuisine-filter");
  if (!sel) return;
  const set = new Set(recipes.map(r => r.cuisine).filter(Boolean));
  const options = Array.from(set).sort();
  options.forEach(c => {
    const o = document.createElement("option");
    o.value = c; o.textContent = c; sel.appendChild(o);
  });
}

function openModal(html) {
  const modal = $("#modal");
  const body = $("#modal-body");
  if (!modal || !body) return;
  body.innerHTML = html;
  modal.setAttribute("aria-hidden", "false");
}
function closeModal() {
  const modal = $("#modal");
  if (modal) modal.setAttribute("aria-hidden", "true");
}

function attachGridEvents() {
  const grid = $("#recipes-grid");
  if (!grid) return;
  grid.addEventListener("click", (e) => {
    const viewBtn = e.target.closest("button[data-view]");
    if (viewBtn) {
      const id = Number(viewBtn.getAttribute("data-view"));
      const r = allRecipes.find(x => x.id === id);
      if (!r) return;
      const html = `
        <img class="recipe-image" src="${r.image}" alt="${r.name}" />
        <h2 class="recipe-title" style="margin:10px 0 6px;">${r.name}</h2>
        <div class="meta">⏱️ ${r.cookTimeMinutes} min • ${r.difficulty} • ${r.cuisine} • ${stars(r.rating)}</div>
        <h3>Ingredients</h3>
        <ul class="ingredients">${(r.ingredients||[]).map(i=>`<li>${i}</li>`).join("")}</ul>
        <h3>Instructions</h3>
        <ol style="padding-left:20px;">${(r.instructions||[]).map(step=>`<li>${step}</li>`).join("")}</ol>
        ${(r.caloriesPerServing)?`<p><strong>Calories/Serving:</strong> ${r.caloriesPerServing}</p>`:""}
      `;
      openModal(html);
      return;
    }

    const favBtn = e.target.closest("button[data-fav]");
    if (favBtn) {
      const id = Number(favBtn.getAttribute("data-fav"));
      if (favoritesSet.has(id)) {
        favoritesSet.delete(id);
      } else {
        favoritesSet.add(id);
      }
      saveFavorites();
      favBtn.setAttribute("aria-pressed", String(favoritesSet.has(id)));
      favBtn.textContent = favoritesSet.has(id) ? "♥ Favorit" : "♡ Favorit";
      applyFilters();
    }
  });
}


async function loadRecipes() {
  const grid = $("#recipes-grid");
  if (grid) grid.innerHTML = "Memuat resep…";
  try {
    const res = await fetch("https://dummyjson.com/recipes");
    if (!res.ok) throw new Error("bad_status");
    const data = await res.json();
    allRecipes = Array.isArray(data?.recipes) ? data.recipes : [];
    filteredRecipes = allRecipes.slice();
    populateCuisineFilter(allRecipes);
    renderGrid();
  } catch (err) {
    if (grid) grid.textContent = "Terjadi kesalahan saat memuat resep. Coba lagi nanti.";
  }
}

function initRecipesPage() {
  const name = requireAuth();
  if (!name) return;
  renderWelcome(name);
  loadFavorites();
  const logoutBtn = $("#logout-btn");
  logoutBtn?.addEventListener("click", () => { clearUser(); window.location.replace("./index.html"); });

  const showMore = $("#show-more");
  showMore?.addEventListener("click", () => { 
    visibleCount += 6; 
    renderGrid(); 
  });

  const search = $("#search");
  search?.addEventListener("input", debounce(applyFilters, 300));
  $("#cuisine-filter")?.addEventListener("change", applyFilters);
  const favFilterBtn = $("#filter-favorites");
  favFilterBtn?.addEventListener("click", () => {
    showFavoritesOnly = !showFavoritesOnly;
    favFilterBtn.setAttribute("aria-pressed", String(showFavoritesOnly));
    applyFilters();
  });

  $("#modal-close")?.addEventListener("click", closeModal);
  $("#modal")?.addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  attachGridEvents();
  loadRecipes();
}


document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  const themeBtn = $("#toggle-theme");
  themeBtn?.addEventListener("click", toggleTheme);

  const page = document.body.getAttribute("data-page");
  if (page === "login") initLoginPage();
  if (page === "recipes") initRecipesPage();
  if (page === "profile") initPublicProfilePage();
});

function fillProfile(u) {
  const img = document.getElementById("admin-image");
  const nameEl = document.getElementById("admin-name");
  const unameEl = document.getElementById("admin-username");
  const roleEl = document.getElementById("admin-role");
  const emailEl = document.getElementById("admin-email");
  const phoneEl = document.getElementById("admin-phone");
  const addrEl = document.getElementById("admin-address");
  const addrExtraEl = document.getElementById("admin-address-extra");
  const compEl = document.getElementById("admin-company");
  const titleEl = document.getElementById("admin-title");
  const compAddrEl = document.getElementById("admin-company-address");
  const uniEl = document.getElementById("admin-university");
  const genderEl = document.getElementById("admin-gender");
  const birthEl = document.getElementById("admin-birth");
  const bloodEl = document.getElementById("admin-blood");
  const physEl = document.getElementById("admin-phys");
  const eyeHairEl = document.getElementById("admin-eyehair");
  const ipEl = document.getElementById("admin-ip");
  const uaEl = document.getElementById("admin-useragent");
  const bankEl = document.getElementById("admin-bank");
  const cryptoEl = document.getElementById("admin-crypto");

  if (img) img.src = u.image || "";
  if (img) img.alt = `${u.firstName || ''} ${u.lastName || ''}`.trim();
  if (nameEl) nameEl.textContent = `${u.firstName || ''} ${u.lastName || ''}`.trim();
  if (unameEl) unameEl.textContent = `@${u.username}`;
  if (roleEl) roleEl.textContent = String(u.role || 'user');
  if (emailEl) emailEl.textContent = u.email || '';
  if (phoneEl) phoneEl.textContent = u.phone || '';
  if (addrEl) {
    const a = u.address || {};
    const city = a.city ? `, ${a.city}` : '';
    const country = a.country ? `, ${a.country}` : '';
    addrEl.textContent = `${a.address || ''}${city}${country}`;
  }
  if (addrExtraEl) {
    const a = u.address || {};
    const st = a.state ? `, ${a.state}` : '';
    const pc = a.postalCode ? ` ${a.postalCode}` : '';
    addrExtraEl.textContent = `${a.stateCode || ''}${st}${pc}`.trim();
  }
  if (compEl) compEl.textContent = (u.company && u.company.name) ? u.company.name : '';
  if (titleEl) titleEl.textContent = (u.company && u.company.title) ? u.company.title : '';
  if (compAddrEl) {
    const ca = (u.company && u.company.address) || {};
    const city = ca.city ? `, ${ca.city}` : '';
    const country = ca.country ? `, ${ca.country}` : '';
    compAddrEl.textContent = `${ca.address || ''}${city}${country}`;
  }
  if (uniEl) uniEl.textContent = u.university || '';
  if (genderEl) genderEl.textContent = u.gender ? `Gender: ${u.gender}` : '';
  if (birthEl) birthEl.textContent = u.birthDate ? `Birth: ${u.birthDate}` : '';
  if (bloodEl) bloodEl.textContent = u.bloodGroup ? `Blood: ${u.bloodGroup}` : '';
  if (physEl) physEl.textContent = (u.height || u.weight) ? `Height: ${u.height || '-'} • Weight: ${u.weight || '-'}` : '';
  if (eyeHairEl) {
    const hc = (u.hair && u.hair.color) ? u.hair.color : '-';
    const ht = (u.hair && u.hair.type) ? u.hair.type : '-';
    if (u.eyeColor || u.hair) eyeHairEl.textContent = `Eyes: ${u.eyeColor || '-'} • Hair: ${hc} (${ht})`;
  }
  if (ipEl) ipEl.textContent = u.ip ? `IP: ${u.ip}` : '';
  if (uaEl) uaEl.textContent = u.userAgent || '';
  if (bankEl) {
    const b = u.bank || {};
    const parts = [b.cardType, b.cardNumber, b.cardExpire, b.currency, b.iban].filter(Boolean).join(" • ");
    bankEl.textContent = parts;
  }
  if (cryptoEl) {
    const c = u.crypto || {};
    const parts = [c.coin, c.network, c.wallet].filter(Boolean).join(" • ");
    cryptoEl.textContent = parts;
  }
}

async function initPublicProfilePage() {
  const params = new URLSearchParams(location.search);
  const qUser = params.get("u");
  try {
    const res = await fetch("https://dummyjson.com/users");
    if (!res.ok) throw new Error("bad_status");
    const data = await res.json();
    const users = Array.isArray(data?.users) ? data.users : [];
    const u = qUser
      ? users.find(x => String(x.username).toLowerCase() === qUser.toLowerCase())
      : users[0];
    if (u) {
      fillProfile(u);
    }
  } catch {
    const el = document.getElementById("admin-name");
    if (el) el.textContent = "Gagal memuat profil";
  }
}
