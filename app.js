// ==========================================================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyD...YOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// ==========================================================================
// 2. ONESIGNAL PUSH NOTIFICATION SETUP
// ==========================================================================
window.OneSignal = window.OneSignal || [];
OneSignal.push(function() {
  OneSignal.init({
    appId: "YOUR_ONESIGNAL_APP_ID_HERE",
    allowLocalhostAsSecureOrigin: true,
    notifyButton: {
      enable: false
    }
  });
});

// ==========================================================================
// 3. SERVICE WORKER REGISTRATION (LOCKED TO /foodies-point-beta/)
// ==========================================================================
let swRegistration = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/foodies-point-beta/sw.js?v=02', {
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
        console.log('[PWA] New worker waiting. Sending SKIP_WAITING...');
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      // Force page reload to grab clean v02 files
      window.location.reload(true);
    });
  } else {
    // Fallback if SW wasn't ready
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

const cart = {}; // Stores item quantities: { 'dish-001': 2 }

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
}

function updateQuantity(dishId, change) {
  const currentQty = cart[dishId] || 0;
  let newQty = currentQty + change;

  // Enforce limits: minimum 0, maximum 10 per dish
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
      // Reset cart quantities
      MENU_ITEMS.forEach((dish) => { cart[dish.id] = 0; });
      renderMenu();
    })
    .catch((error) => {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please check your internet connection.");
    });
}

// ==========================================================================
// 7. KITCHEN CONSOLE SECURITY PIN LOGIC
// ==========================================================================
const KITCHEN_PIN = "validatefoodies2026";

function openKitchenPINModal() {
  document.getElementById('pin-modal').style.display = 'flex';
  document.getElementById('kitchen-pin-input').value = '';
}

function closePINModal() {
  document.getElementById('pin-modal').style.display = 'none';
}

function verifyKitchenPIN() {
  const inputPin = document.getElementById('kitchen-pin-input').value;
  if (inputPin === KITCHEN_PIN) {
    closePINModal();
    enterKitchenMode();
  } else {
    alert("Incorrect PIN. Access denied.");
  }
}

function enterKitchenMode() {
  document.getElementById('customer-view').style.display = 'none';
  document.getElementById('kitchen-view').style.display = 'block';
  listenForKitchenOrders();
}

function exitKitchenMode() {
  document.getElementById('kitchen-view').style.display = 'none';
  document.getElementById('customer-view').style.display = 'block';
  // Stop listening to save data when back in customer view
  db.ref('orders').off();
}

// ==========================================================================
// 8. LIVE KITCHEN ORDER LISTENER (NO ARCHIVING INCLUDED)
// ==========================================================================
function listenForKitchenOrders() {
  const ordersContainer = document.getElementById('kitchen-orders-container');
  
  db.ref('orders').on('value', (snapshot) => {
    if (!ordersContainer) return;
    ordersContainer.innerHTML = '';

    const orders = snapshot.val();
    if (!orders) {
      ordersContainer.innerHTML = `<p style="text-align:center; padding:20px; color:#666;">No active incoming orders.</p>`;
      return;
    }

    // Convert object to array and sort newest first
    const ordersArray = Object.keys(orders).map(key => ({
      firebaseKey: key,
      ...orders[key]
    }));
    ordersArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    ordersArray.forEach((order) => {
      const card = document.createElement('div');
      card.className = 'order-card';
      
      // Generate items list text
      const itemsListHtml = order.items
        .map(i => `<p style="margin: 4px 0;"><strong>${i.quantity}x</strong> ${i.name}</p>`)
        .join('');

      // ONLY Accept and Complete buttons are rendered - Archive button is removed
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

// Mark order as accepted in Firebase
function acceptOrder(firebaseKey) {
  db.ref(`orders/${firebaseKey}`).update({
    status: 'ACCEPTED'
  }).catch((error) => {
    console.error("Error accepting order:", error);
    alert("Could not update order status.");
  });
}

// Permanently delete order from Firebase (NO ARCHIVE SAVED)
function completeOrder(firebaseKey) {
  if (confirm("Mark this order as complete? It will be permanently removed from active orders.")) {
    // Simply remove from the orders node. Nothing is saved to any archive/history node.
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
// 10. INITIALIZE APP ON DOM READY
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
});
