// ==========================================================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION (v10)
// ==========================================================================
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
  console.log("[Firebase v10] Initialized successfully.");
} catch (error) {
  console.error("[Firebase v10] Initialization error:", error);
}

// ==========================================================================
// 2. ONESIGNAL PUSH NOTIFICATION SETUP
// ==========================================================================
try {
  window.OneSignal = window.OneSignal || [];
  OneSignal.push(function() {
    OneSignal.init({
      appId: "YOUR_ONESIGNAL_APP_ID_HERE",
      allowLocalhostAsSecureOrigin: true,
      notifyButton: { enable: false }
    });
  });
} catch (error) {
  console.error("[OneSignal v10] Initialization error:", error);
}

// ==========================================================================
// 3. SERVICE WORKER REGISTRATION (v10 - LOCKED TO /foodies-point-beta/)
// ==========================================================================
let swRegistration = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/foodies-point-beta/sw.js?v=10', {
      scope: '/foodies-point-beta/'
    })
    .then((reg) => {
      console.log('[SW v10] Registered successfully with scope:', reg.scope);
      swRegistration = reg;
    })
    .catch((err) => {
      console.error('[SW v10] Registration failed:', err);
    });
  });
}

// ==========================================================================
// 4. PWA MANUAL UPDATE ENGINE (↻ Update v10 Button)
// ==========================================================================
function manualAppUpdate() {
  console.log('[PWA v10] Checking for updates...');
  if (swRegistration) {
    swRegistration.update().then(() => {
      if (swRegistration.waiting) {
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload(true);
    });
  } else {
    window.location.reload(true);
  }
}

// ==========================================================================
// 5. INVERTED STANDALONE DETECTION & GATE ENGINE (v10)
// ==========================================================================
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  
  const installBtn = document.getElementById('btn-native-install');
  if (installBtn) {
    installBtn.style.display = 'block';
    installBtn.onclick = () => {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA v10] User accepted installation prompt.');
        }
        deferredInstallPrompt = null;
      });
    };
  }
});

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

  // ONLY unlock if running from an installed home-screen app icon
  if (isStandalonePWA()) {
    if (installGate) installGate.style.setProperty('display', 'none', 'important');
    if (appContent) appContent.style.setProperty('display', 'block', 'important');
    console.log("[PWA v10] Standalone PWA mode verified. Application unlocked.");
  } else {
    console.log("[PWA v10] Running in web browser. Irremovable Install Gate remains locked.");
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

// ==========================================================================
// 7. RENDER KITCHEN MENU (Unchecked by Default + Checked Move to Top)
// ==========================================================================
function renderKitchenMenu(activeIds = null) {
  const container = document.getElementById('kitchen-menu-container');
  if (!container) return;

  if (activeIds) {
    kitchenCheckedState = { ...activeIds };
  }

  container.innerHTML = '';
  const categories = [...new Set(MENU_ITEMS.map(item => item.category))];

  categories.forEach((cat) => {
    const catItems = MENU_ITEMS.filter(item => item.category === cat);

    // Checked items automatically sort to the top of their category
    catItems.sort((a, b) => {
      const aChecked = !!kitchenCheckedState[a.id];
      const bChecked = !!kitchenCheckedState[b.id];
      if (aChecked === bChecked) return 0;
      return aChecked ? -1 : 1;
    });

    const categoryHeader = document.createElement('h3');
    categoryHeader.style.cssText = "margin: 18px 0 6px 0; font-size: 1rem; color: #FF4B3A; border-bottom: 2px solid #EAEAEA; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;";
    categoryHeader.textContent = cat;
    container.appendChild(categoryHeader);

    catItems.forEach((dish) => {
      const isChecked = !!kitchenCheckedState[dish.id];

      const card = document.createElement('div');
      card.className = 'menu-card';
      card.setAttribute('data-item-id', dish.id);
      card.innerHTML = `
        <div class="dish-select-area">
          <input type="checkbox" class="dish-checkbox" id="chk-${dish.id}" ${isChecked ? 'checked' : ''} onchange="toggleKitchenItem('${dish.id}', this.checked)">
          <div class="dish-info">
            <h4>${dish.name}</h4>
            <div class="price">₹${dish.price}</div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  });

  console.log("[Kitchen v10] Rendered menu with checked items sorted to top.");
}

function toggleKitchenItem(dishId, isChecked) {
  if (isChecked) {
    kitchenCheckedState[dishId] = true;
  } else {
    delete kitchenCheckedState[dishId];
  }
  renderKitchenMenu();
}

// ==========================================================================
// 8. PUBLISH DAILY LIVE MENU TO FIREBASE
// ==========================================================================
function publishDailyMenu() {
  if (!db) {
    alert("Database connection is not ready. Please refresh the page.");
    return;
  }

  const selectedCount = Object.keys(kitchenCheckedState).length;

  if (selectedCount === 0) {
    alert("Please select at least one item to publish on today's live menu.");
    return;
  }

  db.ref('dailyMenu').set(kitchenCheckedState)
    .then(() => {
      alert(`Daily Live Menu published successfully! (${selectedCount} items live for customers)`);
      console.log(`[v10] Published dailyMenu to Firebase.`);
    })
    .catch((error) => {
      console.error("Error publishing menu:", error);
      alert("Failed to publish daily menu. Please check your network connection.");
    });
}

// ==========================================================================
// 9. CUSTOMER LIVE MENU LISTENER (Shows ONLY Published Items)
// ==========================================================================
function listenForCustomerLiveMenu() {
  if (!db) return;
  const container = document.getElementById('customer-menu-container');
  if (!container) return;

  db.ref('dailyMenu').on('value', (snapshot) => {
    const activeIds = snapshot.val();
    container.innerHTML = '';

    if (!activeIds || Object.keys(activeIds).length === 0) {
      container.innerHTML = `<p style="text-align:center; padding: 40px 20px; color:#666;">The kitchen is preparing today's live menu. Please check back shortly!</p>`;
      return;
    }

    let currentCategory = '';
    let renderedCount = 0;

    MENU_ITEMS.forEach((dish) => {
      if (activeIds[dish.id]) {
        renderedCount++;
        cart[dish.id] = cart[dish.id] || 0;

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
        card.innerHTML = `
          <div class="dish-info">
            <h4>${dish.name}</h4>
            <div class="price">₹${dish.price}</div>
          </div>
          <div class="quantity-stepper">
            <button type="button" aria-label="Decrease quantity" onclick="updateQuantity('${dish.id}', -1)">−</button>
            <span id="qty-${dish.id}">${cart[dish.id]}</span>
            <button type="button" aria-label="Increase quantity" onclick="updateQuantity('${dish.id}', 1)">+</button>
          </div>
        `;
        container.appendChild(card);
      }
    });

    console.log(`[Customer v10] Displaying ${renderedCount} live published menu items.`);
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
// 10. ORDER SUBMISSION TO FIREBASE (Customer Checkout)
// ==========================================================================
function placeOrder() {
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

  const newOrderRef = db.ref('orders').push();
  const orderData = {
    orderId: newOrderRef.key.slice(-4).toUpperCase(),
    items: orderItems,
    total: totalAmount,
    status: 'PENDING',
    timestamp: firebase.database.ServerValue.TIMESTAMP
  };

  newOrderRef.set(orderData)
    .then(() => {
      alert(`Order placed successfully! Your Order ID is #${orderData.orderId}`);
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

// ==========================================================================
// 11. KITCHEN CONSOLE SECURITY PASSCODE LOGIC (With Eye Toggle)
// ==========================================================================
const KITCHEN_PIN = "validatefoodies2026";

function openKitchenPINModal() {
  if (sessionStorage.getItem('fp_kitchen_auth') === 'true') {
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
    sessionStorage.setItem('fp_kitchen_auth', 'true');
    closePINModal();
    enterKitchenMode();
  } else {
    alert("Incorrect passcode. Access denied.");
  }
}

function enterKitchenMode() {
  document.getElementById('customer-view').style.display = 'none';
  document.getElementById('checkout-bar').style.display = 'none';
  document.getElementById('kitchen-view').style.display = 'block';
  
  const headerBtn = document.getElementById('header-kitchen-btn');
  if (headerBtn) headerBtn.style.display = 'none';

  if (db) {
    db.ref('dailyMenu').once('value')
      .then((snap) => renderKitchenMenu(snap.val()))
      .catch(() => renderKitchenMenu(null));
  } else {
    renderKitchenMenu(null);
  }

  listenForKitchenOrders();
}

function exitKitchenMode() {
  document.getElementById('kitchen-view').style.display = 'none';
  document.getElementById('customer-view').style.display = 'block';
  document.getElementById('checkout-bar').style.display = 'flex';
  
  const headerBtn = document.getElementById('header-kitchen-btn');
  if (headerBtn) headerBtn.style.display = 'inline-block';

  if (db) db.ref('orders').off();
}

// ==========================================================================
// 12. LIVE KITCHEN ORDER LISTENER (ONLY Accept & Complete - NO Archive)
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

      card.innerHTML = `
        <div class="order-header">
          <span>Order #${order.orderId}</span>
          <span style="color: ${order.status === 'ACCEPTED' ? '#2E7D32' : '#FF4B3A'};">${order.status}</span>
        </div>
        <div class="order-body" style="margin-bottom: 12px;">
          ${itemsListHtml}
          <p style="margin-top: 8px; font-weight: bold;">Total: ₹${order.total}</p>
        </div>
        <div class="order-actions">
          ${
            order.status === 'PENDING'
              ? `<button class="btn-action btn-accept" onclick="acceptOrder('${order.firebaseKey}')">Accept</button>`
              : ''
          }
          <button class="btn-action btn-complete" onclick="completeOrder('${order.firebaseKey}')">Complete</button>
        </div>
      `;

      ordersContainer.appendChild(card);
    });
  });
}

// ==========================================================================
// 13. ORDER ACTIONS (ONLY ACCEPT AND PERMANENT COMPLETE)
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
// 14. INITIALIZE APP & ENFORCE INVERTED INSTALL GATE ON DOM READY
// ==========================================================================
function initFoodiesPoint() {
  enforceInstallGate();
  listenForCustomerLiveMenu();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFoodiesPoint);
} else {
  initFoodiesPoint();
}
