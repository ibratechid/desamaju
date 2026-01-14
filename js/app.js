// Main Application - DESAKU Village Letter Management System

const App = {
  currentRoute: null,
  
  // Initialize application
  init() {
    this.initData();
    Auth.init();
    this.initRouter();
    this.bindGlobalEvents();
  },

  // Initialize demo data
  initData() {
    // Check if data already exists
    if (localStorage.getItem('desamaju.initialized')) {
      return;
    }

    // Initialize users
    const users = [
      {
        id: Utils.generateId(),
        username: 'admin',
        name: 'Administrator',
        email: 'admin@desa.id',
        password: 'demo123',
        role: 'admin',
        status: true,
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        username: 'rt01',
        name: 'Budi Santoso',
        email: 'rt01@desa.id',
        password: 'demo123',
        role: 'rt',
        status: true,
        rt: '01',
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        username: 'rw01',
        name: 'Ahmad Hidayat',
        email: 'rw01@desa.id',
        password: 'demo123',
        role: 'rw',
        status: true,
        rw: '01',
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        username: 'kades',
        name: 'H. Mohammad Yusuf',
        email: 'kades@desa.id',
        password: 'demo123',
        role: 'kepala_desa',
        status: true,
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        username: 'warga01',
        name: 'Siti Rahayu',
        email: 'siti@email.com',
        password: 'demo123',
        role: 'warga',
        status: true,
        nik: '1234567890123456',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('desamaju.users', JSON.stringify(users));

    // Initialize letter types
    const letterTypes = [
      {
        id: Utils.generateId(),
        code: 'SKD',
        name: 'Surat Keterangan Domisili',
        description: 'Surat keterangan tempat tinggal/domisili',
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        code: 'SKCK',
        name: 'Surat Keterangan Catatan Kepolisian',
        description: 'Surat pengantar untuk pembuatan SKCK',
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        code: 'SKTM',
        name: 'Surat Keterangan Tidak Mampu',
        description: 'Surat keterangan untuk beasiswa/bantuan sosial',
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        code: 'SKK',
        name: 'Surat Keterangan Kematian',
        description: 'Surat keterangan meninggal dunia',
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        code: 'SKL',
        name: 'Surat Keterangan Kelahiran',
        description: 'Surat keterangan lahir',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('desamaju.letter_types', JSON.stringify(letterTypes));

    // Initialize citizens
    const citizens = [
      {
        id: Utils.generateId(),
        nik: '1234567890123456',
        name: 'Siti Rahayu',
        gender: 'P',
        rt: '01',
        rw: '01',
        dusun: 'Dusun 1',
        village: 'Desa Maju',
        district: 'Kecamatan Sejahtera',
        regency: 'Kabupaten Lampung Timur',
        province: 'Provinsi Lampung',
        birthPlace: 'Metro',
        birthDate: '1990-05-15',
        occupation: 'Guru',
        maritalStatus: 'Belum Kawin',
        nationality: 'WNI',
        phone: '081234567890',
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        nik: '1234567890123457',
        name: 'Budi Santoso',
        gender: 'L',
        rt: '01',
        rw: '02',
        dusun: 'Dusun 2',
        village: 'Desa Maju',
        district: 'Kecamatan Sejahtera',
        regency: 'Kabupaten Lampung Timur',
        province: 'Provinsi Lampung',
        birthPlace: 'Bandar Lampung',
        birthDate: '1985-10-20',
        occupation: 'Petani',
        maritalStatus: 'Kawin',
        nationality: 'WNI',
        phone: '082345678901',
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        nik: '1234567890123458',
        name: 'Dewi Sartika',
        gender: 'P',
        rt: '02',
        rw: '01',
        dusun: 'Dusun 1',
        village: 'Desa Maju',
        district: 'Kecamatan Sejahtera',
        regency: 'Kabupaten Lampung Timur',
        province: 'Provinsi Lampung',
        birthPlace: 'Metro',
        birthDate: '1995-03-08',
        occupation: 'Wiraswasta',
        maritalStatus: 'Belum Kawin',
        nationality: 'WNI',
        phone: '083456789012',
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        nik: '1234567890123459',
        name: 'Agus Pratama',
        gender: 'L',
        rt: '02',
        rw: '02',
        dusun: 'Dusun 2',
        village: 'Desa Maju',
        district: 'Kecamatan Sejahtera',
        regency: 'Kabupaten Lampung Timur',
        province: 'Provinsi Lampung',
        birthPlace: 'Tanggamus',
        birthDate: '1988-07-12',
        occupation: 'Pedagang',
        maritalStatus: 'Kawin',
        nationality: 'WNI',
        phone: '084567890123',
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        nik: '1234567890123460',
        name: 'Rina Wati',
        gender: 'P',
        rt: '03',
        rw: '01',
        dusun: 'Dusun 3',
        village: 'Desa Maju',
        district: 'Kecamatan Sejahtera',
        regency: 'Kabupaten Lampung Timur',
        province: 'Provinsi Lampung',
        birthPlace: 'Pesawaran',
        birthDate: '1992-11-25',
        occupation: 'PNS',
        maritalStatus: 'Belum Kawin',
        nationality: 'WNI',
        phone: '085678901234',
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        nik: '1234567890123461',
        name: 'Eko Setiawan',
        gender: 'L',
        rt: '03',
        rw: '02',
        dusun: 'Dusun 3',
        village: 'Desa Maju',
        district: 'Kecamatan Sejahtera',
        regency: 'Kabupaten Lampung Timur',
        province: 'Provinsi Lampung',
        birthPlace: 'Pringsewu',
        birthDate: '1980-04-30',
        occupation: 'Buruh',
        maritalStatus: 'Kawin',
        nationality: 'WNI',
        phone: '086789012345',
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        nik: '1234567890123462',
        name: 'Maya Putri',
        gender: 'P',
        rt: '01',
        rw: '01',
        dusun: 'Dusun 1',
        village: 'Desa Maju',
        district: 'Kecamatan Sejahtera',
        regency: 'Kabupaten Lampung Timur',
        province: 'Provinsi Lampung',
        birthPlace: 'Bandar Lampung',
        birthDate: '1998-09-18',
        occupation: 'Pelajar',
        maritalStatus: 'Belum Kawin',
        nationality: 'WNI',
        phone: '087890123456',
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        nik: '1234567890123463',
        name: 'Rudi Hartono',
        gender: 'L',
        rt: '02',
        rw: '01',
        dusun: 'Dusun 1',
        village: 'Desa Maju',
        district: 'Kecamatan Sejahtera',
        regency: 'Kabupaten Lampung Timur',
        province: 'Provinsi Lampung',
        birthPlace: 'Way Kanan',
        birthDate: '1982-02-14',
        occupation: 'Nelayan',
        maritalStatus: 'Kawin',
        nationality: 'WNI',
        phone: '088901234567',
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        nik: '1234567890123464',
        name: 'Linda Susanti',
        gender: 'P',
        rt: '01',
        rw: '02',
        dusun: 'Dusun 2',
        village: 'Desa Maju',
        district: 'Kecamatan Sejahtera',
        regency: 'Kabupaten Lampung Timur',
        province: 'Provinsi Lampung',
        birthPlace: 'Metro',
        birthDate: '1993-06-07',
        occupation: 'Ibu Rumah Tangga',
        maritalStatus: 'Kawin',
        nationality: 'WNI',
        phone: '089012345678',
        createdAt: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        nik: '1234567890123465',
        name: 'Hendra Wijaya',
        gender: 'L',
        rt: '03',
        rw: '02',
        dusun: 'Dusun 3',
        village: 'Desa Maju',
        district: 'Kecamatan Sejahtera',
        regency: 'Kabupaten Lampung Timur',
        province: 'Provinsi Lampung',
        birthPlace: 'Tulang Bawang',
        birthDate: '1978-12-01',
        occupation: 'Petani',
        maritalStatus: 'Duda',
        nationality: 'WNI',
        phone: '081234567891',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('desamaju.citizens', JSON.stringify(citizens));

    // Initialize sample letters
    const letters = [];
    const letterTypesList = JSON.parse(localStorage.getItem('desamaju.letter_types'));
    const usersList = JSON.parse(localStorage.getItem('desamaju.users'));
    const wargaUser = usersList.find(u => u.role === 'warga');

    // Create 3 sample letters with different statuses
    const sampleLetters = [
      {
        letterTypeId: letterTypesList[0].id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        content: 'Yang bertanda tangan di bawah ini menerangkan bahwa:\n\nNama: Siti Rahayu\nNIK: 1234567890123456\n\nBenar-benar penduduk yang berdomisili di:\nDusun 1, RT 01, RW 01, Desa Maju, Kecamatan Sejahtera, Kabupaten Lampung Timur.\n\nDemikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.',
        status: 'disetujui',
        approvals: {
          rt: { approvedBy: usersList[1].id, approvedByName: usersList[1].name, approvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), notes: '' },
          rw: { approvedBy: usersList[2].id, approvedByName: usersList[2].name, approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), notes: '' },
          kepala_desa: { approvedBy: usersList[3].id, approvedByName: usersList[3].name, approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), notes: '' }
        }
      },
      {
        letterTypeId: letterTypesList[1].id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        content: 'Surat pengantar untuk pembuatan SKCK atas nama:\n\nNama: Siti Rahayu\nNIK: 1234567890123456\n\nTinggal di Dusun 1, RT 01, RW 01, Desa Maju, Kecamatan Sejahtera, Kabupaten Lampung Timur.\n\nDemikian surat pengantar ini dibuat.',
        status: 'process',
        approvals: {
          rt: { approvedBy: usersList[1].id, approvedByName: usersList[1].name, approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), notes: '' },
          rw: null,
          kepala_desa: null
        }
      },
      {
        letterTypeId: letterTypesList[2].id,
        date: new Date().toISOString(),
        content: 'Surat keterangan tidak mampu untuk keperluan beasiswa atas nama:\n\nNama: Siti Rahayu\nNIK: 1234567890123456\n\nDengan alamat Dusun 1, RT 01, RW 01, Desa Maju, Kecamatan Sejahtera, Kabupaten Lampung Timur.\n\nDemikian surat keterangan ini dibuat.',
        status: 'pending',
        approvals: {
          rt: null,
          rw: null,
          kepala_desa: null
        }
      }
    ];

    sampleLetters.forEach((sample, index) => {
      const letterTypes = JSON.parse(localStorage.getItem('desamaju.letter_types'));
      const letterType = letterTypes.find(t => t.id === sample.letterTypeId);
      const code = letterType ? letterType.code : 'SURAT';

      letters.push({
        id: Utils.generateId(),
        letterNumber: `${code}/00${index + 1}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`,
        userId: wargaUser.id,
        applicantName: wargaUser.name,
        ...sample,
        attachment: null,
        createdAt: sample.date,
        updatedAt: sample.date
      });
    });

    localStorage.setItem('desamaju.letters', JSON.stringify(letters));

    // Initialize settings
    const settings = {
      desaName: 'Desa Maju',
      kecamatan: 'Sejahtera',
      kabupaten: 'Lampung Timur',
      kepalaDesaName: 'H. Mohammad Yusuf',
      alamat: 'Jl. Raya Desa No. 1, Kecamatan Sejahtera, Kabupaten Lampung Timur, Provinsi Lampung',
      logo: null,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('desamaju.settings', JSON.stringify(settings));

    // Mark as initialized
    localStorage.setItem('desamaju.initialized', 'true');
  },

  // Initialize router
  initRouter() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  // Handle route changes
  handleRoute() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const [route, param] = hash.split('/');

    // Check authentication for non-login routes
    if (route !== 'login' && !Auth.isLoggedIn()) {
      window.location.hash = 'login';
      return;
    }

    this.currentRoute = route;
    this.render(route, param);
  },

  // Router navigate
  navigate(route) {
    window.location.hash = route;
  },

  // Render page based on route
  render(route, param) {
    const app = document.getElementById('app');
    const user = Auth.getCurrentUser();

    // Render login page
    if (route === 'login') {
      app.innerHTML = this.renderLoginPage();
      return;
    }

    // Render main layout with sidebar
    const menuItems = Auth.getMenuItems();
    app.innerHTML = `
      ${this.renderSidebar(menuItems, user)}
      <div class="main-content">
        ${this.renderTopBar(user)}
        <div class="content-area" id="contentArea">
          ${this.renderContent(route, param, user)}
        </div>
      </div>
    `;

    // Bind events after rendering
    this.bindPageEvents(route);
  },

  // Render login page
  renderLoginPage() {
    return `
      <div class="login-container">
        <div class="login-box">
          <div class="login-header">
            <div class="login-logo">D</div>
            <h1 class="login-title">DESAKU</h1>
            <p class="login-subtitle">Sistem Manajemen Surat Desa</p>
          </div>
          <form id="loginForm">
            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" class="form-input" name="username" 
                     placeholder="Masukkan username" required>
              <span class="form-error" data-error="username">Username harus diisi</span>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" name="password" 
                     placeholder="Masukkan password" required>
              <span class="form-error" data-error="password">Password harus diisi</span>
            </div>
            <button type="submit" class="btn btn-primary btn-block">
              Masuk
            </button>
          </form>
          <div style="margin-top:20px;text-align:center;font-size:12px;color:var(--gray);">
            <p>Demo Login:</p>
            <p>admin / demo123</p>
            <p>rt01 / demo123</p>
            <p>rw01 / demo123</p>
            <p>kades / demo123</p>
            <p>warga01 / demo123</p>
          </div>
        </div>
      </div>
    `;
  },

  // Render sidebar
  renderSidebar(menuItems, user) {
    return `
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">D</div>
          <div class="sidebar-title">DESAKU</div>
          <div class="sidebar-subtitle">Desa Maju Sejahtera</div>
        </div>
        <nav class="sidebar-menu">
          ${menuItems.map(item => `
            <a href="#${item.id}" class="menu-item ${item.id === this.currentRoute ? 'active' : ''}" data-route="${item.id}">
              <span class="menu-item-icon">${item.icon}</span>
              <span>${item.label}</span>
            </a>
          `).join('')}
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">${Utils.getInitials(user.name)}</div>
            <div class="user-details">
              <div class="user-name">${Utils.sanitize(user.name)}</div>
              <div class="user-role">${Utils.getRoleName(user.role)}</div>
            </div>
          </div>
          <button class="btn btn-secondary btn-block" onclick="Auth.logout()">
            🚪 Logout
          </button>
        </div>
      </aside>
    `;
  },

  // Render top bar
  renderTopBar(user) {
    return `
      <div class="top-bar">
        <button class="mobile-menu-btn" onclick="App.toggleSidebar()">
          ☰
        </button>
        <h2 class="page-title">${this.getPageTitle()}</h2>
        <div></div>
      </div>
    `;
  },

  // Get page title based on route
  getPageTitle() {
    const titles = {
      'dashboard': 'Dashboard',
      'surat': 'Daftar Surat',
      'surat-saya': 'Surat Saya',
      'buat-surat': 'Buat Surat Baru',
      'master-users': 'User Management',
      'master-jenis-surat': 'Jenis Surat',
      'master-warga': 'Data Warga',
      'master-ttd': 'TTD & Cap Digital',
      'master-nomor': 'Nomor Surat',
      'persetujuan-rt': 'Persetujuan RT',
      'persetujuan-rw': 'Persetujuan RW',
      'persetujuan-desa': 'Persetujuan Desa',
      'settings': 'Pengaturan'
    };
    return titles[this.currentRoute] || 'Dashboard';
  },

  // Render page content
  renderContent(route, param, user) {
    switch (route) {
      case 'dashboard':
        return this.renderDashboardByRole(user);
      case 'surat':
        return user.role === 'admin' ? Admin.renderLetters() : Approval.renderLetters(user.role);
      case 'surat-saya':
        return Citizen.renderMyLetters();
      case 'buat-surat':
        return Citizen.renderMyLetters(); // Will trigger modal
      case 'master-users':
        return Admin.renderUsers();
      case 'master-jenis-surat':
        return this.renderMasterLetterTypes();
      case 'master-warga':
        return this.renderMasterCitizens();
      case 'master-ttd':
        return this.renderMasterSignatures();
      case 'master-nomor':
        return this.renderMasterLetterNumbering();
      case 'persetujuan-rt':
      case 'persetujuan-rw':
      case 'persetujuan-desa':
        return Approval.renderDashboard(user.role);
      case 'settings':
        return Admin.renderSettings();
      default:
        return '<p>Halaman tidak ditemukan</p>';
    }
  },

  // Render dashboard based on user role
  renderDashboardByRole(user) {
    switch (user.role) {
      case 'admin':
        return Admin.renderDashboard();
      case 'rt':
      case 'rw':
      case 'kepala_desa':
        return Approval.renderDashboard(user.role);
      case 'warga':
        return Citizen.renderDashboard();
      default:
        return '<p>Role tidak dikenal</p>';
    }
  },

  // Master: Letter Types
  renderMasterLetterTypes() {
    const letterTypes = MasterData.letterTypes.getAll();
    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Jenis Surat</h3>
          <button class="btn btn-primary" onclick="App.showAddLetterTypeModal()">
            + Tambah Jenis Surat
          </button>
        </div>
        <div id="letterTypesTable">
          ${MasterData.letterTypes.renderTable(letterTypes)}
        </div>
      </div>
    `;
  },

  showAddLetterTypeModal() {
    const formHtml = `
      <form id="letterTypeForm">
        <div class="form-group">
          <label class="form-label">Kode *</label>
          <input type="text" class="form-input" name="code" required 
                 placeholder="Contoh: SKD" maxlength="10">
        </div>
        <div class="form-group">
          <label class="form-label">Nama Jenis Surat *</label>
          <input type="text" class="form-input" name="name" required 
                 placeholder="Contoh: Surat Keterangan Domisili">
        </div>
        <div class="form-group">
          <label class="form-label">Deskripsi</label>
          <textarea class="form-textarea" name="description" rows="3" 
                    placeholder="Deskripsi jenis surat..."></textarea>
        </div>
      </form>
    `;

    Modal.show({
      title: 'Tambah Jenis Surat',
      content: formHtml,
      onConfirm: () => {
        const form = document.getElementById('letterTypeForm');
        const formData = new FormData(form);
        
        try {
          MasterData.letterTypes.create({
            code: formData.get('code').toUpperCase(),
            name: formData.get('name'),
            description: formData.get('description')
          });
          Modal.hide();
          Toast.success('Berhasil', 'Jenis surat berhasil ditambahkan');
          this.router.navigate('master-jenis-surat');
        } catch (error) {
          Toast.error('Error', error.message);
        }
      }
    });
  },

  // Master: Citizens
  renderMasterCitizens() {
    const citizens = MasterData.citizens.getAll();
    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Data Warga</h3>
          <div style="display:flex;gap:10px;">
            <input type="text" class="form-input" id="searchCitizen" 
                   placeholder="Cari warga..." style="min-width:200px;">
            <button class="btn btn-primary" onclick="App.showAddCitizenModal()">
              + Tambah Warga
            </button>
          </div>
        </div>
        <div id="citizensTable">
          ${MasterData.citizens.renderTable(citizens)}
        </div>
      </div>
    `;
  },

  bindCitizenEvents() {
    const searchInput = document.getElementById('searchCitizen');
    const tableContainer = document.getElementById('citizensTable');

    const refreshTable = () => {
      let citizens = MasterData.citizens.getAll();
      const search = searchInput.value.toLowerCase();

      if (search) {
        citizens = MasterData.citizens.search(search);
      }

      tableContainer.innerHTML = MasterData.citizens.renderTable(citizens);
      this.bindCitizenTableEvents();
    };

    searchInput.addEventListener('input', Utils.debounce(refreshTable, 300));
    this.bindCitizenTableEvents();
  },

  bindCitizenTableEvents() {
    const table = document.querySelector('#citizensTable table');
    if (!table) return;

    const citizens = MasterData.citizens.getAll();

    table.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const index = btn.dataset.index;
      const citizen = citizens[index];
      const action = btn.dataset.action;

      switch (action) {
        case 'edit':
          this.showEditCitizenModal(citizen.id);
          break;
        case 'delete':
          this.deleteCitizen(citizen.id);
          break;
      }
    });
  },

  showAddCitizenModal() {
    const formHtml = `
      <form id="citizenForm" style="max-height:70vh;overflow-y:auto;padding:10px;">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">NIK *</label>
            <input type="text" class="form-input" name="nik" required maxlength="16" pattern="\\d{16}">
          </div>
          <div class="form-group">
            <label class="form-label">Nama Lengkap *</label>
            <input type="text" class="form-input" name="name" required>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Jenis Kelamin *</label>
            <select class="form-select" name="gender" required>
              <option value="">Pilih</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tempat Lahir *</label>
            <input type="text" class="form-input" name="birthPlace" required>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Tanggal Lahir *</label>
            <input type="date" class="form-input" name="birthDate" required>
          </div>
          <div class="form-group">
            <label class="form-label">Pekerjaan</label>
            <input type="text" class="form-input" name="occupation">
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Status Perkawinan</label>
            <select class="form-select" name="maritalStatus">
              <option value="Belum Kawin">Belum Kawin</option>
              <option value="Kawin">Kawin</option>
              <option value="Cerai Hidup">Cerai Hidup</option>
              <option value="Cerai Mati">Cerai Mati</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">No. HP *</label>
            <input type="tel" class="form-input" name="phone" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">RT *</label>
          <input type="text" class="form-input" name="rt" required maxlength="3">
        </div>
        <div class="form-group">
          <label class="form-label">RW *</label>
          <input type="text" class="form-input" name="rw" required maxlength="3">
        </div>
        <div class="form-group">
          <label class="form-label">Dusun</label>
          <input type="text" class="form-input" name="dusun">
        </div>
        <div class="form-group">
          <label class="form-label">Kel/Desa</label>
          <input type="text" class="form-input" name="village">
        </div>
        <div class="form-group">
          <label class="form-label">Kecamatan</label>
          <input type="text" class="form-input" name="district">
        </div>
        <div class="form-group">
          <label class="form-label">Kabupaten</label>
          <input type="text" class="form-input" name="regency">
        </div>
        <div class="form-group">
          <label class="form-label">Provinsi</label>
          <input type="text" class="form-input" name="province">
        </div>
      </form>
    `;

    Modal.show({
      title: 'Tambah Data Warga',
      content: formHtml,
      size: 'large',
      onConfirm: () => {
        const form = document.getElementById('citizenForm');
        const formData = new FormData(form);
        
        try {
          MasterData.citizens.create({
            nik: formData.get('nik'),
            name: formData.get('name'),
            gender: formData.get('gender'),
            birthPlace: formData.get('birthPlace'),
            birthDate: formData.get('birthDate'),
            occupation: formData.get('occupation'),
            maritalStatus: formData.get('maritalStatus'),
            phone: formData.get('phone'),
            rt: formData.get('rt'),
            rw: formData.get('rw'),
            dusun: formData.get('dusun'),
            village: formData.get('village'),
            district: formData.get('district'),
            regency: formData.get('regency'),
            province: formData.get('province')
          });
          Modal.hide();
          Toast.success('Berhasil', 'Data warga berhasil ditambahkan');
          this.router.navigate('master-warga');
        } catch (error) {
          Toast.error('Error', error.message);
        }
      }
    });
  },

  deleteCitizen(citizenId) {
    Modal.confirm('Apakah Anda yakin ingin menghapus data warga ini?', () => {
      try {
        MasterData.citizens.delete(citizenId);
        Toast.success('Berhasil', 'Data warga berhasil dihapus');
        this.router.navigate('master-warga');
      } catch (error) {
        Toast.error('Error', error.message);
      }
    });
  },

  // Master: Digital Signatures
  renderMasterSignatures() {
    const signatures = MasterData.digitalSignatures.getAll();
    const roles = ['rt', 'rw', 'kepala_desa'];

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">TTD & Cap Digital</h3>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;">
          ${roles.map(role => `
            <div style="border:1px solid var(--light-gray);border-radius:8px;padding:20px;">
              <h4 style="margin-bottom:15px;">${Utils.getRoleName(role)}</h4>
              ${signatures[role] ? `
                <img src="${signatures[role]}" style="max-width:100%;max-height:150px;border-radius:4px;margin-bottom:15px;">
                <button class="btn btn-danger btn-block" onclick="App.deleteSignature('${role}')">
                  Hapus TTD
                </button>
              ` : `
                <div class="upload-area" onclick="document.getElementById('sigInput${role}').click()">
                  <div class="upload-area-icon">✍️</div>
                  <div class="upload-area-text">Upload Tanda Tangan</div>
                </div>
                <input type="file" id="sigInput${role}" accept="image/*" style="display:none" 
                       onchange="App.uploadSignature('${role}', this)">
              `}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  async uploadSignature(role, input) {
    const file = input.files[0];
    if (file) {
      try {
        Loader.show('Mengupload tanda tangan...');
        const base64 = await Utils.fileToBase64(file);
        MasterData.digitalSignatures.save(role, base64);
        Toast.success('Berhasil', 'Tanda tangan berhasil diupload');
        this.router.navigate('master-ttd');
      } catch (error) {
        Toast.error('Error', 'Gagal mengupload tanda tangan');
      } finally {
        Loader.hide();
      }
    }
  },

  deleteSignature(role) {
    Modal.confirm('Apakah Anda yakin ingin menghapus tanda tangan ini?', () => {
      MasterData.digitalSignatures.delete(role);
      Toast.success('Berhasil', 'Tanda tangan berhasil dihapus');
      this.router.navigate('master-ttd');
    });
  },

  // Master: Letter Numbering
  renderMasterLetterNumbering() {
    const formats = MasterData.letterNumbering.getAll();
    const letterTypes = MasterData.letterTypes.getAll();

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Format Nomor Surat</h3>
          <button class="btn btn-primary" onclick="App.showAddLetterFormatModal()">
            + Tambah Format
          </button>
        </div>
        <p style="margin-bottom:20px;color:var(--gray);">
          Format nomor surat otomatis akan menggunakan pola: KODE Jenis Surat / Nomor Urut / Bulan / Tahun
        </p>
        <div id="formatsTable">
          ${MasterData.letterNumbering.renderTable(formats)}
        </div>
      </div>
    `;
  },

  showAddLetterFormatModal() {
    const letterTypes = MasterData.letterTypes.getAll();

    if (letterTypes.length === 0) {
      Toast.warning('Peringatan', 'Silakan tambahkan jenis surat terlebih dahulu');
      return;
    }

    const formHtml = `
      <form id="formatForm">
        <div class="form-group">
          <label class="form-label">Jenis Surat *</label>
          <select class="form-select" name="letterTypeId" required>
            <option value="">Pilih Jenis Surat</option>
            ${letterTypes.map(t => `
              <option value="${t.id}">${Utils.sanitize(t.name)} (${Utils.sanitize(t.code)})</option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Format</label>
          <input type="text" class="form-input" value="{code}/{no}/{month}/{year}" readonly
                 style="background:var(--light-gray);">
        </div>
      </form>
    `;

    Modal.show({
      title: 'Tambah Format Nomor Surat',
      content: formHtml,
      onConfirm: () => {
        const form = document.getElementById('formatForm');
        const formData = new FormData(form);
        
        try {
          MasterData.letterNumbering.create({
            letterTypeId: formData.get('letterTypeId'),
            format: '{code}/{no}/{month}/{year}'
          });
          Modal.hide();
          Toast.success('Berhasil', 'Format nomor surat berhasil ditambahkan');
          this.router.navigate('master-nomor');
        } catch (error) {
          Toast.error('Error', error.message);
        }
      }
    });
  },

  // Bind page events based on route
  bindPageEvents(route) {
    switch (route) {
      case 'surat':
        if (Auth.getCurrentUser().role === 'admin') {
          Admin.bindLettersEvents();
        } else {
          Approval.bindLettersEvents(Auth.getCurrentUser().role);
        }
        break;
      case 'surat-saya':
      case 'buat-surat':
        Citizen.bindMyLettersEvents();
        if (route === 'buat-surat') {
          Citizen.showCreateLetterModal();
        }
        break;
      case 'master-users':
        Admin.bindUsersEvents();
        break;
      case 'master-warga':
        this.bindCitizenEvents();
        break;
      case 'settings':
        Admin.bindSettingsEvents();
        break;
      case 'persetujuan-rt':
      case 'persetujuan-rw':
      case 'persetujuan-desa':
        Approval.bindEvents(Auth.getCurrentUser().role);
        break;
    }

    // Bind modal events
    this.bindModalEvents();
  },

  bindModalEvents() {
    // Listen for modal button clicks
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;

        if (action === 'reject') {
          const user = Auth.getCurrentUser();
          if (['rt', 'rw', 'kepala_desa'].includes(user.role)) {
            Approval.rejectLetter(Approval.getPendingLetters(user.role)[0]?.id, user.role);
          }
        } else if (action === 'approve') {
          const user = Auth.getCurrentUser();
          if (['rt', 'rw', 'kepala_desa'].includes(user.role)) {
            Approval.approveLetter(Approval.getPendingLetters(user.role)[0]?.id, user.role);
          }
        }
      });
    }

    // Handle letter type table events
    const letterTypesTable = document.querySelector('#letterTypesTable table');
    if (letterTypesTable) {
      letterTypesTable.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const index = btn.dataset.index;
        const letterTypes = MasterData.letterTypes.getAll();
        const letterType = letterTypes[index];
        const action = btn.dataset.action;

        if (action === 'delete') {
          Modal.confirm('Apakah Anda yakin ingin menghapus jenis surat ini?', () => {
            try {
              MasterData.letterTypes.delete(letterType.id);
              Toast.success('Berhasil', 'Jenis surat berhasil dihapus');
              this.router.navigate('master-jenis-surat');
            } catch (error) {
              Toast.error('Error', error.message);
            }
          });
        }
      });
    }

    // Handle formats table events
    const formatsTable = document.querySelector('#formatsTable table');
    if (formatsTable) {
      formatsTable.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const index = btn.dataset.index;
        const formats = MasterData.letterNumbering.getAll();
        const format = formats[index];
        const action = btn.dataset.action;

        if (action === 'delete') {
          Modal.confirm('Apakah Anda yakin ingin menghapus format ini?', () => {
            try {
              MasterData.letterNumbering.delete(format.id);
              Toast.success('Berhasil', 'Format nomor surat berhasil dihapus');
              this.router.navigate('master-nomor');
            } catch (error) {
              Toast.error('Error', error.message);
            }
          });
        }
      });
    }
  },

  // Bind global events
  bindGlobalEvents() {
    // Mobile menu toggle
    document.addEventListener('click', (e) => {
      const mobileBtn = e.target.closest('.mobile-menu-btn');
      if (mobileBtn) {
        this.toggleSidebar();
      }
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      const sidebar = document.querySelector('.sidebar');
      const sidebarBtn = e.target.closest('.sidebar') || e.target.closest('.mobile-menu-btn');
      
      if (sidebar && sidebar.classList.contains('active') && !sidebarBtn) {
        sidebar.classList.remove('active');
      }
    });
  },

  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
  },

  router: {
    navigate: function(route) {
      App.navigate(route);
    }
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
