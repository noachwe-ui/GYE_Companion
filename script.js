document.addEventListener("DOMContentLoaded", () => {
  // 1. Fetch quotes database
  fetch("quotes.json")
    .then((res) => res.json())
    .then((data) => {
      // Pick a random quote
      const randomIndex = Math.floor(Math.random() * data.length);
      const selectedQuote = data[randomIndex];

      document.getElementById("quote").textContent = `"${selectedQuote.quote}"`;
      document.getElementById("source").textContent = `— ${selectedQuote.source}`;
      document.getElementById("shiur-btn").href = selectedQuote.shiur_url;
    })
    .catch((err) => console.error("Error loading quotes:", err));

  // 2. Handle simple daily streak tracking
  const today = new Date().toDateString();
  let lastVisit = localStorage.getItem("last_visit");
  let streak = parseInt(localStorage.getItem("streak") || "0", 10);

  if (lastVisit !== today) {
    streak += 1;
    localStorage.setItem("streak", streak);
    localStorage.setItem("last_visit", today);
  }

  document.querySelector(".streak-badge").textContent = `🔥 Streak: Day ${streak}`;
});
