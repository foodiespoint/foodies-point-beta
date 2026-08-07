// ==========================================================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION (v43)
// ==========================================================================
const CURRENT_APP_VERSION = "v43";
let db = null;

try {
  const firebaseConfig = {
    apiKey: "AIzaSyDu-pEongNewYbzc9-FG477NRVW2izilzM",
    authDomain: "foodiespoint-6760.firebaseapp.com",
    databaseURL: "https://foodiespoint-6760-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "foodiespoint-6760",
    storageBucket: "foodiespoint-6760.firebasestorage.app",
    messagingSenderId: "160661145433",
    appId: "1:160661145433:web:616afe0d7ca7cdf0faae48"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.database();
  console.log(`[Firebase ${CURRENT_APP_VERSION}] Initialized successfully.`);
} catch (error) {
  console.error(`[Firebase ${CURRENT_APP_VERSION}] Initialization error:`, error);
}

// ==========================================================================
// 2. TIME-BOUND OPERATING WINDOW & 6:00 PM AUTOMATIC RESET ENGINE (v43)
// ==========================================================================
function isDuringBreakWindow() {
  const now = new Date();
  const hour = now.getHours();
  return (hour >= 18 && hour < 21);
}

function checkDaily6PMReset() {
  const now = new Date();
  const hour = now.getHours();
  const todayStr = now.toDateString();
  const lastResetDate = localStorage.getItem('fp_last_reset_date');

  if (hour >= 18 && hour < 21 && lastResetDate !== todayStr) {
    localStorage.setItem('fp_last_reset_date', todayStr);
    kitchenCheckedState = {};

    if (db) {
      db.ref('dailyMenu').remove()
        .then(() => {
          console.log(`[${CURRENT_APP_VERSION}] 6:00 PM reached: Kitchen list checks reset & live menu cleared.`);
          renderKitchenMenu();
        })
        .catch((err) => console.error("Error clearing menu at 6 PM:", err));
    } else {
      renderKitchenMenu();
    }
  }
}

// ==========================================================================
// 3. ONESIGNAL v16 AUTO-PROMPT ENGINE (v43 - NO BELL ICON)
// ==========================================================================
try {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "d686653a-e6bc-40a4-b6e1-447a86a082cd",
      safari_web_id: "web.onesignal.auto.0dd8fdab-49d8-437b-ac06-36c9d15991be",
      // Bell icon completely disabled as requested
      notifyButton: {
        enable: false,
      },
      serviceWorkerParam: { scope: "/foodies-point-beta/" },
      serviceWorkerPath: "foodies-point-beta/sw.js"
    });
    console.log(`[OneSignal ${CURRENT_APP_VERSION}] v16 SDK initialized successfully.`);
  });
} catch (error) {
  console.error(`[OneSignal ${CURRENT_APP_VERSION}] Initialization error:`, error);
}

// AUTOMATIC PERMISSION CHECKER: Re-prompts whenever user is NOT subscribed
function r9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8() {
  try {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    OneSignalDeferred.push(async function(OneSignal) {
      const isSubscribed = OneSignal.Notifications && OneSignal.Notifications.permission;
      if (!isSubscribed) {
        console.log(`[Notification ${CURRENT_APP_VERSION}] User not subscribed. Triggering automatic access prompt...`);
        if (OneSignal.Slidedown && typeof OneSignal.Slidedown.promptPush === 'function') {
          await OneSignal.Slidedown.promptPush({ force: true });
        } else if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
          await OneSignal.Notifications.requestPermission();
        }
      } else {
        console.log(`[Notification ${CURRENT_APP_VERSION}] User is already subscribed to push notifications.`);
      }
    });

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log(`[PWA ${CURRENT_APP_VERSION}] Native notification permission status:`, permission);
      });
    }
  } catch (err) {
    console.error(`[Notification ${CURRENT_APP_VERSION}] Error requesting permission:`, err);
  }
}

// ==========================================================================
// 4. SERVICE WORKER REGISTRATION & SAFE AUTO-RELOAD ENGINE (v43)
// ==========================================================================
let swRegistration = null;
let isRefreshing = false;

if ('serviceWorker' in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || isRefreshing) return;
    isRefreshing = true;
    console.log(`[PWA ${CURRENT_APP_VERSION}] New service worker activated! Reloading screen to apply updates...`);
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/foodies-point-beta/sw.js', {
      scope: '/foodies-point-beta/'
    })
    .then((reg) => {
      console.log(`[SW ${CURRENT_APP_VERSION}] Registered successfully with scope:`, reg.scope);
      swRegistration = reg;
      reg.update();

      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log(`[PWA ${CURRENT_APP_VERSION}] Update downloaded. Forcing immediate activation...`);
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });
    })
    .catch((err) => {
      console.error(`[SW ${CURRENT_APP_VERSION}] Registration failed:`, err);
    });
  });
}

// ==========================================================================
// 5. STANDALONE DETECTION & INSTALLATION ENGINE (v43)
// ==========================================================================
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  console.log(`[PWA ${CURRENT_APP_VERSION}] Native install prompt intercepted & ready.`);
});

function triggerAppInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log(`[PWA ${CURRENT_APP_VERSION}] User accepted installation prompt.`);
      }
      deferredInstallPrompt = null;
    });
  } else {
    const guide = document.getElementById('install-manual-guide');
    if (guide) guide.style.display = 'block';
  }
}

function isStandalonePWA() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

function enforceInstallGate() {
  const installGate = document.getElementById('install-gate-overlay');
  const appContent = document.getElementById('main-app-content');

  if (isStandalonePWA()) {
    if (installGate) installGate.style.setProperty('display', 'none', 'important');
    if (appContent) appContent.style.setProperty('display', 'block', 'important');
    console.log(`[PWA ${CURRENT_APP_VERSION}] Standalone PWA mode verified. Application unlocked.`);
    // Automatically trigger permission check whenever the app launches
    setTimeout(r9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8, 1500);
  } else {
    console.log(`[PWA ${CURRENT_APP_VERSION}] Running in web browser. Install Gate active.`);
  }
}

// ==========================================================================
// 6. COMPLETE FOODIES POINT MENU (102 ITEMS - MASTER DATA)
// ==========================================================================
const MENU_ITEMS = [
  // --- ROLLS ---
  { id: 'dish-001', category: 'Rolls', name: 'Dahi Bread Roll (1 pc)', price: 15 },
  { id: 'dish-002', category: 'Rolls', name: 'Bread Roll (8 pc plate)', price: 80 },
  { id: 'dish-003', category: 'Rolls', name: 'Spring Roll', price: 25 },
  { id: 'dish-004', category: 'Rolls', name: 'Veg Kebab Roll', price: 20 },
  { id: 'dish-005', category: 'Rolls', name: 'Paneer Roll', price: 45 },
  { id: 'dish-006', category: 'Rolls', name: 'Egg Mayonnaise & Cheese Mix Roll', price: 50 },
  { id: 'dish-007', category: 'Rolls', name: 'Egg Mayonnaise Roll', price: 40 },
  { id: 'dish-008', category: 'Rolls', name: 'Egg Roll', price: 35 },
  { id: 'dish-009', category: 'Rolls', name: 'Chicken Roll', price: 55 },
  { id: 'dish-010', category: 'Rolls', name: 'Chicken Mayonnaise Roll', price: 60 },
  { id: 'dish-011', category: 'Rolls', name: 'Chicken Egg Roll', price: 70 },
  { id: 'dish-012', category: 'Rolls', name: 'Chicken Egg Mayonnaise Roll', price: 75 },

  // --- PAKODI ---
  { id: 'dish-013', category: 'Pakodi', name: 'Pyaaz ki Pakodi (250gm)', price: 60 },
  { id: 'dish-014', category: 'Pakodi', name: 'Paalak ki Pakodi (250gm)', price: 60 },
  { id: 'dish-015', category: 'Pakodi', name: 'Gobhi ki Pakodi (250gm)', price: 60 },
  { id: 'dish-016', category: 'Pakodi', name: 'Mirch ki Pakodi', price: 15 },
  { id: 'dish-017', category: 'Pakodi', name: 'Bread Pakoda', price: 20 },
  { id: 'dish-018', category: 'Pakodi', name: 'Egg Pakodi', price: 10 },
  { id: 'dish-019', category: 'Pakodi', name: 'Moong Daal ke Mongode (250gm)', price: 75 },

  // --- SANDWICH ---
  { id: 'dish-020', category: 'Sandwich', name: 'Veg Grilled Mayonnaise Sandwich (2 pc)', price: 55 },
  { id: 'dish-021', category: 'Sandwich', name: 'Veg Cheese Sandwich (2 pc)', price: 60 },
  { id: 'dish-022', category: 'Sandwich', name: 'Veg Sandwich', price: 18 },

  // --- SNACKS ---
  { id: 'dish-023', category: 'Snacks', name: 'Chocolate Croissant', price: 48 },
  { id: 'dish-024', category: 'Snacks', name: 'Zingy Parcel (Paneer)', price: 60 },
  { id: 'dish-025', category: 'Snacks', name: 'Pizza Puff', price: 18 },
  { id: 'dish-026', category: 'Snacks', name: 'Mini Pizza', price: 45 },
  { id: 'dish-027', category: 'Snacks', name: 'Veg Burger', price: 50 },
  { id: 'dish-028', category: 'Snacks', name: 'Aloo Patty', price: 17 },
  { id: 'dish-029', category: 'Snacks', name: 'Paneer Patty', price: 25 },
  { id: 'dish-030', category: 'Snacks', name: 'Veg Appe (per plate)', price: 65 },
  { id: 'dish-031', category: 'Snacks', name: 'Phare (250gm)', price: 70 },
  { id: 'dish-032', category: 'Snacks', name: 'Veg Masala Idli (per plate)', price: 45 },
  { id: 'dish-033', category: 'Snacks', name: 'Fried Idli (per plate)', price: 50 },
  { id: 'dish-034', category: 'Snacks', name: 'Poha (per plate)', price: 80 },
  { id: 'dish-035', category: 'Snacks', name: 'Crispy Stuffed Mushroom (4 pc)', price: 65 },
  { id: 'dish-036', category: 'Snacks', name: 'Aloo Bonda', price: 12 },
  { id: 'dish-037', category: 'Snacks', name: 'Vada Pav', price: 25 },
  { id: 'dish-038', category: 'Snacks', name: 'Cheese Balls (8 pc plate)', price: 80 },
  { id: 'dish-039', category: 'Snacks', name: 'Masala Vada (8 pc plate)', price: 80 },
  { id: 'dish-040', category: 'Snacks', name: 'Falafel Mushakkal Veg. Roll', price: 40 },
  { id: 'dish-041', category: 'Snacks', name: 'Pani Poori (5 pc)', price: 15 },
  { id: 'dish-042', category: 'Snacks', name: 'Tikki Chaat (per plate)', price: 55 },
  { id: 'dish-043', category: 'Snacks', name: 'Dahi Vada (4 pc plate)', price: 60 },
  { id: 'dish-044', category: 'Snacks', name: 'Raj Kachori (per plate)', price: 85 },
  { id: 'dish-045', category: 'Snacks', name: 'Samosa', price: 12 },
  { id: 'dish-046', category: 'Snacks', name: 'Paneer Tikka (per plate)', price: 240 },
  { id: 'dish-047', category: 'Snacks', name: 'Paneer Malai Tikka (per plate)', price: 260 },

  // --- CHINESE ---
  { id: 'dish-048', category: 'Chinese', name: 'Honey Chilli Potato', price: 90 },
  { id: 'dish-049', category: 'Chinese', name: 'Chowmein', price: 80 },
  { id: 'dish-050', category: 'Chinese', name: 'Macaroni', price: 80 },
  { id: 'dish-051', category: 'Chinese', name: 'Fried Rice', price: 80 },
  { id: 'dish-052', category: 'Chinese', name: 'Veg Manchurian', price: 80 },
  { id: 'dish-053', category: 'Chinese', name: 'Paneer Manchurian', price: 160 },
  { id: 'dish-054', category: 'Chinese', name: 'Chilli Paneer', price: 140 },
  { id: 'dish-055', category: 'Chinese', name: 'Veg Momos (10 pc)', price: 55 },
  { id: 'dish-056', category: 'Chinese', name: 'Paneer Momos (10 pc)', price: 75 },
  { id: 'dish-057', category: 'Chinese', name: 'Chicken Momos (10 pc)', price: 100 },
  { id: 'dish-058', category: 'Chinese', name: 'White Pasta', price: 100 },

  // --- KEBABS ---
  { id: 'dish-059', category: 'Kebabs', name: 'Veg. Seekh Kebab', price: 15 },
  { id: 'dish-060', category: 'Kebabs', name: 'Veg Kebab', price: 17 },
  { id: 'dish-061', category: 'Kebabs', name: 'Dahi ke Kebab', price: 25 },
  { id: 'dish-062', category: 'Kebabs', name: 'Hariyali Kebab', price: 25 },

  // --- CAKE (EGG-LESS) ---
  { id: 'dish-063', category: 'Cake (Egg-Less)', name: 'Tutti Frutti Cup Cake', price: 18 },
  { id: 'dish-064', category: 'Cake (Egg-Less)', name: 'Chocolate Cup Cake', price: 20 },
  { id: 'dish-065', category: 'Cake (Egg-Less)', name: 'Chocolava Cup Cake', price: 38 },

  // --- SHAKES & BEVERAGES ---
  { id: 'dish-066', category: 'Shakes', name: 'Mango Shake', price: 30 },
  { id: 'dish-067', category: 'Shakes', name: 'Lassi', price: 45 },
  { id: 'dish-068', category: 'Shakes', name: 'Panna', price: 12 },

  // --- INDIAN MEALS & COMBOS ---
  { id: 'dish-069', category: 'Meals & Combos', name: 'Chokha Baati (2 pc plate)', price: 50 },
  { id: 'dish-070', category: 'Meals & Combos', name: 'Chole Aloo Kulche (per plate)', price: 70 },
  { id: 'dish-071', category: 'Meals & Combos', name: 'Chole Bhature (per plate)', price: 60 },
  { id: 'dish-072', category: 'Meals & Combos', name: 'Khasta Aloo Matar (2 pc plate)', price: 55 },
  { id: 'dish-073', category: 'Meals & Combos', name: 'Sambhar Vada (4 pc plate)', price: 55 },
  { id: 'dish-074', category: 'Meals & Combos', name: 'Idli Sambhar (4 pc plate)', price: 55 },
  { id: 'dish-075', category: 'Meals & Combos', name: 'Pav Bhaaji (per plate)', price: 60 },

  // --- SWEETS ---
  { id: 'dish-076', category: 'Sweets', name: 'Gulab Jamun', price: 20 },
  { id: 'dish-077', category: 'Sweets', name: 'Kheer', price: 80 },
  { id: 'dish-078', category: 'Sweets', name: 'Sweet Rice', price: 90 },
  { id: 'dish-079', category: 'Sweets', name: 'Shrikhand (250 gm)', price: 85 },

  // --- SABZI ---
  { id: 'dish-080', category: 'Sabzi', name: 'Shaahi Paneer', price: 300 },
  { id: 'dish-081', category: 'Sabzi', name: 'Paneer Masala', price: 220 },
  { id: 'dish-082', category: 'Sabzi', name: 'Paneer Angara', price: 280 },
  { id: 'dish-083', category: 'Sabzi', name: 'Paneer Korma', price: 260 },
  { id: 'dish-084', category: 'Sabzi', name: 'Palak Paneer', price: 200 },
  { id: 'dish-085', category: 'Sabzi', name: 'Matar Paneer', price: 200 },

  // --- NON-VEG ---
  { id: 'dish-086', category: 'Non-Veg', name: 'Chicken Afghani', price: 500 },
  { id: 'dish-087', category: 'Non-Veg', name: 'Roasted Chicken', price: 340 },
  { id: 'dish-088', category: 'Non-Veg', name: 'Chilli Chicken', price: 440 },
  { id: 'dish-089', category: 'Non-Veg', name: 'Egg Curry', price: 75 },
  { id: 'dish-090', category: 'Non-Veg', name: 'Fish Fry (boneless - 250 gm)', price: 180 },
  { id: 'dish-091', category: 'Non-Veg', name: 'Fish Dry (boneless - 250 gm)', price: 165 },
  { id: 'dish-092', category: 'Non-Veg', name: 'Chicken Shawarma', price: 90 },
  { id: 'dish-093', category: 'Non-Veg', name: 'Mutton Curry', price: 400 },
  { id: 'dish-094', category: 'Non-Veg', name: 'Mutton Korma', price: 430 },
  { id: 'dish-095', category: 'Non-Veg', name: 'Keema Kaleji', price: 400 },
  { id: 'dish-096', category: 'Non-Veg', name: 'Chicken Curry', price: 360 },
  { id: 'dish-097', category: 'Non-Veg', name: 'Chicken Masala', price: 400 },
  { id: 'dish-098', category: 'Non-Veg', name: 'Butter Chicken', price: 500 },

  // --- RICE ---
  { id: 'dish-099', category: 'Rice', name: 'Plain Rice', price: 90 },
  { id: 'dish-100', category: 'Rice', name: 'Jeera Rice', price: 120 },
  { id: 'dish-101', category: 'Rice', name: 'Matar Pulao', price: 140 },
  { id: 'dish-102', category: 'Rice', name: 'Veg. Biryani', price: 180 }
];

const cart = {};
let kitchenCheckedState = {};
let latestFirebaseMenuSnapshot = null;

// ==========================================================================
// 7. KITCHEN LEFT SLIDER DRAWER CONTROLLER (v43)
// ==========================================================================
function toggleKitchenDrawer(forceState) {
  const drawer = document.getElementById('kitchen-left-drawer');
  const backdrop = document.getElementById('kitchen-drawer-backdrop');
  if (!drawer || !backdrop) return;

  const isOpen = drawer.classList.contains('open');
  const shouldOpen = (typeof forceState === 'boolean') ? forceState : !isOpen;

  if (shouldOpen) {
    drawer.classList.add('open');
    backdrop.classList.add('active');
  } else {
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
  }
}

// ==========================================================================
// 8. RENDER KITCHEN MENU (v43)
// ==========================================================================
function renderKitchenMenu() {
  const container = document.getElementById('kitchen-menu-container');
  if (!container) return;

  container.innerHTML = '';

  const checkedDishes = MENU_ITEMS.filter(d => kitchenCheckedState[d.id]);

  checkedDishes.forEach((dish) => {
    const isOOS = (kitchenCheckedState[dish.id] === 'OOS');
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.setAttribute('data-item-id', dish.id);

    card.innerHTML = `
      <div class="dish-select-area">
        <input type="checkbox" class="dish-checkbox" id="chk-top-${dish.id}" checked onchange="toggleKitchenItem('${dish.id}', false)">
        <div class="dish-info">
          <h4>${dish.name} <span style="font-size:0.78rem; color:#777; font-weight:normal;">(${dish.category})</span></h4>
          <div class="price">₹${dish.price}</div>
        </div>
      </div>
      <button type="button" class="btn-oos ${isOOS ? 'is-oos' : ''}" onclick="toggleOutOfStock('${dish.id}')">
        ${isOOS ? '🔴 Out of Stock' : '🟢 In Stock'}
      </button>
    `;
    container.appendChild(card);
  });

  const categories = [...new Set(MENU_ITEMS.map(item => item.category))];
  categories.forEach((cat) => {
    const uncheckedCatItems = MENU_ITEMS.filter(item => item.category === cat && !kitchenCheckedState[item.id]);

    if (uncheckedCatItems.length > 0) {
      const categoryHeader = document.createElement('h3');
      categoryHeader.style.cssText = "margin: 16px 0 6px 0; font-size: 0.95rem; color: #FF4B3A; border-bottom: 2px solid #EAEAEA; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;";
      categoryHeader.textContent = cat;
      container.appendChild(categoryHeader);

      uncheckedCatItems.forEach((dish) => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.setAttribute('data-item-id', dish.id);

        card.innerHTML = `
          <div class="dish-select-area">
            <input type="checkbox" class="dish-checkbox" id="chk-${dish.id}" onchange="toggleKitchenItem('${dish.id}', true)">
            <div class="dish-info">
              <h4>${dish.name}</h4>
              <div class="price">₹${dish.price}</div>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    }
  });
}

function toggleKitchenItem(dishId, isChecked) {
  if (isChecked) {
    kitchenCheckedState[dishId] = true;
  } else {
    delete kitchenCheckedState[dishId];
  }
  renderKitchenMenu();
}

function toggleOutOfStock(dishId) {
  const current = kitchenCheckedState[dishId];
  const newState = (current === 'OOS') ? true : 'OOS';
  kitchenCheckedState[dishId] = newState;

  if (db) {
    db.ref(`dailyMenu/${dishId}`).set(newState);
  }
  renderKitchenMenu();
}

// ==========================================================================
// 9. PUBLISH OR CLEAR DAILY LIVE MENU IN FIREBASE (v43)
// ==========================================================================
function publishDailyMenu() {
  if (!db) {
    alert("Database connection is not ready. Please refresh the page.");
    return;
  }

  const selectedCount = Object.keys(kitchenCheckedState).length;

  if (selectedCount === 0) {
    if (confirm("No items selected. Do you want to clear all items from the customer's live menu page?")) {
      clearDailyMenu();
    }
    return;
  }

  const confirmMsg = isDuringBreakWindow()
    ? `It is currently between 6:00 PM and 9:00 PM.\n\nAre you sure you want to publish these ${selectedCount} selected items? (They will automatically go live for customers at 9:00 PM tonight for tomorrow's orders.)`
    : `Are you sure you want to publish ${selectedCount} selected items to the live customer menu?`;

  if (!confirm(confirmMsg)) {
    return;
  }

  db.ref('dailyMenu').set(kitchenCheckedState)
    .then(() => {
      alert(`Daily Live Menu published successfully (${selectedCount} items)!`);
    })
    .catch((error) => {
      console.error("Error publishing menu:", error);
      alert("Failed to publish daily menu. Please check your network connection.");
    });
}

function clearDailyMenu() {
  if (!db) {
    alert("Database connection is not ready. Please refresh the page.");
    return;
  }

  if (confirm("Remove all items from the customer's live menu page?")) {
    db.ref('dailyMenu').remove()
      .then(() => {
        kitchenCheckedState = {};
        renderKitchenMenu();
        alert("All items have been removed from the customer page!");
      })
      .catch((error) => {
        console.error("Error clearing daily menu:", error);
        alert("Could not remove items from customer page. Check network connection.");
      });
  }
}

// ==========================================================================
// 10. CUSTOMER LIVE MENU LISTENER (v43)
// ==========================================================================
function renderCustomerMenuFromSnapshot(activeIds) {
  const container = document.getElementById('customer-menu-container');
  const placeOrderBtn = document.getElementById('btn-place-order');
  if (!container) return;

  container.innerHTML = '';

  if (isDuringBreakWindow()) {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px 20px; color:#555;">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">🌙</div>
        <h3 style="color:#FF4B3A; font-size: 1.15rem; margin-bottom: 8px;">We're Closed for the Day!</h3>
        <p style="font-size: 0.95rem; line-height: 1.5; color: #666;">
          Orders are now closed for today.<br>
          Tomorrow's live menu will be available starting at <strong>9:00 PM tonight</strong>!
        </p>
      </div>
    `;
    if (placeOrderBtn) placeOrderBtn.disabled = true;
    return;
  }

  if (placeOrderBtn) placeOrderBtn.disabled = false;

  if (!activeIds || Object.keys(activeIds).length === 0) {
    container.innerHTML = `<p style="text-align:center; padding: 40px 20px; color:#666;">The kitchen is preparing today's live menu. Please check back shortly!</p>`;
    return;
  }

  let currentCategory = '';

  MENU_ITEMS.forEach((dish) => {
    if (activeIds[dish.id]) {
      cart[dish.id] = cart[dish.id] || 0;
      const isOOS = (activeIds[dish.id] === 'OOS');

      if (isOOS && cart[dish.id] > 0) {
        cart[dish.id] = 0;
      }

      if (dish.category !== currentCategory) {
        currentCategory = dish.category;
        const categoryHeader = document.createElement('h3');
        categoryHeader.style.cssText = "margin: 18px 0 6px 0; font-size: 1.05rem; color: #FF4B3A; border-bottom: 2px solid #EAEAEA; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;";
        categoryHeader.textContent = currentCategory;
        container.appendChild(categoryHeader);
      }

      const card = document.createElement('div');
      card.className = 'menu-card';
      card.setAttribute('data-item-id', dish.id);

      const actionAreaHtml = isOOS
        ? `<span class="badge-oos">Out of Stock</span>`
        : `<div class="quantity-stepper">
             <button type="button" aria-label="Decrease quantity" onclick="updateQuantity('${dish.id}', -1)">−</button>
             <span id="qty-${dish.id}">${cart[dish.id]}</span>
             <button type="button" aria-label="Increase quantity" onclick="updateQuantity('${dish.id}', 1)">+</button>
           </div>`;

      card.innerHTML = `
        <div class="dish-info" style="${isOOS ? 'opacity: 0.5;' : ''}">
          <h4>${dish.name}</h4>
          <div class="price">₹${dish.price}</div>
        </div>
        ${actionAreaHtml}
      `;
      container.appendChild(card);
    }
  });
}

function listenForCustomerLiveMenu() {
  if (!db) return;

  db.ref('dailyMenu').on('value', (snapshot) => {
    latestFirebaseMenuSnapshot = snapshot.val();
    renderCustomerMenuFromSnapshot(latestFirebaseMenuSnapshot);
  });
}

function updateQuantity(dishId, change) {
  const currentQty = cart[dishId] || 0;
  let newQty = currentQty + change;

  if (newQty < 0) newQty = 0;
  if (newQty > 10) {
    alert("Quantity cap reached: Maximum 10 items per dish.");
    newQty = 10;
  }

  cart[dishId] = newQty;
  const qtySpan = document.getElementById(`qty-${dishId}`);
  if (qtySpan) {
    qtySpan.textContent = newQty;
  }
}

// ==========================================================================
// 11. ORDER SUBMISSION & PROFILE VERSION SYNC ENGINE (v43)
// ==========================================================================
function syncCustomerVersionToFirebase(profile) {
  if (!db || !profile || !profile.mobile) return;
  db.ref(`customers/${profile.mobile}`).update({
    name: profile.name,
    mobile: profile.mobile,
    appVersion: CURRENT_APP_VERSION,
    lastSeen: firebase.database.ServerValue.TIMESTAMP
  }).catch((err) => console.error("Error syncing customer version:", err));
}

function placeOrder() {
  if (isDuringBreakWindow()) {
    alert("Orders are closed for today. Tomorrow's menu will be available starting at 9:00 PM tonight!");
    return;
  }

  // Backup check: always verify push access when customer attempts to place an order
  r9yMnTm4NSzvG9rrwjM2ec8xZgh1cafXH8();

  if (!db) {
    alert("Database connection is not ready. Please refresh the page.");
    return;
  }

  const orderItems = [];
  let totalAmount = 0;

  MENU_ITEMS.forEach((dish) => {
    const qty = cart[dish.id] || 0;
    if (qty > 0) {
      orderItems.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: qty
      });
      totalAmount += dish.price * qty;
    }
  });

  if (orderItems.length === 0) {
    alert("Please add at least one item to your order.");
    return;
  }

  const profileStr = localStorage.getItem('fp_customer_profile');
  if (!profileStr) {
    const profileModal = document.getElementById('profile-modal');
    if (profileModal) profileModal.style.display = 'flex';
    return;
  }

  const customerProfile = JSON.parse(profileStr);
  syncCustomerVersionToFirebase(customerProfile);
  executeFirebaseOrderSubmission(orderItems, totalAmount, customerProfile);
}

function closeProfileModal() {
  const profileModal = document.getElementById('profile-modal');
  if (profileModal) profileModal.style.display = 'none';
}

function saveProfileAndPlaceOrder() {
  const nameInput = document.getElementById('cust-name-input');
  const mobileInput = document.getElementById('cust-mobile-input');
  
  const nameVal = nameInput ? nameInput.value.trim() : '';
  const mobileVal = mobileInput ? mobileInput.value.trim() : '';

  if (nameVal.length < 2) {
    alert("Please enter a valid Name (at least 2 characters).");
    return;
  }
  if (!/^[0-9]{10}$/.test(mobileVal)) {
    alert("Please enter a valid 10-digit Mobile Number.");
    return;
  }

  const customerProfile = {
    name: nameVal,
    mobile: mobileVal
  };

  localStorage.setItem('fp_customer_profile', JSON.stringify(customerProfile));
  syncCustomerVersionToFirebase(customerProfile);
  closeProfileModal();

  const orderItems = [];
  let totalAmount = 0;
  MENU_ITEMS.forEach((dish) => {
    const qty = cart[dish.id] || 0;
    if (qty > 0) {
      orderItems.push({ id: dish.id, name: dish.name, price: dish.price, quantity: qty });
      totalAmount += dish.price * qty;
    }
  });

  executeFirebaseOrderSubmission(orderItems, totalAmount, customerProfile);
}

function executeFirebaseOrderSubmission(orderItems, totalAmount, customerProfile) {
  const newOrderRef = db.ref('orders').push();
  const orderData = {
    orderId: newOrderRef.key.slice(-4).toUpperCase(),
    items: orderItems,
    total: totalAmount,
    status: 'PENDING',
    customerName: customerProfile.name,
    customerMobile: customerProfile.mobile,
    customerVersion: CURRENT_APP_VERSION,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  };

  newOrderRef.set(orderData)
    .then(() => {
      alert(`Order placed successfully! Your Order ID is #${orderData.orderId}`);
      
      const myOrder = {
        firebaseKey: newOrderRef.key,
        orderId: orderData.orderId,
        items: orderItems,
        total: totalAmount,
        status: 'PENDING',
        timestamp: Date.now()
      };
      const pastOrders = JSON.parse(localStorage.getItem('fp_customer_orders') || '[]');
      pastOrders.unshift(myOrder);
      localStorage.setItem('fp_customer_orders', JSON.stringify(pastOrders));
      renderCustomerOrderHistory();

      MENU_ITEMS.forEach((dish) => { cart[dish.id] = 0; });
      Object.keys(cart).forEach(id => {
        const span = document.getElementById(`qty-${id}`);
        if (span) span.textContent = 0;
      });
    })
    .catch((error) => {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please check your internet connection.");
    });
}

function renderCustomerOrderHistory() {
  const container = document.getElementById('customer-orders-container');
  if (!container) return;

  const pastOrders = JSON.parse(localStorage.getItem('fp_customer_orders') || '[]');

  if (pastOrders.length === 0) {
    container.innerHTML = `<p style="text-align:center; padding: 20px; color:#666;">No past orders yet. Orders placed from this device will appear here!</p>`;
    return;
  }

  container.innerHTML = '';

  pastOrders.forEach((myOrder) => {
    const card = document.createElement('div');
    card.className = 'customer-order-card';

    const itemsSummary = myOrder.items
      .map(i => `<strong>${i.quantity}x</strong> ${i.name}`)
      .join(', ');

    const dateStr = new Date(myOrder.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    card.innerHTML = `
      <div class="customer-order-header">
        <span><strong>Order #${myOrder.orderId}</strong> (${dateStr})</span>
        <span class="status-badge status-${myOrder.status}">${myOrder.status}</span>
      </div>
      <p style="font-size: 0.88rem; color: #444; margin-bottom: 6px; line-height: 1.4;">${itemsSummary}</p>
      <div style="font-weight: 700; color: #FF4B3A; font-size: 0.95rem;">Total: ₹${myOrder.total}</div>
    `;

    container.appendChild(card);
  });
}

function clearCustomerHistory() {
  if (confirm("Clear your order history from this device?")) {
    localStorage.removeItem('fp_customer_orders');
    renderCustomerOrderHistory();
  }
}

function listenForCustomerOrderUpdates() {
  if (!db) return;

  db.ref('orders').on('value', (snapshot) => {
    const activeOrders = snapshot.val() || {};
    const pastOrders = JSON.parse(localStorage.getItem('fp_customer_orders') || '[]');
    let hasChanges = false;

    pastOrders.forEach((myOrder) => {
      const liveOrder = activeOrders[myOrder.firebaseKey];
      if (liveOrder) {
        if (myOrder.status !== liveOrder.status) {
          myOrder.status = liveOrder.status;
          hasChanges = true;
        }
      } else if (myOrder.status === 'PENDING' || myOrder.status === 'ACCEPTED') {
        myOrder.status = 'COMPLETED';
        hasChanges = true;
      }
    });

    if (hasChanges) {
      localStorage.setItem('fp_customer_orders', JSON.stringify(pastOrders));
      renderCustomerOrderHistory();
    }
  });
}

// ==========================================================================
// 12. PERMANENT KITCHEN LOGIN, SMART HEADER BACK & CONTROLS (v43)
// ==========================================================================
const KITCHEN_PIN = "validatefoodies2026";
let isKitchenMode = false;

function openKitchenPINModal() {
  if (localStorage.getItem('fp_kitchen_auth') === 'true') {
    enterKitchenMode();
    return;
  }
  document.getElementById('pin-modal').style.display = 'flex';
  
  const input = document.getElementById('kitchen-pin-input');
  const eyeBtn = document.getElementById('toggle-passcode-eye');
  if (input) {
    input.value = '';
    input.type = 'password';
  }
  if (eyeBtn) {
    eyeBtn.textContent = '👁️';
  }
}

function closePINModal() {
  document.getElementById('pin-modal').style.display = 'none';
}

function togglePasscodeVisibility() {
  const input = document.getElementById('kitchen-pin-input');
  const eyeBtn = document.getElementById('toggle-passcode-eye');
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    if (eyeBtn) eyeBtn.textContent = '🔒';
  } else {
    input.type = 'password';
    if (eyeBtn) eyeBtn.textContent = '👁️';
  }
}

function verifyKitchenPIN() {
  const inputPin = document.getElementById('kitchen-pin-input').value;
  if (inputPin === KITCHEN_PIN) {
    localStorage.setItem('fp_kitchen_auth', 'true');
    closePINModal();
    enterKitchenMode();
  } else {
    alert("Incorrect passcode. Access denied.");
  }
}

function enterKitchenMode() {
  if (!isKitchenMode) {
    history.pushState({ kitchenMode: true }, '', '#kitchen');
  }
  isKitchenMode = true;

  const titleEl = document.getElementById('main-app-title');
  if (titleEl) titleEl.style.display = 'none';

  document.getElementById('customer-view').style.display = 'none';

  document.getElementById('header-kitchen-btn').style.display = 'none';
  document.getElementById('header-back-btn').style.display = 'inline-flex';
  document.getElementById('header-drawer-btn').style.display = 'inline-block';
  document.getElementById('kitchen-version-badge').style.display = 'inline-block';
  document.getElementById('header-exit-btn').style.display = 'inline-block';

  const kitchenView = document.getElementById('kitchen-view');
  if (kitchenView) kitchenView.style.display = 'flex';

  if (db) {
    db.ref('dailyMenu').on('value', (snapshot) => {
      kitchenCheckedState = snapshot.val() || {};
      renderKitchenMenu();
    });
  } else {
    renderKitchenMenu();
  }

  listenForKitchenOrders();
}

function handleHeaderBack() {
  const custPage = document.getElementById('customer-data-view');
  const payPage = document.getElementById('payment-details-view');
  
  if ((custPage && custPage.style.display === 'flex') || (payPage && payPage.style.display === 'flex')) {
    closeKitchenSubPage(true);
  } else {
    exitKitchenMode(true);
  }
}

function exitKitchenMode(triggerHistoryBack = true) {
  if (!isKitchenMode) return;
  isKitchenMode = false;

  toggleKitchenDrawer(false);
  closeKitchenSubPage(false);

  if (triggerHistoryBack && window.location.hash.startsWith('#kitchen')) {
    history.back();
  }

  const titleEl = document.getElementById('main-app-title');
  if (titleEl) titleEl.style.display = 'block';

  const kitchenView = document.getElementById('kitchen-view');
  if (kitchenView) kitchenView.style.display = 'none';

  document.getElementById('customer-view').style.display = 'flex';

  document.getElementById('header-kitchen-btn').style.display = 'inline-block';
  document.getElementById('header-back-btn').style.display = 'none';
  document.getElementById('header-drawer-btn').style.display = 'none';
  document.getElementById('kitchen-version-badge').style.display = 'none';
  document.getElementById('header-exit-btn').style.display = 'none';

  if (db) {
    db.ref('orders').off();
    db.ref('dailyMenu').off();
  }
}

// ==========================================================================
// 13. DEDICATED KITCHEN SUB-PAGES & ATOMIC LEDGER WIPE ENGINE (v43)
// ==========================================================================
function openCustomerDataPage() {
  toggleKitchenDrawer(false);
  history.pushState({ kitchenSubPage: 'customers' }, '', '#kitchen-customers');

  document.getElementById('kitchen-view').style.display = 'none';
  const subPage = document.getElementById('customer-data-view');
  if (subPage) subPage.style.display = 'flex';

  fetchAndRenderCustomerDirectory();
}

function openPaymentDetailsPage() {
  toggleKitchenDrawer(false);
  history.pushState({ kitchenSubPage: 'payments' }, '', '#kitchen-payments');

  document.getElementById('kitchen-view').style.display = 'none';
  const subPage = document.getElementById('payment-details-view');
  if (subPage) subPage.style.display = 'flex';

  fetchAndRenderPaymentLedger();
}

function closeKitchenSubPage(triggerBack = true) {
  document.getElementById('customer-data-view').style.display = 'none';
  document.getElementById('payment-details-view').style.display = 'none';

  if (isKitchenMode) {
    document.getElementById('kitchen-view').style.display = 'flex';
  }

  if (triggerBack && (window.location.hash === '#kitchen-customers' || window.location.hash === '#kitchen-payments')) {
    history.back();
  }
}

function clearPaymentLedger() {
  if (!db) {
    alert("Database connection is not ready. Please refresh the page.");
    return;
  }
  if (confirm("Are you sure you want to wipe all billing records and order entries? This will reset the total ledger back to ₹0.")) {
    db.ref('orders').remove()
      .then(() => {
        alert("Payment ledger wiped clean!");
        fetchAndRenderPaymentLedger();
      })
      .catch((err) => {
        console.error("Error clearing payment ledger:", err);
        alert("Could not clear payment entries. Please check your network connection.");
      });
  }
}

function fetchAndRenderCustomerDirectory() {
  const container = document.getElementById('customer-directory-container');
  if (!container || !db) return;

  container.innerHTML = `<p style="text-align:center; padding: 30px; color:#666;">Fetching live directory...</p>`;

  db.ref('customers').once('value')
    .then((snapshot) => {
      const customers = snapshot.val();
      if (!customers) {
        container.innerHTML = `<p style="text-align:center; padding: 30px; color:#666;">No customer version records synced yet. Data appears as orders are placed!</p>`;
        return;
      }

      container.innerHTML = '';
      const list = Object.keys(customers).map(key => customers[key]);

      list.forEach((cust) => {
        const card = document.createElement('div');
        card.className = 'customer-data-card';
        const dateStr = cust.lastSeen
          ? new Date(cust.lastSeen).toLocaleDateString()
          : 'Recently';

        card.innerHTML = `
          <div>
            <h4 style="font-size:1.05rem; color:#2D2D2D; margin-bottom:3px;">${cust.name || 'Guest'}</h4>
            <div style="font-size:0.85rem; color:#666;">📞 <strong>${cust.mobile}</strong></div>
            <div style="font-size:0.75rem; color:#888; margin-top:2px;">Last Active: ${dateStr}</div>
          </div>
          <span class="version-badge">${cust.appVersion || 'Unknown'}</span>
        `;
        container.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("Error loading directory:", err);
      container.innerHTML = `<p style="text-align:center; color:red;">Failed to load customer list.</p>`;
    });
}

function fetchAndRenderPaymentLedger() {
  const container = document.getElementById('payment-ledger-container');
  if (!container || !db) return;

  container.innerHTML = `<p style="text-align:center; padding: 30px; color:#666;">Calculating payment ledger...</p>`;

  db.ref('orders').once('value')
    .then((snapshot) => {
      const orders = snapshot.val();
      if (!orders) {
        container.innerHTML = `
          <div class="payment-summary-box">
            <div style="font-size:0.85rem; color:#666; text-transform:uppercase; font-weight:700;">Active Orders Billing Total</div>
            <div style="font-size:1.8rem; font-weight:800; color:#FF4B3A; margin:4px 0;">₹0</div>
            <div style="font-size:0.85rem; color:#2E7D32;">✔ 0 Orders Accepted/Completed</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin: 16px 0 10px 0;">
            <h3 style="font-size:1rem; color:#2D2D2D; margin: 0;">Recent Billing Entries</h3>
            <button type="button" class="btn-clear-menu" onclick="clearPaymentLedger()" style="padding: 6px 12px; font-size: 0.8rem; width: auto; flex: none;">🗑️ Clear Entries</button>
          </div>
          <p style="text-align:center; padding: 30px; color:#666;">No active payment records found today.</p>
        `;
        return;
      }

      let totalRevenue = 0;
      let completedCount = 0;
      const orderRows = [];

      Object.keys(orders).forEach((key) => {
        const o = orders[key];
        orderRows.push(o);
        if (o.status === 'COMPLETED' || o.status === 'ACCEPTED') {
          totalRevenue += (o.total || 0);
          completedCount++;
        }
      });

      container.innerHTML = `
        <div class="payment-summary-box">
          <div style="font-size:0.85rem; color:#666; text-transform:uppercase; font-weight:700;">Active Orders Billing Total</div>
          <div style="font-size:1.8rem; font-weight:800; color:#FF4B3A; margin:4px 0;">₹${totalRevenue}</div>
          <div style="font-size:0.85rem; color:#2E7D32;">✔ ${completedCount} Orders Accepted/Completed</div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 16px 0 10px 0;">
          <h3 style="font-size:1rem; color:#2D2D2D; margin: 0;">Recent Billing Entries</h3>
          <button type="button" class="btn-clear-menu" onclick="clearPaymentLedger()" style="padding: 6px 12px; font-size: 0.8rem; width: auto; flex: none;">🗑️ Clear Entries</button>
        </div>
      `;

      orderRows.sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0));

      orderRows.forEach((order) => {
        const row = document.createElement('div');
        row.className = 'customer-data-card';
        row.innerHTML = `
          <div>
            <h4 style="font-size:0.98rem; color:#2D2D2D;">Order #${order.orderId} — ₹${order.total}</h4>
            <div style="font-size:0.8rem; color:#666;">${order.customerName || 'Guest'} (${order.customerMobile || 'N/A'})</div>
          </div>
          <span style="font-weight:700; font-size:0.85rem; color:#FF4B3A;">${order.status}</span>
        `;
        container.appendChild(row);
      });
    })
    .catch((err) => {
      console.error("Error loading payments:", err);
      container.innerHTML = `<p style="text-align:center; color:red;">Failed to calculate payment ledger.</p>`;
    });
}

window.addEventListener('popstate', () => {
  if (isKitchenMode) {
    if (window.location.hash === '#kitchen') {
      closeKitchenSubPage(false);
    } else if (window.location.hash !== '#kitchen-customers' && window.location.hash !== '#kitchen-payments') {
      exitKitchenMode(false);
    }
  }
});

// ==========================================================================
// 14. LIVE KITCHEN ORDER LISTENER (v43)
// ==========================================================================
function listenForKitchenOrders() {
  if (!db) return;
  const ordersContainer = document.getElementById('kitchen-orders-container');
  
  db.ref('orders').on('value', (snapshot) => {
    if (!ordersContainer) return;
    ordersContainer.innerHTML = '';

    const orders = snapshot.val();
    if (!orders) {
      ordersContainer.innerHTML = `<p style="text-align:center; padding:20px; color:#666;">No active incoming orders.</p>`;
      return;
    }

    const ordersArray = Object.keys(orders).map(key => ({
      firebaseKey: key,
      ...orders[key]
    }));
    ordersArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    ordersArray.forEach((order) => {
      const card = document.createElement('div');
      card.className = 'order-card';
      
      const itemsListHtml = order.items
        .map(i => `<p style="margin: 4px 0;"><strong>${i.quantity}x</strong> ${i.name}</p>`)
        .join('');

      const statusColors = {
        PENDING: '#EF6C00',
        ACCEPTED: '#2E7D32',
        DENIED: '#C62828',
        COMPLETED: '#1565C0'
      };
      const statusColor = statusColors[order.status] || '#FF4B3A';

      const actionButtonsHtml = (order.status === 'PENDING')
        ? `<button class="btn-action btn-accept" onclick="acceptOrder('${order.firebaseKey}')">Accept</button>
           <button class="btn-action btn-deny" onclick="denyOrder('${order.firebaseKey}')">Deny</button>`
        : `<button class="btn-action btn-complete" onclick="completeOrder('${order.firebaseKey}')">Complete</button>`;

      card.innerHTML = `
        <div class="order-header">
          <div>
            <div style="font-size: 1.05rem;">Order #${order.orderId}</div>
            <div style="font-size: 0.85rem; color: #444; margin-top: 3px; font-weight: 500;">
              👤 <strong>${order.customerName || 'Guest'}</strong> (${order.customerMobile || 'N/A'})
            </div>
          </div>
          <span style="color: ${statusColor}; font-weight: 700;">${order.status}</span>
        </div>
        <div class="order-body" style="margin: 6px 0 12px 0;">
          ${itemsListHtml}
          <p style="margin-top: 8px; font-weight: bold;">Total: ₹${order.total}</p>
        </div>
        <div class="order-actions">
          ${actionButtonsHtml}
        </div>
      `;

      ordersContainer.appendChild(card);
    });
  });
}

// ==========================================================================
// 15. ORDER ACTIONS (ACCEPT, DENY & COMPLETE)
// ==========================================================================
function acceptOrder(firebaseKey) {
  if (!db) return;
  db.ref(`orders/${firebaseKey}`).update({
    status: 'ACCEPTED'
  }).catch((error) => {
    console.error("Error accepting order:", error);
    alert("Could not update order status.");
  });
}

function denyOrder(firebaseKey) {
  if (!db) return;
  if (confirm("Deny this order? The customer will see that their order was declined.")) {
    db.ref(`orders/${firebaseKey}`).update({
      status: 'DENIED'
    }).then(() => {
      setTimeout(() => {
        db.ref(`orders/${firebaseKey}`).remove();
      }, 2000);
    }).catch((error) => {
      console.error("Error denying order:", error);
      alert("Could not update order status.");
    });
  }
}

function completeOrder(firebaseKey) {
  if (!db) return;
  if (confirm("Mark this order as complete? It will be permanently removed from active orders.")) {
    db.ref(`orders/${firebaseKey}`).remove()
      .then(() => {
        console.log(`Order ${firebaseKey} permanently deleted.`);
      })
      .catch((error) => {
        console.error("Error completing order:", error);
        alert("Could not remove completed order.");
      });
  }
}

// ==========================================================================
// 16. INITIALIZE APP & ENFORCE STANDALONE GATE ON DOM READY
// ==========================================================================
function initFoodiesPoint() {
  enforceInstallGate();
  checkDaily6PMReset();
  listenForCustomerLiveMenu();
  renderCustomerOrderHistory();
  listenForCustomerOrderUpdates();

  setInterval(() => {
    checkDaily6PMReset();
    if (!isKitchenMode && latestFirebaseMenuSnapshot) {
      renderCustomerMenuFromSnapshot(latestFirebaseMenuSnapshot);
    }
  }, 30000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFoodiesPoint);
} else {
  initFoodiesPoint();
}
