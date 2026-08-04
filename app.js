// ==========================================================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION (Protected with Try/Catch)
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
  console.log("[Firebase] Initialized successfully.");
} catch (error) {
  console.error("[Firebase] Initialization error:", error);
}

// ==========================================================================
// 2. ONESIGNAL PUSH NOTIFICATION SETUP (Protected with Try/Catch)
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
  console.error("[OneSignal] Initialization error:", error);
}

// ==========================================================================
// 3. SERVICE WORKER REGISTRATION (LOCKED TO /foodies-point-beta/)
// ==========================================================================
let swRegistration = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/foodies-point-beta/sw.js?v=03', {
      scope: '/foodies-point-beta/'
    })
    .then((reg) => {
      console.log('[SW v02] Registered successfully with scope:', reg.scope);
      swRegistration = reg;
    })
    .catch((err) => {
      console.error('[SW v02] Registration failed:', err);
    });
  });
}

// ==========================================================================
// 4. PWA MANUAL UPDATE ENGINE (↻ Update Button)
// ==========================================================================
function manualAppUpdate() {
  console.log('[PWA] Checking for updates...');
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
// 5. CUSTOMER MENU & QUANTITY STEPPER (MAX 10 CAP)
// ==========================================================================
const MENU_ITEMS = [
  { id: 'dish-001', name: 'Paneer Butter Masala', price: 220 },
  { id: 'dish-002', name: 'Butter Naan', price: 40 },
  { id: 'dish-003', name: 'Chicken Biryani', price: 280 },
  { id: 'dish-004', name: 'Veg Hakka Noodles', price: 160 }
];

const cart = {};

function renderMenu() {
  const container = document.getElementById('menu-list-container');
  if (!container) return;

  container.innerHTML = '';
  MENU_ITEMS.forEach((dish) => {
    cart[dish.id] = cart[dish.id] || 0;

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
  });
  console.log("[Menu] Rendered successfully.");
}

function updateQuantity(dishId, change) {
  const currentQty = cart[dishId] || 0;
  let newQty = currentQty + change;

  if (newQty < 0) newQty = 0;
  if (newQty > 10) {
    alert("You can order a maximum of 10 items per dish.");
    newQty = 10;
  }

  cart[dishId] = newQty;
  const qtySpan = document.getElementById(`qty-${dishId}`);
  if (qtySpan) {
    qtySpan.textContent = newQty;
  }
}

// ==========================================================================
// 6. ORDER SUBMISSION TO FIREBASE
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
      renderMenu();
    })
    .catch((error) => {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please check your internet connection.");
    });
}

// ==========================================================================
// 7. KITCHEN CONSOLE SECURITY PIN LOGIC (With Session Caching)
// ==========================================================================
const KITCHEN_PIN = "validatefoodies2026";

function openKitchenPINModal() {
  // If already authenticated during this session, bypass the PIN modal
  if (sessionStorage.getItem('fp_kitchen_auth') === 'true') {
    enterKitchenMode();
    return;
  }
  document.getElementById('pin-modal').style.display = 'flex';
  document.getElementById('kitchen-pin-input').value = '';
}

function closePINModal() {
  document.getElementById('pin-modal').style.display = 'none';
}

function verifyKitchenPIN() {
  const inputPin = document.getElementById('kitchen-pin-input').value;
  if (inputPin === KITCHEN_PIN) {
    // Save authentication state in browser session
    sessionStorage.setItem('fp_kitchen_auth', 'true');
    closePINModal();
    enterKitchenMode();
  } else {
    alert("Incorrect PIN. Access denied.");
  }
}

function enterKitchenMode() {
  document.getElementById('customer-view').style.display = 'none';
  document.getElementById('checkout-bar').style.display = 'none';
  document.getElementById('kitchen-view').style.display = 'block';
  
  // Hide the "Kitchen" button in the header while inside Kitchen Console
  const headerBtn = document.getElementById('header-kitchen-btn');
  if (headerBtn) headerBtn.style.display = 'none';

  listenForKitchenOrders();
}

function exitKitchenMode() {
  document.getElementById('kitchen-view').style.display = 'none';
  document.getElementById('customer-view').style.display = 'block';
  document.getElementById('checkout-bar').style.display = 'flex';
  
  // Restore the "Kitchen" button in the header
  const headerBtn = document.getElementById('header-kitchen-btn');
  if (headerBtn) headerBtn.style.display = 'inline-block';

  if (db) db.ref('orders').off();
}

// ==========================================================================
// 8. LIVE KITCHEN ORDER LISTENER (NO ARCHIVING INCLUDED)
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
// 9. ORDER ACTIONS (ONLY ACCEPT AND PERMANENT COMPLETE)
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
// 10. INITIALIZE APP ON DOM READY (Foolproof Menu Rendering)
// ==========================================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderMenu);
} else {
  renderMenu();
}
