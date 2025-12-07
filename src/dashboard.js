// Dashboard JavaScript
let currentUser = null;

// Load current user on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentUser();
    setupNavigation();
    loadDashboardData();
});

// Load current user from API
async function loadCurrentUser() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });

        if (!response.ok) {
            // Not logged in, redirect to home
            window.location.href = './index.html';
            return;
        }

        const result = await response.json();
        currentUser = result.user;
    } catch (error) {
        console.error('Failed to load user:', error);
        window.location.href = './index.html';
    }
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);

            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// Show specific section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');

        // Load data for the specific section
        switch(sectionId) {
            case 'orders':
                loadOrdersSection();
                break;
            case 'products':
                loadProductsSection();
                break;
            case 'balance':
                loadWalletSection();
                break;
            case 'profile':
                loadProfileSection();
                break;
            case 'account':
                loadAccountSection();
                break;
        }
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load stats
        await loadStats();

        // Load recent transactions
        await loadTransactions();

        // Load rank progress
        await loadRankProgress();
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch('/api/dashboard/stats', {
            credentials: 'include'
        });

        if (response.ok) {
            const result = await response.json();
            const data = result.data;

            // Update stat cards
            document.getElementById('completed-orders').textContent = data.completedOrders;
            document.getElementById('pending-orders').textContent = data.pendingOrders;
            document.getElementById('total-refund').textContent = formatCurrency(data.totalRefund);
            document.getElementById('available-balance').textContent = formatCurrency(data.availableBalance);
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Load transactions
async function loadTransactions() {
    try {
        const response = await fetch('/api/dashboard/transactions', {
            credentials: 'include'
        });

        if (response.ok) {
            const result = await response.json();
            const transactions = result.data;

            renderTransactions(transactions);
        }
    } catch (error) {
        console.error('Failed to load transactions:', error);
    }
}

// Render transactions in table
function renderTransactions(transactions) {
    const tbody = document.getElementById('recent-orders-tbody');

    if (!transactions || transactions.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="4">
                    <div class="empty-content">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có đơn hàng nào</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = transactions.map(transaction => `
        <tr>
            <td>${transaction.orderId || 'N/A'}</td>
            <td>${transaction.store || 'N/A'}</td>
            <td>${formatCurrency(transaction.amount)}</td>
            <td>
                <span class="status-badge status-${transaction.status.toLowerCase()}">
                    ${getStatusText(transaction.status)}
                </span>
            </td>
        </tr>
    `).join('');
}

// Get status text in Vietnamese
function getStatusText(status) {
    const statusMap = {
        'PENDING': 'Đang xử lý',
        'COMPLETED': 'Hoàn thành',
        'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
}

// Load rank progress
async function loadRankProgress() {
    try {
        const response = await fetch('/api/dashboard/rank-progress', {
            credentials: 'include'
        });

        if (response.ok) {
            const result = await response.json();
            const data = result.data;

            // Update rank display
            document.getElementById('current-rank').textContent = data.currentRank;
            document.getElementById('order-count').textContent = data.orderCount;

            // Update progress bar
            const progressFill = document.getElementById('rank-progress-fill');
            progressFill.style.width = `${Math.min(data.progress, 100)}%`;

            // Update message
            const ordersNeededElement = document.getElementById('orders-needed');
            if (ordersNeededElement) {
                ordersNeededElement.textContent = data.ordersNeeded;
            }

            // Update rank icon based on rank
            updateRankIcon(data.currentRank);
        }
    } catch (error) {
        console.error('Failed to load rank progress:', error);
    }
}

// Update rank icon based on rank
function updateRankIcon(rank) {
    const rankIcon = document.getElementById('rank-icon');
    if (!rankIcon) return;

    const rankIcons = {
        'ĐỒNG': 'fa-medal',
        'BẠC': 'fa-award',
        'VÀNG': 'fa-trophy',
        'BẠCH KIM CƯƠNG': 'fa-gem',
        'KIM CƯƠNG': 'fa-crown'
    };

    rankIcon.innerHTML = `<i class="fas ${rankIcons[rank] || 'fa-medal'}"></i>`;
}

// Format currency
function formatCurrency(amount) {
    if (amount === 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Logout function
async function handleLogout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        window.location.href = './index.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = './index.html';
    }
}

// Add status badge styles
const style = document.createElement('style');
style.textContent = `
    .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
    }

    .status-pending {
        background: #fef3c7;
        color: #92400e;
    }

    .status-completed {
        background: #d1fae5;
        color: #065f46;
    }

    .status-cancelled {
        background: #fee2e2;
        color: #991b1b;
    }
`;
document.head.appendChild(style);

// ===== ĐƠN HÀNG SECTION =====
let ordersCurrentPage = 1;
const ordersPerPage = 10;

// Load orders when Đơn Hàng section is shown
async function loadOrdersSection() {
    await loadOrders();
    setupOrderFilters();
    setupOrderPagination();
}

// Load all orders with pagination and filtering
async function loadOrders(page = 1, status = 'all', search = '') {
    try {
        const params = new URLSearchParams({
            page: page,
            limit: ordersPerPage,
            status: status,
            search: search
        });

        const response = await fetch(`/api/dashboard/orders?${params}`, {
            credentials: 'include'
        });

        if (response.ok) {
            const result = await response.json();
            renderOrders(result.data.orders);
            renderOrderPagination(result.data.pagination);
            ordersCurrentPage = page;
        }
    } catch (error) {
        console.error('Failed to load orders:', error);
    }
}

// Render orders table
function renderOrders(orders) {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="6">
                    <div class="empty-content">
                        <i class="fas fa-inbox"></i>
                        <p>Chưa có đơn hàng nào</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.orderId || 'N/A'}</td>
            <td>${order.store || 'N/A'}</td>
            <td>${formatCurrency(order.amount)}</td>
            <td>${getStatusText(order.status)}</td>
            <td>${formatDate(order.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="viewOrderDetail('${order.id}')">
                    <i class="fas fa-eye"></i> Chi tiết
                </button>
            </td>
        </tr>
    `).join('');
}

// Setup order filters
function setupOrderFilters() {
    const statusFilter = document.getElementById('order-status-filter');
    const searchInput = document.getElementById('order-search-input');
    const searchBtn = document.getElementById('order-search-btn');

    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            loadOrders(1, statusFilter.value, searchInput?.value || '');
        });
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            loadOrders(1, statusFilter?.value || 'all', searchInput.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadOrders(1, statusFilter?.value || 'all', searchInput.value);
            }
        });
    }
}

// Setup order pagination
function setupOrderPagination() {
    // Pagination is handled by renderOrderPagination function
}

// Render pagination controls
function renderOrderPagination(pagination) {
    const paginationContainer = document.getElementById('orders-pagination');
    if (!paginationContainer) return;

    const { currentPage, totalPages, hasNext, hasPrev } = pagination;

    let paginationHTML = '';

    if (hasPrev) {
        paginationHTML += `
            <button class="btn btn-outline" onclick="loadOrders(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i> Previous
            </button>
        `;
    }

    paginationHTML += `<span class="pagination-info">Page ${currentPage} of ${totalPages}</span>`;

    if (hasNext) {
        paginationHTML += `
            <button class="btn btn-outline" onclick="loadOrders(${currentPage + 1})">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }

    paginationContainer.innerHTML = paginationHTML;
}

// View order detail (placeholder function)
window.viewOrderDetail = function(orderId) {
    showMessage('Tính năng chi tiết đơn hàng đang phát triển', 'info');
};

// ===== SẢN PHẨM SECTION =====
let selectedCategory = 'all';

// Load products/stores when Sản Phẩm section is shown
async function loadProductsSection() {
    await loadStores();
    setupStoreFilters();
}

// Load all stores
async function loadStores(category = 'all') {
    try {
        const params = category !== 'all' ? `?category=${category}` : '';
        const response = await fetch(`/api/dashboard/stores${params}`, {
            credentials: 'include'
        });

        if (response.ok) {
            const result = await response.json();
            renderStores(result.data.stores);
            renderStoreCategories(result.data.categories);
        }
    } catch (error) {
        console.error('Failed to load stores:', error);
    }
}

// Render stores grid
function renderStores(stores) {
    const grid = document.getElementById('stores-grid');
    if (!grid) return;

    if (!stores || stores.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-store"></i>
                <p>Chưa có cửa hàng nào</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = stores.map(store => `
        <div class="store-card" onclick="visitStore('${store.affiliateUrl}')">
            <div class="store-logo">
                <img src="${store.logo}" alt="${store.name}" onerror="this.src='https://via.placeholder.com/80x80?text=Logo'">
            </div>
            <div class="store-info">
                <h3>${store.name}</h3>
                <p class="store-category">${store.category}</p>
                <div class="store-cashback">
                    <span class="cashback-rate">${store.cashbackRate}%</span>
                    <span class="max-cashback">Tối đa ${formatCurrency(store.maxCashback)}</span>
                </div>
            </div>
            <div class="store-action">
                <button class="btn btn-primary btn-sm">
                    <i class="fas fa-shopping-cart"></i> Mua ngay
                </button>
            </div>
        </div>
    `).join('');
}

// Render store categories
function renderStoreCategories(categories) {
    const categoryFilter = document.getElementById('store-category-filter');
    if (!categoryFilter) return;

    categoryFilter.innerHTML = `
        <option value="all">Tất cả danh mục</option>
        ${categories.map(cat => `
            <option value="${cat}">${cat}</option>
        `).join('')}
    `;
}

// Setup store filters
function setupStoreFilters() {
    const categoryFilter = document.getElementById('store-category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            selectedCategory = categoryFilter.value;
            loadStores(selectedCategory);
        });
    }
}

// Visit store (placeholder function)
window.visitStore = function(url) {
    window.open(url, '_blank');
};

// ===== SỐ DƯ SECTION =====
// Load wallet when Số Dư section is shown
async function loadWalletSection() {
    await loadWallet();
    setupWithdrawalForm();
}

// Load wallet information
async function loadWallet() {
    try {
        const response = await fetch('/api/dashboard/wallet', {
            credentials: 'include'
        });

        if (response.ok) {
            const result = await response.json();
            renderWallet(result.data);
        }
    } catch (error) {
        console.error('Failed to load wallet:', error);
    }
}

// Render wallet information
function renderWallet(data) {
    // Update balance cards
    const elements = {
        'wallet-balance': data.balance,
        'wallet-pending': data.pendingBalance,
        'wallet-withdrawn': data.withdrawnBalance,
        'wallet-total': data.totalRefund,
        'wallet-monthly': data.monthlyEarnings
    };

    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = formatCurrency(value);
    });

    // Update rank
    const rankEl = document.getElementById('wallet-rank');
    if (rankEl) rankEl.textContent = data.rank;

    // Render recent transactions
    renderWalletTransactions(data.recentTransactions);
}

// Render wallet recent transactions
function renderWalletTransactions(transactions) {
    const container = document.getElementById('wallet-transactions');
    if (!container) return;

    if (!transactions || transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exchange-alt"></i>
                <p>Chưa có giao dịch nào</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="transaction-list">
            ${transactions.map(tx => `
                <div class="transaction-item">
                    <div class="transaction-icon ${tx.type.toLowerCase()}">
                        <i class="fas ${getTransactionIcon(tx.type)}"></i>
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-title">${tx.description || tx.store}</div>
                        <div class="transaction-date">${formatDate(tx.createdAt)}</div>
                    </div>
                    <div class="transaction-amount ${tx.amount >= 0 ? 'positive' : 'negative'}">
                        ${tx.amount >= 0 ? '+' : ''}${formatCurrency(tx.amount)}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Get transaction icon
function getTransactionIcon(type) {
    const icons = {
        'cashback': 'fa-hand-holding-usd',
        'withdrawal': 'fa-money-bill-wave',
        'pending': 'fa-clock'
    };
    return icons[type.toLowerCase()] || 'fa-exchange-alt';
}

// Setup withdrawal form
function setupWithdrawalForm() {
    const form = document.getElementById('withdrawal-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const amount = parseFloat(data.amount);

        if (isNaN(amount) || amount <= 0) {
            showMessage('Vui lòng nhập số tiền hợp lệ', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/dashboard/wallet/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message, 'success');
                form.reset();
                await loadWallet(); // Refresh wallet data
            } else {
                showMessage(result.error, 'error');
            }
        } catch (error) {
            console.error('Withdrawal error:', error);
            showMessage('Lỗi kết nối, vui lòng thử lại', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ===== HỒ SƠ SECTION =====
// Load profile when Hồ Sơ section is shown
async function loadProfileSection() {
    await loadProfile();
    setupProfileForm();
}

// Load user profile
async function loadProfile() {
    try {
        const response = await fetch('/api/dashboard/profile', {
            credentials: 'include'
        });

        if (response.ok) {
            const result = await response.json();
            renderProfile(result.data);
        }
    } catch (error) {
        console.error('Failed to load profile:', error);
    }
}

// Render profile information
function renderProfile(data) {
    const { user, stats } = data;

    // Update profile info
    const profileAvatar = document.getElementById('profile-avatar');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profilePhone = document.getElementById('profile-phone');
    const profileRank = document.getElementById('profile-rank');
    const profileMemberSince = document.getElementById('profile-member-since');

    if (profileAvatar) {
        profileAvatar.src = user.avatar || 'https://via.placeholder.com/150?text=Avatar';
    }
    if (profileName) profileName.textContent = user.name;
    if (profileEmail) profileEmail.textContent = user.email;
    if (profilePhone) profilePhone.textContent = user.phone || 'Chưa cập nhật';
    if (profileRank) profileRank.textContent = user.rank;
    if (profileMemberSince) profileMemberSince.textContent = formatDate(user.memberSince);

    // Update stats
    const statElements = {
        'profile-orders': stats.totalOrders,
        'profile-cashback': stats.totalCashback,
        'profile-favorite': stats.favoriteStore
    };

    Object.entries(statElements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) {
            if (id === 'profile-cashback') {
                el.textContent = formatCurrency(value);
            } else {
                el.textContent = value;
            }
        }
    });

    // Fill form fields
    const formName = document.getElementById('profile-form-name');
    const formPhone = document.getElementById('profile-form-phone');
    const formAvatar = document.getElementById('profile-form-avatar');

    if (formName) formName.value = user.name;
    if (formPhone) formPhone.value = user.phone || '';
    if (formAvatar) formAvatar.value = user.avatar || '';
}

// Setup profile form
function setupProfileForm() {
    const form = document.getElementById('profile-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang cập nhật...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/dashboard/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message, 'success');
                await loadProfile(); // Refresh profile data
            } else {
                showMessage(result.error, 'error');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            showMessage('Lỗi kết nối, vui lòng thử lại', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ===== TÀI KHOẢN SECTION =====
// Load account settings when Tài Khoản section is shown
async function loadAccountSection() {
    await loadAccountSettings();
    setupAccountForms();
}

// Load account settings
async function loadAccountSettings() {
    try {
        const response = await fetch('/api/dashboard/account/settings', {
            credentials: 'include'
        });

        if (response.ok) {
            const result = await response.json();
            renderAccountSettings(result.data);
        }
    } catch (error) {
        console.error('Failed to load account settings:', error);
    }
}

// Render account settings
function renderAccountSettings(data) {
    const { user, settings } = data;

    // Update account info display
    const accountEmail = document.getElementById('account-email');
    const accountName = document.getElementById('account-name');
    const accountPhone = document.getElementById('account-phone');
    const accountCreated = document.getElementById('account-created');

    if (accountEmail) accountEmail.textContent = user.email;
    if (accountName) accountName.textContent = user.name;
    if (accountPhone) accountPhone.textContent = user.phone || 'Chưa cập nhật';
    if (accountCreated) accountCreated.textContent = formatDate(user.createdAt);

    // Update notification settings
    Object.entries(settings).forEach(([key, value]) => {
        const checkbox = document.getElementById(`setting-${key}`);
        if (checkbox) checkbox.checked = value;
    });
}

// Setup account forms
function setupAccountForms() {
    // Password change form
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(passwordForm);
            const data = Object.fromEntries(formData.entries());

            if (data.newPassword !== data.confirmPassword) {
                showMessage('Mật khẩu xác nhận không khớp', 'error');
                return;
            }

            const submitBtn = passwordForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang cập nhật...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/dashboard/account/password', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        currentPassword: data.currentPassword,
                        newPassword: data.newPassword
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    showMessage(result.message, 'success');
                    passwordForm.reset();
                } else {
                    showMessage(result.error, 'error');
                }
            } catch (error) {
                console.error('Change password error:', error);
                showMessage('Lỗi kết nối, vui lòng thử lại', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Delete account button
    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const password = prompt('Nhập mật khẩu để xác nhận xóa tài khoản:');
            if (!password) return;

            if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
                deleteAccount(password);
            }
        });
    }
}

// Delete account
async function deleteAccount(password) {
    try {
        const response = await fetch('/api/dashboard/account', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ password })
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(result.message, 'success');
            setTimeout(() => {
                window.location.href = './index.html';
            }, 1500);
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        console.error('Delete account error:', error);
        showMessage('Lỗi kết nối, vui lòng thử lại', 'error');
    }
}

// ===== UTILITY FUNCTIONS =====
// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show message (redefine for dashboard)
function showMessage(message, type = 'info') {
    const messageHTML = `
        <div class="message-toast ${type}">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    const messageEl = document.createElement('div');
    messageEl.innerHTML = messageHTML;
    document.body.appendChild(messageEl.firstElementChild);

    setTimeout(() => {
        const toast = document.querySelector('.message-toast');
        if (toast) toast.remove();
    }, 3000);
}