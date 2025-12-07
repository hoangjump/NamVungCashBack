// Auth Modal Component
const authModal = {
  isOpen: false,
  currentView: 'login', // 'login' or 'register'

  open(view = 'login') {
    this.currentView = view;
    this.isOpen = true;
    this.render();
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.isOpen = false;
    document.body.style.overflow = '';
    const modal = document.getElementById('authModal');
    if (modal) modal.remove();
  },

  render() {
    if (!this.isOpen) return;

    // Remove existing modal if any
    const existingModal = document.getElementById('authModal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
      <div id="authModal" class="auth-modal">
        <div class="modal-overlay" onclick="authModal.close()"></div>
        <div class="modal-content compact">
          <button class="modal-close" onclick="authModal.close()">
            <i class="fas fa-times"></i>
          </button>

          <div class="auth-container">
            <div class="auth-header">
              <img src="https://i.ibb.co/6y2kF0r/namvung-logo.png" alt="NamVung CashBack" class="auth-logo">
              <h2>${this.currentView === 'login' ? 'Đăng nhập' : 'Đăng ký'}</h2>
            </div>

            <form id="authForm" class="auth-form">
              ${this.currentView === 'register' ? `
                <div class="form-row">
                  <div class="form-group half">
                    <label for="name">Họ và tên</label>
                    <input type="text" id="name" name="name" required>
                  </div>
                  <div class="form-group half">
                    <label for="phone">Số điện thoại</label>
                    <input type="tel" id="phone" name="phone" placeholder="Không bắt buộc">
                  </div>
                </div>
              ` : ''}

              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
              </div>

              <div class="form-group">
                <label for="password">Mật khẩu</label>
                <input type="password" id="password" name="password" placeholder="${this.currentView === 'login' ? 'Để trống để dùng mật khẩu 123456' : 'Nhập mật khẩu'}">
                ${this.currentView === 'login' ? '<small class="form-hint">Mật khẩu mặc định: 123456</small>' : ''}
              </div>

              <button type="submit" class="btn btn-primary btn-full">
                ${this.currentView === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            </form>

            <div class="auth-footer">
              <p>
                ${this.currentView === 'login' ?
                  'Chưa có tài khoản?' :
                  'Đã có tài khoản?'}
                <a href="#" onclick="authModal.switchView('${this.currentView === 'login' ? 'register' : 'login'}'); return false;">
                  ${this.currentView === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.attachEventListeners();
  },

  switchView(view) {
    this.currentView = view;
    this.render();
  },

  attachEventListeners() {
    const form = document.getElementById('authForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSubmit(e.target);
      });
    }
  },

  async handleSubmit(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Show loading
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const endpoint = this.currentView === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        // Success
        window.showMessage('Đăng nhập thành công!', 'success');
        this.close();

        // Redirect to dashboard page
        setTimeout(() => {
          window.location.href = './tong-quan.html';
        }, 500);
      } else {
        // Error
        window.showMessage(result.error || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      console.error('Auth error:', error);
      window.showMessage('Lỗi kết nối, vui lòng thử lại', 'error');
    } finally {
      // Restore button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
};

// Current user state management
window.currentUser = {
  data: null,

  async updateUI() {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        this.data = result.user;
        return true;
      } else {
        this.data = null;
        return false;
      }
    } catch (error) {
      console.error('Failed to update UI:', error);
      this.data = null;
      return false;
    }
  }
};

// Format currency
function formatCurrency(amount) {
  if (amount === 0) return '0đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('₫', 'đ');
}

// Logout handler
window.handleLogout = async () => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    window.showMessage('Đăng xuất thành công', 'success');
    window.currentUser.data = null;

    // Redirect to home page
    setTimeout(() => {
      window.location.href = './index.html';
    }, 500);
  } catch (error) {
    console.error('Logout error:', error);
    window.showMessage('Đăng xuất thất bại', 'error');
  }
};

// Show message utility
window.showMessage = (message, type = 'info') => {
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
};

// Setup auth buttons function
function setupAuthButtons() {
  // Setup auth buttons
  const loginBtn = document.querySelector('.btn-outline');
  const registerBtn = document.querySelector('.btn-primary:not(.hero-buttons .btn-primary)');

  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      authModal.open('login');
    });
  }

  if (registerBtn && !registerBtn.closest('.hero-buttons')) {
    registerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      authModal.open('register');
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Update header with user info if logged in
  window.currentUser.updateUI();

  // Setup auth buttons
  setupAuthButtons();
});

