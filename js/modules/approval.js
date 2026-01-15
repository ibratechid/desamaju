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
        label: 'Lihat Detail & Approve', 
        icon: '✅', 
        action: 'approve', 
        type: 'success' 
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
          this.showApprovalModal(letter.id, role);
          break;
      }
    });
  },

  // Show approval modal
  showApprovalModal(letterId, role) {
    const letter = Letters.getById(letterId);
    if (!letter) {
      Toast.error('Error', 'Surat tidak ditemukan');
      return;
    }

    const roleLabel = this.getRoleLabel(role);

    const content = `
      <div class="letter-detail">
        ${Letters.renderDetail(letterId)}
        <div style="margin-top:20px;">
          <h4 style="margin-bottom:15px;">Aksi Persetujuan ${roleLabel}</h4>
          <div class="form-group">
            <label class="form-label">Catatan (Opsional)</label>
            <textarea class="form-textarea" id="approvalNotes" rows="3" 
                      placeholder="Tambahkan catatan jika diperlukan..."></textarea>
          </div>
        </div>
      </div>
    `;

    Modal.show({
      title: `Persetujuan ${roleLabel} - ${letter.letterNumber}`,
      content: content,
      size: 'large',
      footerButtons: [
        { text: 'Tolak', type: 'danger', action: 'reject' },
        { text: 'Batal', type: 'secondary', action: 'cancel' },
        { text: 'Setujui', type: 'success', action: 'approve' }
      ]
    });
  },

  // Approve letter
  async approveLetter(letterId, role) {
    const notes = document.getElementById('approvalNotes')?.value || '';
    
    try {
      Letters.approve(letterId, role, notes);
      Modal.hide();
      Toast.success('Berhasil', `Surat berhasil disetujui oleh ${this.getRoleLabel(role)}`);
      App.router.navigate(`persetujuan-${role}`);
    } catch (error) {
      Toast.error('Error', error.message);
    }
  },

  // Reject letter
  async rejectLetter(letterId, role) {
    const notes = document.getElementById('approvalNotes')?.value || '';

    if (!notes) {
      Toast.warning('Peringatan', 'Harap isi alasan penolakan');
      return;
    }

    try {
      Letters.reject(letterId, role, notes);
      Modal.hide();
      Toast.success('Berhasil', 'Surat berhasil ditolak');
      App.router.navigate(`persetujuan-${role}`);
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
