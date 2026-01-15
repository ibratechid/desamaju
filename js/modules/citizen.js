// Citizen Module - Handle warga (citizen) functionality

const Citizen = {
  // Render warga dashboard
  renderDashboard() {
    const user = Auth.getCurrentUser();
    const letters = Letters.getByUserId(user.id);
    const stats = Letters.getStats(user.id);

    // Get recent letters
    const recentLetters = [...letters]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Selamat Datang, ${Utils.sanitize(user.name)}!</h3>
        </div>
        <p style="margin-bottom:20px;">Anda login sebagai ${Utils.getRoleName(user.role)}</p>
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
              <p>Pending</p>
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
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Surat Terbaru</h3>
          <button class="btn btn-primary" onclick="App.router.navigate('surat-saya')">
            Lihat Semua
          </button>
        </div>
        ${this.renderMyLettersTable(recentLetters)}
      </div>
    `;
  },

  // Render all my letters
  renderMyLetters() {
    const user = Auth.getCurrentUser();
    const letters = Letters.getByUserId(user.id);

    const actions = [
      { 
        label: 'Lihat', 
        icon: '👁️', 
        action: 'view', 
        type: 'primary' 
      },
      { 
        label: 'Download', 
        icon: '📥', 
        action: 'download', 
        type: 'success',
        show: (row) => row.status === 'disetujui'
      }
    ];

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Surat Saya</h3>
          <button class="btn btn-primary" onclick="Citizen.showCreateLetterModal()">
            + Buat Surat Baru
          </button>
        </div>
        <div id="lettersTable">
          ${this.renderMyLettersTable(letters, actions)}
        </div>
      </div>
    `;
  },

  renderMyLettersTable(letters, actions = null) {
    const user = Auth.getCurrentUser();
    
    // Filter letters for current user
    const myLetters = letters.filter(l => l.userId === user.id);

    if (!actions) {
      actions = [
        { label: 'Lihat', icon: '👁️', action: 'view', type: 'primary' },
        { label: 'Download', icon: '📥', action: 'download', type: 'success', show: (r) => r.status === 'disetujui' }
      ];
    }

    return Letters.renderTable(myLetters, {
      actions,
      emptyMessage: 'Anda belum memiliki surat. Silakan buat surat baru.'
    });
  },

  bindMyLettersEvents() {
    const searchInput = document.getElementById('searchLetters');
    const filterSelect = document.getElementById('filterStatus');
    const tableContainer = document.getElementById('lettersTable');

    const refreshTable = () => {
      const user = Auth.getCurrentUser();
      let letters = Letters.getByUserId(user.id);
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

      tableContainer.innerHTML = this.renderMyLettersTable(letters, actions);
      this.bindMyLettersTableEvents(letters);
    };

    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce(refreshTable, 300));
    }
    if (filterSelect) {
      filterSelect.addEventListener('change', refreshTable);
    }

    const user = Auth.getCurrentUser();
    const letters = Letters.getByUserId(user.id);
    this.bindMyLettersTableEvents(letters);
  },

  bindMyLettersTableEvents(letters = null) {
    if (!letters) {
      const user = Auth.getCurrentUser();
      letters = Letters.getByUserId(user.id);
    }

    const table = document.querySelector('#lettersTable table');
    if (!table) return;

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
  },

  // Show create letter modal
  showCreateLetterModal() {
    const letterTypes = MasterData.letterTypes.getAll();
    const user = Auth.getCurrentUser();

    if (letterTypes.length === 0) {
      Toast.warning('Peringatan', 'Belum ada jenis surat tersedia. Silakan hubungi Administrator.');
      return;
    }

    const formHtml = `
      <form id="createLetterForm">
        <div class="form-group">
          <label class="form-label">Jenis Surat *</label>
          <select class="form-select" name="letterTypeId" required id="letterTypeSelect">
            <option value="">Pilih Jenis Surat</option>
            ${letterTypes.map(t => `
              <option value="${t.id}" data-code="${t.code}">
                ${Utils.sanitize(t.name)} (${Utils.sanitize(t.code)})
              </option>
            `).join('')}
          </select>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Nomor Surat</label>
            <input type="text" class="form-input" id="letterNumberPreview" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Tanggal Surat *</label>
            <input type="date" class="form-input" name="date" required value="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Nama Pemohon</label>
          <input type="text" class="form-input" value="${Utils.sanitize(user.name)}" readonly>
        </div>
        <div class="form-group">
          <label class="form-label">Isi Surat *</label>
          <textarea class="form-textarea" name="content" rows="10" required 
                    placeholder="Tulis isi surat di sini..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Lampiran (Opsional)</label>
          <div class="upload-area" onclick="document.getElementById('attachmentInput').click()">
            <div class="upload-area-icon">📎</div>
            <div class="upload-area-text">Klik untuk upload lampiran</div>
          </div>
          <input type="file" id="attachmentInput" style="display:none">
          <input type="hidden" name="attachment" id="attachmentData">
        </div>
      </form>
    `;

    Modal.show({
      title: 'Buat Surat Baru',
      content: formHtml,
      size: 'large',
      onConfirm: () => {
        this.handleCreateLetter();
      }
    });

    // Bind events
    this.bindCreateLetterEvents();
  },

  bindCreateLetterEvents() {
    const letterTypeSelect = document.getElementById('letterTypeSelect');
    const letterNumberPreview = document.getElementById('letterNumberPreview');
    const attachmentInput = document.getElementById('attachmentInput');

    // Update letter number preview when type changes
    letterTypeSelect.addEventListener('change', () => {
      const selectedOption = letterTypeSelect.options[letterTypeSelect.selectedIndex];
      if (selectedOption.value) {
        const code = selectedOption.dataset.code;
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        letterNumberPreview.value = `${code}/001/${month}/${year}`;
      } else {
        letterNumberPreview.value = '';
      }
    });

    // Handle file upload
    attachmentInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          Toast.warning('Peringatan', 'Ukuran file maksimal 5MB');
          e.target.value = '';
          return;
        }

        try {
          Loader.show('Mengupload file...');
          const base64 = await Utils.fileToBase64(file);
          document.getElementById('attachmentData').value = base64;
          document.querySelector('.upload-area').innerHTML = `
            <div class="upload-area-icon">✅</div>
            <div class="upload-area-text">${file.name}</div>
          `;
          Toast.success('Berhasil', 'File berhasil diupload');
        } catch (error) {
          Toast.error('Error', 'Gagal mengupload file');
        } finally {
          Loader.hide();
        }
      }
    });
  },

  handleCreateLetter() {
    const form = document.getElementById('createLetterForm');
    
    // Validate form
    const { isValid } = FormValidator.validate(form, {
      letterTypeId: ['required'],
      date: ['required'],
      content: ['required']
    });

    if (!isValid) {
      Toast.error('Error', 'Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    const formData = new FormData(form);

    try {
      Letters.create({
        letterTypeId: formData.get('letterTypeId'),
        date: formData.get('date'),
        content: formData.get('content'),
        attachment: formData.get('attachment') || null
      });

      Modal.hide();
      Toast.success('Berhasil', 'Surat berhasil dibuat dan sedang diproses');
      App.router.navigate('surat-saya');
    } catch (error) {
      Toast.error('Error', error.message);
    }
  }
};
