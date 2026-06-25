// ==========================================================================
// 1. GLOBAL CONFIGURATIONS & DOM ELEMENTS (VERSION 67)
// ==========================================================================
let deferredPrompt = null;
let cart = [];
let isConsoleViewActive = false;
let currentLiveMenuArray = []; 
let pendingLiveArray = [];     
let currentUserUid = null;
let cloudTrackedOrders = [];

const ROUTING_SECRET_PIN = "validatefoodies2026"; 

const pwaModal = document.getElementById('pwa-modal');
const pwaOverlay = document.getElementById('pwa-overlay');
const notifModal = document.getElementById('notification-modal');
const notifOverlay = document.getElementById('notification-overlay');
const body = document.body;
const updateSplash = document.getElementById('update-splash');
const splashText = document.getElementById('splash-text');
const menuContainer = document.getElementById('menu-container');
const cartBtn = document.getElementById('cart-btn');

// ==========================================================================
// 🚀 2. CORE FIREBASE ENGINE (MUST LOAD FIRST)
// ==========================================================================
const firebaseConfig = { databaseURL: "https://foodiespoint-6760-default-rtdb.asia-southeast1.firebasedatabase.app/" };
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth(); 

auth.onAuthStateChanged((user) => { 
    if (user) { 
        currentUserUid = user.uid; 
        initializeCloudDataSync(); 
    } else { 
        auth.signInAnonymously().catch(err => console.error("Firebase Auth Error:", err)); 
    } 
});

function initializeCloudDataSync() {
    if(!currentUserUid) return;
    database.ref(`users/${currentUserUid}/tracked_orders`).on('value', (snapshot) => {
        cloudTrackedOrders = []; 
        snapshot.forEach((child) => { cloudTrackedOrders.push(child.val()); });
        renderOrderHistory(); 
    });
}

// ==========================================================================
// 3. MASTER CATALOG DATA CONTAINER
// ==========================================================================
const MASTER_MENU = [
    { id: "roll_1", title: "Dahi Bread Roll", details: "15/- per pc.", category: "ROLLS" },
    { id: "roll_2", title: "Bread Roll", details: "80/- per plate (8 pc.)", category: "ROLLS" },
    { id: "roll_3", title: "Spring Roll", details: "25/- per pc.", category: "ROLLS" },
    { id: "roll_4", title: "Veg Kebab Roll", details: "20/- per pc.", category: "ROLLS" },
    { id: "roll_5", title: "Paneer Roll", details: "45/- per pc.", category: "ROLLS" },
    { id: "roll_6", title: "Egg Mayonaise & Cheese Mix Roll", details: "50/- per pc.", category: "ROLLS" },
    { id: "roll_7", title: "Egg Mayonaise Roll", details: "40/- per pc.", category: "ROLLS" },
    { id: "roll_8", title: "Egg Roll", details: "35/- per pc.", category: "ROLLS" },
    { id: "roll_9", title: "Chicken Roll", details: "55/- pr pc.", category: "ROLLS" },
    { id: "roll_10", title: "Chicken Mayonaise Roll", details: "60/- per pc.", category: "ROLLS" },
    { id: "roll_11", title: "Chicken Egg Roll", details: "70/- per pc.", category: "ROLLS" },
    { id: "roll_12", title: "Chicken Egg Mayonaise Roll", details: "75/-", category: "ROLLS" },
    { id: "pak_1", title: "Pyaaz ki Pakodi", details: "60 (250gm)", category: "PAKODI" },
    { id: "pak_2", title: "Paalak ki pakodi", details: "60 (250gm)", category: "PAKODI" },
    { id: "pak_3", title: "Gobhi ki pajkodi", details: "60 (250gm)", category: "PAKODI" },
    { id: "pak_4", title: "Mirch ki pakodi", details: "15 per pc.", category: "PAKODI" },
    { id: "pak_5", title: "Bread Pakoda", details: "20/- per pc.", category: "PAKODI" },
    { id: "pak_6", title: "Egg pakodi", details: "10/- per pc", category: "PAKODI" },
    { id: "pak_7", title: "Moong daal ke mongode", details: "75 (250gm)", category: "PAKODI" },
    { id: "sand_1", title: "Veg Grilled Mayonaise Sandwich", details: "55/- (2 pc)", category: "SANDWICH" },
    { id: "sand_2", title: "Veg Cheese Sandwich", details: "60/- (2 pc)", category: "SANDWICH" },
    { id: "sand_3", title: "Veg Sandwich", details: "18/- per pc", category: "SANDWICH" },
    { id: "snack_1", title: "Chocolate Croissant", details: "48 per pc", category: "SNACKS" },
    { id: "snack_2", title: "Zingy Parcel (Paneer)", details: "60 per pc", category: "SNACKS" },
    { id: "snack_3", title: "Pizza Puff", details: "18 per pc", category: "SNACKS" },
    { id: "snack_4", title: "Mini Pizza", details: "45 per pc", category: "SNACKS" },
    { id: "snack_5", title: "Veg Burger", details: "50 per pc", category: "SNACKS" },
    { id: "snack_6", title: "Aloo Patty", details: "17 per pc", category: "SNACKS" },
    { id: "snack_7", title: "Paneer Patty", details: "25 per pc", category: "SNACKS" },
    { id: "snack_8", title: "Veg Appe", details: "65 per plate", category: "SNACKS" },
    { id: "snack_9", title: "Phare", details: "70 250gm", category: "SNACKS" },
    { id: "snack_10", title: "Veg Masala Idli", details: "45 per plate", category: "SNACKS" },
    { id: "snack_11", title: "Fried Idli", details: "50 per plate", category: "SNACKS" },
    { id: "snack_12", title: "Poha", details: "80 per plate", category: "SNACKS" },
    { id: "snack_13", title: "Stuffed Mushroom", details: "65 per plate (4 pc)", category: "SNACKS" },
    { id: "snack_14", title: "Aloo Bonda", details: "12 per pc", category: "SNACKS" },
    { id: "snack_15", title: "Vada Pav", details: "25 per pc", category: "SNACKS" },
    { id: "snack_16", title: "Cheese Balls", details: "80 per plate (8 pc)", category: "SNACKS" },
    { id: "snack_17", title: "Masala Vada", details: "80 per plate (8 pc)", category: "SNACKS" },
    { id: "snack_18", title: "Falafel Mushakkal Veg. Roll", details: "40", category: "SNACKS" },
    { id: "snack_19", title: "Pani Poori", details: "15 (5 pc)", category: "SNACKS" },
    { id: "snack_20", title: "Tikki Chaat", details: "55 per plate", category: "SNACKS" },
    { id: "snack_21", title: "Dahi vada", details: "60 per plate (4pc)", category: "SNACKS" },
    { id: "snack_22", title: "Raj Kachori", details: "85 per plate", category: "SNACKS" },
    { id: "snack_23", title: "Samosa", details: "12 per pc", category: "SNACKS" },
    { id: "snack_24", title: "Paneer Tikka", details: "240 per plate", category: "SNACKS" },
    { id: "snack_25", title: "Paneer Malai Tikka", details: "260 per plate", category: "SNACKS" },
    { id: "chin_1", title: "Honey Chilli Potato", details: "90 per plate", category: "CHINESE" },
    { id: "chin_2", title: "Chowmein", details: "80 per plate", category: "CHINESE" },
    { id: "chin_3", title: "Macaroni", details: "80 per plate", category: "CHINESE" },
    { id: "chin_4", title: "Fried Rice", details: "80 per plate", category: "CHINESE" },
    { id: "chin_5", title: "Veg Manchurian", details: "80 pr plate", category: "CHINESE" },
    { id: "chin_6", title: "Paneer Manchurian", details: "160 per plate", category: "CHINESE" },
    { id: "chin_7", title: "Chilli Paneer", details: "140 per plate", category: "CHINESE" },
    { id: "chin_8", title: "Veg momos", details: "55 per plate (10 pc)", category: "CHINESE" },
    { id: "chin_9", title: "Paneer momos", details: "75 per plate (10 pc)", category: "CHINESE" },
    { id: "chin_10", title: "Chicken momos", details: "100 per plate (10 pc)", category: "CHINESE" },
    { id: "chin_11", title: "White Pasta", details: "100 per plate", category: "CHINESE" },
    { id: "keb_1", title: "Veg. Seekh Kebab", details: "15 per pc", category: "KEBEBS" },
    { id: "keb_2", title: "Veg Kebab", details: "17 per pc", category: "KEBEBS" },
    { id: "keb_3", title: "Dahi ke kebab", details: "25 per pc", category: "KEBEBS" },
    { id: "keb_4", title: "Hariyali kebab", details: "25 per pc", category: "KEBEBS" },
    { id: "cake_1", title: "Tutti Frutti Cup Cake", details: "18 per pc", category: "CAKE (Egg-Less)" },
    { id: "cake_2", title: "Chocolate Cup Cake", details: "20 per pc", category: "CAKE (Egg-Less)" },
    { id: "cake_3", title: "Chocolava Cup Cake", details: "38 per pc", category: "CAKE (Egg-Less)" },
    { id: "shake_1", title: "Mango Shake", details: "30", category: "SHAKES" },
    { id: "shake_2", title: "Lassi", details: "45", category: "SHAKES" },
    { id: "shake_3", title: "Panna", details: "12", category: "SHAKES" },
    { id: "trad_1", title: "Chokha Baati", details: "50 per plate (2 pc)", category: "COMBOS" },
    { id: "trad_2", title: "Chole Aloo Kulche", details: "70 per plate", category: "COMBOS" },
    { id: "trad_3", title: "Chole Bhature", details: "60 per plate", category: "COMBOS" },
    { id: "trad_4", title: "Khasta Aloo Matar", details: "55 per plate (2 pc)", category: "COMBOS" },
    { id: "trad_5", title: "Sambhar Vada", details: "55 per plate (4 pc)", category: "COMBOS" },
    { id: "trad_6", title: "Idli Sambhar", details: "55 per plate (4 pc)", category: "COMBOS" },
    { id: "trad_7", title: "Pav Bhaaji", details: "60 per plate", category: "COMBOS" },
    { id: "sweet_1", title: "Gulab Jamun", details: "20", category: "SWEETS" },
    { id: "sweet_2", title: "Kheer", details: "80", category: "SWEETS" },
    { id: "sweet_3", title: "Sweet Rice", details: "90", category: "SWEETS" },
    { id: "sweet_4", title: "Shrikhand", details: "85 (250 gm)", category: "SWEETS" },
    { id: "sabzi_1", title: "Shaahi Paneer", details: "300", category: "SABZI" },
    { id: "sabzi_2", title: "Paneer Masala", details: "220", category: "SABZI" },
    { id: "sabzi_3", title: "Paneer Angara", details: "280", category: "SABZI" },
    { id: "sabzi_4", title: "Paneer Korma", details: "Price on request", category: "SABZI" },
    { id: "sabzi_5", title: "Palak Paneer", details: "200", category: "SABZI" },
    { id: "sabzi_6", title: "Matar Paneer", details: "200", category: "SABZI" },
    { id: "nv_1", title: "Chichen Afghani", details: "500", category: "NON-VEG" },
    { id: "nv_2", title: "Roasted Chicken", details: "340", category: "NON-VEG" },
    { id: "nv_3", title: "Chilli Chicken", details: "440", category: "NON-VEG" },
    { id: "nv_4", title: "Egg Curry", details: "75", category: "NON-VEG" },
    { id: "nv_5", title: "Fish Fry (boneless)", details: "180 (250 gm)", category: "NON-VEG" },
    { id: "nv_6", title: "Fish Dry (boneless)", details: "165 (250 gm)", category: "NON-VEG" },
    { id: "nv_7", title: "Chicken Shawarma", details: "90", category: "NON-VEG" },
    { id: "nv_8", title: "Mutton Curry", details: "400", category: "NON-VEG" },
    { id: "nv_9", title: "Mutton Korma", details: "430", category: "NON-VEG" },
    { id: "nv_10", title: "Keema Kaleji", details: "400", category: "NON-VEG" },
    { id: "nv_11", title: "Chicken Curry", details: "360", category: "NON-VEG" },
    { id: "nv_12", title: "Chicken Masala", details: "400", category: "NON-VEG" },
    { id: "nv_13", title: "Butter Chicken", details: "500", category: "NON-VEG" },
    { id: "rice_1", title: "Plain Rice", details: "90", category: "RICE" },
    { id: "rice_2", title: "Jeera Rice", details: "120", category: "RICE" },
    { id: "rice_3", title: "Matar Pulao", details: "140", category: "RICE" },
    { id: "rice_4", title: "Veg. Biryani", details: "180", category: "RICE" }
];

// ==========================================================================
// 4. LINEAR STARTUP SEQUENCE ENGINE 
// ==========================================================================
let minimumSplashTimeMet = false;

setTimeout(() => { 
    minimumSplashTimeMet = true; 
    evaluateStartupSequence(); 
}, 1200);

const splashFailSafeGuard = setTimeout(() => { 
    minimumSplashTimeMet = true; 
    evaluateStartupSequence(); 
}, 4000);

window.addEventListener('beforeinstallprompt', (e) => { 
    e.preventDefault(); 
    deferredPrompt = e; 
});

function evaluateStartupSequence() {
    if (!minimumSplashTimeMet) return;
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    forceDismissSplash();

    // Gate 1: App Installation 
    if (!isStandalone) {
        showStrictInstallModal();
    } 
    // Gate 2: Notifications
    else if ('Notification' in window) {
        if (Notification.permission === 'default') {
            showStrictNotificationModal();
        } else if (Notification.permission === 'denied' && sessionStorage.getItem('notification_reminder_shown') !== 'true') {
            showStrictNotificationModal();
        } else {
            bootApplication();
        }
    } else {
        bootApplication();
    }
}

function forceDismissSplash() {
    clearTimeout(splashFailSafeGuard);
    if (updateSplash) { 
        updateSplash.style.transition = "opacity 0.4s"; 
        updateSplash.style.opacity = "0"; 
        setTimeout(() => { updateSplash.style.display = "none"; }, 400); 
    }
}

// ==========================================================================
// 5. MODAL GATES
// ==========================================================================
function showStrictInstallModal() { 
    if (pwaModal && pwaOverlay) { 
        const okBtn = document.getElementById('pwa-ok-btn');
        if(okBtn) okBtn.onclick = handleInstallClick; 
        pwaModal.style.display = 'flex'; 
        pwaOverlay.style.display = 'block'; 
        body.classList.add('stop-scrolling'); 
    } 
}

function handleInstallClick() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => { 
            if (choiceResult.outcome === 'accepted') { 
                deferredPrompt = null; 
                pwaModal.innerHTML = `<div style="text-align:center;"><div style="font-size:48px; margin-bottom:14px;">✅</div><div style="font-weight:700; font-size:20px; color:#111827; margin-bottom:8px;">App Installed!</div><div style="font-size:14px; color:#6B7280;">Please close this browser tab and launch Foodies Point directly from your home screen.</div></div>`; 
            } 
        });
    } else { 
        alert("To install: Tap your browser's menu (3 dots or Share button), select 'Add to Home Screen', and launch the app from there!"); 
    }
}

function showStrictNotificationModal() {
    if (notifModal && notifOverlay) {
        const descriptionDiv = notifModal.querySelector('div:nth-of-type(3)');
        const actionBtn = document.getElementById('notif-ok-btn');

        if (Notification.permission === 'denied') {
            sessionStorage.setItem('notification_reminder_shown', 'true');
            if(descriptionDiv) {
                descriptionDiv.innerHTML = "Notifications are currently disabled. To receive real-time order tracking alerts, please enable notification access in your device settings.";
            }
            if(actionBtn) {
                actionBtn.innerText = "OK";
                actionBtn.style.backgroundColor = "#FF4B3A";
                actionBtn.onclick = () => { 
                    notifModal.style.display = 'none'; 
                    notifOverlay.style.display = 'none'; 
                    body.classList.remove('stop-scrolling'); 
                    bootApplication(); 
                };
            }
        } else {
            if(descriptionDiv) {
                descriptionDiv.innerHTML = "To track your orders in real-time and receive instant updates from the kitchen, enabling device notifications is mandatory.";
            }
            if(actionBtn) {
                actionBtn.innerText = "OK";
                actionBtn.style.backgroundColor = "#FF4B3A";
                actionBtn.onclick = handleMandatoryPermissionRequest; 
            }
        }

        notifModal.style.display = 'flex'; 
        notifOverlay.style.display = 'block'; 
        body.classList.add('stop-scrolling');
    }
}

function handleMandatoryPermissionRequest() {
    if (!('Notification' in window)) return;
    
    Notification.requestPermission().then((permission) => {
        if (notifModal && notifOverlay) {
            notifModal.style.display = 'none'; 
            notifOverlay.style.display = 'none'; 
            body.classList.remove('stop-scrolling');
        }
        
        if (permission === 'granted') {
            triggerInstantNotification('🍕 Alerts Enabled! Your live tracking is active.', 'success');
        } else {
            sessionStorage.setItem('notification_reminder_shown', 'true');
            triggerInstantNotification('⚠️ Notifications disabled. You will not receive live updates.', 'error');
        }
        
        bootApplication(); 
    }).catch(err => {
        console.error("Native request handler crash:", err);
        if (notifModal && notifOverlay) {
            notifModal.style.display = 'none'; 
            notifOverlay.style.display = 'none'; 
            body.classList.remove('stop-scrolling');
        }
        bootApplication();
    });
}

function triggerInstantNotification(messageText, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? '#EF4444' : (type === 'info' ? '#3B82F6' : '#10B981');
        toast.style.cssText = `background: ${bgColor}; color: white; padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: toastFadeIn 0.3s forwards; pointer-events: auto;`;
        toast.innerText = messageText;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'toastFadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

// ==========================================================================
// 6. MAIN ENGINE BOOT & ONESIGNAL
// ==========================================================================
function bootApplication() {
    window.OneSignal = window.OneSignal || [];
    OneSignal.push(async function() {
        await OneSignal.init({ 
            appId: "ad014d82-5244-4531-bca8-f7acf471d23d", 
            notifyButton: { enable: false }, 
            allowLocalhostAsSecureOrigin: true 
        });
        OneSignal.Notifications.requestPermission();
    });

    initializeCloudDataSync();
    
    setInterval(() => { 
        const currentlyBlackedOut = isKitchenBlackoutActive();
        if (currentlyBlackedOut !== blackoutStateMemory) {
            blackoutStateMemory = currentlyBlackedOut;
            if (currentlyBlackedOut) enforceBlackoutUILayout();
            else renderCustomerMenu();
        } else if (currentlyBlackedOut) {
            enforceBlackoutUILayout();
        }
    }, 5000);
}

// ==========================================================================
// 7. TIMEZONE ENGINE & LIVE MENU CONTROLLER
// ==========================================================================
function isKitchenBlackoutActive() { return false; } 

function enforceBlackoutUILayout() {
    if (isConsoleViewActive) return;
    const historyContainer = document.getElementById('history-container');
    cart = [];
    if (cartBtn) cartBtn.style.display = 'none';
    if (menuContainer) {
        menuContainer.innerHTML = `<div style="text-align: center; padding: 32px 16px; background-color: #FFFFFF; border-radius: 18px; border: 1px dashed #E5E7EB; width: 100%; box-sizing: border-box;"><div style="font-size: 32px; margin-bottom: 8px;">⏰</div><div style="font-weight: 700; font-size: 15px; color: #111827;">Kitchen Closed for Today</div><div style="color: #6B7280; font-size: 13px; margin-top: 4px; line-height: 1.5;">Tomorrow's live menu will be available after 9:30 PM IST.</div></div>`;
    }
}

database.ref('daily_live_menu').on('value', (snapshot) => {
    currentLiveMenuArray = [];
    snapshot.forEach((child) => { currentLiveMenuArray.push(child.val()); });

    if (isKitchenBlackoutActive()) { enforceBlackoutUILayout(); return; }
    if (isConsoleViewActive) return; 
    renderCustomerMenu();
});

function renderCustomerMenu() {
    if (!menuContainer) return;
    menuContainer.innerHTML = ''; 
    if (currentLiveMenuArray.length === 0) {
        menuContainer.innerHTML = '<p style="text-align: center; color: #9CA3AF; margin-top: 20px;">The kitchen has not posted a menu yet today.</p>'; return;
    }

    const todayStr = new Date().toLocaleDateString();
    const lastNotifiedDate = localStorage.getItem('foodies_menu_notified_date');
    if (lastNotifiedDate !== todayStr) {
        triggerInstantNotification('🍽️ Today\'s Menu is Live! Tap here to check what\'s cooking.', 'info');
        localStorage.setItem('foodies_menu_notified_date', todayStr);
    }

    currentLiveMenuArray.forEach((item) => {
        const card = document.createElement('div');
        const isStocked = !item.isOutOfStock;
        const opacitySetting = isStocked ? '1.0' : '0.6';
        
        const badgeHTML = isStocked ? `<span style="background-color: #EEF2F6; color: #4B5563; font-size: 10px; font-weight: 600; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">${item.category}</span>` : `<span style="background-color: #FEE2E2; color: #EF4444; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 6px;">OUT OF STOCK</span>`;
        const actionButtonHTML = isStocked ? `<button onclick="addToCart('${item.id}', '${item.title}', '${item.details}')" style="background-color: #FF4B3A; color: white; padding: 8px 16px; border: none; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer; box-shadow: 0 4px 10px rgba(255, 75, 58, 0.15);">+ Add</button>` : `<button disabled style="background-color: #F3F4F6; color: #9CA3AF; padding: 8px 14px; border: none; border-radius: 10px; font-weight: 500; font-size: 13px;">N/A</button>`;

        card.style.cssText = `background-color: #FFFFFF; padding: 16px; border-radius: 18px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); border: 1px solid #F3F4F6; opacity: ${opacitySetting}; display: flex; justify-content: space-between; align-items: center;`;
        card.innerHTML = `<div style="flex-grow: 1; padding-right: 16px;"><div style="margin-bottom: 6px; display: inline-block;">${badgeHTML}</div><div style="font-size: 16px; font-weight: 600; color: #111827; letter-spacing: -0.3px; margin-top: 2px;">${item.title}</div><div style="color: #6B7280; font-size: 13px; margin-top: 3px; line-height: 1.4;">${item.details}</div></div><div style="flex-shrink: 0;">${actionButtonHTML}</div>`;
        menuContainer.appendChild(card);
    });
}

// ==========================================================================
// 8. CART & CHECKOUT PIPELINE
// ==========================================================================
function addToCart(id, title, details) {
    if (isKitchenBlackoutActive()) return alert("The kitchen is currently closed.");
    const existingItem = cart.find(i => i.id === id);
    if (details.toLowerCase().includes("per plate") && existingItem && existingItem.quantity >= 5) return alert(`⚠️ Order Limit Exceeded!`);
    if (existingItem) existingItem.quantity += 1; else cart.push({ id, title, details, quantity: 1 });
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartBtn) {
        cartBtn.style.display = 'block'; 
        cartBtn.innerText = `View Order (${totalItems} items)`;
    }
}

function openCheckout() {
    if (isKitchenBlackoutActive()) return;
    const checkoutMdl = document.getElementById('checkout-modal');
    if (checkoutMdl) checkoutMdl.style.display = 'flex'; 
    body.classList.add('stop-scrolling'); 
    const summaryDiv = document.getElementById('cart-summary');
    if (summaryDiv) {
        let summaryHTML = '<div style="font-weight: 600; color: #111827; margin-bottom: 8px; font-size: 15px;">Selected Items:</div>';
        cart.forEach(item => { summaryHTML += `<div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>🟢 ${item.title}</span><span style="font-weight: 600; color: #111827;">x${item.quantity}</span></div>`; });
        summaryDiv.innerHTML = summaryHTML;
    }
}

function closeCheckout() { 
    const checkoutMdl = document.getElementById('checkout-modal');
    if (checkoutMdl) checkoutMdl.style.display = 'none'; 
    body.classList.remove('stop-scrolling'); 
}

function submitOrder() {
    if (isKitchenBlackoutActive()) return alert("The kitchen is currently closed for the day.");
    const firstNameEl = document.getElementById('customer-first-name');
    const lastNameEl = document.getElementById('customer-last-name');
    const phoneEl = document.getElementById('customer-phone');

    if (!firstNameEl || !lastNameEl || !phoneEl) return;

    const firstName = firstNameEl.value.trim();
    const lastName = lastNameEl.value.trim();
    const phone = phoneEl.value.trim();

    if (firstName === "" || lastName === "") return alert("Please enter both your First Name and Last Name.");
    if (phone === "" || phone.length !== 10) return alert("Please enter a valid 10-digit mobile number.");
    if (cart.length === 0) return;

    const completeFullName = `${firstName} ${lastName}`;
    const itemSummaryString = cart.map(item => {
        return item.details.toLowerCase().includes("per plate") ? `${item.quantity}x ${item.title} (${item.details})` : `${item.title} (${item.details})`;
    }).join(", ");

    const newOrderRef = database.ref('orders').push();

    let hardwareToken = "NOT_ALLOWED";
    try {
        if (window.OneSignal && OneSignal.User && OneSignal.User.PushSubscription) {
            hardwareToken = OneSignal.User.PushSubscription.id || "NOT_ALLOWED";
        }
    } catch (e) {
        console.warn("Could not handle native hardware token extraction:", e);
    }

    newOrderRef.set({ 
        id: newOrderRef.key, 
        customerName: completeFullName, 
        customerPhone: phone, 
        items: itemSummaryString, 
        status: "PENDING", 
        timestamp: Date.now(), 
        archived: false,
        oneSignalToken: hardwareToken
    }).then(() => {
        if (currentUserUid) {
            database.ref(`users/${currentUserUid}/tracked_orders`).push(newOrderRef.key);
        }
        
        triggerInstantNotification("Order dispatched to the kitchen!", "success");
        cart = []; 
        if (cartBtn) cartBtn.style.display = 'none'; 
        closeCheckout();
        firstNameEl.value = ''; lastNameEl.value = ''; phoneEl.value = '';
    }).catch(() => triggerInstantNotification("Error sending order.", "error"));
}

// ==========================================================================
// 9. CLIENT-SIDE CLOUD ORDER HISTORY
// ==========================================================================
function renderOrderHistory() {
    if (isKitchenBlackoutActive()) return enforceBlackoutUILayout();
    const historyContainer = document.getElementById('history-container');
    if (!historyContainer) return;
    
    if (cloudTrackedOrders.length === 0) { 
        historyContainer.innerHTML = '<p style="text-align: center; color: #9CA3AF; font-size: 13px; margin-top: 12px;">No orders placed today yet.</p>'; return; 
    }
    if (historyContainer.innerHTML.includes("No orders placed today")) { historyContainer.innerHTML = ''; }

    let notifiedStatuses = JSON.parse(localStorage.getItem('foodies_notified_statuses') || '{}');
    
    cloudTrackedOrders.forEach(orderId => {
        database.ref(`orders/${orderId}`).on('value', (snapshot) => {
            if (isKitchenBlackoutActive() || isConsoleViewActive) return; 
            const order = snapshot.val();
            if (!order) return;
            
            let card = document.getElementById(`history-card-${orderId}`);
            let isNew = false;
            if (!card) { card = document.createElement('div'); card.id = `history-card-${orderId}`; isNew = true; }
            
            let statusText = "On Hold"; let badgeColor = "#D97706"; let bgColor = "#FEF3C7";
            const currentStatusKey = `${orderId}_${order.status}`;
            
            if (order.status === "ACCEPTED") { 
                statusText = "Accepted"; badgeColor = "#059669"; bgColor = "#D1FAE5"; 
                if (!notifiedStatuses[currentStatusKey]) {
                    triggerInstantNotification(`✅ Order Accepted! The kitchen is preparing your food.`, 'success');
                    notifiedStatuses[currentStatusKey] = true;
                    localStorage.setItem('foodies_notified_statuses', JSON.stringify(notifiedStatuses));
                }
            } 
            else if (order.status === "REJECTED") { 
                statusText = "Rejected"; badgeColor = "#DC2626"; bgColor = "#FEE2E2"; 
                if (!notifiedStatuses[currentStatusKey]) {
                    triggerInstantNotification(`❌ Order Rejected. Please contact the kitchen.`, 'error');
                    notifiedStatuses[currentStatusKey] = true;
                    localStorage.setItem('foodies_notified_statuses', JSON.stringify(notifiedStatuses));
                }
            } else if (order.status === "HOLD" || order.status === "PENDING") {
                statusText = "On Hold"; badgeColor = "#D97706"; bgColor = "#FEF3C7";
            }
            
            card.style.cssText = `background-color: #F9FAFB; padding: 14px; border-radius: 14px; border: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center;`;
            card.innerHTML = `<div style="flex-grow: 1; padding-right: 12px;"><div style="font-size: 13px; font-weight: 600; color: #111827; line-height: 1.4;">${order.items}</div><div style="font-size: 11px; color: #9CA3AF; margin-top: 4px;">Ordered at ${new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div></div><span style="background-color: ${bgColor}; color: ${badgeColor}; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; white-space: nowrap; letter-spacing: 0.3px;">${statusText}</span>`;
            if (isNew) historyContainer.insertBefore(card, historyContainer.firstChild);
        });
    });
}

// ==========================================================================
// 🚀 10. KITCHEN CONSOLE ENGINE
// ==========================================================================
function authenticateConsoleAccess() {
    if (isConsoleViewActive) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        window.location.reload(); 
        return; 
    } 
    if (localStorage.getItem('foodies_console_authenticated') === 'true') { launchConsoleLayout(); return; }
    
    const overlay = document.getElementById('admin-auth-overlay');
    const modal = document.getElementById('admin-auth-modal');
    const input = document.getElementById('admin-pin-input');

    if (overlay) overlay.style.display = 'block';
    if (modal) modal.style.display = 'flex';
    if (input) { input.value = ''; input.focus(); }
    body.classList.add('stop-scrolling');
}

function closeConsoleAuthModal() {
    const overlay = document.getElementById('admin-auth-overlay');
    const modal = document.getElementById('admin-auth-modal');
    if (overlay) overlay.style.display = 'none';
    if (modal) modal.style.display = 'none';
    body.classList.remove('stop-scrolling');
}

function submitConsolePIN() {
    const input = document.getElementById('admin-pin-input');
    const enteredPassword = input ? input.value : '';
    if (enteredPassword === ROUTING_SECRET_PIN) {
        localStorage.setItem('foodies_console_authenticated', 'true');
        closeConsoleAuthModal(); launchConsoleLayout();
    } else { 
        alert("✕ Authentication Failed."); 
        if (input) input.value = ''; 
    }
}

function launchConsoleLayout() {
    isConsoleViewActive = true;
    
    const customerLayout = document.getElementById('customer-view-layout');
    const kitchenLayout = document.getElementById('kitchen-view-layout');
    const headerTitle = document.getElementById('header-title-text');
    const toggleAction = document.getElementById('view-toggle-action');
    const searchBar = document.getElementById('console-search-bar');
    const inventoryContainer = document.getElementById('kitchen-inventory-container');

    if (customerLayout) customerLayout.style.display = 'none';
    if (cartBtn) cartBtn.style.display = 'none';
    if (kitchenLayout) kitchenLayout.style.display = 'flex';
    if (headerTitle) headerTitle.innerText = "Kitchen Console";
    if (toggleAction) {
        toggleAction.innerText = "Exit";
        toggleAction.style.backgroundColor = "#DC2626";
    }
    if (searchBar) searchBar.value = '';

    if (window.location.hash !== '#console') {
        history.pushState({ view: 'console' }, 'Console', window.location.pathname + window.location.search + '#console');
    }

    initializeKitchenOrderStream();
    
    if (!inventoryContainer) return; 
    inventoryContainer.innerHTML = ''; 
    
    const sortedMenu = [...MASTER_MENU].sort((a, b) => {
        const aLive = currentLiveMenuArray.some(m => m.id === a.id);
        const bLive = currentLiveMenuArray.some(m => m.id === b.id);
        if (aLive && !bLive) return -1;
        if (!aLive && bLive) return 1;
        return 0; 
    });

    sortedMenu.forEach((item) => {
        const gridRow = document.createElement('div');
        gridRow.className = "inventory-row";
        gridRow.setAttribute('data-search', `${item.title.toLowerCase()} ${item.category.toLowerCase()}`);
        gridRow.style.cssText = `background-color: #F9FAFB; padding: 14px; border-radius: 14px; border: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; text-align: left; margin-bottom: 2px;`;

        const liveRec = currentLiveMenuArray.find(m => m.id === item.id);
        const isLive = !!liveRec;
        const isOutOfStock = liveRec ? (liveRec.isOutOfStock === true) : false;

        gridRow.innerHTML = `
            <div style="flex-grow: 1; padding-right: 8px;">
                <div style="font-size: 14px; font-weight: 600; color: #111827;">${item.title}</div>
                <div style="font-size: 11px; color: #6B7280;">${item.category} • ${item.details}</div>
            </div>
            <div style="display: flex; align-items: center; flex-shrink: 0; gap: 12px;">
                <button type="button" id="stock-btn-${item.id}" onclick="toggleLocalStockState(this, '${item.id}')" style="display: ${isLive ? 'block' : 'none'}; background-color: ${isOutOfStock ? '#EF4444' : '#10B981'}; color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; min-width: 95px;">
                    ${isOutOfStock ? 'Out of Stock' : 'In Stock'}
                </button>
                <input type="checkbox" class="console-checkbox" data-id="${item.id}" ${isLive ? 'checked' : ''} onchange="handleCheckboxChange(this, '${item.id}')" style="width: 26px; height: 26px; accent-color: #FF4B3A; cursor: pointer;">
            </div>
        `;
        inventoryContainer.appendChild(gridRow);
    });
}

function filterConsoleMenu() {
    const searchBar = document.getElementById('console-search-bar');
    const query = searchBar ? searchBar.value.toLowerCase() : '';
    const rows = document.querySelectorAll('.inventory-row');
    rows.forEach(row => {
        const searchData = row.getAttribute('data-search');
        if (searchData && searchData.includes(query)) row.style.display = 'flex';
        else row.style.display = 'none';
    });
}

function handleCheckboxChange(chk, itemId) {
    const index = currentLiveMenuArray.findIndex(m => m.id === itemId);
    if (!chk.checked && index !== -1) {
        const targetItem = MASTER_MENU.find(m => m.id === itemId);
        const confirmRemove = confirm(`⚠️ Remove from Live Menu:\n\nRemove "${targetItem.title}" immediately?`);
        if (confirmRemove) {
            currentLiveMenuArray.splice(index, 1);
            database.ref('daily_live_menu').set(currentLiveMenuArray).then(() => { launchConsoleLayout(); });
        } else { chk.checked = true; }
    }
}

function toggleLocalStockState(btnElement, itemId) {
    const index = currentLiveMenuArray.findIndex(m => m.id === itemId);
    if (index !== -1) {
        const isCurrentlyOut = btnElement.innerText === "Out of Stock";
        const newOutState = !isCurrentlyOut;
        
        const targetItem = MASTER_MENU.find(m => m.id === itemId);
        const statusText = newOutState ? "OUT OF STOCK" : "IN STOCK";
        const confirmChange = confirm(`⚠️ Change Stock Status:\n\nAre you sure you want to mark "${targetItem.title}" as ${statusText}?`);
        if (!confirmChange) return; 
        
        database.ref(`daily_live_menu/${index}`).update({ isOutOfStock: newOutState });
        btnElement.innerText = newOutState ? "Out of Stock" : "In Stock";
        btnElement.style.backgroundColor = newOutState ? "#EF4444" : "#10B981";
        currentLiveMenuArray[index].isOutOfStock = newOutState;
    } else { alert("Please Post Menu first before modifying stock."); }
}

function previewSelectedLiveMenu() {
    const previewList = document.getElementById('menu-preview-list');
    if (!previewList) return;
    previewList.innerHTML = '';
    pendingLiveArray = []; 

    const allCheckboxes = document.querySelectorAll('.console-checkbox');
    for (let i = 0; i < allCheckboxes.length; i++) {
        if (allCheckboxes[i].checked === true) {
            const itemId = allCheckboxes[i].getAttribute('data-id');
            const item = MASTER_MENU.find(m => m.id === itemId);
            if (item) {
                const liveRec = currentLiveMenuArray.find(m => m.id === itemId);
                const outOfStock = liveRec ? liveRec.isOutOfStock : false;
                pendingLiveArray.push({ id: item.id, title: item.title, details: item.details, category: item.category, isOutOfStock: outOfStock });

                const line = document.createElement('div');
                line.style.cssText = "font-size: 13px; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 6px;";
                line.innerHTML = `<span>🟢</span> ${item.title} <span style="font-size:10px; font-weight:400; color:#6B7280;">(${item.category})</span>`;
                previewList.appendChild(line);
            }
        }
    }

    if (pendingLiveArray.length === 0) { alert("⚠️ Menu empty:\n\nPlease select at least one item before posting today's menu!"); return; }
    
    const overlay = document.getElementById('menu-confirm-overlay');
    const modal = document.getElementById('menu-confirm-modal');
    if (overlay) overlay.style.display = 'block';
    if (modal) modal.style.display = 'flex';
}

function closeMenuConfirmModal() {
    const overlay = document.getElementById('menu-confirm-overlay');
    const modal = document.getElementById('menu-confirm-modal');
    if (overlay) overlay.style.display = 'none';
    if (modal) modal.style.display = 'none';
}

function publishSelectedLiveMenu() {
    if (pendingLiveArray.length === 0) return;
    database.ref('daily_live_menu').set(pendingLiveArray)
        .then(() => {
            alert(`🚀 Success!\n\n${pendingLiveArray.length} items successfully published.`);
            closeMenuConfirmModal(); launchConsoleLayout(); 
        }).catch((err) => { alert("Error updating live database nodes."); console.error(err); });
}

function initializeKitchenOrderStream() {
    const ordersContainer = document.getElementById('kitchen-orders-container');
    if (!ordersContainer) return; 
    
    let notifiedKitchenOrders = JSON.parse(localStorage.getItem('foodies_kitchen_notified') || '{}');

    database.ref('orders').orderByChild('timestamp').on('value', (snapshot) => {
        if (!isConsoleViewActive) return;
        ordersContainer.innerHTML = '';
        const trackingList = [];
        
        snapshot.forEach((child) => {
            const rawOrder = child.val();
            if (!rawOrder.archived) trackingList.push(rawOrder);
        });

        if (trackingList.length === 0) {
            ordersContainer.innerHTML = '<p style="text-align: center; color: #6B7280; font-size: 13px; margin-top: 20px;">No active orders found today.</p>';
            return;
        }

        trackingList.sort((a, b) => b.timestamp - a.timestamp);
        
        trackingList.forEach((order) => {
            if (order.status === "PENDING" && !notifiedKitchenOrders[order.id]) {
                triggerInstantNotification(`🔔 New Order from ${order.customerName}!`, 'info');
                notifiedKitchenOrders[order.id] = true;
                localStorage.setItem('foodies_kitchen_notified', JSON.stringify(notifiedKitchenOrders));
            }

            const rowItem = document.createElement('div');
            let statusBadgeColor = "#D97706"; let statusLabel = "PENDING";
            if (order.status === "ACCEPTED") { statusBadgeColor = "#10B981"; statusLabel = "ACCEPTED"; }
            if (order.status === "REJECTED") { statusBadgeColor = "#EF4444"; statusLabel = "REJECTED"; }

            let actionButtonsHTML = '';
            if (order.status === "PENDING" || order.status === "HOLD") {
                actionButtonsHTML = `
                    <button onclick="updateTicketStatus('${order.id}', 'ACCEPTED')" style="flex: 1; background-color: #10B981; color: white; border: none; padding: 8px; border-radius: 8px; font-weight: 600; font-size: 11px; cursor: pointer;">✓ Accept</button>
                    <button onclick="updateTicketStatus('${order.id}', 'REJECTED')" style="flex: 1; background-color: #EF4444; color: white; border: none; padding: 8px; border-radius: 8px; font-weight: 600; font-size: 11px; cursor: pointer;">✕ Reject</button>
                `;
            } else {
                actionButtonsHTML = `
                    <div style="flex: 2; display: flex; align-items: center; justify-content: center; background-color: #F3F4F6; color: #9CA3AF; border-radius: 8px; font-weight: 600; font-size: 11px; padding: 8px;">Processed: ${statusLabel}</div>
                `;
            }

            rowItem.style.cssText = `background-color: #FFFFFF; padding: 14px; border-radius: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); border-left: 5px solid ${statusBadgeColor}; display: flex; flex-direction: column; gap: 8px; margin-bottom: 4px; text-align: left;`;
            rowItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div><div style="font-size: 14px; font-weight: 700; color: #111827;">${order.customerName}</div><div style="font-size: 11px; color: #4B5563; font-weight: 500;">📞 ${order.customerPhone}</div></div>
                    <span style="font-size: 10px; font-weight: 700; color: white; background-color: ${statusBadgeColor}; padding: 3px 8px; border-radius: 6px;">${statusLabel}</span>
                </div>
                <div style="font-size: 13px; color: #374151; font-weight: 500; line-height: 1.4; background-color: #F9FAFB; padding: 8px; border-radius: 8px;">${order.items}</div>
                <div style="display: flex; gap: 8px; margin-top: 4px;">
                    ${actionButtonsHTML}
                    <button onclick="archiveTicket('${order.id}')" style="flex: ${order.status === 'PENDING' ? 'initial' : '1'}; background-color: #6B7280; color: white; border: none; padding: 8px 12px; border-radius: 8px; font-weight: 600; font-size: 11px; cursor: pointer;">Archive</button>
                </div>
            `;
            ordersContainer.appendChild(rowItem);
        });
    });
}

function updateTicketStatus(ticketId, targetState) { 
    const doubleCheck = confirm(`Confirm Action:\n\nAre you sure you want to mark this order as ${targetState}?`);
    if(!doubleCheck) return;

    database.ref(`orders/${ticketId}`).once('value').then((snapshot) => {
        const orderData = snapshot.val();
        if (!orderData) return;

        database.ref(`orders/${ticketId}`).update({ status: targetState }); 

        const customerToken = orderData.oneSignalToken;
        if (customerToken && customerToken !== "NOT_ALLOWED") {
            let messageTitle = targetState === "ACCEPTED" ? "✅ Order Accepted!" : "❌ Order Update";
            let messageBody = targetState === "ACCEPTED" 
                ? "The kitchen has verified your ticket and is preparing your food." 
                : "Your order was declined. Please check in with kitchen support.";

            fetch("https://corsproxy.io/?https://api.onesignal.com/notifications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": "Basic os_v2_app_vuau3assirbvdpfi66wpi4oshwmnjoxo5crepuuesz5rn67apboysov2putkhzo52d6wdk6izm2cnn7temdw4rphwc4ljervdun6mia" 
                },
                body: JSON.stringify({
                    app_id: "ad014d82-5244-4531-bca8-f7acf471d23d", 
                    include_subscription_ids: [customerToken], 
                    headings: {"en": messageTitle},
                    contents: {"en": messageBody},
                    priority: 10
                })
            }).then(res => {
                console.log("OneSignal Proxy Delivery Status Payload code:", res.status);
            }).catch(err => console.error("OneSignal Fetch execution failed through proxy:", err));
        }
    });
}

function archiveTicket(ticketId) { database.ref(`orders/${ticketId}`).update({ archived: true }); }

let blackoutStateMemory = isKitchenBlackoutActive();

window.addEventListener('popstate', (event) => {
    if (isConsoleViewActive && window.location.hash !== '#console') {
        isConsoleViewActive = false;
        history.replaceState(null, '', window.location.pathname + window.location.search);
        window.location.reload();
    }
});

// ==========================================================================
// 11. DEVELOPER UTILITY: NUKE DEVICE CACHE SCRIPT
// ==========================================================================
window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js?v=67').then(reg => {
            if (!navigator.serviceWorker.controller) return; 
            reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        if (splashText) splashText.innerHTML = "New update found!<br><span style='color:#FF4B3A; font-size:14px; font-weight:500;'>Installing assets... Please do not close the app.</span>";
                    }
                };
            };
        }).catch(err => console.error("SW Error:", err));
    }
});

let refreshing = false;
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) { refreshing = true; window.location.reload(); }
    });
}

async function nukeAppCache() {
    console.log("Initiating complete site data wipe...");
    localStorage.clear();
    sessionStorage.clear();
    console.log("Local Storage cleared.");

    if ('caches' in window) {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(cache => caches.delete(cache)));
            console.log("Service Worker Cache cleared.");
        } catch (e) { console.error("Failed to clear cache:", e); }
    }

    if ('serviceWorker' in navigator) {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration = 0; registration < registrations.length; registration++) { 
                await registrations[registration].unregister(); 
            }
            console.log("Service Workers unregistered.");
        } catch (e) { console.error("Failed to unregister SW:", e); }
    }

    alert("App data wiped successfully. Reloading...");
    window.location.reload(true); 
}
