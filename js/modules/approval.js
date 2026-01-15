// Approval Module - Handle approval workflow for RT, RW, and Kepala Desa

const Approval = {
  // Get pending letters based on role
  getPendingLetters(role) {
    switch (role) {
      case 'rt':
        return Letters.getPendingRT();
      case 'rw':
        return Letters.getPendingRW();
      case 'kepala_desa':
        return Letters.getPendingDesa();
      default:
        return [];
    }
  },

  // Get role label
  getRoleLabel(role) {
    const labels = {
      'rt': 'RT',
      'rw': 'RW',
      'kepala_desa': 'Kepala Desa'
    };
    return labels[role] || role;
  },

  // Render approval dashboard
  renderDashboard(role) {
    const pendingLetters = this.getPendingLetters(role);
    const stats = Letters.getStats();
    const roleLabel = this.getRoleLabel(role);

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon warning">
            ⏳
          </div>
          <div class="stat-details">
            <h3>${pendingLetters.length}</h3>
            <p>Menunggu Persetujuan ${roleLabel}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">
            ✅
          </div>
          <div class="stat-details">
            <h3>${stats.approved}</h3>
            <p>Total Disetujui</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Surat Menunggu Persetujuan ${roleLabel}</h3>
        </div>
        ${this.renderPendingTable(pendingLetters, role)}
      </div>

      ${pendingLetters.length === 0 ? `
        <div class="card">
          <div class="empty-state">
            <div class="empty-state-icon">✅</div>
            <div class="empty-state-title">Tidak Ada Surat Pending</div>
            <div class="empty-state-message">Semua surat sudah diproses</div>
          </div>
        </div>
      ` : ''}
    `;
  },

  // Render pending letters table
  renderPendingTable(letters, role) {
    const roleLabel = this.getRoleLabel(role);

    const actions = [
      { 
        label: 'Approve', 
        icon: '✅', 
        action: 'approve', 
        type: 'success' 
      },
      { 
        label: 'Reject', 
        icon: '✕', 
        action: 'reject', 
        type: 'danger' 
      }
    ];

    return Letters.renderTable(letters, {
      actions,
      emptyMessage: 'Tidak ada surat yang menunggu persetujuan'
    });
  },

  // Bind events for approval
  bindEvents(role) {
    const table = document.querySelector('.data-table');
    if (!table) return;

    const pendingLetters = this.getPendingLetters(role);

    table.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const index = btn.dataset.index;
      const letter = pendingLetters[index];
      const action = btn.dataset.action;

      switch (action) {
        case 'approve':
          this.showApprovalModal(letter.id, role, 'approve');
          break;
        case 'reject':
          this.showApprovalModal(letter.id, role, 'reject');
          break;
      }
    });
  },

  // Show approval modal
  showApprovalModal(letterId, role, actionType) {
    const letter = Letters.getById(letterId);
    if (!letter) {
      Toast.error('Error', 'Surat tidak ditemukan');
      return;
    }

    const roleLabel = this.getRoleLabel(role);
    const isApproveAction = actionType === 'approve';
    const modalTitle = isApproveAction 
      ? `Persetujuan ${roleLabel} - ${letter.letterNumber}`
      : `Penolakan ${roleLabel} - ${letter.letterNumber}`;

    let content = `
      <div class="letter-detail">
        ${Letters.renderDetail(letterId)}
        <div style="margin-top:20px;">
          <h4 style="margin-bottom:15px;">Aksi ${isApproveAction ? 'Persetujuan' : 'Penolakan'} ${roleLabel}</h4>
          <div class="form-group">
            <label class="form-label">Catatan ${isApproveAction ? '(Opsional)' : '(Wajib diisi)'} </label>
            <textarea class="form-textarea" id="approvalNotes" rows="3" 
                      placeholder="${isApproveAction ? 'Tambahkan catatan jika diperlukan...' : 'Silakan berikan alasan penolakan...'}" 
                      ${!isApproveAction ? 'required' : ''}></textarea>
          </div>
    `;

    if (role === 'kepala_desa' && isApproveAction) {
      const signatures = JSON.parse(localStorage.getItem('desamaju.digital_signatures') || '{}');
      const signatureOptions = Object.entries(signatures)
        .map(([id, sig]) => `<option value="${id}">${Utils.sanitize(sig.name || id)}</option>`)
        .join('');
      
      if (signatureOptions) {
        content += `
          <div class="form-group">
            <label class="form-label">Pilih Tanda Tangan Digital</label>
            <select class="form-select" id="signatureSelect">
              <option value="">Pilih Tanda Tangan</option>
              ${signatureOptions}
            </select>
          </div>
        `;
      }
    }
    
    content += `</div></div>`;

    const footerButtons = [];
    if (isApproveAction) {
      footerButtons.push(
        { text: 'Tolak', type: 'danger', action: () => this.showApprovalModal(letterId, role, 'reject') },
        { text: 'Batal', type: 'secondary', action: 'cancel' },
        { text: `Setujui ${roleLabel}`, type: 'success', action: () => this.handleApprovalAction(letterId, role, 'approve') }
      );
    } else {
      footerButtons.push(
        { text: 'Batal', type: 'secondary', action: 'cancel' },
        { text: `Tolak ${roleLabel}`, type: 'danger', action: () => this.handleApprovalAction(letterId, role, 'reject') }
      );
    }

    Modal.show({
      title: modalTitle,
      content: content,
      size: 'large',
      footerButtons: footerButtons
    });
  },

  // Get route name for approval navigation
  getRoute(role) {
    const routes = {
      'rt': 'persetujuan-rt',
      'rw': 'persetujuan-rw',
      'kepala_desa': 'persetujuan-desa'
    };
    return routes[role] || 'dashboard';
  },

  // Handle approval or rejection action
  async handleApprovalAction(letterId, role, actionType) {
    const notes = document.getElementById('approvalNotes')?.value || '';
    
    if (actionType === 'reject' && !notes) {
      Toast.warning('Peringatan', 'Harap isi alasan penolakan');
      return;
    }

    try {
      if (actionType === 'approve') {
        Letters.approve(letterId, role, notes);
        Toast.success('Berhasil', `Surat berhasil di-approve oleh ${this.getRoleLabel(role)}`);
      } else {
        Letters.reject(letterId, role, notes);
        Toast.success('Berhasil', 'Surat berhasil ditolak');
      }
      
      Modal.hide();
      App.navigate(this.getRoute(role));
    } catch (error) {
      Toast.error('Error', error.message);
    }
  },

  // Render letters list for RT/RW/Kepala Desa
  renderLetters(role) {
    const letters = Letters.getAll();
    const roleLabel = this.getRoleLabel(role);

    const actions = [
      { label: 'Lihat', icon: '👁️', action: 'view', type: 'primary' },
      { label: 'Download', icon: '📥', action: 'download', type: 'success', show: (r) => r.status === 'disetujui' }
    ];

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Daftar Surat</h3>
          <div class="search-filter-bar" style="margin:0;gap:10px;">
            <input type="text" class="form-input search-box" 
                   placeholder="Cari surat..." id="searchLetters"
                   style="min-width:200px;">
            <select class="form-select filter-select" id="filterStatus">
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="process">Proses</option>
              <option value="disetujui">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>
        <div id="lettersTable">
          ${Letters.renderTable(letters, { actions, emptyMessage: 'Tidak ada surat' })}
        </div>
      </div>
    `;
  },

  // Bind letters events for RT/RW/Kepala Desa
  bindLettersEvents(role) {
    const searchInput = document.getElementById('searchLetters');
    const filterSelect = document.getElementById('filterStatus');
    const tableContainer = document.getElementById('lettersTable');

    const refreshTable = () => {
      let letters = Letters.getAll();
      const search = searchInput.value.toLowerCase();
      const status = filterSelect.value;

      if (search) {
        letters = letters.filter(l => 
          l.letterNumber.toLowerCase().includes(search) ||
          l.applicantName.toLowerCase().includes(search)
        );
      }

      if (status) {
        letters = letters.filter(l => l.status === status);
      }

      const actions = [
        { label: 'Lihat', icon: '👁️', action: 'view', type: 'primary' },
        { label: 'Download', icon: '📥', action: 'download', type: 'success', show: (r) => r.status === 'disetujui' }
      ];

      tableContainer.innerHTML = Letters.renderTable(letters, { actions, emptyMessage: 'Tidak ada surat' });
      this.bindLettersTableEvents();
    };

    searchInput.addEventListener('input', Utils.debounce(refreshTable, 300));
    filterSelect.addEventListener('change', refreshTable);

    this.bindLettersTableEvents();
  },

  bindLettersTableEvents() {
    const table = document.querySelector('#lettersTable table');
    if (!table) return;

    const letters = Letters.getAll();

    table.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const index = btn.dataset.index;
      const letter = letters[index];
      const action = btn.dataset.action;

      switch (action) {
        case 'view':
          this.viewLetter(letter.id);
          break;
        case 'download':
          this.downloadLetter(letter.id);
          break;
      }
    });
  },

  viewLetter(letterId) {
    const letter = Letters.getById(letterId);
    if (!letter) {
      Toast.error('Error', 'Surat tidak ditemukan');
      return;
    }

    Modal.show({
      title: 'Detail Surat',
      content: Letters.renderDetail(letterId),
      size: 'large',
      showFooter: false
    });
  },

  async downloadLetter(letterId) {
    try {
      Loader.show('Menggenerate PDF...');
      await Letters.generatePDF(letterId);
    } catch (error) {
      Toast.error('Error', error.message);
    } finally {
      Loader.hide();
    }
  }
};
