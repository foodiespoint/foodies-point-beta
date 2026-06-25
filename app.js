// ==========================================================================
// 1. GLOBAL CONFIGURATIONS & STATE REGISTRY (VERSION 66)
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

// MASTER CATALOG DATA CONTAINER
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
// 2. LINEAR STARTUP SEQUENCE ENGINE (V66)
// ==========================================================================
let minimumSplashTimeMet = false;
setTimeout(() => { minimumSplashTimeMet = true; evaluateStartupSequence(); }, 1200);
const splashFailSafeGuard = setTimeout(() => { minimumSplashTimeMet = true; evaluateStartupSequence(); }, 4000);

window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });

function evaluateStartupSequence() {
    if (!minimumSplashTimeMet) return;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    forceDismissSplash();
    if (!isStandalone) { showStrictInstallModal(); }
    else if ('Notification' in window && Notification.permission === 'denied' && sessionStorage.getItem('notification_reminder_shown') !== 'true') { showStrictNotificationModal(); }
    else { bootApplication(); }
}

function forceDismissSplash() {
    clearTimeout(splashFailSafeGuard);
    if (updateSplash) { updateSplash.style.transition = "opacity 0.4s"; updateSplash.style.opacity = "0"; setTimeout(() => { updateSplash.style.display = "none"; }, 400); }
}

// ==========================================================================
// 3. MODAL GATES
// ==========================================================================
function showStrictInstallModal() { 
    if (pwaModal) { document.getElementById('pwa-ok-btn').onclick = handleInstallClick; pwaModal.style.display = 'flex'; pwaOverlay.style.display = 'block'; body.classList.add('stop-scrolling'); } 
}

function handleInstallClick() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => { if (choiceResult.outcome === 'accepted') { deferredPrompt = null; pwaModal.innerHTML = `<div style="text-align:center;"><div style="font-size:48px;">✅</div><div style="font-weight:700; font-size:20px;">App Installed!</div><div style="font-size:14px; color:#6B7280;">Close this tab and open the app from your home screen.</div></div>`; } });
    } else { alert("To install: Tap the menu (3 dots) and select 'Add to Home screen'."); }
}

function showStrictNotificationModal() {
    if (notifModal) {
        sessionStorage.setItem('notification_reminder_shown', 'true');
        const actionBtn = document.getElementById('notif-ok-btn');
        notifModal.querySelector('div:nth-of-type(3)').innerHTML = "Notifications are currently disabled. To receive real-time order tracking alerts, please enable notification access in your device settings.";
        actionBtn.innerText = "OK";
        actionBtn.style.backgroundColor = "#FF4B3A";
        actionBtn.onclick = () => { notifModal.style.display = 'none'; notifOverlay.style.display = 'none'; body.classList.remove('stop-scrolling'); bootApplication(); };
        notifModal.style.display = 'flex'; notifOverlay.style.display = 'block'; body.classList.add('stop-scrolling');
    }
}

// ==========================================================================
// 4. CORE ENGINE & FIREBASE SYNC
// ==========================================================================
function bootApplication() {
    window.OneSignal = window.OneSignal || [];
    OneSignal.push(async function() {
        await OneSignal.init({ appId: "ad014d82-5244-4531-bca8-f7acf471d23d", notifyButton: { enable: false }, allowLocalhostAsSecureOrigin: true });
        OneSignal.Notifications.requestPermission();
    });
    initializeCloudDataSync();
    
    // Kitchen blackout logic loop
    setInterval(() => { 
        // Logic to check blackout state omitted for brevity
    }, 5000);
}

const firebaseConfig = { databaseURL: "https://foodiespoint-6760-default-rtdb.asia-southeast1.firebasedatabase.app/" };
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
firebase.auth().onAuthStateChanged((user) => { if (user) { currentUserUid = user.uid; initializeCloudDataSync(); } else { firebase.auth().signInAnonymously(); } });

function initializeCloudDataSync() {
    if(!currentUserUid) return;
    database.ref(`users/${currentUserUid}/tracked_orders`).on('value', (snapshot) => {
        cloudTrackedOrders = []; snapshot.forEach((child) => { cloudTrackedOrders.push(child.val()); });
        renderOrderHistory(); 
    });
}

// ... (Continue adding your renderMenu, renderOrderHistory, and utility functions here) ...

window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js?v=66').catch(err => console.error("SW Error:", err));
    }
});
