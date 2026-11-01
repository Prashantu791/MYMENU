// Determine API base dynamically:
// When served through Spring Boot or any web server, use relative origin /api
// When opened via separate dev server (e.g. port 5500) or local file, fallback to backend on port 8080
const isLocalDevServer = (window.location.protocol === 'file:') || 
                         (window.location.port === '5500') || 
                         (window.location.port === '3000');

const API_BASE_URL = (!isLocalDevServer && window.location.origin && window.location.origin.startsWith('http')) 
    ? `${window.location.origin}/api` 
    : 'http://localhost:8085/api';


// Current Logged In User State
let currentUser = JSON.parse(localStorage.getItem('mymenu_user')) || null;

// Modern Floating Toast Notification System
function showToast(message, type = 'info', title = null) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let icon = 'ℹ️';
    let defaultTitle = 'Notice';
    if (type === 'success') { icon = '✅'; defaultTitle = 'Success'; }
    else if (type === 'error') { icon = '❌'; defaultTitle = 'Error'; }
    else if (type === 'warning') { icon = '⚠️'; defaultTitle = 'Attention'; }

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${escapeHtml(title || defaultTitle)}</div>
            <div class="toast-message">${escapeHtml(message)}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        <div class="toast-progress"><div class="toast-progress-bar"></div></div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast-show'));

    setTimeout(() => {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}
window.showToast = showToast;

document.addEventListener('DOMContentLoaded', () => {
    ensureCustomerAuthModalExists();
    ensureOwnerAuthModalExists();
    ensureOrderModalExists();
    initApp();
    init3DEngine();
});

function initApp() {
    updateNavUI();

    const heroRegBtn = document.getElementById('heroRegisterBtn');
    if (heroRegBtn) heroRegBtn.addEventListener('click', (e) => { e.preventDefault(); openOwnerAuthModal('register'); });

    const asideRegBtn = document.getElementById('asideRegisterBtn');
    if (asideRegBtn) asideRegBtn.addEventListener('click', (e) => { e.preventDefault(); openOwnerAuthModal('register'); });

    if (currentUser && currentUser.role === 'OWNER') {
        document.body.classList.add('owner-logged-in');
        if (typeof close3DShowcase === 'function') close3DShowcase();
        const scModal = document.getElementById('showcaseModal3D');
        if (scModal) scModal.style.display = 'none';
        removeCustomerWelcomeBanner();
        renderDedicatedOwnerPortal();
    } else {
        document.body.classList.remove('owner-logged-in');
        if (currentUser && currentUser.role === 'CUSTOMER') {
            restorePublicView();
            renderCustomerWelcomeBanner();
            const menuSec = document.getElementById('menus');
            if (menuSec) menuSec.style.display = 'block';
            loadTodayMesses();
        } else {
            restorePublicView();
            removeCustomerWelcomeBanner();
            const menuSec = document.getElementById('menus');
            if (menuSec) menuSec.style.display = 'none';
        }
    }
}

function renderGuestLandingGateway() {
    const cardsContainer = document.querySelector('.cards');
    if (!cardsContainer) return;

    cardsContainer.innerHTML = `
        <div class="auth-gate-wrapper">
            <div class="auth-gate-hero-card">
                <div class="auth-gate-top-badge">
                    <span>✨ SANT TUKARAM NAGAR • PURE VEG LIVE MESSES</span>
                </div>
                
                <h2 class="auth-gate-title">
                    Aaj Ka Garam Thali Menu Dekhne Ke Liye <span>Login Karein</span>
                </h2>
                
                <p class="auth-gate-desc">
                    Pimpri ke sabhi certified mess owners ke live menus, unlimited thali prices (₹60 - ₹90) aur direct parcel order booking ke liye login ya register karein.
                </p>

                <div class="auth-gate-grid">
                    <!-- Customer Card -->
                    <div class="role-choice-card card-customer">
                        <div class="role-card-header">
                            <div class="role-icon-box">🍱</div>
                            <div>
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <h3>Customer / Student</h3>
                                    <span class="role-card-badge">LIVE ACCESS</span>
                                </div>
                                <small style="color: #2563eb; font-weight: 700;">For Students & Foodies</small>
                            </div>
                        </div>
                        <p class="role-card-desc">
                            Sant Tukaram Nagar ke sabhi 10+ messes ke live thali menus, bhaji aur plate price dekhein aur bina kisi extra charge ke direct parcel order karein.
                        </p>
                        <div class="role-card-actions">
                            <button class="btn-auth-primary" onclick="openCustomerAuthModal('login')">
                                <span>👤 Customer Login</span>
                            </button>
                            <button class="btn-auth-secondary" onclick="openCustomerAuthModal('register')">
                                <span>📝 Create Account Free</span>
                            </button>
                        </div>
                    </div>

                    <!-- Mess Owner Card -->
                    <div class="role-choice-card card-owner">
                        <div class="role-card-header">
                            <div class="role-icon-box">👨‍🍳</div>
                            <div>
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <h3>Mess Owner Portal</h3>
                                    <span class="role-card-badge">PARTNER</span>
                                </div>
                                <small style="color: #7c3aed; font-weight: 700;">For Mess Owners</small>
                            </div>
                        </div>
                        <p class="role-card-desc">
                            Apne mess ka aaj ka special menu aur price update karein, live parcel orders receive karein aur private dashboard manage karein.
                        </p>
                        <div class="role-card-actions">
                            <button class="btn-auth-primary btn-auth-owner" onclick="openOwnerAuthModal('login')">
                                <span>👨‍🍳 Owner Login</span>
                            </button>
                            <button class="btn-auth-secondary" onclick="openOwnerAuthModal('register')">
                                <span>➕ Register Mess Free</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="auth-gate-features">
                    <span class="gate-feature-item">🫓 Unlimited Chapati & Rice</span>
                    <span class="gate-feature-item">🌶️ Garam Marathi Bhaji</span>
                    <span class="gate-feature-item">📞 Direct Mess Call</span>
                    <span class="gate-feature-item">⚡ 0% Extra Commission</span>
                </div>
            </div>
        </div>
    `;
}

function renderCustomerWelcomeBanner() {
    const heroSec = document.querySelector('.hero');
    if (!heroSec) return;

    let banner = document.getElementById('customerWelcomeBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'customerWelcomeBanner';
        banner.className = 'customer-welcome-wrapper';
        heroSec.parentNode.insertBefore(banner, heroSec.nextSibling);
    }
    banner.innerHTML = `
        <div class="neu-welcome-banner">
            <div>
                <span class="welcome-title">👋 Namaste, ${escapeHtml(currentUser.fullName)}!</span>
                <div class="welcome-subtitle">Aapka Customer account active hai. Sant Tukaram Nagar pure veg homely food portal me aapka swagat hai.</div>
            </div>
            <span class="welcome-badge">Verified Customer</span>
        </div>
    `;
}

function removeCustomerWelcomeBanner() {
    const banner = document.getElementById('customerWelcomeBanner');
    if (banner) banner.remove();
}

function restorePublicView() {
    const heroSec = document.querySelector('.hero');
    const ribbonSec = document.querySelector('.taste-ribbon');
    const quoteSec = document.querySelector('.quote-banner');
    const attractSec = document.querySelector('.attract-strip');
    const menuSec = document.getElementById('menus');
    const menuInfoSec = document.querySelector('.menu-info');
    const ownerPortal = document.getElementById('ownerPortalSection');
    
    if (heroSec) heroSec.style.display = '';
    if (ribbonSec) ribbonSec.style.display = '';
    if (quoteSec) quoteSec.style.display = '';
    if (attractSec) attractSec.style.display = '';
    if (menuInfoSec) menuInfoSec.style.display = '';
    if (ownerPortal) ownerPortal.style.display = 'none';

    if (menuSec) {
        if (currentUser && currentUser.role === 'CUSTOMER') {
            menuSec.style.display = 'block';
        } else {
            menuSec.style.display = 'none';
        }
    }
}

function handleNavMenuClick() {
    if (currentUser && currentUser.role === 'CUSTOMER') {
        const sec = document.getElementById('menus');
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    } else {
        openCustomerAuthModal('login');
    }
}
window.handleNavMenuClick = handleNavMenuClick;

function updateNavUI() {
    const navActions = document.querySelector('.nav-actions');
    const bnavUserLabel = document.getElementById('bnavUserLabel');
    const mainNav = document.getElementById('mainNavLinks');
    const heroBtn = document.getElementById('heroMainBtn');

    if (currentUser) {
        let roleBadge = currentUser.role === 'OWNER' ? '👨‍🍳 Mess Owner' : '👤 Customer';
        let messInfoText = currentUser.messName ? `(${escapeHtml(currentUser.messName)})` : '';
        
        if (currentUser.role === 'CUSTOMER') {
            if (mainNav) {
                mainNav.innerHTML = `
                    <a class="active" href="#"><span>🏠</span> Home</a>
                    <a href="#menus" class="nav-menu-link"><span>🍱</span> Today's Menu <span class="nav-live-dot" title="Live Today"></span></a>
                    <a href="#about"><span>🌿</span> Pure Veg Promise</a>
                    <div class="nav-area-chip" title="Sant Tukaram Nagar, Pimpri"><span>📍</span><small>Sant Tukaram Nagar</small></div>
                `;
            }
            if (heroBtn) {
                heroBtn.innerHTML = '🍱 View Today\'s Mess Menus';
                heroBtn.onclick = () => {
                    const sec = document.getElementById('menus');
                    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
                };
            }
        } else {
            if (mainNav) {
                mainNav.innerHTML = `
                    <a class="active" href="#"><span>🏠</span> Home</a>
                    <a href="#about"><span>🌿</span> Pure Veg Promise</a>
                    <div class="nav-area-chip" title="Sant Tukaram Nagar, Pimpri"><span>📍</span><small>Sant Tukaram Nagar</small></div>
                `;
            }
        }

        if (navActions) {
            navActions.innerHTML = `
                <div class="nav-user-info">
                    <div class="nav-user-role">${roleBadge} ${messInfoText}</div>
                    <div class="nav-user-sub">${escapeHtml(currentUser.fullName)} ${currentUser.messPhone ? '• 📱 ' + escapeHtml(currentUser.messPhone) : ''}</div>
                </div>
                <button class="logout-btn" onclick="logoutUser()">Logout</button>
            `;
        }
        if (bnavUserLabel) {
            bnavUserLabel.innerText = currentUser.role === 'OWNER' ? 'Portal' : 'Profile';
        }
    } else {
        if (mainNav) {
            mainNav.innerHTML = `
                <a class="active" href="#"><span>🏠</span> Home</a>
                <a href="javascript:void(0)" onclick="handleNavMenuClick()" class="nav-menu-link"><span>🍱</span> Today's Menu <span class="nav-live-dot" title="Live Today"></span></a>
                <a href="#about"><span>🌿</span> Pure Veg Promise</a>
                <div class="nav-area-chip" title="Sant Tukaram Nagar, Pimpri"><span>📍</span><small>Sant Tukaram Nagar</small></div>
            `;
        }
        if (heroBtn) {
            heroBtn.innerHTML = '🍱 Customer Login & View Menus';
            heroBtn.onclick = () => openCustomerAuthModal('login');
        }
        if (navActions) {
            navActions.innerHTML = `
                <button class="login" id="navLoginBtn" onclick="openCustomerAuthModal('login')"><span class="btn-text-long">Customer </span>Login</button>
                <button class="register" id="navRegisterBtn" onclick="openCustomerAuthModal('register')">Create Account</button>
                <button class="btn-nav-owner" id="navOwnerPortalBtn" onclick="openOwnerAuthModal('login')">
                    <span class="nav-owner-text-long">👨‍🍳 Mess Owner Portal</span>
                    <span class="nav-owner-text-short">👨‍🍳 Owner</span>
                </button>
            `;
        }
        if (bnavUserLabel) {
            bnavUserLabel.innerText = 'Login';
        }
    }
}

function logoutUser() {
    document.body.classList.remove('owner-logged-in');
    localStorage.removeItem('mymenu_user');
    currentUser = null;
    showToast('Aap safaltapoorvak logout ho gaye hain.', 'info', 'Logged Out');
    setTimeout(() => {
        location.reload();
    }, 600);
}
window.logoutUser = logoutUser;

// ----------------------------------------------------
// DEDICATED MESS OWNER PORTAL (PRIVACY SCOPED)
// ----------------------------------------------------
async function renderDedicatedOwnerPortal() {
    const heroSec = document.querySelector('.hero');
    const ribbonSec = document.querySelector('.taste-ribbon');
    const quoteSec = document.querySelector('.quote-banner');
    const attractSec = document.querySelector('.attract-strip');
    const menuSec = document.querySelector('.menu-section');
    const menuInfoSec = document.querySelector('.menu-info');
    const ownerPortal = document.getElementById('ownerPortalSection');
    
    document.body.classList.add('owner-logged-in');
    if (typeof close3DShowcase === 'function') close3DShowcase();
    const scModal = document.getElementById('showcaseModal3D');
    if (scModal) scModal.style.display = 'none';

    if (heroSec) heroSec.style.display = 'none';
    if (ribbonSec) ribbonSec.style.display = 'none';
    if (quoteSec) quoteSec.style.display = 'none';
    if (attractSec) attractSec.style.display = 'none';
    if (menuSec) menuSec.style.display = 'none';
    if (menuInfoSec) menuInfoSec.style.display = 'none';

    const portalContainer = ownerPortal || menuSec;
    if (portalContainer) {
        portalContainer.style.display = 'block';
        portalContainer.innerHTML = `
            <div class="owner-portal-wrap">
                <div class="owner-portal-card">
                    <div class="owner-portal-header">
                        <div>
                            <span class="owner-portal-badge">🔒 PRIVACY SECURED OWNER PORTAL</span>
                            <h1 class="owner-portal-title">${escapeHtml(currentUser.messName || 'My Mess Dashboard')}</h1>
                            <p class="owner-portal-subtitle">👤 <b>Owner:</b> ${escapeHtml(currentUser.fullName)} | 📱 <b>Phone:</b> ${escapeHtml(currentUser.messPhone || 'N/A')} | 📍 ${escapeHtml(currentUser.messAddress || 'Pimpri, Pune')}</p>
                        </div>
                        <button type="button" id="refreshOwnerPortal" class="btn-refresh-portal">🔄 Refresh Data</button>
                    </div>

                    <div class="owner-portal-tabs">
                        <button type="button" class="portal-tab active" id="tabOrders">📦 Incoming Orders</button>
                        <button type="button" class="portal-tab" id="tabMenu">🍛 Edit Menu & Price</button>
                        <button type="button" class="portal-tab" id="tabPreview">👁️ Live Preview (My Mess)</button>
                    </div>

                    <!-- ORDERS TAB -->
                    <div id="portalOrdersSection">
                        <div id="ownerOrdersContainer">Loading live orders...</div>
                    </div>

                    <!-- MENU UPDATE TAB -->
                    <div id="portalMenuSection" style="display:none;">
                        <h3 style="margin-top: 0;">Update Today's Menu for ${escapeHtml(currentUser.messName)}</h3>
                        <p style="color: #666; font-size: 0.85rem; margin-top: -5px;">Update today's rice plate price and dishes so customers can view your live menu and order parcel thalis.</p>
                        <form id="ownerMenuForm">
                            <div class="form-group" style="margin-bottom: 12px;">
                                <label style="display:block; font-weight:bold; margin-bottom: 4px;">Today's Rice Plate Price (₹)</label>
                                <input type="number" id="ownerPrice" class="modern-input" required placeholder="e.g. 70">
                            </div>
                            <div class="form-group" style="margin-bottom: 12px;">
                                <label style="display:block; font-weight:bold; margin-bottom: 4px;">Sukhi Bhaji Dish Name</label>
                                <input type="text" id="ownerSukhi" class="modern-input" placeholder="e.g. Aloo Methi / Batata Sukhi">
                            </div>
                            <div class="form-group" style="margin-bottom: 12px;">
                                <label style="display:block; font-weight:bold; margin-bottom: 4px;">Rassa Bhaji Dish Name</label>
                                <input type="text" id="ownerRassa" class="modern-input" placeholder="e.g. Paneer Rassa / Dal Amti">
                            </div>
                            <div class="form-group" style="margin-bottom: 12px;">
                                <label style="display:block; font-weight:bold; margin-bottom: 4px;">Special Dish / Text (Optional)</label>
                                <input type="text" id="ownerSpecialText" class="modern-input" placeholder="e.g. Puri Bhaji Special / Gulab Jamun">
                            </div>
                            <div class="form-group" style="margin-top: 10px; margin-bottom: 12px;">
                                <label><input type="checkbox" id="ownerIsSpecial"> <b>Mark as Today's Special Mess</b> (Appears First on Website)</label>
                            </div>
                            <button type="submit" class="btn-submit-modern" style="margin-top: 12px;">Save & Update Live Menu</button>
                        </form>
                    </div>

                    <!-- PREVIEW TAB -->
                    <div id="portalPreviewSection" style="display:none;">
                        <h3 style="margin-top: 0;">Your Live Mess Card Preview</h3>
                        <p style="color: #666; font-size: 0.85rem; margin-top: -5px;">🔒 <b>Privacy Shield Active:</b> This is how customers see your mess. Other mess owners are completely hidden from your account.</p>
                        <div id="ownerPreviewContainer" class="cards" style="max-width: 380px; margin: 20px auto 0;">Loading your card preview...</div>
                    </div>
                </div>
            </div>
        `;
    }

    const tabOrders = document.getElementById('tabOrders');
    const tabMenu = document.getElementById('tabMenu');
    const tabPreview = document.getElementById('tabPreview');
    const secOrders = document.getElementById('portalOrdersSection');
    const secMenu = document.getElementById('portalMenuSection');
    const secPreview = document.getElementById('portalPreviewSection');

    function resetTabs() {
        [tabOrders, tabMenu, tabPreview].forEach(t => { if (t) t.classList.remove('active'); });
        if (secOrders) secOrders.style.display = 'none';
        if (secMenu) secMenu.style.display = 'none';
        if (secPreview) secPreview.style.display = 'none';
    }

    if (tabOrders && tabMenu) {
        tabOrders.addEventListener('click', () => {
            resetTabs();
            tabOrders.classList.add('active');
            secOrders.style.display = 'block';
        });
        tabMenu.addEventListener('click', () => {
            resetTabs();
            tabMenu.classList.add('active');
            secMenu.style.display = 'block';
        });
        if (tabPreview) {
            tabPreview.addEventListener('click', () => {
                resetTabs();
                tabPreview.classList.add('active');
                secPreview.style.display = 'block';
                loadOwnerCardPreview();
            });
        }
    }

    const refreshBtn = document.getElementById('refreshOwnerPortal');
    if (refreshBtn) refreshBtn.addEventListener('click', () => renderDedicatedOwnerPortal());

    const ownerMenuForm = document.getElementById('ownerMenuForm');
    if (ownerMenuForm) ownerMenuForm.addEventListener('submit', handleOwnerMenuUpdate);

    loadOwnerOrders(currentUser.messId);
}

async function loadOwnerCardPreview() {
    const previewContainer = document.getElementById('ownerPreviewContainer');
    if (!previewContainer) return;
    previewContainer.innerHTML = '<p>⏳ Loading your card...</p>';

    try {
        const headers = {
            'X-User-Role': 'OWNER',
            'X-User-Id': currentUser.userId ? String(currentUser.userId) : ''
        };
        const res = await fetch(`${API_BASE_URL}/messes/today`, { headers });
        const data = await res.json();
        if (!data || data.length === 0) {
            previewContainer.innerHTML = '<p style="color: #666;">No active menu found for your mess. Please update your menu.</p>';
            return;
        }
        renderMessCards(data, previewContainer);
    } catch (e) {
        console.error(e);
        previewContainer.innerHTML = '<p style="color: red;">Error loading card preview.</p>';
    }
}

async function loadOwnerOrders(messId) {
    const container = document.getElementById('ownerOrdersContainer');
    if (!container) return;
    container.innerHTML = '<p>⏳ Loading live customer orders...</p>';

    try {
        const headers = (currentUser && currentUser.role === 'OWNER') ? {
            'X-User-Role': currentUser.role,
            'X-User-Id': currentUser.userId ? String(currentUser.userId) : ''
        } : {};
        // Use pendingOnly=true so completed orders are filtered out
        const response = await fetch(`${API_BASE_URL}/orders/mess/${messId}?pendingOnly=true`, { headers });
        const orders = await response.json();

        // STRICT PENDING FILTER: Remove COMPLETED and CANCELLED orders from owner profile
        const pendingOrders = (Array.isArray(orders) ? orders : [])
            .filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');

        // Update Tab Label Counter
        const tabOrders = document.getElementById('tabOrders');
        if (tabOrders) {
            tabOrders.innerHTML = `📦 Pending Orders <span style="background: ${pendingOrders.length > 0 ? '#d32f2f' : '#888'}; color: white; border-radius: 12px; padding: 2px 7px; font-size: 0.75rem; margin-left: 5px;">${pendingOrders.length}</span>`;
        }

        if (pendingOrders.length === 0) {
            container.innerHTML = `
                <div style="padding: 30px; text-align: center; color: #555; background: #f9fbf9; border: 1px dashed #c8e6c9; border-radius: 12px;">
                    <div style="font-size: 2.2rem; margin-bottom: 8px;">✨</div>
                    <b style="color: #2e7d32; font-size: 1.05rem;">No Pending Orders Right Now!</b><br>
                    <p style="margin: 6px 0 14px 0; color: #666; font-size: 0.9rem;">Sabhi orders complete ho chuke hain ya koi naya pending order nahi hai.</p>
                    <button onclick="toggleCompletedHistory(${messId})" style="background: #f5f5f5; border: 1px solid #ccc; padding: 6px 14px; border-radius: 6px; font-size: 0.85rem; cursor: pointer;">📜 View Completed Orders History</button>
                    <div id="completedHistoryBox" style="display:none; margin-top: 16px; text-align: left;"></div>
                </div>
            `;
            return;
        }

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <span style="font-size: 0.95rem; font-weight: bold; color: #e65100;">
                    🔥 ${pendingOrders.length} Pending Incoming Order(s)
                </span>
                <button onclick="toggleCompletedHistory(${messId})" style="background: #f5f5f5; border: 1px solid #ccc; padding: 5px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer;">
                    📜 View Past Completed Orders
                </button>
            </div>
            <div id="completedHistoryBox" style="display:none; margin-bottom: 16px; text-align: left;"></div>
        `;

        pendingOrders.reverse().forEach(order => {
            html += `
                <div class="owner-order-card">
                    <div class="order-card-header">
                        <span class="order-id-label">Order #${order.id}</span>
                        <span class="status-badge status-${order.status}">${order.status}</span>
                    </div>
                    
                    <div class="order-detail-row">
                        👤 <b>Customer Name:</b> <span class="order-cust-name">${escapeHtml(order.customerName)}</span>
                    </div>
                    
                    <div class="order-phone-pill">
                        📞 <b>Customer Phone:</b> <a href="tel:${escapeHtml(order.customerPhone)}">${escapeHtml(order.customerPhone)}</a>
                    </div>
                    
                    <div class="order-meta-text">🍱 <b>Quantity:</b> <strong>${order.quantity} Thali(s)</strong></div>
                    ${order.pickupTime ? `<div class="order-meta-text">⏰ <b>Expected Pickup Time:</b> ${escapeHtml(order.pickupTime)}</div>` : ''}
                    ${order.note ? `<div class="order-meta-note">📝 <b>Customer Request:</b> <i>"${escapeHtml(order.note)}"</i></div>` : ''}
                    
                    <div class="order-actions-bar">
                        <span class="order-actions-label">Update Status:</span>
                        <button type="button" class="btn-order-ready" onclick="updateOrderStatus(${order.id}, 'READY', ${messId})">Mark Ready for Pickup</button>
                        <button type="button" class="btn-order-complete" onclick="updateOrderStatus(${order.id}, 'COMPLETED', ${messId})" title="Order will be cleared from pending orders">✅ Complete Order (Clear)</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color: red;">Error loading orders.</p>';
    }
}

async function toggleCompletedHistory(messId) {
    const box = document.getElementById('completedHistoryBox');
    if (!box) return;
    if (box.style.display === 'block') {
        box.style.display = 'none';
        return;
    }
    box.style.display = 'block';
    box.innerHTML = '<p style="font-size:0.85rem; color:#666;">⏳ Loading past completed orders...</p>';

    try {
        const headers = (currentUser && currentUser.role === 'OWNER') ? {
            'X-User-Role': currentUser.role,
            'X-User-Id': currentUser.userId ? String(currentUser.userId) : ''
        } : {};
        const response = await fetch(`${API_BASE_URL}/orders/mess/${messId}`, { headers });
        const allOrders = await response.json();
        const completed = (Array.isArray(allOrders) ? allOrders : []).filter(o => o.status === 'COMPLETED');

        if (completed.length === 0) {
            box.innerHTML = '<div style="padding: 12px; background: #f0f0f0; border-radius: 8px; font-size: 0.85rem; color: #666;">No past completed orders yet.</div>';
            return;
        }

        let h = '<div style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; max-height: 250px; overflow-y: auto;">';
        h += `<div style="font-weight: bold; margin-bottom: 8px; font-size: 0.88rem; color: #444;">Past Completed Orders (${completed.length}):</div>`;
        completed.reverse().forEach(o => {
            h += `
                <div style="font-size: 0.82rem; padding: 6px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                    <span>Order #${o.id} • ${escapeHtml(o.customerName)} (${escapeHtml(o.customerPhone)}) • <b>${o.quantity} Thali(s)</b></span>
                    <span style="color: #2e7d32; font-weight: bold;">COMPLETED</span>
                </div>
            `;
        });
        h += '</div>';
        box.innerHTML = h;
    } catch (e) {
        console.error(e);
        box.innerHTML = '<p style="color:red; font-size:0.85rem;">Error loading past orders.</p>';
    }
}
window.toggleCompletedHistory = toggleCompletedHistory;

async function updateOrderStatus(orderId, newStatus, messId) {
    try {
        const headers = (currentUser && currentUser.role === 'OWNER') ? {
            'X-User-Role': currentUser.role,
            'X-User-Id': currentUser.userId ? String(currentUser.userId) : ''
        } : {};
        const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status?status=${newStatus}`, { 
            method: 'PUT',
            headers
        });
        const data = await res.json();
        if (data.success) {
            loadOwnerOrders(messId);
        }
    } catch (e) {
        console.error(e);
    }
}
window.updateOrderStatus = updateOrderStatus;

async function handleOwnerMenuUpdate(e) {
    e.preventDefault();
    const messId = currentUser.messId;
    const payload = {
        price: parseFloat(document.getElementById('ownerPrice').value),
        sukhiBhaji: document.getElementById('ownerSukhi').value,
        rassaBhaji: document.getElementById('ownerRassa').value,
        specialText: document.getElementById('ownerSpecialText').value,
        isSpecial: document.getElementById('ownerIsSpecial').checked,
        chapati: true,
        rice: true
    };

    try {
        const headers = { 
            'Content-Type': 'application/json',
            ...(currentUser && currentUser.role === 'OWNER' ? {
                'X-User-Role': currentUser.role,
                'X-User-Id': currentUser.userId ? String(currentUser.userId) : ''
            } : {})
        };
        const res = await fetch(`${API_BASE_URL}/messes/${messId}/menu`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('🎉 Today\'s Menu & Rice Plate Price updated live on website!');
            document.getElementById('ownerMenuForm').reset();
        } else {
            alert('Failed to update menu.');
        }
    } catch (err) {
        console.error(err);
        alert('Error updating menu.');
    }
}

// ----------------------------------------------------
// PUBLIC CUSTOMER VIEW
// ----------------------------------------------------
let allLoadedMesses = [];
let currentFilterKey = 'all';
let currentSearchQuery = '';

function getFallbackMesses() {
    return [
        {
            mess: { id: 1, name: "Siddheshwar Bhojanalay", address: "Near Savtamali Garden, Sant Tukaram Nagar", phone: "9000000001", isActive: true },
            todayMenu: { id: 1, messId: 1, price: 90, chapati: true, rice: true, sukhiBhaji: "Aloo Methi", rassaBhaji: "Matki Rassa", isSpecial: true, specialText: "Puri Bhaji Special", parcelAvailable: true }
        },
        {
            mess: { id: 2, name: "Ganesh Mess", address: "Beside ATM, opposite to Girls Hostel", phone: "9000000002", isActive: true },
            todayMenu: { id: 2, messId: 2, price: 70, chapati: true, rice: true, sukhiBhaji: "Batata Sukhi", rassaBhaji: "Matki Rassa", isSpecial: false, parcelAvailable: true }
        },
        {
            mess: { id: 3, name: "Khandesho Mess", address: "Near YCM Hospital, Sant Tukaram Nagar", phone: "9000000003", isActive: true },
            todayMenu: { id: 3, messId: 3, price: 65, chapati: true, rice: true, sukhiBhaji: "Mix Sukhi Bhaji", rassaBhaji: "Dal Rassa", isSpecial: false, parcelAvailable: true }
        },
        {
            mess: { id: 4, name: "Panjabi Mess", address: "Near Ganesh Mess, Sant Tukaram Nagar", phone: "9000000004", isActive: true },
            todayMenu: { id: 4, messId: 4, price: 75, chapati: true, rice: true, sukhiBhaji: "Jeera Aloo", rassaBhaji: "Paneer Rassa", isSpecial: false, parcelAvailable: true }
        },
        {
            mess: { id: 5, name: "Shree Ganesh Bhojanalay", address: "Near Sant Tukaram Nagar", phone: "9000000005", isActive: true },
            todayMenu: { id: 5, messId: 5, price: 60, chapati: true, rice: true, sukhiBhaji: "Kobi Vatana", rassaBhaji: "Varan", isSpecial: false, parcelAvailable: true }
        },
        {
            mess: { id: 6, name: "Mauli Mess", address: "Near Pimpri Market", phone: "9000000006", isActive: true },
            todayMenu: { id: 6, messId: 6, price: 65, chapati: true, rice: true, sukhiBhaji: "Aloo Sukhi", rassaBhaji: "Dal Rassa", isSpecial: false, parcelAvailable: true }
        }
    ];
}

async function loadTodayMesses() {
    const cardsContainer = document.querySelector('.cards');
    if (!cardsContainer) return;

    try {
        cardsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-saffron, #e65100); font-weight: bold; font-size: 1.15rem;">⏳ Loading Today\'s Fresh Menus from Database...</div>';
        
        const headers = {};
        if (currentUser && currentUser.role === 'OWNER') {
            headers['X-User-Role'] = 'OWNER';
            headers['X-User-Id'] = currentUser.userId ? String(currentUser.userId) : '';
        }

        const response = await fetch(`${API_BASE_URL}/messes/today`, { headers });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (!data || data.length === 0) {
            allLoadedMesses = getFallbackMesses();
            applyCurrentFilters();
            return;
        }

        allLoadedMesses = data;
        applyCurrentFilters();
    } catch (error) {
        console.warn('Backend sync paused, loading verified local menus:', error);
        allLoadedMesses = getFallbackMesses();
        applyCurrentFilters();
    }
}

function handleMessSearch(query) {
    currentSearchQuery = (query || '').toLowerCase().trim();
    const clearBtn = document.getElementById('searchClearBtn');
    if (clearBtn) clearBtn.style.display = currentSearchQuery ? 'flex' : 'none';
    applyCurrentFilters();
}
window.handleMessSearch = handleMessSearch;

function clearMessSearch() {
    const input = document.getElementById('messSearchInput');
    if (input) input.value = '';
    currentSearchQuery = '';
    const clearBtn = document.getElementById('searchClearBtn');
    if (clearBtn) clearBtn.style.display = 'none';
    applyCurrentFilters();
}
window.clearMessSearch = clearMessSearch;

function setMessFilter(filterKey, btnEl) {
    currentFilterKey = filterKey;
    document.querySelectorAll('.filter-chip').forEach(btn => btn.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    applyCurrentFilters();
}
window.setMessFilter = setMessFilter;

function applyCurrentFilters() {
    const container = document.querySelector('.cards');
    if (!container || !allLoadedMesses) return;

    let filtered = allLoadedMesses.filter(item => {
        const mess = item.mess || {};
        const menu = item.todayMenu || {};
        const messName = (mess.name || '').toLowerCase();
        const address = (mess.address || '').toLowerCase();
        const sukhi = (menu.sukhiBhaji || '').toLowerCase();
        const rassa = (menu.rassaBhaji || '').toLowerCase();
        const priceNum = menu.price || 70;

        if (currentSearchQuery) {
            const matchesSearch = messName.includes(currentSearchQuery) || 
                                  address.includes(currentSearchQuery) || 
                                  sukhi.includes(currentSearchQuery) || 
                                  rassa.includes(currentSearchQuery);
            if (!matchesSearch) return false;
        }

        if (currentFilterKey === 'under70') {
            return priceNum <= 70;
        } else if (currentFilterKey === 'special') {
            return Boolean(menu.isSpecial);
        } else if (currentFilterKey === 'chapati') {
            return Boolean(menu.chapati);
        }

        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 45px 20px; background: var(--neu-base); border-radius: 20px; box-shadow: var(--neu-inset);">
                <div style="font-size: 2.2rem; margin-bottom: 10px;">🔍</div>
                <h3 style="margin-bottom: 6px; color: var(--color-text-main);">Koi mess match nahi hua</h3>
                <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 14px;">"${escapeHtml(currentSearchQuery || currentFilterKey)}" ke liye koi menu nahi mila.</p>
                <button type="button" class="btn-neu-primary" onclick="clearMessSearch(); setMessFilter('all', document.querySelector('[data-filter=all]'))" style="padding: 9px 18px; font-size: 0.88rem;">Sabhi Messes Dekhein</button>
            </div>
        `;
        return;
    }

    renderMessCards(filtered, container);
}


function renderMessCards(messList, container) {
    container.innerHTML = '';

    messList.forEach((item, index) => {
        const mess = item.mess;
        const menu = item.todayMenu;

        const isSpecial = menu && menu.isSpecial;
        const imgClass = `img${(index % 4) + 1}`;
        const price = (menu && menu.price) ? `₹${menu.price}` : '₹70';
        
        let itemsList = [];
        if (menu) {
            if (menu.chapati) itemsList.push('🫓 Chapati');
            if (menu.rice) itemsList.push('🍚 Rice');
            if (menu.sukhiBhaji && menu.sukhiBhaji.trim()) {
                itemsList.push(`🥘 ${menu.sukhiBhaji.trim()}`);
            } else {
                itemsList.push('🥘 Sukhi Bhaji');
            }
            if (menu.rassaBhaji && menu.rassaBhaji.trim()) {
                itemsList.push(`🌶️ ${menu.rassaBhaji.trim()}`);
            } else {
                itemsList.push('🌶️ Rassa Bhaji');
            }
            if (menu.specialText && menu.specialText.trim()) {
                itemsList.push(`⭐ ${menu.specialText.trim()}`);
            }
        } else {
            itemsList = ['🫓 Chapati', '🍚 Rice', '🥘 Sukhi Bhaji', '🌶️ Rassa Bhaji'];
        }

        const tagsHtml = itemsList.map(tag => `<span class="menu-pill ${tag.includes('⭐') ? 'special' : ''}">${escapeHtml(tag)}</span>`).join('');

        const cardElement = document.createElement('article');
        cardElement.className = `mess-card ${isSpecial ? 'special-first' : ''}`;
        cardElement.setAttribute('data-tilt-card', 'true');
        cardElement.style.setProperty('--card-index', index);

        const isOwnerRole = (currentUser && currentUser.role === 'OWNER');
        const inspect3DBtnHtml = isOwnerRole ? '' : `
            <button type="button" class="btn-inspect-3d" onclick="open3DShowcase('${escapeHtml(mess.name)}', '${imgClass}', '${price}', ${mess.id}, '${escapeHtml(mess.phone || '9000000000')}', ${menu ? menu.id : 1})" title="Inspect Dish in 3D Perspective">
                <span>🔮 3D View</span>
            </button>
        `;

        cardElement.innerHTML = `
            <div class="food-image ${imgClass}">
                <div class="card-glare"></div>
                <span class="${isSpecial ? 'special' : ''}">${isSpecial ? "⭐ TODAY'S SPECIAL" : '🟢 OPEN NOW'}</span>
                ${inspect3DBtnHtml}
            </div>
            <div class="card-body">
                <div class="mess-head">
                    <h3>${escapeHtml(mess.name)}</h3>
                    <span class="rating">4.5 ★</span>
                </div>
                <p class="place">📍 ${escapeHtml(mess.address)}</p>
                <div class="menu-tags-pill">
                    ${tagsHtml}
                </div>
                <div class="plate-box ${isSpecial ? 'special-box' : ''}">
                    <div>
                        <small>TODAY'S THALI</small>
                        <strong>${price}</strong>
                    </div>
                    <p>Unlimited Rice • Chapati • Sukhi Bhaji • Rassa Bhaji</p>
                </div>
                <div class="card-actions-row">
                    <a href="tel:${escapeHtml(mess.phone || '9000000000')}" class="call-btn" title="Call Mess Owner">
                        📞 Call
                    </a>
                    ${isOwnerRole ? `
                    <div style="flex: 1; text-align: center; padding: 10px; background: #e8f5e9; color: #2e7d32; font-weight: 700; border-radius: 10px; font-size: 0.88rem;">
                        ✅ Verified Live Card
                    </div>
                    ` : `
                    <button type="button" class="order-btn"
                            onclick="triggerOrderModal(${mess.id}, '${escapeHtml(mess.name)}', '${escapeHtml(mess.phone || '9000000000')}', ${menu ? menu.id : 1}, '${price}')">
                        🍛 Order Parcel
                    </button>
                    `}
                </div>
            </div>
        `;

        container.appendChild(cardElement);
    });

    if (typeof attach3DCardTilt === 'function') {
        attach3DCardTilt(container);
    }
}

function triggerOrderModal(messId, messName, messPhone, menuId, price) {
    if (!currentUser) {
        showToast('Parcel thali order karne ke liye kripya Customer Login karein.', 'warning', 'Login Required');
        openCustomerAuthModal('login');
        return;
    }
    if (currentUser.role === 'OWNER') {
        showToast('Mess Owners cannot place orders. Please use a Customer account.', 'warning', 'Owner Account');
        return;
    }
    openOrderModal({ messId, messName, messPhone, menuId, price });
}
window.triggerOrderModal = triggerOrderModal;

function ensureOrderModalExists() {
    if (document.getElementById('orderModal')) return;

    const modalHTML = `
        <div id="orderModal" class="modal-overlay-modern" style="display:none;">
            <div class="modal-card-modern" style="max-width: 500px;">
                <div class="modal-header-modern">
                    <button type="button" class="modal-close-modern" onclick="document.getElementById('orderModal').style.display='none'" title="Close">&times;</button>
                    <div class="modal-title-group">
                        <span style="font-size: 0.78rem; font-weight: 800; color: #ffcc80; letter-spacing: 0.6px; text-transform: uppercase;">🍱 INSTANT PARCEL BOOKING</span>
                        <h2 id="modalMessName">Order Parcel Thali</h2>
                        <p id="modalMessContact" style="color: #ffeedd; margin-top: 4px; font-weight: 600; font-size: 0.88rem;">📞 Mess Owner Phone: ...</p>
                    </div>
                </div>
                
                <div class="modal-body-modern">
                    <form id="orderForm">
                        <input type="hidden" id="orderMessId">
                        <input type="hidden" id="orderMenuId">
                        
                        <div class="form-floating-group">
                            <label for="custName">Your Full Name</label>
                            <div class="input-with-icon">
                                <span class="input-icon-badge">👤</span>
                                <input type="text" id="custName" class="modern-input" required placeholder="e.g. Rahul Sharma">
                            </div>
                        </div>
                        
                        <div class="form-floating-group">
                            <label for="custPhone">Your Mobile Phone (For Mess Owner to Call)</label>
                            <div class="input-with-icon">
                                <span class="input-icon-badge">📱</span>
                                <input type="tel" id="custPhone" class="modern-input" required placeholder="e.g. 9876543210">
                            </div>
                        </div>

                        <div class="form-floating-group">
                            <label for="custQty">Quantity (Number of Thalis)</label>
                            <div class="qty-stepper-wrap">
                                <button type="button" class="qty-stepper-btn" onclick="adjustOrderQty(-1)">−</button>
                                <input type="number" id="custQty" class="qty-stepper-input" value="1" min="1" max="15" required onchange="updateOrderPriceSummary()" oninput="updateOrderPriceSummary()">
                                <button type="button" class="qty-stepper-btn" onclick="adjustOrderQty(1)">+</button>
                                <span style="font-size: 0.86rem; color: #64748b; font-weight: 700;">Full Thali(s)</span>
                            </div>
                        </div>

                        <div class="form-floating-group">
                            <label for="custTime">Expected Pickup Time</label>
                            <div class="input-with-icon">
                                <span class="input-icon-badge">⏰</span>
                                <input type="text" id="custTime" class="modern-input" placeholder="e.g. 8:30 PM">
                            </div>
                            <div class="quick-time-chips">
                                <button type="button" class="time-chip-btn" onclick="selectPickupTime('In 15 Mins')">⚡ In 15 Mins</button>
                                <button type="button" class="time-chip-btn" onclick="selectPickupTime('In 30 Mins')">⏱️ In 30 Mins</button>
                                <button type="button" class="time-chip-btn" onclick="selectPickupTime('8:00 PM')">🌙 8:00 PM</button>
                                <button type="button" class="time-chip-btn" onclick="selectPickupTime('8:30 PM')">🌙 8:30 PM</button>
                                <button type="button" class="time-chip-btn" onclick="selectPickupTime('9:00 PM')">🌙 9:00 PM</button>
                            </div>
                        </div>

                        <!-- Live Price & Bill Summary Card -->
                        <div class="order-price-summary-card" id="orderSummaryCard">
                            <div>
                                <div class="summary-label" id="summaryLabelText">1 Thali × ₹70</div>
                                <small style="color: #b45309; font-size: 0.78rem;">Pay cash or UPI directly at mess counter</small>
                            </div>
                            <div class="summary-amount" id="summaryTotalText">₹70</div>
                        </div>

                        <div class="form-floating-group">
                            <label for="custNote">Special Instructions / Note (Optional)</label>
                            <div class="input-with-icon">
                                <span class="input-icon-badge">📝</span>
                                <input type="text" id="custNote" class="modern-input" placeholder="e.g. Extra Rassa, Less Spicy">
                            </div>
                        </div>

                        <button type="submit" class="btn-submit-modern" id="orderSubmitBtn">
                            <span>Confirm & Place Parcel Order</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('orderForm').addEventListener('submit', handleOrderSubmit);
}

let currentModalUnitPrice = 70;

function adjustOrderQty(delta) {
    const input = document.getElementById('custQty');
    if (!input) return;
    let val = parseInt(input.value) || 1;
    val = Math.max(1, Math.min(15, val + delta));
    input.value = val;
    updateOrderPriceSummary();
}
window.adjustOrderQty = adjustOrderQty;

function selectPickupTime(timeStr) {
    const input = document.getElementById('custTime');
    if (input) input.value = timeStr;
    document.querySelectorAll('.time-chip-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.innerText.includes(timeStr));
    });
}
window.selectPickupTime = selectPickupTime;

function updateOrderPriceSummary() {
    const qtyInput = document.getElementById('custQty');
    const label = document.getElementById('summaryLabelText');
    const total = document.getElementById('summaryTotalText');
    if (!qtyInput || !label || !total) return;
    const qty = parseInt(qtyInput.value) || 1;
    const amount = qty * currentModalUnitPrice;
    label.innerText = `${qty} Thali${qty > 1 ? 's' : ''} × ₹${currentModalUnitPrice}`;
    total.innerText = `₹${amount}`;
}
window.updateOrderPriceSummary = updateOrderPriceSummary;

function openOrderModal(data) {
    ensureOrderModalExists();
    document.getElementById('modalMessName').innerText = `Order from ${data.messName}`;
    document.getElementById('modalMessContact').innerHTML = `📞 Owner Contact: <a href="tel:${data.messPhone}" style="color: #ffcc80; text-decoration: underline; font-weight: bold;">${data.messPhone}</a><br><small style="color:#ffd8a8; font-weight:normal;">Call the mess owner directly if you need urgent food preparation.</small>`;
    document.getElementById('orderMessId').value = data.messId;
    document.getElementById('orderMenuId').value = data.menuId;

    currentModalUnitPrice = parseFloat(String(data.price || '').replace(/[^\d.]/g, '')) || 70;
    const qtyInput = document.getElementById('custQty');
    if (qtyInput) qtyInput.value = 1;
    updateOrderPriceSummary();

    if (currentUser) {
        const nameField = document.getElementById('custName');
        const phoneField = document.getElementById('custPhone');
        if (nameField && currentUser.fullName) nameField.value = currentUser.fullName;
        if (phoneField && currentUser.phone) phoneField.value = currentUser.phone;
    }
    
    const modal = document.getElementById('orderModal');
    modal.style.display = 'flex';
}

async function handleOrderSubmit(e) {
    e.preventDefault();

    if (!currentUser || currentUser.role !== 'CUSTOMER' || !currentUser.userId) {
        showToast('Please login as a Customer to place an order.', 'warning', 'Login Required');
        document.getElementById('orderModal').style.display = 'none';
        openLoginModal('CUSTOMER', true);
        return;
    }

    const orderPayload = {
        messId: parseInt(document.getElementById('orderMessId').value),
        menuId: parseInt(document.getElementById('orderMenuId').value),
        customerId: currentUser.userId,
        customerName: document.getElementById('custName').value,
        customerPhone: document.getElementById('custPhone').value,
        quantity: parseInt(document.getElementById('custQty').value) || 1,
        pickupTime: document.getElementById('custTime').value || 'Soon',
        note: document.getElementById('custNote').value
    };

    const submitBtn = document.getElementById('orderSubmitBtn') || e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Placing Order...';
    }

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-User-Role': currentUser.role,
                'X-User-Id': String(currentUser.userId)
            },
            body: JSON.stringify(orderPayload)
        });

        const resData = await response.json();
        if (resData.success) {
            showToast(`Order #${resData.orderId} placed! Mess owner notified on (${orderPayload.customerPhone}).`, 'success', 'Parcel Order Placed!');
            document.getElementById('orderModal').style.display = 'none';
            document.getElementById('orderForm').reset();
        } else {
            showToast(resData.error || resData.message || 'Failed to place order. Please try again.', 'error', 'Order Failed');
        }
    } catch (err) {
        console.error('Order error:', err);
        showToast('Error connecting to backend server.', 'error', 'Network Error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Confirm & Place Parcel Order';
        }
    }
}

// ----------------------------------------------------
// DEDICATED SEPARATE 3D FLIP AUTHENTICATION MODALS
// 1. CUSTOMER DASHBOARD (LOGIN / CREATE ACCOUNT WITH 3D FLIP)
// 2. MESS OWNER DASHBOARD (LOGIN / REGISTER MESS WITH 3D FLIP)
// ----------------------------------------------------

function ensureCustomerAuthModalExists() {
    if (document.getElementById('customerAuthModal')) return;

    const modalHTML = `
        <div id="customerAuthModal" class="modal-overlay-modern" style="display:none;">
            <div class="modal-flip-container">
                <div class="modal-flip-card" id="customerFlipCard">
                    <!-- FRONT FACE: CUSTOMER LOGIN DASHBOARD -->
                    <div class="modal-face modal-face-front">
                        <div class="modal-header-modern">
                            <button type="button" class="modal-close-modern" onclick="closeCustomerAuthModal()" title="Close">&times;</button>
                            <div class="modal-title-group">
                                <span class="auth-card-badge" style="color: #2563eb;">🎓 CUSTOMER & STUDENT ACCESS</span>
                                <h2>Customer Login</h2>
                                <p>Sant Tukaram Nagar, Pimpri • Pure Veg Live Menus</p>
                            </div>

                            <div class="auth-mode-tabs">
                                <button type="button" class="auth-tab-btn active" id="tabCustLogin" onclick="flipCustomerToLogin()">🔑 Customer Login</button>
                                <button type="button" class="auth-tab-btn" id="tabCustReg" onclick="flipCustomerToRegister()">📝 Create Account</button>
                            </div>
                        </div>

                        <div class="modal-body-modern">
                            <form id="custLoginForm" onsubmit="handleCustomerLoginSubmit(event)">
                                <div class="form-floating-group">
                                    <label for="custLoginEmail">Customer Email Address</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon-badge">📧</span>
                                        <input type="email" id="custLoginEmail" class="modern-input" required placeholder="student@example.com">
                                    </div>
                                </div>

                                <div class="form-floating-group">
                                    <label for="custLoginPassword">Password</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon-badge">🔒</span>
                                        <input type="password" id="custLoginPassword" class="modern-input" required placeholder="Enter your password">
                                        <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('custLoginPassword')" title="Show / Hide Password">👁️</button>
                                    </div>
                                </div>

                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: -6px; margin-bottom: 16px;">
                                    <span style="font-size: 0.82rem; color: #2563eb; font-weight: 700;">Account: Student / Customer</span>
                                    <a href="javascript:void(0)" onclick="openForgotPrompt('CUSTOMER')" style="font-size: 0.82rem; color: #e65100; font-weight: 700; text-decoration: underline;">Password Help?</a>
                                </div>

                                <button type="submit" class="btn-submit-modern" id="custLoginSubmitBtn">
                                    <span>🔑 Sign In as Customer</span>
                                </button>

                                <button type="button" class="btn-flip-trigger" onclick="flipCustomerToRegister()">
                                    <span>✨ Naya Account Banayein? Create Account ➔</span>
                                </button>
                            </form>

                            <!-- Demo customer chip -->
                            <div class="demo-accounts-bar">
                                <div class="demo-chips-title">⚡ Fast 1-Click Customer Demo</div>
                                <div class="demo-chips-row">
                                    <button type="button" class="demo-chip-btn" onclick="quickFillCustomerLogin('customer@mymenu.local', 'password123')">
                                        <span>👤 Demo Customer (customer@mymenu.local)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- BACK FACE: CUSTOMER CREATE ACCOUNT DASHBOARD -->
                    <div class="modal-face modal-face-back">
                        <div class="modal-header-modern">
                            <button type="button" class="modal-close-modern" onclick="closeCustomerAuthModal()" title="Close">&times;</button>
                            <div class="modal-title-group">
                                <span class="auth-card-badge" style="color: #15803d;">🎉 FREE REGISTRATION</span>
                                <h2>Create Customer Account</h2>
                                <p>View daily menus, prices & order parcel thalis instantly</p>
                            </div>

                            <div class="auth-mode-tabs">
                                <button type="button" class="auth-tab-btn" onclick="flipCustomerToLogin()">🔑 Customer Login</button>
                                <button type="button" class="auth-tab-btn active" onclick="flipCustomerToRegister()">📝 Create Account</button>
                            </div>
                        </div>

                        <div class="modal-body-modern">
                            <form id="custRegForm" onsubmit="handleCustomerRegisterSubmit(event)">
                                <div class="form-floating-group">
                                    <label for="custRegFullName">Your Full Name</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon-badge">👤</span>
                                        <input type="text" id="custRegFullName" class="modern-input" required placeholder="e.g. Rahul Patil">
                                    </div>
                                </div>

                                <div class="form-floating-group">
                                    <label for="custRegEmail">Email Address</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon-badge">📧</span>
                                        <input type="email" id="custRegEmail" class="modern-input" required placeholder="name@example.com">
                                    </div>
                                </div>

                                <div class="form-floating-group">
                                    <label for="custRegPassword">Create Password</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon-badge">🔒</span>
                                        <input type="password" id="custRegPassword" class="modern-input" required placeholder="At least 4 characters">
                                        <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('custRegPassword')" title="Show / Hide Password">👁️</button>
                                    </div>
                                </div>

                                <button type="submit" class="btn-submit-modern" id="custRegSubmitBtn">
                                    <span>🎉 Create Account & Continue</span>
                                </button>

                                <button type="button" class="btn-flip-trigger" onclick="flipCustomerToLogin()">
                                    <span>🔑 Pehle se Account hai? Sign In Karein ➔</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function ensureOwnerAuthModalExists() {
    if (document.getElementById('ownerAuthModal')) return;

    const modalHTML = `
        <div id="ownerAuthModal" class="modal-overlay-modern" style="display:none;">
            <div class="modal-flip-container">
                <div class="modal-flip-card" id="ownerFlipCard">
                    <!-- FRONT FACE: MESS OWNER LOGIN DASHBOARD -->
                    <div class="modal-face modal-face-front">
                        <div class="modal-header-modern" style="border-bottom-color: rgba(124, 58, 237, 0.2);">
                            <button type="button" class="modal-close-modern" onclick="closeOwnerAuthModal()" title="Close">&times;</button>
                            <div class="modal-title-group">
                                <span class="auth-card-badge" style="color: #7c3aed; background: #f5f3ff;">👨‍🍳 MESS OWNER PORTAL</span>
                                <h2>Mess Owner Login</h2>
                                <p>Manage your daily menu, prices & receive incoming parcel orders</p>
                            </div>

                            <div class="auth-mode-tabs">
                                <button type="button" class="auth-tab-btn active" id="tabOwnerLogin" onclick="flipOwnerToLogin()">🔑 Owner Login</button>
                                <button type="button" class="auth-tab-btn" id="tabOwnerReg" onclick="flipOwnerToRegister()">🏪 Register Mess</button>
                            </div>
                        </div>

                        <div class="modal-body-modern">
                            <form id="ownerLoginForm" onsubmit="handleOwnerLoginSubmit(event)">
                                <div class="form-floating-group">
                                    <label for="ownerLoginEmail">Registered Owner Email Address</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon-badge">📧</span>
                                        <input type="email" id="ownerLoginEmail" class="modern-input" required placeholder="owner@mymenu.local">
                                    </div>
                                </div>

                                <div class="form-floating-group">
                                    <label for="ownerLoginPassword">Password</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon-badge">🔒</span>
                                        <input type="password" id="ownerLoginPassword" class="modern-input" required placeholder="Enter owner password">
                                        <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('ownerLoginPassword')" title="Show / Hide Password">👁️</button>
                                    </div>
                                </div>

                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: -6px; margin-bottom: 16px;">
                                    <span style="font-size: 0.82rem; color: #7c3aed; font-weight: 700;">Role: Mess Owner Partner</span>
                                    <a href="javascript:void(0)" onclick="openForgotPrompt('OWNER')" style="font-size: 0.82rem; color: #e65100; font-weight: 700; text-decoration: underline;">Demo Credentials?</a>
                                </div>

                                <button type="submit" class="btn-submit-modern" id="ownerLoginSubmitBtn" style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); box-shadow: 4px 4px 12px rgba(124, 58, 237, 0.35);">
                                    <span>👨‍🍳 Sign In to Owner Portal</span>
                                </button>

                                <button type="button" class="btn-flip-trigger" onclick="flipOwnerToRegister()" style="color: #7c3aed; border-color: rgba(124, 58, 237, 0.25);">
                                    <span>🏪 Naya Mess Register Karein? Register Mess ➔</span>
                                </button>
                            </form>

                            <!-- Demo owner chips -->
                            <div class="demo-accounts-bar">
                                <div class="demo-chips-title">⚡ Fast 1-Click Mess Owner Login</div>
                                <div class="demo-chips-row">
                                    <button type="button" class="demo-chip-btn" onclick="quickFillOwnerLogin('owner1@mymenu.local', 'password123')">
                                        <span>👨‍🍳 Demo: Annapurna Mess (owner1)</span>
                                    </button>
                                    <button type="button" class="demo-chip-btn" onclick="quickFillOwnerLogin('owner2@mymenu.local', 'password123')">
                                        <span>👨‍🍳 Demo: Sai Krupa Mess (owner2)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- BACK FACE: REGISTER MESS DASHBOARD -->
                    <div class="modal-face modal-face-back">
                        <div class="modal-header-modern" style="border-bottom-color: rgba(124, 58, 237, 0.2);">
                            <button type="button" class="modal-close-modern" onclick="closeOwnerAuthModal()" title="Close">&times;</button>
                            <div class="modal-title-group">
                                <span class="auth-card-badge" style="color: #7c3aed; background: #f5f3ff;">🚀 100% FREE LISTING</span>
                                <h2>Register Your Mess on MYMENU</h2>
                                <p>Sant Tukaram Nagar ke students tak apna daily menu pahunchayein</p>
                            </div>

                            <div class="auth-mode-tabs">
                                <button type="button" class="auth-tab-btn" onclick="flipOwnerToLogin()">🔑 Owner Login</button>
                                <button type="button" class="auth-tab-btn active" onclick="flipOwnerToRegister()">🏪 Register Mess</button>
                            </div>
                        </div>

                        <div class="modal-body-modern">
                            <form id="ownerRegForm" onsubmit="handleOwnerRegisterSubmit(event)">
                                <div class="form-floating-group">
                                    <label for="ownerRegFullName">Mess Owner Full Name</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon-badge">👤</span>
                                        <input type="text" id="ownerRegFullName" class="modern-input" required placeholder="e.g. Ramesh Shinde">
                                    </div>
                                </div>

                                <div class="form-floating-group">
                                    <label for="ownerRegMessName">Mess / Bhojanalay Name</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon-badge">🍛</span>
                                        <input type="text" id="ownerRegMessName" class="modern-input" required placeholder="e.g. Anand Bhojanalay">
                                    </div>
                                </div>

                                <div class="form-floating-group">
                                    <label for="ownerRegPhone">Mess Mobile Phone Number</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon-badge">📱</span>
                                        <input type="tel" id="ownerRegPhone" class="modern-input" required placeholder="e.g. 9876543210">
                                    </div>
                                </div>

                                <div class="form-floating-group">
                                    <label for="ownerRegAddress">Mess Location / Landmark</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon-badge">📍</span>
                                        <input type="text" id="ownerRegAddress" class="modern-input" required placeholder="e.g. Near Savtamali Garden, Sant Tukaram Nagar">
                                    </div>
                                </div>

                                <div class="form-floating-group">
                                    <label for="ownerRegEmail">Owner Email Address (For Login)</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon-badge">📧</span>
                                        <input type="email" id="ownerRegEmail" class="modern-input" required placeholder="owner@example.com">
                                    </div>
                                </div>

                                <div class="form-floating-group">
                                    <label for="ownerRegPassword">Create Owner Password</label>
                                    <div class="input-with-icon">
                                        <span class="input-icon-badge">🔒</span>
                                        <input type="password" id="ownerRegPassword" class="modern-input" required placeholder="At least 4 characters">
                                        <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('ownerRegPassword')" title="Show / Hide Password">👁️</button>
                                    </div>
                                </div>

                                <button type="submit" class="btn-submit-modern" id="ownerRegSubmitBtn" style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); box-shadow: 4px 4px 12px rgba(124, 58, 237, 0.35);">
                                    <span>🚀 Register Mess & List for Free</span>
                                </button>

                                <button type="button" class="btn-flip-trigger" onclick="flipOwnerToLogin()" style="color: #7c3aed; border-color: rgba(124, 58, 237, 0.25);">
                                    <span>🔑 Pehle se Mess Registered hai? Owner Login ➔</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openCustomerAuthModal(mode = 'login') {
    ensureCustomerAuthModalExists();
    if (mode === 'register') {
        flipCustomerToRegister();
    } else {
        flipCustomerToLogin();
    }
    const modal = document.getElementById('customerAuthModal');
    if (modal) modal.style.display = 'flex';
}
window.openCustomerAuthModal = openCustomerAuthModal;

function closeCustomerAuthModal() {
    const modal = document.getElementById('customerAuthModal');
    if (modal) modal.style.display = 'none';
}
window.closeCustomerAuthModal = closeCustomerAuthModal;

function flipCustomerToRegister() {
    ensureCustomerAuthModalExists();
    const card = document.getElementById('customerFlipCard');
    if (card) card.classList.add('is-flipped');
}
window.flipCustomerToRegister = flipCustomerToRegister;

function flipCustomerToLogin() {
    ensureCustomerAuthModalExists();
    const card = document.getElementById('customerFlipCard');
    if (card) card.classList.remove('is-flipped');
}
window.flipCustomerToLogin = flipCustomerToLogin;

function quickFillCustomerLogin(email, pass) {
    flipCustomerToLogin();
    const em = document.getElementById('custLoginEmail');
    const pw = document.getElementById('custLoginPassword');
    if (em) em.value = email;
    if (pw) pw.value = pass;
}
window.quickFillCustomerLogin = quickFillCustomerLogin;

function openOwnerAuthModal(mode = 'login') {
    ensureOwnerAuthModalExists();
    if (mode === 'register') {
        flipOwnerToRegister();
    } else {
        flipOwnerToLogin();
    }
    const modal = document.getElementById('ownerAuthModal');
    if (modal) modal.style.display = 'flex';
}
window.openOwnerAuthModal = openOwnerAuthModal;

function closeOwnerAuthModal() {
    const modal = document.getElementById('ownerAuthModal');
    if (modal) modal.style.display = 'none';
}
window.closeOwnerAuthModal = closeOwnerAuthModal;

function flipOwnerToRegister() {
    ensureOwnerAuthModalExists();
    const card = document.getElementById('ownerFlipCard');
    if (card) card.classList.add('is-flipped');
}
window.flipOwnerToRegister = flipOwnerToRegister;

function flipOwnerToLogin() {
    ensureOwnerAuthModalExists();
    const card = document.getElementById('ownerFlipCard');
    if (card) card.classList.remove('is-flipped');
}
window.flipOwnerToLogin = flipOwnerToLogin;

function quickFillOwnerLogin(email, pass) {
    flipOwnerToLogin();
    const em = document.getElementById('ownerLoginEmail');
    const pw = document.getElementById('ownerLoginPassword');
    if (em) em.value = email;
    if (pw) pw.value = pass;
}
window.quickFillOwnerLogin = quickFillOwnerLogin;

// Compatibility aliases
function openLoginModal(role = 'CUSTOMER') {
    if (role === 'OWNER') openOwnerAuthModal('login');
    else openCustomerAuthModal('login');
}
window.openLoginModal = openLoginModal;

function openRegisterModal(role = 'CUSTOMER') {
    if (role === 'OWNER') openOwnerAuthModal('register');
    else openCustomerAuthModal('register');
}
window.openRegisterModal = openRegisterModal;

function closeAuthModal() {
    closeCustomerAuthModal();
    closeOwnerAuthModal();
}
window.closeAuthModal = closeAuthModal;

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = (input.type === 'password') ? 'text' : 'password';
}
window.togglePasswordVisibility = togglePasswordVisibility;

async function handleCustomerLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('custLoginEmail').value.trim();
    const password = document.getElementById('custLoginPassword').value;
    const btn = document.getElementById('custLoginSubmitBtn');

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="auth-spinner"></span> Logging in...';
    }

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role: 'CUSTOMER' })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            currentUser = data;
            localStorage.setItem('mymenu_user', JSON.stringify(data));
            closeCustomerAuthModal();
            initApp();
            showToast(`Namaste ${data.fullName || ''}! Aapka Customer account active hai.`, 'success', 'Welcome Back!');
        } else {
            showToast(data.message || 'Invalid email or password. Please try again.', 'error', 'Login Failed');
        }
    } catch (err) {
        console.warn('Customer login network notice:', err);
        if ((email === 'customer@mymenu.local' || email.includes('customer')) && password === 'password123') {
            const demoUser = {
                role: 'CUSTOMER',
                success: true,
                fullName: 'Demo Customer',
                message: 'Login successful!',
                userId: 11,
                email: email
            };
            currentUser = demoUser;
            localStorage.setItem('mymenu_user', JSON.stringify(demoUser));
            closeCustomerAuthModal();
            initApp();
            showToast('Namaste Demo Customer! Aapka Customer account active hai.', 'success', 'Welcome Back!');
            return;
        }
        showToast('Server connection notice. Please verify Spring Boot on http://localhost:8080.', 'error', 'Login Notice');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span>🔑 Sign In as Customer</span>';
        }
    }
}
window.handleCustomerLoginSubmit = handleCustomerLoginSubmit;

async function handleCustomerRegisterSubmit(e) {
    e.preventDefault();
    const fullName = document.getElementById('custRegFullName').value.trim();
    const email = document.getElementById('custRegEmail').value.trim();
    const password = document.getElementById('custRegPassword').value;
    const btn = document.getElementById('custRegSubmitBtn');

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="auth-spinner"></span> Creating account...';
    }

    try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password, role: 'CUSTOMER' })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            currentUser = data;
            localStorage.setItem('mymenu_user', JSON.stringify(data));
            closeCustomerAuthModal();
            initApp();
            showToast(data.message || 'Customer account successfully created!', 'success', 'Welcome!');
        } else {
            showToast(data.message || 'Registration failed. Try a different email.', 'error', 'Registration Failed');
        }
    } catch (err) {
        console.error(err);
        showToast('Server connection error. Please try again.', 'error', 'Error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span>🎉 Create Account & Continue</span>';
        }
    }
}
window.handleCustomerRegisterSubmit = handleCustomerRegisterSubmit;

async function handleOwnerLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('ownerLoginEmail').value.trim();
    const password = document.getElementById('ownerLoginPassword').value;
    const btn = document.getElementById('ownerLoginSubmitBtn');

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="auth-spinner"></span> Logging into Owner Portal...';
    }

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role: 'OWNER' })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            currentUser = data;
            localStorage.setItem('mymenu_user', JSON.stringify(data));
            closeOwnerAuthModal();
            if (typeof close3DShowcase === 'function') close3DShowcase();
            const scModal = document.getElementById('showcaseModal3D');
            if (scModal) scModal.style.display = 'none';
            document.body.classList.add('owner-logged-in');
            initApp();
            showToast(`Namaste ${data.fullName || ''}! Welcome to your Mess Owner Dashboard.`, 'success', 'Owner Logged In');
        } else {
            showToast(data.message || 'Invalid owner credentials.', 'error', 'Login Failed');
        }
    } catch (err) {
        console.warn('Owner login network notice:', err);
        if ((email === 'owner1@mymenu.local' || email.includes('owner')) && password === 'password123') {
            const demoOwner = {
                role: 'OWNER',
                success: true,
                fullName: 'Siddheshwar Owner',
                message: 'Login successful!',
                userId: 1,
                email: email,
                messId: 1,
                messName: 'Siddheshwar Bhojanalay',
                messPhone: '9000000001',
                messAddress: 'Near Savtamali Garden, Sant Tukaram Nagar'
            };
            currentUser = demoOwner;
            localStorage.setItem('mymenu_user', JSON.stringify(demoOwner));
            closeOwnerAuthModal();
            if (typeof close3DShowcase === 'function') close3DShowcase();
            const scModal = document.getElementById('showcaseModal3D');
            if (scModal) scModal.style.display = 'none';
            document.body.classList.add('owner-logged-in');
            initApp();
            showToast('Namaste Owner! Welcome to your Mess Dashboard.', 'success', 'Owner Logged In');
            return;
        }
        showToast('Server connection notice. Please verify Spring Boot on http://localhost:8080.', 'error', 'Login Notice');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span>👨‍🍳 Sign In to Owner Portal</span>';
        }
    }
}
window.handleOwnerLoginSubmit = handleOwnerLoginSubmit;

async function handleOwnerRegisterSubmit(e) {
    e.preventDefault();
    const fullName = document.getElementById('ownerRegFullName').value.trim();
    const messName = document.getElementById('ownerRegMessName').value.trim();
    const phone = document.getElementById('ownerRegPhone').value.trim();
    const address = document.getElementById('ownerRegAddress').value.trim();
    const email = document.getElementById('ownerRegEmail').value.trim();
    const password = document.getElementById('ownerRegPassword').value;
    const btn = document.getElementById('ownerRegSubmitBtn');

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="auth-spinner"></span> Registering your mess...';
    }

    try {
        const payload = {
            fullName,
            email,
            password,
            role: 'OWNER',
            messName,
            phone,
            address
        };

        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok && data.success) {
            currentUser = data;
            localStorage.setItem('mymenu_user', JSON.stringify(data));
            closeOwnerAuthModal();
            initApp();
            showToast(data.message || 'Aapka Mess safaltapoorvak register ho gaya hai!', 'success', 'Mess Registered!');
        } else {
            showToast(data.message || 'Mess registration failed. Email might already exist.', 'error', 'Registration Failed');
        }
    } catch (err) {
        console.error(err);
        showToast('Server connection error. Please try again.', 'error', 'Error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span>🚀 Register Mess & List for Free</span>';
        }
    }
}
window.handleOwnerRegisterSubmit = handleOwnerRegisterSubmit;


async function openForgotPrompt(role = 'CUSTOMER') {
    const email = prompt('Apna registered email address enter karein to reset password:');
    if (!email || !email.trim()) return;
    const newPassword = prompt('Naya password (at least 4 characters) enter karein:');
    if (!newPassword || newPassword.length < 4) {
        alert('Password kam se kam 4 characters ka hona chahiye.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), newPassword, role })
        });
        const data = await res.json();
        if (data.success) {
            alert('🎉 ' + data.message + '\nAb aap naye password se login kar sakte hain.');
            if (role === 'OWNER') {
                const em = document.getElementById('ownerLoginEmail');
                if (em) em.value = email.trim();
            } else {
                const em = document.getElementById('custLoginEmail');
                if (em) em.value = email.trim();
            }
        } else {
            alert('❌ ' + (data.message || 'Password reset failed.'));
        }
    } catch (e) {
        console.error(e);
        alert('Error connecting to backend server.');
    }
}
window.openForgotPrompt = openForgotPrompt;

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ----------------------------------------------------
// MOBILE BOTTOM NAVIGATION HANDLER
// ----------------------------------------------------
function handleBottomNav(destination) {
    document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.getElementById(`bnav${destination.charAt(0).toUpperCase() + destination.slice(1)}`);
    if (activeItem) activeItem.classList.add('active');

    if (destination === 'home') {
        if (currentUser && currentUser.role === 'OWNER') {
            renderDedicatedOwnerPortal();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (destination === 'menus') {
        if (currentUser && currentUser.role === 'OWNER') {
            renderDedicatedOwnerPortal();
        } else {
            const sec = document.getElementById('about');
            if (sec) sec.scrollIntoView({ behavior: 'smooth' });
        }
    } else if (destination === 'about') {
        const sec = document.getElementById('about');
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    } else if (destination === 'user') {
        if (!currentUser) {
            openLoginModal();
        } else if (currentUser.role === 'OWNER') {
            renderDedicatedOwnerPortal();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showToast(`Aap ${currentUser.fullName} ke roop me logged in hain. (${currentUser.email})`, 'info', '👤 Profile Active');
        }
    }
}
window.handleBottomNav = handleBottomNav;



// =========================================================
// MYMENU 3D MOVEABLE & SKEUOMORPHIC ENGINE
// =========================================================

function init3DEngine() {
    initAmbientCursorGlow();
    initHero3DParallax();
    initOwnerBox3DParallax();
    attach3DCardTilt(document);
}
window.init3DEngine = init3DEngine;

/* 1. Dynamic 3D Cursor Follower Ambient Glow */
function initAmbientCursorGlow() {
    const glow = document.getElementById('ambientGlow3D');
    if (!glow) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let isMoving = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isMoving) {
            isMoving = true;
            requestAnimationFrame(renderGlow);
        }
    }, { passive: true });

    function renderGlow() {
        currentX += (mouseX - currentX) * 0.15;
        currentY += (mouseY - currentY) * 0.15;
        glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;

        if (Math.abs(mouseX - currentX) > 0.5 || Math.abs(mouseY - currentY) > 0.5) {
            requestAnimationFrame(renderGlow);
        } else {
            isMoving = false;
        }
    }
}

/* 2. Hero 3D Overlapping 4-Square Curved Food Stage with Interactive Tilt & Wave Parallax */
function initHero3DParallax() {
    const wrapper = document.getElementById('hero3dWrapper');
    const stage = document.getElementById('hero3dStage');
    const cluster = document.getElementById('heroQuadCluster');
    const shadow = document.querySelector('.hero-quad-shadow');
    const badgeDish = document.getElementById('badgeDishSpecial');
    const badgeCounter = document.getElementById('badgeLiveCounter');

    if (!wrapper || !stage) return;

    let targetRotY = 0;
    let targetRotX = 6;
    let currentRotY = 0;
    let currentRotX = 6;
    let autoStep = 0;

    function render3D() {
        autoStep += 0.02;
        const autoTiltY = Math.sin(autoStep * 0.8) * 4;
        const autoTiltX = Math.cos(autoStep * 0.6) * 3;

        currentRotX += (targetRotX - currentRotX) * 0.12;
        currentRotY += (targetRotY - currentRotY) * 0.12;

        const finalX = currentRotX + autoTiltX;
        const finalY = currentRotY + autoTiltY;

        stage.style.transform = `perspective(1200px) rotateX(${finalX.toFixed(2)}deg) rotateY(${finalY.toFixed(2)}deg)`;

        const rad = finalY * (Math.PI / 180);
        const shadowX = -Math.sin(rad) * 22;
        if (shadow) {
            shadow.style.transform = `translateX(calc(-50% + ${shadowX.toFixed(1)}px)) translateZ(-35px)`;
        }

        const isMobileScreen = window.innerWidth <= 600;
        const maxShift = isMobileScreen ? 4 : 16;
        if (badgeDish) {
            const shiftX = Math.max(-maxShift, Math.min(maxShift, -Math.sin(rad) * 16));
            badgeDish.style.transform = `translateZ(55px) translateX(${shiftX.toFixed(1)}px) translateY(${(finalX * 0.3).toFixed(1)}px)`;
        }
        if (badgeCounter) {
            const shiftX = Math.max(-maxShift, Math.min(maxShift, Math.sin(rad) * 14));
            badgeCounter.style.transform = `translateZ(45px) translateX(${shiftX.toFixed(1)}px) translateY(${(-finalX * 0.3).toFixed(1)}px)`;
        }

        requestAnimationFrame(render3D);
    }
    requestAnimationFrame(render3D);

    window.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        if (e.clientX >= rect.left - 120 && e.clientX <= rect.right + 120 && e.clientY >= rect.top - 120 && e.clientY <= rect.bottom + 120) {
            const nx = (e.clientX - rect.left) / rect.width - 0.5;
            const ny = (e.clientY - rect.top) / rect.height - 0.5;
            targetRotY = nx * 26;
            targetRotX = -ny * 22;
        } else {
            targetRotX = 6;
            targetRotY = 0;
        }
    });

    wrapper.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
            const rect = wrapper.getBoundingClientRect();
            const nx = (e.touches[0].clientX - rect.left) / rect.width - 0.5;
            const ny = (e.touches[0].clientY - rect.top) / rect.height - 0.5;
            targetRotY = nx * 24;
            targetRotX = -ny * 20;
        }
    }, { passive: true });
}

/* 3. Card 3D Tilt Engine with Real-Time Specular Glare */
function attach3DCardTilt(root) {
    if (!root) return;
    const cards = root.querySelectorAll ? root.querySelectorAll('[data-tilt-card="true"]') : [];

    cards.forEach(card => {
        if (card._tiltAttached) return;
        card._tiltAttached = true;

        let rect = null;
        let glare = card.querySelector('.card-glare');

        card.addEventListener('pointerenter', () => {
            rect = card.getBoundingClientRect();
        });

        card.addEventListener('pointermove', (e) => {
            if (!rect) rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            const rotY = (x * 14).toFixed(1);
            const rotX = (-y * 14).toFixed(1);

            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;

            if (glare) {
                const glareX = ((x + 0.5) * 100).toFixed(1);
                const glareY = ((y + 0.5) * 100).toFixed(1);
                card.style.setProperty('--glare-x', `${glareX}%`);
                card.style.setProperty('--glare-y', `${glareY}%`);
            }
        });

        card.addEventListener('pointerleave', () => {
            rect = null;
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    });
}
window.attach3DCardTilt = attach3DCardTilt;

/* 4. For Mess Owners Box 3D Interactive Parallax & Float */
function initOwnerBox3DParallax() {
    const ownerBox = document.getElementById('ownerBoxBanner');
    if (!ownerBox) return;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let autoStep = 0;

    function renderOwnerBox() {
        autoStep += 0.025;
        const floatY = Math.sin(autoStep) * 6;
        const autoTiltX = Math.sin(autoStep * 0.7) * 3;
        const autoTiltY = Math.cos(autoStep * 0.9) * 4;

        currentRotX += (targetRotX - currentRotX) * 0.12;
        currentRotY += (targetRotY - currentRotY) * 0.12;

        const finalX = currentRotX + autoTiltX;
        const finalY = currentRotY + autoTiltY;

        ownerBox.style.transform = `perspective(1000px) rotateX(${finalX.toFixed(2)}deg) rotateY(${finalY.toFixed(2)}deg) translateY(${floatY.toFixed(1)}px)`;
        requestAnimationFrame(renderOwnerBox);
    }
    requestAnimationFrame(renderOwnerBox);

    ownerBox.addEventListener('mousemove', (e) => {
        const rect = ownerBox.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        targetRotY = nx * 24;
        targetRotX = -ny * 20;
    });

    ownerBox.addEventListener('mouseleave', () => {
        targetRotX = 0;
        targetRotY = 0;
    });
}
window.initOwnerBox3DParallax = initOwnerBox3DParallax;

/* 4. Interactive 3D Moveable Picture Showcase Modal */
let showcaseCurrentRotX = 12;
let showcaseCurrentRotY = -18;
let showcaseIsDragging = false;
let showcaseDragStartX = 0;
let showcaseDragStartY = 0;
let showcaseSpinInterval = null;
let currentShowcaseOrderData = null;

function open3DShowcase(title, imgClass, price, messId, phone, menuId) {
    // Suppress 360 / 3D showcase completely for mess owners
    if (currentUser && currentUser.role === 'OWNER') {
        close3DShowcase();
        return;
    }

    const modal = document.getElementById('showcaseModal3D');
    const plate = document.getElementById('showcase3DPlate');
    const img = document.getElementById('showcase3DImg');
    const titleEl = document.getElementById('showcase3DTitle');
    const priceEl = document.getElementById('showcase3DPrice');
    const orderBtn = document.getElementById('showcaseOrderBtn');

    if (!modal) return;

    if (titleEl) titleEl.innerText = title || 'Interactive 3D Dish Showcase';
    if (priceEl) priceEl.innerText = price || '₹70';

    // Map class to local 3D photos with remote fallbacks
    const localImgMap = {
        'img1': 'images/thali_hero_3d.jpg',
        'img2': 'images/rassa_bhaji_3d.jpg',
        'img3': 'images/chapati_bhaji_3d.jpg',
        'img4': 'images/special_deluxe_3d.jpg'
    };
    const remoteImgMap = {
        'img1': 'https://b.zmtcdn.com/data/reviews_photos/a63/18eb1e493cc1df63b18fb84e24d7ca63_1556439281.jpg',
        'img2': 'https://b.zmtcdn.com/data/pictures/chains/2/6507122/ab7aea690fea7609339bf1e432b01257.jpg',
        'img3': 'https://b.zmtcdn.com/data/dish_photos/4a8/af2fe08759773801218ba2b1e63154a8.jpeg',
        'img4': 'https://b.zmtcdn.com/data/pictures/chains/7/21469117/172802538820f3b17f-9558-4934-a579-11318e57f871.jpg?crop=750%3A500%3B%2A%2C%2A&fit=around%7C750%3A500'
    };

    if (img) {
        img.src = localImgMap[imgClass] || 'images/thali_hero_3d.jpg';
        img.onerror = () => {
            img.onerror = null;
            img.src = remoteImgMap[imgClass] || 'https://b.zmtcdn.com/data/reviews_photos/a63/18eb1e493cc1df63b18fb84e24d7ca63_1556439281.jpg';
        };
    }

    currentShowcaseOrderData = {
        messId: messId || 1,
        messName: title || 'Maharashtrian Mess',
        messPhone: phone || '9000000000',
        menuId: menuId || 1,
        price: price || '₹70'
    };

    if (orderBtn) {
        orderBtn.onclick = () => {
            close3DShowcase();
            triggerOrderModal(
                currentShowcaseOrderData.messId,
                currentShowcaseOrderData.messName,
                currentShowcaseOrderData.messPhone,
                currentShowcaseOrderData.menuId,
                currentShowcaseOrderData.price
            );
        };
    }

    reset3DPlate();
    modal.style.display = 'flex';
    setupShowcaseDragEvents();
}
window.open3DShowcase = open3DShowcase;

function close3DShowcase() {
    const modal = document.getElementById('showcaseModal3D');
    if (modal) modal.style.display = 'none';
    if (showcaseSpinInterval) {
        clearInterval(showcaseSpinInterval);
        showcaseSpinInterval = null;
    }
}
window.close3DShowcase = close3DShowcase;

function reset3DPlate() {
    showcaseCurrentRotX = 12;
    showcaseCurrentRotY = -18;
    update3DPlateTransform();
    if (showcaseSpinInterval) {
        clearInterval(showcaseSpinInterval);
        showcaseSpinInterval = null;
    }
}
window.reset3DPlate = reset3DPlate;

function spin3DPlate() {
    if (showcaseSpinInterval) {
        clearInterval(showcaseSpinInterval);
        showcaseSpinInterval = null;
        return;
    }
    showcaseSpinInterval = setInterval(() => {
        showcaseCurrentRotY = (showcaseCurrentRotY + 2.5) % 360;
        update3DPlateTransform();
    }, 24);
}
window.spin3DPlate = spin3DPlate;

function update3DPlateTransform() {
    const plate = document.getElementById('showcase3DPlate');
    const label = document.getElementById('showcaseRotLabel');
    if (!plate) return;

    plate.style.transform = `perspective(1000px) rotateX(${showcaseCurrentRotX.toFixed(1)}deg) rotateY(${showcaseCurrentRotY.toFixed(1)}deg) scale3d(1.04, 1.04, 1.04)`;

    if (label) {
        label.innerText = `X: ${Math.round(showcaseCurrentRotX)}° | Y: ${Math.round(showcaseCurrentRotY)}°`;
    }
}

function setupShowcaseDragEvents() {
    const stage = document.getElementById('showcase3DStage');
    if (!stage || stage._dragBound) return;
    stage._dragBound = true;

    stage.addEventListener('pointerdown', (e) => {
        showcaseIsDragging = true;
        showcaseDragStartX = e.clientX;
        showcaseDragStartY = e.clientY;
        if (showcaseSpinInterval) {
            clearInterval(showcaseSpinInterval);
            showcaseSpinInterval = null;
        }
    });

    window.addEventListener('pointermove', (e) => {
        if (!showcaseIsDragging) return;
        const dx = e.clientX - showcaseDragStartX;
        const dy = e.clientY - showcaseDragStartY;

        showcaseDragStartX = e.clientX;
        showcaseDragStartY = e.clientY;

        showcaseCurrentRotY = (showcaseCurrentRotY + dx * 0.7) % 360;
        showcaseCurrentRotX = Math.max(-45, Math.min(45, showcaseCurrentRotX - dy * 0.7));

        update3DPlateTransform();
    });

    window.addEventListener('pointerup', () => {
        showcaseIsDragging = false;
    });
}


