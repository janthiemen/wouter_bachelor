// Edit these values to customize the game.
const GAME_CONFIG = {
  maxLeftSwipes: 6,
  profiles: [
    { name: "Doutzen Kroes", imageUrl: "images/doutzen.JPG", booze: "Vodka" },
    { name: "Zendaya", imageUrl: "images/zendeya.jpg", booze: "Tequila" },
    { name: "Dua Lipa", imageUrl: "images/dua_lipa.jpg", booze: "Tequila" },
    { name: "Scarlett Johansson", imageUrl: "images/scarlett.jpg", booze: "Whiskey" },
    { name: "Taylor Swift", imageUrl: "images/taylor_swift.png", booze: "Gin" },
    { name: "Rihanna", imageUrl: "images/rihanna.jpg", booze: "Coconut Rum" },
    { name: "Ezgi", imageUrl: "images/ezgi.jpeg", booze: "Raki" },
    { name: "Ezgi", imageUrl: "images/ezgi.jpeg", booze: "Raki" },
    { name: "Ezgi", imageUrl: "images/ezgi.jpeg", booze: "Raki" }
  ]
};


const state = {
  index: 0,
  leftCount: 0,
  rightCount: 0,
  startX: null,
  dragging: false
};

const cardEl = document.getElementById("card");
const cardImageEl = document.getElementById("cardImage");
const cardNameEl = document.getElementById("cardName");
const cardBoozeEl = document.getElementById("cardBooze");
const feedbackEl = document.getElementById("feedback");
const matchOverlayEl = document.getElementById("matchOverlay");
const matchBoozeEl = document.getElementById("matchBooze");
const matchCloseBtn = document.getElementById("matchCloseBtn");
const endScreenEl = document.getElementById("endScreen");
const endRightCountEl = document.getElementById("endRightCount");
const endLeftCountEl = document.getElementById("endLeftCount");

const leftCountEl = document.getElementById("leftCount");
const leftMaxEl = document.getElementById("leftMax");
const rightCountEl = document.getElementById("rightCount");
const cardsLeftEl = document.getElementById("cardsLeft");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

function init() {
  if (!Array.isArray(GAME_CONFIG.profiles) || GAME_CONFIG.profiles.length !== 9) {
    throw new Error("GAME_CONFIG.profiles must contain exactly 9 items.");
  }

  leftMaxEl.textContent = String(GAME_CONFIG.maxLeftSwipes);
  renderCard();
  bindEvents();
}

function bindEvents() {
  leftBtn.addEventListener("click", () => handleSwipe("left"));
  rightBtn.addEventListener("click", () => handleSwipe("right"));
  matchCloseBtn.addEventListener("click", closeMatch);
  matchOverlayEl.addEventListener("click", onMatchOverlayClick);
  endScreenEl.addEventListener("click", onEndScreenClick);
  document.addEventListener("keydown", onKeyDown);

  cardEl.addEventListener("pointerdown", onPointerDown);
  cardEl.addEventListener("pointermove", onPointerMove);
  cardEl.addEventListener("pointerup", onPointerUp);
  cardEl.addEventListener("pointercancel", onPointerUp);
}

function onKeyDown(event) {
  if (event.key === "Escape") {
    closeMatch();
  }
}

function onMatchOverlayClick(event) {
  if (event.target === matchOverlayEl) {
    closeMatch();
  }
}

function onEndScreenClick(event) {
  if (event.target === endScreenEl) {
    closeEndScreen();
  }
}

function onPointerDown(event) {
  if (isGameFinished()) {
    return;
  }
  state.startX = event.clientX;
  state.dragging = true;
  cardEl.setPointerCapture(event.pointerId);
}

function onPointerMove(event) {
  if (!state.dragging || state.startX === null) {
    return;
  }
  const deltaX = event.clientX - state.startX;
  const rotate = deltaX * 0.04;
  cardEl.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg)`;
}

function onPointerUp(event) {
  if (!state.dragging || state.startX === null) {
    return;
  }

  const deltaX = event.clientX - state.startX;
  state.dragging = false;
  state.startX = null;
  cardEl.releasePointerCapture(event.pointerId);

  if (deltaX > 70) {
    animateAndSwipe("right");
  } else if (deltaX < -70) {
    animateAndSwipe("left");
  } else {
    resetCardPosition();
  }
}

function animateAndSwipe(direction) {
  const offset = direction === "right" ? 420 : -420;
  cardEl.style.transition = "transform 180ms ease, opacity 180ms ease";
  cardEl.style.transform = `translateX(${offset}px) rotate(${direction === "right" ? 16 : -16}deg)`;
  cardEl.style.opacity = "0.2";

  window.setTimeout(() => {
    const consumed = handleSwipe(direction);
    if (!consumed) {
      resetCardPosition();
      return;
    }
    cardEl.style.transition = "none";
    cardEl.style.transform = "translateX(0) rotate(0)";
    cardEl.style.opacity = "1";
    void cardEl.offsetWidth;
    cardEl.style.transition = "transform 160ms ease, opacity 160ms ease";
  }, 180);
}

function handleSwipe(direction) {
  if (isGameFinished()) {
    return false;
  }

  if (direction === "left" && state.leftCount >= GAME_CONFIG.maxLeftSwipes) {
    showFeedback(`Left swipe limit reached (${GAME_CONFIG.maxLeftSwipes}).`, "warn");
    return false;
  }

  const profile = GAME_CONFIG.profiles[state.index];

  if (direction === "left") {
    state.leftCount += 1;
    // showFeedback(`Skipped ${profile.name}.`, "warn");
  } else {
    state.rightCount += 1;
    // showFeedback(`Drink 1 shot of ${profile.booze} for ${profile.name}!`, "ok");
    showMatch(profile.booze);
  }

  state.index += 1;
  renderCard();
  return true;
}

function renderCard() {
  updateCounters();

  endScreenEl.classList.remove("show");
  endScreenEl.setAttribute("aria-hidden", "true");

  if (isGameFinished()) {
    cardImageEl.src = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80";
    cardNameEl.textContent = "Game over";
    cardBoozeEl.textContent = `Total shots: ${state.rightCount}`;
    leftBtn.disabled = true;
    rightBtn.disabled = true;
    showEndScreen();
    return;
  }

  const profile = GAME_CONFIG.profiles[state.index];
  cardImageEl.src = profile.imageUrl;
  cardImageEl.alt = `${profile.name} photo`;
  cardNameEl.textContent = profile.name;
//   cardBoozeEl.textContent = `Shot if right swipe: ${profile.booze}`;

  leftBtn.disabled = state.leftCount >= GAME_CONFIG.maxLeftSwipes;
  rightBtn.disabled = false;
}

function updateCounters() {
  leftCountEl.textContent = String(state.leftCount);
  rightCountEl.textContent = String(state.rightCount);
  cardsLeftEl.textContent = String(Math.max(0, GAME_CONFIG.profiles.length - state.index));
}

function resetCardPosition() {
  cardEl.style.transition = "transform 120ms ease";
  cardEl.style.transform = "translateX(0) rotate(0)";
  cardEl.style.opacity = "1";
}

function showFeedback(message, type) {
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback ${type}`;
}

function showMatch(boozeType) {
  matchBoozeEl.textContent = boozeType;
  matchOverlayEl.classList.add("show");
  matchOverlayEl.setAttribute("aria-hidden", "false");
}

function closeMatch() {
  matchOverlayEl.classList.remove("show");
  matchOverlayEl.setAttribute("aria-hidden", "true");
}

function closeEndScreen() {
  endScreenEl.classList.remove("show");
  endScreenEl.setAttribute("aria-hidden", "true");
}

function isGameFinished() {
  return state.index >= GAME_CONFIG.profiles.length;
}

function showEndScreen() {
  endRightCountEl.textContent = String(state.rightCount);
  endLeftCountEl.textContent = String(state.leftCount);
  endScreenEl.classList.add("show");
  endScreenEl.setAttribute("aria-hidden", "false");
}

init();



// file:///C:/Users/janthiemen.postema/OneDrive%20-%20Milliman%20Inc/Documents/personal/wouter/images/taylor_swift.jpg
// file:///C:/Users/janthiemen.postema/OneDrive%20-%20Milliman%20Inc/Documents/personal/wouter/images/taylor_swift.png