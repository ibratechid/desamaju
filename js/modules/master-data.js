// Master Data Module - CRUD operations for master data

const MasterData = {
  // ============ USERS ============
  users: {
    getAll() {
      return JSON.parse(localStorage.getItem('desamaju.users') || '[]');
    },

    getById(id) {
      const users = this.getAll();
      return users.find(u => u.id === id);
    },

    create(userData) {
      const users = this.getAll();
      
      // Check duplicate username
      if (users.find(u => u.username === userData.username)) {
        throw new Error('Username sudah digunakan');
      }

      const newUser = {
        id: Utils.generateId(),
        ...userData,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('desamaju.users', JSON.stringify(users));

      // Log activity
      const currentUser = Auth.getCurrentUser();
      Auth.logActivity(currentUser.id, `create_user:${newUser.id}`);

      return newUser;
    },

    update(id, updates) {
      const users = this.getAll();
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) {
        throw new Error('User tidak ditemukan');
      }

      // Prevent modifying self to remove admin privileges
      const currentUser = Auth.getCurrentUser();
      if (id === currentUser.id && updates.role && updates.role !== currentUser.role) {
        throw new Error('Tidak dapat mengubah role sendiri');
      }

      users[index] = {
        ...users[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('desamaju.users', JSON.stringify(users));

      // Log activity
      Auth.logActivity(currentUser.id, `update_user:${id}`);

      return users[index];
    },

    delete(id) {
      const users = this.getAll();
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) {
        throw new Error('User tidak ditemukan');
      }

      // Prevent deleting self
      const currentUser = Auth.getCurrentUser();
      if (id === currentUser.id) {
        throw new Error('Tidak dapat menghapus user sendiri');
      }

      users.splice(index, 1);
      localStorage.setItem('desamaju.users', JSON.stringify(users));

      // Log activity
      Auth.logActivity(currentUser.id, `delete_user:${id}`);

      return true;
    },

    renderTable(users, options = {}) {
      const { showActions = true } = options;

      const columns = [
        { key: 'username', label: 'Username' },
        { key: 'name', label: 'Nama Lengkap', formatter: (v) => Utils.sanitize(v) },
        { key: 'email', label: 'Email', formatter: (v) => Utils.sanitize(v) },
        { 
          key: 'role', 
          label: 'Role',
          formatter: (v) => `<span class="badge badge-process">${Utils.getRoleName(v)}</span>`
        },
        { 
          key: 'status', 
          label: 'Status',
          formatter: (v) => v ? '<span class="badge badge-approved">Aktif</span>' : '<span class="badge badge-rejected">Nonaktif</span>'
        }
      ];

      const rowActions = showActions ? [
        { label: 'Edit', icon: '✏️', action: 'edit', type: 'primary' },
        { label: 'Hapus', icon: '🗑️', action: 'delete', type: 'danger' }
      ] : null;

      return Table.render({
        columns,
        data: users,
        emptyMessage: 'Tidak ada user',
        rowActions
      });
    }
  },

  // ============ LETTER TYPES ============
  letterTypes: {
    getAll() {
      return JSON.parse(localStorage.getItem('desamaju.letter_types') || '[]');
    },

    getById(id) {
      const types = this.getAll();
      return types.find(t => t.id === id);
    },

    create(typeData) {
      const types = this.getAll();
      
      // Check duplicate code
      if (types.find(t => t.code === typeData.code)) {
        throw new Error('Kode jenis surat sudah digunakan');
      }

      const newType = {
        id: Utils.generateId(),
        ...typeData,
        createdAt: new Date().toISOString()
      };

      types.push(newType);
      localStorage.setItem('desamaju.letter_types', JSON.stringify(types));

      const currentUser = Auth.getCurrentUser();
      Auth.logActivity(currentUser.id, `create_letter_type:${newType.id}`);

      return newType;
    },

    update(id, updates) {
      const types = this.getAll();
      const index = types.findIndex(t => t.id === id);
      
      if (index === -1) {
        throw new Error('Jenis surat tidak ditemukan');
      }

      // Check duplicate code if changing code
      if (updates.code && updates.code !== types[index].code) {
        if (types.find(t => t.code === updates.code && t.id !== id)) {
          throw new Error('Kode jenis surat sudah digunakan');
        }
      }

      types[index] = {
        ...types[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('desamaju.letter_types', JSON.stringify(types));

      const currentUser = Auth.getCurrentUser();
      Auth.logActivity(currentUser.id, `update_letter_type:${id}`);

      return types[index];
    },

    delete(id) {
      const types = this.getAll();
      const index = types.findIndex(t => t.id === id);
      
      if (index === -1) {
        throw new Error('Jenis surat tidak ditemukan');
      }

      types.splice(index, 1);
      localStorage.setItem('desamaju.letter_types', JSON.stringify(types));

      const currentUser = Auth.getCurrentUser();
      Auth.logActivity(currentUser.id, `delete_letter_type:${id}`);

      return true;
    },

    renderTable(types, options = {}) {
      const { showActions = true } = options;

      const columns = [
        { key: 'code', label: 'Kode', formatter: (v) => `<strong>${Utils.sanitize(v)}</strong>` },
        { key: 'name', label: 'Nama Jenis Surat', formatter: (v) => Utils.sanitize(v) },
        { key: 'description', label: 'Deskripsi', formatter: (v) => Utils.truncate(v, 50) }
      ];

      const rowActions = showActions ? [
        { label: 'Edit', icon: '✏️', action: 'edit', type: 'primary' },
        { label: 'Hapus', icon: '🗑️', action: 'delete', type: 'danger' }
      ] : null;

      return Table.render({
        columns,
        data: types,
        emptyMessage: 'Tidak ada jenis surat',
        rowActions
      });
    }
  },

  // ============ CITIZENS (WARGA) ============
  citizens: {
    getAll() {
      return JSON.parse(localStorage.getItem('desamaju.citizens') || '[]');
    },

    getById(id) {
      const citizens = this.getAll();
      return citizens.find(c => c.id === id);
    },

    search(query) {
      const citizens = this.getAll();
      const q = query.toLowerCase();
      return citizens.filter(c => 
        c.name.toLowerCase().includes(q) || c.nik.includes(q)
      );
    },

    create(citizenData) {
      const citizens = this.getAll();
      
      // Check duplicate NIK
      if (citizens.find(c => c.nik === citizenData.nik)) {
        throw new Error('NIK sudah terdaftar');
      }

      const newCitizen = {
        id: Utils.generateId(),
        ...citizenData,
        createdAt: new Date().toISOString()
      };

      citizens.push(newCitizen);
      localStorage.setItem('desamaju.citizens', JSON.stringify(citizens));

      const currentUser = Auth.getCurrentUser();
      Auth.logActivity(currentUser.id, `create_citizen:${newCitizen.id}`);

      return newCitizen;
    },

    update(id, updates) {
      const citizens = this.getAll();
      const index = citizens.findIndex(c => c.id === id);
      
      if (index === -1) {
        throw new Error('Warga tidak ditemukan');
      }

      // Check duplicate NIK if changing NIK
      if (updates.nik && updates.nik !== citizens[index].nik) {
        if (citizens.find(c => c.nik === updates.nik && c.id !== id)) {
          throw new Error('NIK sudah terdaftar');
        }
      }

      citizens[index] = {
        ...citizens[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('desamaju.citizens', JSON.stringify(citizens));

      const currentUser = Auth.getCurrentUser();
      Auth.logActivity(currentUser.id, `update_citizen:${id}`);

      return citizens[index];
    },

    delete(id) {
      const citizens = this.getAll();
      const index = citizens.findIndex(c => c.id === id);
      
      if (index === -1) {
        throw new Error('Warga tidak ditemukan');
      }

      citizens.splice(index, 1);
      localStorage.setItem('desamaju.citizens', JSON.stringify(citizens));

      const currentUser = Auth.getCurrentUser();
      Auth.logActivity(currentUser.id, `delete_citizen:${id}`);

      return true;
    },

    renderTable(citizens, options = {}) {
      const { showActions = true } = options;

      const columns = [
        { key: 'nik', label: 'NIK', formatter: (v) => `<strong>${Utils.sanitize(v)}</strong>` },
        { key: 'name', label: 'Nama Lengkap', formatter: (v) => Utils.sanitize(v) },
        { key: 'rt', label: 'RT', formatter: (v) => Utils.sanitize(v) },
        { key: 'rw', label: 'RW', formatter: (v) => Utils.sanitize(v) },
        { key: 'phone', label: 'No. HP', formatter: (v) => Utils.sanitize(v) },
        { 
          key: 'gender', 
          label: 'Jenis Kelamin',
          formatter: (v) => v === 'L' ? 'Laki-laki' : 'Perempuan'
        }
      ];

      const rowActions = showActions ? [
        { label: 'Edit', icon: '✏️', action: 'edit', type: 'primary' },
        { label: 'Hapus', icon: '🗑️', action: 'delete', type: 'danger' }
      ] : null;

      return Table.render({
        columns,
        data: citizens,
        emptyMessage: 'Tidak ada data warga',
        rowActions
      });
    }
  },

  // ============ DIGITAL SIGNATURES ============
  digitalSignatures: {
    getAll() {
      return JSON.parse(localStorage.getItem('desamaju.digital_signatures') || '{}');
    },

    save(role, base64Data) {
      const signatures = this.getAll();
      signatures[role] = base64Data;
      localStorage.setItem('desamaju.digital_signatures', JSON.stringify(signatures));

      const currentUser = Auth.getCurrentUser();
      Auth.logActivity(currentUser.id, `save_signature:${role}`);

      return true;
    },

    delete(role) {
      const signatures = this.getAll();
      delete signatures[role];
      localStorage.setItem('desamaju.digital_signatures', JSON.stringify(signatures));

      const currentUser = Auth.getCurrentUser();
      Auth.logActivity(currentUser.id, `delete_signature:${role}`);

      return true;
    },

    get(role) {
      const signatures = this.getAll();
      return signatures[role] || null;
    }
  },

  // ============ LETTER NUMBERING ============
  letterNumbering: {
    getAll() {
      return JSON.parse(localStorage.getItem('desamaju.letter_numbering') || '[]');
    },

    getByLetterType(letterTypeId) {
      const formats = this.getAll();
      return formats.find(f => f.letterTypeId === letterTypeId);
    },

    create(formatData) {
      const formats = this.getAll();
      
      // Check duplicate letter type
      if (formats.find(f => f.letterTypeId === formatData.letterTypeId)) {
        throw new Error('Format nomor surat untuk jenis ini sudah ada');
      }

      const newFormat = {
        id: Utils.generateId(),
        ...formatData,
        createdAt: new Date().toISOString()
      };

      formats.push(newFormat);
      localStorage.setItem('desamaju.letter_numbering', JSON.stringify(formats));

      const currentUser = Auth.getCurrentUser();
      Auth.logActivity(currentUser.id, `create_letter_format:${newFormat.id}`);

      return newFormat;
    },

    update(id, updates) {
      const formats = this.getAll();
      const index = formats.findIndex(f => f.id === id);
      
      if (index === -1) {
        throw new Error('Format nomor surat tidak ditemukan');
      }

      formats[index] = {
        ...formats[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('desamaju.letter_numbering', JSON.stringify(formats));

      const currentUser = Auth.getCurrentUser();
      Auth.logActivity(currentUser.id, `update_letter_format:${id}`);

      return formats[index];
    },

    delete(id) {
      const formats = this.getAll();
      const index = formats.findIndex(f => f.id === id);
      
      if (index === -1) {
        throw new Error('Format nomor surat tidak ditemukan');
      }

      formats.splice(index, 1);
      localStorage.setItem('desamaju.letter_numbering', JSON.stringify(formats));

      const currentUser = Auth.getCurrentUser();
      Auth.logActivity(currentUser.id, `delete_letter_format:${id}`);

      return true;
    },

    renderTable(formats, options = {}) {
      const { showActions = true } = options;

      const letterTypes = JSON.parse(localStorage.getItem('desamaju.letter_types') || '[]');

      const columns = [
        { 
          key: 'letterTypeId', 
          label: 'Jenis Surat',
          formatter: (value) => {
            const type = letterTypes.find(t => t.id === value);
            return type ? Utils.sanitize(type.name) : 'Unknown';
          }
        },
        { key: 'format', label: 'Format', formatter: (v) => `<code>${Utils.sanitize(v)}</code>` },
        { 
          key: 'preview', 
          label: 'Preview',
          formatter: (v, row) => {
            const type = letterTypes.find(t => t.id === row.letterTypeId);
            const code = type ? type.code : 'XXX';
            return `${code}/001/01/2024`;
          }
        }
      ];

      const rowActions = showActions ? [
        { label: 'Edit', icon: '✏️', action: 'edit', type: 'primary' },
        { label: 'Hapus', icon: '🗑️', action: 'delete', type: 'danger' }
      ] : null;

      return Table.render({
        columns,
        data: formats,
        emptyMessage: 'Tidak ada format nomor surat',
        rowActions
      });
    }
  },

  // ============ SETTINGS ============
  settings: {
    getAll() {
      return JSON.parse(localStorage.getItem('desamaju.settings') || '{}');
    },

    save(settingsData) {
      const currentSettings = this.getAll();
      const newSettings = {
        ...currentSettings,
        ...settingsData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('desamaju.settings', JSON.stringify(newSettings));

      const currentUser = Auth.getCurrentUser();
      Auth.logActivity(currentUser.id, 'update_settings');

      return newSettings;
    },

    get(key) {
      const settings = this.getAll();
      return settings[key] || null;
    }
  }
};
