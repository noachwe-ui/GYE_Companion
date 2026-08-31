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

// Function to open native Android Accessibility Settings
function openAccessibilitySettings() {
  if (window.Capacitor && window.Capacitor.isNativePlatform()) {
    // Uses Android Intent URI to open system settings directly
    window.location.href = "intent:#Intent;action=android.settings.ACCESSIBILITY_SETTINGS;end";
  } else {
    alert("Accessibility permissions must be enabled manually in Android System Settings.");
  }
}

// Attach listener to button
document.getElementById('accessibility-btn').addEventListener('click', openAccessibilitySettings);

