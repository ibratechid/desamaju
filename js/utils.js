// Utility Functions for DESAKU System

const Utils = {
  // Generate UUID
  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // Format date to Indonesian locale
  formatDate(date, format = 'full') {
    const d = new Date(date);
    const options = {
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' },
      datetime: { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    };
    return d.toLocaleDateString('id-ID', options[format] || options.full);
  },

  // Format number with Indonesian locale
  formatNumber(num) {
    return num.toLocaleString('id-ID');
  },

  // Validate email
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validate Indonesian phone number
  isValidPhone(phone) {
    const re = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    return re.test(phone);
  },

  // Validate NIK (16 digits)
  isValidNIK(nik) {
    const re = /^\d{16}$/;
    return re.test(nik);
  },

  // Sanitize input to prevent XSS
  sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Deep clone object
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Get initials from name
  getInitials(name) {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  // Truncate text
  truncate(text, length = 50) {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  },

  // Generate letter number
  generateLetterNumber(letterTypeCode) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const key = `letter_number_${letterTypeCode}_${year}_${month}`;
    const lastNumber = parseInt(localStorage.getItem(key) || '0');
    const newNumber = lastNumber + 1;
    localStorage.setItem(key, newNumber.toString());
    return `${letterTypeCode}/${newNumber}/${month}/${year}`;
  },

  // Convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  },

  // Download file
  downloadFile(data, filename, type = 'application/pdf') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Show confirmation dialog
  confirm(message) {
    return window.confirm(message);
  },

  // Parse query string
  parseQueryString(queryString) {
    const params = new URLSearchParams(queryString);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },

  // Build query string
  buildQueryString(params) {
    return new URLSearchParams(params).toString();
  },

  // Get role display name
  getRoleName(role) {
    const roles = {
      'admin': 'Administrator',
      'rt': 'Kepala RT',
      'rw': 'Kepala RW',
      'kepala_desa': 'Kepala Desa',
      'warga': 'Warga'
    };
    return roles[role] || role;
  },

  // Get status badge class
  getStatusBadgeClass(status) {
    const classes = {
      'pending': 'badge-pending',
      'process': 'badge-process',
      'disetujui': 'badge-approved',
      'rejected': 'badge-rejected'
    };
    return classes[status] || '';
  },

  // Check if today
  isToday(date) {
    const today = new Date();
    const d = new Date(date);
    return d.toDateString() === today.toDateString();
  },

  // Get relative time
  getRelativeTime(date) {
    const now = new Date();
    const d = new Date(date);
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    if (days < 7) return `${days} hari yang lalu`;
    return this.formatDate(date, 'short');
  },

  // Escape HTML
  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};
