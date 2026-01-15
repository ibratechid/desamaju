// Admin Module - Administrator dashboard and management

const Admin = {
  // Render dashboard
  renderDashboard() {
    const stats = Letters.getStats();
    const letters = Letters.getAll();
    const users = MasterData.users.getAll();

    // Get recent letters
    const recentLetters = [...letters]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    let html = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon primary">
            📄
          </div>
          <div class="stat-details">
            <h3>${stats.total}</h3>
            <p>Total Surat</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            ⏳
          </div>
          <div class="stat-details">
            <h3>${stats.pending}</h3>
            <p>Surat Pending</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon info">
            🔄
          </div>
          <div class="stat-details">
            <h3>${stats.process}</h3>
            <p>Dalam Proses</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">
            ✅
          </div>
          <div class="stat-details">
            <h3>${stats.approved}</h3>
            <p>Disetujui</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Surat Terbaru</h3>
          <button class="btn btn-primary" onclick="App.router.navigate('surat')">
            Lihat Semua
          </button>
        </div>
        ${Letters.renderTable(recentLetters, { showActions: false })}
      </div>

      <div class="stats-grid" style="margin-top:20px;">
        <div class="stat-card">
          <div class="stat-icon primary">
            👥
          </div>
          <div class="stat-details">
            <h3>${users.length}</h3>
            <p>Total User</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">
            📝
          </div>
          <div class="stat-details">
            <h3>${MasterData.letterTypes.getAll().length}</h3>
            <p>Jenis Surat</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon info">
            🏠
          </div>
          <div class="stat-details">
            <h3>${MasterData.citizens.getAll().length}</h3>
            <p>Total Warga</p>
          </div>
        </div>
      </div>
    `;

    return html;
  },

  // Render all letters
  renderLetters() {
    const letters = Letters.getAll();
    const user = Auth.getCurrentUser();

    const actions = [
      { 
        label: 'Lihat', 
        icon: '👁️', 
        action: 'view', 
        type: 'primary' 
      },
      { 
        label: 'Edit', 
        icon: '✏️', 
        action: 'edit', 
        type: 'warning',
        show: (row) => row.status !== 'disetujui'
      },
      { 
        label: 'Download', 
        icon: '📥', 
        action: 'download', 
        type: 'success',
        show: (row) => row.status === 'disetujui'
      },
      { 
        label: 'Hapus', 
        icon: '🗑️', 
        action: 'delete', 
        type: 'danger',
        show: (row) => row.status !== 'disetujui'
      }
    ];

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Daftar Semua Surat</h3>
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

  // Bind events for letters page
  bindLettersEvents() {
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
        { label: 'Edit', icon: '✏️', action: 'edit', type: 'warning', show: (r) => r.status !== 'disetujui' },
        { label: 'Download', icon: '📥', action: 'download', type: 'success', show: (r) => r.status === 'disetujui' },
        { label: 'Hapus', icon: '🗑️', action: 'delete', type: 'danger', show: (r) => r.status !== 'disetujui' }
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
        case 'edit':
          this.editLetter(letter.id);
          break;
        case 'download':
          this.downloadLetter(letter.id);
          break;
        case 'delete':
          this.deleteLetter(letter.id);
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

  editLetter(letterId) {
    const letter = Letters.getById(letterId);
    if (!letter) {
      Toast.error('Error', 'Surat tidak ditemukan');
      return;
    }

    const letterTypes = MasterData.letterTypes.getAll();

    const formHtml = `
      <form id="editLetterForm">
        <div class="form-group">
          <label class="form-label">Jenis Surat</label>
          <select class="form-select" name="letterTypeId" required>
            ${letterTypes.map(t => `
              <option value="${t.id}" ${letter.letterTypeId === t.id ? 'selected' : ''}>
                ${Utils.sanitize(t.name)} (${Utils.sanitize(t.code)})
              </option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Nomor Surat</label>
          <input type="text" class="form-input" name="letterNumber" 
                 value="${Utils.sanitize(letter.letterNumber)}" readonly>
        </div>
        <div class="form-group">
          <label class="form-label">Tanggal Surat</label>
          <input type="date" class="form-input" name="date" 
                 value="${letter.date.split('T')[0]}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Isi Surat</label>
          <textarea class="form-textarea" name="content" rows="8" required>${Utils.sanitize(letter.content)}</textarea>
        </div>
      </form>
    `;

    Modal.show({
      title: 'Edit Surat',
      content: formHtml,
      size: 'large',
      onConfirm: () => {
        const form = document.getElementById('editLetterForm');
        const formData = new FormData(form);
        
        try {
          Letters.update(letterId, {
            letterTypeId: formData.get('letterTypeId'),
            date: formData.get('date'),
            content: formData.get('content')
          });
          Modal.hide();
          Toast.success('Berhasil', 'Surat berhasil diupdate');
          App.router.navigate('surat');
        } catch (error) {
          Toast.error('Error', error.message);
        }
      }
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
  },

  deleteLetter(letterId) {
    Modal.confirm('Apakah Anda yakin ingin menghapus surat ini?', async () => {
      try {
        Letters.delete(letterId);
        Toast.success('Berhasil', 'Surat berhasil dihapus');
        App.router.navigate('surat');
      } catch (error) {
        Toast.error('Error', error.message);
      }
    });
  },

  // Render users management
  renderUsers() {
    const users = MasterData.users.getAll();

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">User Management</h3>
          <button class="btn btn-primary" onclick="Admin.showAddUserModal()">
            + Tambah User
          </button>
        </div>
        <div id="usersTable">
          ${MasterData.users.renderTable(users)}
        </div>
      </div>
    `;
  },

  bindUsersEvents() {
    const table = document.querySelector('#usersTable table');
    if (!table) return;

    const users = MasterData.users.getAll();

    table.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const index = btn.dataset.index;
      const user = users[index];
      const action = btn.dataset.action;

      switch (action) {
        case 'edit':
          this.showEditUserModal(user.id);
          break;
        case 'delete':
          this.deleteUser(user.id);
          break;
      }
    });
  },

  showAddUserModal() {
    const formHtml = `
      <form id="userForm">
        <div class="form-group">
          <label class="form-label">Username *</label>
          <input type="text" class="form-input" name="username" required>
        </div>
        <div class="form-group">
          <label class="form-label">Nama Lengkap *</label>
          <input type="text" class="form-input" name="name" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email *</label>
          <input type="email" class="form-input" name="email" required>
        </div>
        <div class="form-group">
          <label class="form-label">Password *</label>
          <input type="password" class="form-input" name="password" required>
        </div>
        <div class="form-group">
          <label class="form-label">Role *</label>
          <select class="form-select" name="role" required>
            <option value="">Pilih Role</option>
            <option value="admin">Administrator</option>
            <option value="rt">Kepala RT</option>
            <option value="rw">Kepala RW</option>
            <option value="kepala_desa">Kepala Desa</option>
            <option value="warga">Warga</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" name="status">
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
      </form>
    `;

    Modal.show({
      title: 'Tambah User Baru',
      content: formHtml,
      size: 'large',
      onConfirm: () => {
        const form = document.getElementById('userForm');
        const formData = new FormData(form);
        
        try {
          MasterData.users.create({
            username: formData.get('username'),
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            status: formData.get('status') === 'true'
          });
          Modal.hide();
          Toast.success('Berhasil', 'User berhasil ditambahkan');
          App.router.navigate('master-users');
        } catch (error) {
          Toast.error('Error', error.message);
        }
      }
    });
  },

  showEditUserModal(userId) {
    const user = MasterData.users.getById(userId);
    if (!user) return;

    const formHtml = `
      <form id="userForm">
        <div class="form-group">
          <label class="form-label">Username *</label>
          <input type="text" class="form-input" name="username" value="${Utils.sanitize(user.username)}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Nama Lengkap *</label>
          <input type="text" class="form-input" name="name" value="${Utils.sanitize(user.name)}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email *</label>
          <input type="email" class="form-input" name="email" value="${Utils.sanitize(user.email)}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" name="password" placeholder="Kosongkan jika tidak diubah">
        </div>
        <div class="form-group">
          <label class="form-label">Role *</label>
          <select class="form-select" name="role" required>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrator</option>
            <option value="rt" ${user.role === 'rt' ? 'selected' : ''}>Kepala RT</option>
            <option value="rw" ${user.role === 'rw' ? 'selected' : ''}>Kepala RW</option>
            <option value="kepala_desa" ${user.role === 'kepala_desa' ? 'selected' : ''}>Kepala Desa</option>
            <option value="warga" ${user.role === 'warga' ? 'selected' : ''}>Warga</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" name="status">
            <option value="true" ${user.status ? 'selected' : ''}>Aktif</option>
            <option value="false" ${!user.status ? 'selected' : ''}>Nonaktif</option>
          </select>
        </div>
      </form>
    `;

    Modal.show({
      title: 'Edit User',
      content: formHtml,
      size: 'large',
      onConfirm: () => {
        const form = document.getElementById('userForm');
        const formData = new FormData(form);
        
        const updates = {
          username: formData.get('username'),
          name: formData.get('name'),
          email: formData.get('email'),
          role: formData.get('role'),
          status: formData.get('status') === 'true'
        };

        if (formData.get('password')) {
          updates.password = formData.get('password');
        }

        try {
          MasterData.users.update(userId, updates);
          Modal.hide();
          Toast.success('Berhasil', 'User berhasil diupdate');
          App.router.navigate('master-users');
        } catch (error) {
          Toast.error('Error', error.message);
        }
      }
    });
  },

  deleteUser(userId) {
    Modal.confirm('Apakah Anda yakin ingin menghapus user ini?', () => {
      try {
        MasterData.users.delete(userId);
        Toast.success('Berhasil', 'User berhasil dihapus');
        App.router.navigate('master-users');
      } catch (error) {
        Toast.error('Error', error.message);
      }
    });
  },

  // Render settings
  renderSettings() {
    const settings = MasterData.settings.getAll();

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Pengaturan</h3>
        </div>
        <form id="settingsForm">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Nama Desa</label>
              <input type="text" class="form-input" name="desaName" 
                     value="${Utils.sanitize(settings.desaName || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">Kecamatan</label>
              <input type="text" class="form-input" name="kecamatan" 
                     value="${Utils.sanitize(settings.kecamatan || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">Kabupaten</label>
              <input type="text" class="form-input" name="kabupaten" 
                     value="${Utils.sanitize(settings.kabupaten || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">Nama Kepala Desa</label>
              <input type="text" class="form-input" name="kepalaDesaName" 
                     value="${Utils.sanitize(settings.kepalaDesaName || '')}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Alamat Desa</label>
            <textarea class="form-textarea" name="alamat" rows="3">${Utils.sanitize(settings.alamat || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Logo Desa</label>
            <div class="upload-area" onclick="document.getElementById('logoInput').click()">
              ${settings.logo ? `<img src="${settings.logo}" class="preview-image">` : `
                <div class="upload-area-icon">📷</div>
                <div class="upload-area-text">Klik untuk upload logo</div>
              `}
            </div>
            <input type="file" id="logoInput" accept="image/*" style="display:none">
            <input type="hidden" name="logo" value="${settings.logo || ''}">
          </div>
          <div class="form-group">
            <button type="submit" class="btn btn-primary">Simpan Pengaturan</button>
          </div>
        </form>
      </div>
    `;
  },

  bindSettingsEvents() {
    const form = document.getElementById('settingsForm');
    const logoInput = document.getElementById('logoInput');

    // Logo upload
    logoInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          Loader.show('Mengupload logo...');
          const base64 = await Utils.fileToBase64(file);
          form.querySelector('[name="logo"]').value = base64;
          form.querySelector('.upload-area').innerHTML = `<img src="${base64}" class="preview-image">`;
          Toast.success('Berhasil', 'Logo berhasil diupload');
        } catch (error) {
          Toast.error('Error', 'Gagal mengupload logo');
        } finally {
          Loader.hide();
        }
      }
    });

    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      const settings = {
        desaName: formData.get('desaName'),
        kecamatan: formData.get('kecamatan'),
        kabupaten: formData.get('kabupaten'),
        kepalaDesaName: formData.get('kepalaDesaName'),
        alamat: formData.get('alamat'),
        logo: formData.get('logo')
      };

      MasterData.settings.save(settings);
      Toast.success('Berhasil', 'Pengaturan berhasil disimpan');
    });
  }
};
