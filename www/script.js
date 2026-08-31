let quotesData = [];
let urlsData = [];

// Initialize app data and authentication state
async function initApp() {
  try {
    const cacheBuster = `?t=${new Date().getTime()}`;
    const [quotesRes, urlsRes] = await Promise.all([
      fetch(`quotes.json${cacheBuster}`),
      fetch(`urls.json${cacheBuster}`)
    ]);

    quotesData = await quotesRes.json();
    urlsData = await urlsRes.json();

    displayRandomQuote();
  } catch (error) {
    console.error('Error loading JSON files:', error);
  }

  checkAuthStatus();
}

// Check saved user session and update badge/status
function checkAuthStatus() {
  const username = localStorage.getItem('gye_username');
  const streak = localStorage.getItem('gye_streak') || 0;
  
  const statusElem = document.getElementById('user-status');
  const authBtn = document.getElementById('auth-btn');
  const streakBadge = document.getElementById('streak-badge');

  if (username) {
    statusElem.innerText = `Connected: ${username}`;
    authBtn.innerText = 'Disconnect';
    streakBadge.innerText = `🔥 Streak: Day ${streak}`;
  } else {
    statusElem.innerText = 'Not connected';
    authBtn.innerText = 'Connect GYE Account';
    streakBadge.innerText = '🔥 Streak: Offline';
  }
}

// Handle Login / Disconnect
document.getElementById('auth-btn').addEventListener('click', () => {
  const currentUsername = localStorage.getItem('gye_username');

  if (currentUsername) {
    localStorage.removeItem('gye_username');
    localStorage.removeItem('gye_streak');
    checkAuthStatus();
  } else {
    const username = prompt('Enter your GYE Username:');
    if (username) {
      const currentStreak = prompt('Enter your current GYE Streak (Days):', '1') || '1';
      
      localStorage.setItem('gye_username', username);
      localStorage.setItem('gye_streak', currentStreak);
      
      checkAuthStatus();
    }
  }
});

// Display random quote from local quotes.json
function displayRandomQuote() {
  if (!quotesData || !quotesData.length) return;
  const randomIndex = Math.floor(Math.random() * quotesData.length);
  const selected = quotesData[randomIndex];

  const text = selected.quote || selected.quoteText || "No quote text";
  const author = selected.source || selected.quoteAuthor || "Unknown";

  document.getElementById('quote').innerText = `"${text}"`;
  document.getElementById('source').innerText = `— ${author}`;
}

// Open random clip URL
async function watchClip() {
  // If urlsData is empty, attempt a fresh fetch
  if (!urlsData || !urlsData.length) {
    try {
      const cacheBuster = `?t=${new Date().getTime()}`;
      const res = await fetch(`urls.json${cacheBuster}`);
      urlsData = await res.json();
    } catch (err) {
      console.error('Failed to load urls.json:', err);
    }
  }

  if (!urlsData || !urlsData.length) {
    alert('No URLs found in urls.json. Check syntax or file content.');
    return;
  }

  const randomIndex = Math.floor(Math.random() * urlsData.length);
  window.open(urlsData[randomIndex], '_blank', 'noopener,noreferrer');
}

// Button Event Listeners
document.getElementById('watch-clip-btn').addEventListener('click', watchClip);

document.getElementById('forum-btn').addEventListener('click', () => {
  window.open('https://guardyoureyes.com/forum', '_blank', 'noopener,noreferrer');
});
document.getElementById('sos-btn').addEventListener('click', () => {
  window.open('https://app.guardyoureyes.com/sos', '_blank', 'noopener,noreferrer');
});

// Run application
initApp();

// Load Motivational Quotes dynamically
async function loadQuote() {
  const quoteBox = document.getElementById('quote-display');
  try {
    const response = await fetch('quotes.json');
    const quotes = await response.json();
    if (quotes && quotes.length > 0) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      quoteBox.innerText = `"${randomQuote.text || randomQuote}"`;
    }
  } catch (e) {
    quoteBox.innerText = "Take a deep breath. You are in control.";
  }
}

// User & Streak Management
function checkAuthStatus() {
  const username = localStorage.getItem('gye_username');
  const streak = localStorage.getItem('gye_streak') || 'Offline';
  const hideStreak = localStorage.getItem('gye_hide_streak') === 'true';

  const statusElem = document.getElementById('user-status');
  const streakBadge = document.getElementById('streak-badge');
  const streakCheckbox = document.getElementById('toggle-streak-checkbox');

  if (hideStreak) {
    streakBadge.style.display = 'none';
    streakCheckbox.checked = false;
  } else {
    streakBadge.style.display = 'inline-block';
    streakCheckbox.checked = true;
    streakBadge.innerText = `🔥 Streak: ${streak === 'Offline' ? 'Offline' : 'Day ' + streak}`;
  }

  if (username) {
    statusElem.innerText = `Connected: ${username}`;
  } else {
    statusElem.innerText = 'Not connected';
  }
}

// Support Button Actions
document.getElementById('watch-clip-btn').addEventListener('click', () => {
  window.open('https://app.guardyoureyes.com', '_blank');
});

document.getElementById('sos-btn').addEventListener('click', () => {
  window.open('https://guardyoureyes.com/sos', '_blank');
});

document.getElementById('forum-btn').addEventListener('click', () => {
  window.open('https://forum.guardyoureyes.com', '_blank');
});

// Toggle Settings Drawer
document.getElementById('toggle-settings-btn').addEventListener('click', () => {
  const drawer = document.getElementById('settings-drawer');
  drawer.style.display = drawer.style.display === 'block' ? 'none' : 'block';
});

// Streak Toggle
document.getElementById('toggle-streak-checkbox').addEventListener('change', (e) => {
  localStorage.setItem('gye_hide_streak', !e.target.checked);
  checkAuthStatus();
});

// Custom Blocked Domains Management
function getCustomBlockedDomains() {
  const saved = localStorage.getItem('gye_custom_blocked');
  return saved ? JSON.parse(saved) : [];
}

function renderBlockedDomains() {
  const listElem = document.getElementById('blocked-domains-list');
  const domains = getCustomBlockedDomains();
  listElem.innerHTML = '';

  domains.forEach((domain, index) => {
    const li = document.createElement('li');
    li.innerHTML = `${domain} <a href="#" style="color: #d32f2f; margin-left: 8px;" onclick="removeDomain(${index})">×</a>`;
    listElem.appendChild(li);
  });
}

document.getElementById('add-domain-btn').addEventListener('click', () => {
  const input = document.getElementById('custom-domain-input');
  let domain = input.value.trim().toLowerCase();
  domain = domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];

  if (!domain) return;

  const domains = getCustomBlockedDomains();
  if (!domains.includes(domain)) {
    domains.push(domain);
    localStorage.setItem('gye_custom_blocked', JSON.stringify(domains));
    renderBlockedDomains();
  }
  input.value = '';
});

function removeDomain(index) {
  const domains = getCustomBlockedDomains();
  domains.splice(index, 1);
  localStorage.setItem('gye_custom_blocked', JSON.stringify(domains));
  renderBlockedDomains();
}

// Native Accessibility Settings Link
document.getElementById('accessibility-btn').addEventListener('click', () => {
  if (window.Capacitor && window.Capacitor.isNativePlatform()) {
    window.location.href = "intent:#Intent;action=android.settings.ACCESSIBILITY_SETTINGS;end";
  } else {
    alert("Open Android Settings -> Accessibility to enable GYE Service.");
  }
});

// Initialize on startup
checkAuthStatus();
loadQuote();
renderBlockedDomains();

// Load initial preference checkbox states
function loadPreferences() {
  const bubbleEnabled = localStorage.getItem('gye_bubble_enabled') !== 'false';
  const filterEnabled = localStorage.getItem('gye_filter_enabled') !== 'false';
  
  document.getElementById('toggle-bubble-checkbox').checked = bubbleEnabled;
  document.getElementById('toggle-filter-checkbox').checked = filterEnabled;
}

// Bubble Toggle Listener
document.getElementById('toggle-bubble-checkbox').addEventListener('change', (e) => {
  localStorage.setItem('gye_bubble_enabled', e.target.checked);
});

// Filter Toggle Listener
document.getElementById('toggle-filter-checkbox').addEventListener('change', (e) => {
  localStorage.setItem('gye_filter_enabled', e.target.checked);
});

// Run on startup
loadPreferences();

