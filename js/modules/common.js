// Common Module - Shared utilities and components

const Toast = {
  container: null,

  init() {
    this.createContainer();
  },

  createContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(type, title, message, duration = 5000) {
    this.createContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-title">${Utils.sanitize(title)}</div>
        <div class="toast-message">${Utils.sanitize(message)}</div>
      </div>
    `;

    this.container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      this.remove(toast);
    }, duration);

    return toast;
  },

  remove(toast) {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  },

  success(title, message) {
    return this.show('success', title, message);
  },

  error(title, message) {
    return this.show('error', title, message);
  },

  warning(title, message) {
    return this.show('warning', title, message);
  },

  info(title, message) {
    return this.show('info', title, message);
  }
};

const Modal = {
  activeModal: null,

  show(options = {}) {
    const {
      title = '',
      content = '',
      size = 'medium',
      showFooter = true,
      footerButtons = [],
      onConfirm = null,
      onCancel = null
    } = options;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const sizeClass = size === 'large' ? 'max-width: 800px;' : 'max-width: 600px;';
    
    let footerHtml = '';
    if (showFooter) {
      if (footerButtons.length > 0) {
        footerHtml = footerButtons.map(btn => 
          `<button class="btn btn-${btn.type || 'secondary'}" data-action="${btn.action || ''}">${btn.text}</button>`
        ).join('');
      } else {
        footerHtml = `
          <button class="btn btn-secondary" data-action="cancel">Batal</button>
          <button class="btn btn-primary" data-action="confirm">OK</button>
        `;
      }
    }

    modal.innerHTML = `
      <div class="modal-content" style="${sizeClass}">
        <div class="modal-header">
          <h3 class="modal-title">${Utils.sanitize(title)}</h3>
          <button class="modal-close" data-action="close">&times;</button>
        </div>
        <div class="modal-body">
          ${typeof content === 'string' ? content : ''}
        </div>
        ${showFooter ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    `;

    document.body.appendChild(modal);
    this.activeModal = modal;

    // Bind events
    modal.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action === 'close' || action === 'cancel' || e.target === modal) {
        if (onCancel) onCancel();
        this.hide();
      } else if (action === 'confirm') {
        if (onConfirm) onConfirm();
        this.hide();
      } else if (action) {
        const btn = footerButtons.find(b => b.action === action);
        if (btn && btn.handler) btn.handler();
      }
    });

    // Focus first input if exists
    const firstInput = modal.querySelector('input, textarea, select');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }

    return modal;
  },

  hide() {
    if (this.activeModal) {
      this.activeModal.classList.remove('active');
      setTimeout(() => {
        if (this.activeModal && this.activeModal.parentElement) {
          this.activeModal.parentElement.removeChild(this.activeModal);
        }
        this.activeModal = null;
      }, 300);
    }
  },

  confirm(message, onConfirm, onCancel) {
    return this.show({
      title: 'Konfirmasi',
      content: `<p>${Utils.sanitize(message)}</p>`,
      onConfirm,
      onCancel
    });
  },

  alert(message, type = 'info') {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    return this.show({
      title: type === 'error' ? 'Error' : type === 'success' ? 'Berhasil' : 'Informasi',
      content: `<div style="text-align:center;font-size:48px;margin-bottom:15px;color:var(--${type}-color)">${icons[type]}</div><p>${Utils.sanitize(message)}</p>`,
      showFooter: true,
      footerButtons: [{ text: 'OK', type: 'primary' }]
    });
  }
};

const FormValidator = {
  rules: {
    required: (value) => value && value.trim() !== '',
    email: (value) => !value || Utils.isValidEmail(value),
    phone: (value) => !value || Utils.isValidPhone(value),
    nik: (value) => !value || Utils.isValidNIK(value),
    minLength: (value, min) => !value || value.length >= min,
    maxLength: (value, max) => !value || value.length <= max
  },

  messages: {
    required: 'Field ini wajib diisi',
    email: 'Email tidak valid',
    phone: 'Nomor HP tidak valid',
    nik: 'NIK harus 16 digit angka',
    minLength: 'Minimal {0} karakter',
    maxLength: 'Maksimal {0} karakter'
  },

  validate(form, rules) {
    const errors = {};
    let isValid = true;

    for (const field in rules) {
      const input = form.querySelector(`[name="${field}"]`);
      if (!input) continue;

      const value = input.value;
      const fieldRules = rules[field];

      for (const rule of fieldRules) {
        const [ruleName, ...params] = rule.split(':');
        const validator = this.rules[ruleName];

        if (validator && !validator(value, ...params)) {
          errors[field] = this.messages[ruleName].replace('{0}', params[0] || '');
          isValid = false;
          break;
        }
      }
    }

    // Update UI
    for (const field in rules) {
      const input = form.querySelector(`[name="${field}"]`);
      if (!input) continue;

      const errorMsg = form.querySelector(`[data-error="${field}"]`);
      
      if (errors[field]) {
        input.classList.add('error');
        if (errorMsg) {
          errorMsg.textContent = errors[field];
          errorMsg.style.display = 'block';
        }
      } else {
        input.classList.remove('error');
        if (errorMsg) {
          errorMsg.style.display = 'none';
        }
      }
    }

    return { isValid, errors };
  },

  clearErrors(form) {
    const inputs = form.querySelectorAll('.error');
    inputs.forEach(input => input.classList.remove('error'));

    const errors = form.querySelectorAll('.form-error');
    errors.forEach(error => {
      if (error.dataset.error) {
        error.style.display = 'none';
      }
    });
  }
};

const Table = {
  render(options) {
    const {
      columns = [],
      data = [],
      emptyMessage = 'Tidak ada data',
      onRowClick = null,
      rowActions = null
    } = options;

    let html = '<div class="table-container"><table class="data-table">';
    
    // Header
    html += '<thead><tr>';
    columns.forEach(col => {
      html += `<th>${Utils.sanitize(col.label)}</th>`;
    });
    if (rowActions) {
      html += '<th>Aksi</th>';
    }
    html += '</tr></thead>';

    // Body
    html += '<tbody>';
    if (data.length === 0) {
      html += `
        <tr>
          <td colspan="${columns.length + (rowActions ? 1 : 0)}">
            <div class="empty-state">
              <div class="empty-state-icon">📭</div>
              <div class="empty-state-title">${Utils.sanitize(emptyMessage)}</div>
            </div>
          </td>
        </tr>
      `;
    } else {
      data.forEach((row, index) => {
        html += `<tr${onRowClick ? ' style="cursor:pointer"' : ''}>`;
        columns.forEach(col => {
          let value = col.key ? row[col.key] : '';
          
          // Apply formatter if exists
          if (col.formatter) {
            value = col.formatter(value, row);
          }
          
          html += `<td>${value}</td>`;
        });
        
        if (rowActions) {
          html += '<td><div class="action-buttons">';
          rowActions.forEach(action => {
            if (!action.show || action.show(row)) {
              html += `<button class="btn btn-${action.type || 'secondary'} btn-action" 
                       data-action="${action.action}" 
                       data-index="${index}">
                       ${action.icon || ''} ${action.label}
                       </button>`;
            }
          });
          html += '</div></td>';
        }
        html += '</tr>';
      });
    }
    
    html += '</tbody></table></div>';
    return html;
  }
};

const Loader = {
  show(message = 'Memuat...') {
    const overlay = document.createElement('div');
    overlay.id = 'loader-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;
    overlay.innerHTML = `
      <div style="background:white;padding:30px;border-radius:8px;text-align:center;">
        <div class="spinner" style="width:40px;height:40px;border-width:4px;margin:0 auto 15px;"></div>
        <div style="color:var(--dark);font-weight:500;">${Utils.sanitize(message)}</div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  hide() {
    const overlay = document.getElementById('loader-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
});
