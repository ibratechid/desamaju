// Authentication Module for DESAKU System

const Auth = {
  // Initialize authentication
  init() {
    this.checkSession();
    this.bindEvents();
  },

  // Check if user is logged in
  isLoggedIn() {
    const user = localStorage.getItem('desamaju.currentUser');
    return user !== null;
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('desamaju.currentUser');
    return user ? JSON.parse(user) : null;
  },

  // Check session and redirect if needed
  checkSession() {
    const user = this.getCurrentUser();
    const currentPage = window.location.hash.slice(1) || 'login';

    // If not logged in and not on login page, redirect to login
    if (!user && currentPage !== 'login') {
      window.location.hash = 'login';
      return false;
    }

    // If logged in and on login page, redirect to dashboard
    if (user && currentPage === 'login') {
      window.location.hash = 'dashboard';
      return true;
    }

    return true;
  },

  // Login function
  login(username, password) {
    return new Promise((resolve, reject) => {
      // Get users from storage
      const users = JSON.parse(localStorage.getItem('desamaju.users') || '[]');

      // Find user
      const user = users.find(u => u.username === username && u.password === password);

      if (!user) {
        reject(new Error('Username atau password salah'));
        return;
      }

      if (!user.status) {
        reject(new Error('Akun Anda telah dinonaktifkan'));
        return;
      }

      // Set current user session
      localStorage.setItem('desamaju.currentUser', JSON.stringify(user));

      // Log login activity
      this.logActivity(user.id, 'login');

      resolve(user);
    });
  },

  // Logout function
  logout() {
    const user = this.getCurrentUser();
    if (user) {
      this.logActivity(user.id, 'logout');
    }
    localStorage.removeItem('desamaju.currentUser');
    window.location.hash = 'login';
  },

  // Check if user has specific role
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  },

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    const user = this.getCurrentUser();
    return user && roles.includes(user.role);
  },

  // Log user activity
  logActivity(userId, action) {
    const logs = JSON.parse(localStorage.getItem('desamaju.activity_logs') || '[]');
    logs.push({
      id: Utils.generateId(),
      userId,
      action,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('desamaju.activity_logs', JSON.stringify(logs));
  },

  // Bind authentication events
  bindEvents() {
    // Login form
    document.addEventListener('submit', (e) => {
      const loginForm = document.getElementById('loginForm');
      if (loginForm && loginForm.contains(e.target)) {
        e.preventDefault();
        this.handleLogin();
      }
    });
  },

  // Handle login form submission
  async handleLogin() {
    const form = document.getElementById('loginForm');
    const username = form.username.value.trim();
    const password = form.password.value;

    // Validate form
    if (!username) {
      Toast.show('error', 'Login Gagal', 'Username harus diisi');
      return;
    }

    if (!password) {
      Toast.show('error', 'Login Gagal', 'Password harus diisi');
      return;
    }

    // Disable form and show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Masuk...';

    try {
      await this.login(username, password);
      Toast.show('success', 'Login Berhasil', 'Selamat datang kembali!');
      window.location.hash = 'dashboard';
    } catch (error) {
      Toast.show('error', 'Login Gagal', error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Masuk';
    }
  },

  // Get menu items based on user role
  getMenuItems() {
    const user = this.getCurrentUser();
    if (!user) return [];

    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' }
    ];

    const roleMenus = {
      'admin': [
        ...commonItems,
        { id: 'surat', label: 'Daftar Surat', icon: '📄' },
        { id: 'master-users', label: 'User Management', icon: '👥' },
        { id: 'master-jenis-surat', label: 'Jenis Surat', icon: '📝' },
        { id: 'master-warga', label: 'Data Warga', icon: '🏠' },
        { id: 'master-ttd', label: 'TTD & Cap Digital', icon: '✍️' },
        { id: 'master-nomor', label: 'Nomor Surat', icon: '🔢' },
        { id: 'settings', label: 'Pengaturan', icon: '⚙️' }
      ],
      'rt': [
        ...commonItems,
        { id: 'persetujuan-rt', label: 'Persetujuan RT', icon: '✅' },
        { id: 'surat', label: 'Daftar Surat', icon: '📄' }
      ],
      'rw': [
        ...commonItems,
        { id: 'persetujuan-rw', label: 'Persetujuan RW', icon: '✅' },
        { id: 'surat', label: 'Daftar Surat', icon: '📄' }
      ],
      'kepala_desa': [
        ...commonItems,
        { id: 'persetujuan-desa', label: 'Persetujuan Desa', icon: '✅' },
        { id: 'surat', label: 'Daftar Surat', icon: '📄' }
      ],
      'warga': [
        ...commonItems,
        { id: 'surat-saya', label: 'Surat Saya', icon: '📄' },
        { id: 'buat-surat', label: 'Buat Surat', icon: '➕' }
      ]
    };

    return roleMenus[user.role] || commonItems;
  },

  // Require authentication for a route
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.hash = 'login';
      return false;
    }
    return true;
  },

  // Require specific role
  requireRole(role) {
    if (!this.isLoggedIn()) {
      window.location.hash = 'login';
      return false;
    }
    if (!this.hasRole(role)) {
      Toast.show('error', 'Akses Ditolak', 'Anda tidak memiliki akses ke halaman ini');
      window.location.hash = 'dashboard';
      return false;
    }
    return true;
  },

  // Require any of the specified roles
  requireAnyRole(roles) {
    if (!this.isLoggedIn()) {
      window.location.hash = 'login';
      return false;
    }
    if (!this.hasAnyRole(roles)) {
      Toast.show('error', 'Akses Ditolak', 'Anda tidak memiliki akses ke halaman ini');
      window.location.hash = 'dashboard';
      return false;
    }
    return true;
  }
};
