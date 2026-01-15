// Letters Module - Manage letters and approval workflow

const Letters = {
  // Get all letters
  getAll() {
    return JSON.parse(localStorage.getItem('desamaju.letters') || '[]');
  },

  // Get letter by ID
  getById(id) {
    const letters = this.getAll();
    return letters.find(l => l.id === id);
  },

  // Get letters by user
  getByUserId(userId) {
    const letters = this.getAll();
    return letters.filter(l => l.userId === userId);
  },

  // Get letters by status
  getByStatus(status) {
    const letters = this.getAll();
    return letters.filter(l => l.status === status);
  },

  // Get pending letters for RT
  getPendingRT(rtNumber) {
    const letters = this.getAll();
    return letters.filter(l => l.status === 'pending');
  },

  // Get pending letters for RW
  getPendingRW() {
    const letters = this.getAll();
    return letters.filter(l => l.status === 'process' && l.approvals.rt && !l.approvals.rw);
  },

  // Get pending letters for Kepala Desa
  getPendingDesa() {
    const letters = this.getAll();
    return letters.filter(l => l.status === 'process' && l.approvals.rw && !l.approvals.kepala_desa);
  },

  // Create new letter
  create(letterData) {
    const letters = this.getAll();
    const user = Auth.getCurrentUser();
    
    // Get letter type for code
    const letterTypes = JSON.parse(localStorage.getItem('desamaju.letter_types') || '[]');
    const letterType = letterTypes.find(t => t.id === letterData.letterTypeId);
    const code = letterType ? letterType.code : 'SURAT';

    const newLetter = {
      id: Utils.generateId(),
      letterNumber: Utils.generateLetterNumber(code),
      userId: user.id,
      letterTypeId: letterData.letterTypeId,
      date: letterData.date || new Date().toISOString(),
      applicantName: user.name,
      content: letterData.content,
      attachment: letterData.attachment || null,
      status: 'pending',
      approvals: {
        rt: null,
        rw: null,
        kepala_desa: null
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    letters.push(newLetter);
    localStorage.setItem('desamaju.letters', JSON.stringify(letters));

    // Log activity
    Auth.logActivity(user.id, `create_letter:${newLetter.id}`);

    return newLetter;
  },

  // Update letter
  update(id, updates) {
    const letters = this.getAll();
    const index = letters.findIndex(l => l.id === id);
    
    if (index === -1) {
      throw new Error('Surat tidak ditemukan');
    }

    // Cannot update approved letters
    if (letters[index].status === 'disetujui') {
      throw new Error('Surat yang sudah disetujui tidak dapat diubah');
    }

    letters[index] = {
      ...letters[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('desamaju.letters', JSON.stringify(letters));
    return letters[index];
  },

  // Approve letter (for RT, RW, Kepala Desa)
  approve(letterId, role, notes = '') {
    const letters = this.getAll();
    const index = letters.findIndex(l => l.id === letterId);
    
    if (index === -1) {
      throw new Error('Surat tidak ditemukan');
    }

    const letter = letters[index];
    const user = Auth.getCurrentUser();

    // Check if already approved by this role
    if (letter.approvals[role]) {
      throw new Error('Surat sudah disetujui oleh ' + Utils.getRoleName(role));
    }

    // Update approval
    letter.approvals[role] = {
      approvedBy: user.id,
      approvedByName: user.name,
      approvedAt: new Date().toISOString(),
      notes: notes
    };

    // Update status based on workflow
    if (role === 'rt') {
      letter.status = 'process';
    } else if (role === 'rw') {
      letter.status = 'process';
    } else if (role === 'kepala_desa') {
      letter.status = 'disetujui';
    }

    letter.updatedAt = new Date().toISOString();
    letters[index] = letter;
    localStorage.setItem('desamaju.letters', JSON.stringify(letters));

    // Log activity
    Auth.logActivity(user.id, `approve_letter:${letterId}:${role}`);

    return letter;
  },

  // Reject letter
  reject(letterId, role, notes = '') {
    const letters = this.getAll();
    const index = letters.findIndex(l => l.id === letterId);
    
    if (index === -1) {
      throw new Error('Surat tidak ditemukan');
    }

    const letter = letters[index];
    const user = Auth.getCurrentUser();

    // Update status based on role rejection workflow
    if (role === 'rt') {
      letter.status = 'pending'; // RT rejected, go back to pending for warga revision
    } else if (role === 'rw') {
      letter.status = 'pending'; // RW rejected, go back to pending for RT review
    } else if (role === 'kepala_desa') {
      letter.status = 'process'; // Kepala Desa rejected, go back to process for RW review
    }
    
    letter.approvals[role] = {
      approvedBy: user.id,
      approvedByName: user.name,
      approvedAt: new Date().toISOString(),
      notes: notes,
      rejected: true
    };
    letter.updatedAt = new Date().toISOString();

    letters[index] = letter;
    localStorage.setItem('desamaju.letters', JSON.stringify(letters));

    // Log activity
    Auth.logActivity(user.id, `reject_letter:${letterId}:${role}`);

    return letter;
  },

  // Delete letter
  delete(id) {
    const letters = this.getAll();
    const index = letters.findIndex(l => l.id === id);
    
    if (index === -1) {
      throw new Error('Surat tidak ditemukan');
    }

    // Cannot delete approved letters
    if (letters[index].status === 'disetujui') {
      throw new Error('Surat yang sudah disetujui tidak dapat dihapus');
    }

    letters.splice(index, 1);
    localStorage.setItem('desamaju.letters', JSON.stringify(letters));

    // Log activity
    const user = Auth.getCurrentUser();
    Auth.logActivity(user.id, `delete_letter:${id}`);

    return true;
  },

  // Get statistics
  getStats(userId = null) {
    const letters = userId ? this.getByUserId(userId) : this.getAll();
    
    return {
      total: letters.length,
      pending: letters.filter(l => l.status === 'pending').length,
      process: letters.filter(l => l.status === 'process').length,
      approved: letters.filter(l => l.status === 'disetujui').length,
      rejected: letters.filter(l => l.status === 'rejected').length
    };
  },

  // Get letter type name
  getLetterTypeName(letterTypeId) {
    const types = JSON.parse(localStorage.getItem('desamaju.letter_types') || '[]');
    const type = types.find(t => t.id === letterTypeId);
    return type ? type.name : 'Unknown';
  },

  // Render letters table
  renderTable(letters, options = {}) {
    const {
      showActions = true,
      actions = [],
      emptyMessage = 'Tidak ada surat'
    } = options;

    const columns = [
      { 
        key: 'letterNumber', 
        label: 'No. Surat',
        formatter: (value, row) => `<strong>${Utils.sanitize(value)}</strong>`
      },
      { 
        key: 'letterTypeId', 
        label: 'Jenis Surat',
        formatter: (value) => Utils.sanitize(this.getLetterTypeName(value))
      },
      { 
        key: 'applicantName', 
        label: 'Pemohon',
        formatter: (value) => Utils.sanitize(value)
      },
      { 
        key: 'date', 
        label: 'Tanggal',
        formatter: (value) => Utils.formatDate(value, 'short')
      },
      { 
        key: 'status', 
        label: 'Status',
        formatter: (value) => `<span class="badge ${Utils.getStatusBadgeClass(value)}">${value}</span>`
      }
    ];

    const rowActions = showActions ? actions : null;

    return Table.render({
      columns,
      data: letters,
      emptyMessage,
      rowActions
    });
  },

  // Render letter detail
  renderDetail(letterId) {
    const letter = this.getById(letterId);
    if (!letter) {
      return '<p>Surat tidak ditemukan</p>';
    }

    const letterType = this.getLetterTypeName(letter.letterTypeId);
    const user = Auth.getCurrentUser();

    return `
      <div class="letter-detail">
        <div class="letter-detail-header">
          <h2 class="letter-detail-title">${Utils.sanitize(letterType)}</h2>
          <div class="letter-detail-number">Nomor: ${Utils.sanitize(letter.letterNumber)}</div>
          <div class="badge ${Utils.getStatusBadgeClass(letter.status)}" style="margin-top:10px;">
            Status: ${letter.status}
          </div>
        </div>

        <div class="letter-detail-meta">
          <div class="letter-meta-item">
            <span class="letter-meta-label">Tanggal Surat</span>
            <span class="letter-meta-value">${Utils.formatDate(letter.date)}</span>
          </div>
          <div class="letter-meta-item">
            <span class="letter-meta-label">Pemohon</span>
            <span class="letter-meta-value">${Utils.sanitize(letter.applicantName)}</span>
          </div>
          <div class="letter-meta-item">
            <span class="letter-meta-label">Dibuat</span>
            <span class="letter-meta-value">${Utils.formatDate(letter.createdAt, 'datetime')}</span>
          </div>
          <div class="letter-meta-item">
            <span class="letter-meta-label">Terakhir Diupdate</span>
            <span class="letter-meta-value">${Utils.formatDate(letter.updatedAt, 'datetime')}</span>
          </div>
        </div>

        <div class="letter-detail-content">
          <h4 style="margin-bottom:15px;">Isi Surat:</h4>
          <div style="background:var(--light-bg);padding:15px;border-radius:8px;white-space:pre-wrap;">
            ${Utils.sanitize(letter.content)}
          </div>
        </div>

        ${letter.attachment ? `
          <div class="letter-detail-content">
            <h4 style="margin-bottom:15px;">Lampiran:</h4>
            <a href="${letter.attachment}" download="lampiran" class="btn btn-secondary">
              📎 Download Lampiran
            </a>
          </div>
        ` : ''}

        <div class="letter-detail-footer">
          <h4 style="margin-bottom:15px;">Riwayat Persetujuan:</h4>
          <div class="approval-trail">
            ${this.renderApprovalTrail(letter)}
          </div>
        </div>
      </div>
    `;
  },

  // Render approval trail
  renderApprovalTrail(letter) {
    const roles = [
      { key: 'rt', label: 'Kepala RT', icon: '👤' },
      { key: 'rw', label: 'Kepala RW', icon: '👤' },
      { key: 'kepala_desa', label: 'Kepala Desa', icon: '👑' }
    ];

    return roles.map(role => {
      const approval = letter.approvals[role.key];
      
      if (!approval) {
        return `
          <div class="approval-trail-item" style="opacity:0.5;">
            <div class="approval-trail-icon" style="background:#e0e0e0;">
              ${role.icon}
            </div>
            <div class="approval-trail-info">
              <div class="approval-trail-name">${role.label}</div>
              <div class="approval-trail-role">Menunggu persetujuan</div>
            </div>
          </div>
        `;
      }

      const isRejected = approval.rejected;
      return `
        <div class="approval-trail-item">
          <div class="approval-trail-icon" style="background:${isRejected ? 'rgba(244,67,54,0.1)' : 'rgba(76,175,80,0.1)'};color:${isRejected ? 'var(--danger-color)' : 'var(--success-color)'};">
            ${isRejected ? '✕' : '✓'}
          </div>
          <div class="approval-trail-info">
            <div class="approval-trail-name">${Utils.sanitize(approval.approvedByName)}</div>
            <div class="approval-trail-role">${role.label} - ${Utils.formatDate(approval.approvedAt, 'datetime')}</div>
            ${approval.notes ? `<div class="approval-trail-note">${Utils.sanitize(approval.notes)}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  // Generate PDF
  async generatePDF(letterId) {
    const letter = this.getById(letterId);
    if (!letter) {
      throw new Error('Surat tidak ditemukan');
    }

    if (letter.status !== 'disetujui') {
      throw new Error('Hanya surat yang sudah disetujui yang bisa didownload');
    }

    // Create temporary container for PDF generation
    const container = document.createElement('div');
    container.innerHTML = this.renderLetterTemplate(letter);
    document.body.appendChild(container);

    try {
      const element = container;
      const opt = {
        margin: 10,
        filename: `Surat_${letter.letterNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      Toast.success('Berhasil', 'Surat berhasil didownload');
    } finally {
      document.body.removeChild(container);
    }
  },

  // Render letter template for PDF
  renderLetterTemplate(letter) {
    const settings = JSON.parse(localStorage.getItem('desamaju.settings') || '{}');
    const letterType = this.getLetterTypeName(letter.letterTypeId);
    const ttd = JSON.parse(localStorage.getItem('desamaju.digital_signatures') || '{}');

    return `
      <div style="font-family:'Times New Roman',serif;padding:40px;line-height:1.6;color:#000;">
        <!-- Kop Surat -->
        <div style="text-align:center;border-bottom:3px double #000;padding-bottom:20px;margin-bottom:30px;">
          ${settings.logo ? `<img src="${settings.logo}" style="width:80px;height:80px;margin-bottom:10px;">` : ''}
          <h2 style="margin:0;font-size:18px;font-weight:bold;text-transform:uppercase;">
            PEMERINTAH DESA ${settings.desaName || 'CONTOH'}
          </h2>
          <h3 style="margin:5px 0;font-size:14px;font-weight:bold;">
            Kecamatan ${settings.kecamatan || 'CONTOH'}, Kabupaten ${settings.kabupaten || 'CONTOH'}
          </h3>
          <p style="margin:5px 0;font-size:11px;">Alamat: ${settings.alamat || 'Alamat Desa'}</p>
        </div>

        <!-- Judul Surat -->
        <div style="text-align:center;margin:30px 0;">
          <h2 style="margin:0;font-size:16px;font-weight:bold;text-transform:underline;">
            R E S I
          </h2>
          <h3 style="margin:10px 0;font-size:14px;font-weight:bold;text-transform:uppercase;">
            ${Utils.sanitize(letterType)}
          </h3>
          <p style="margin:0;font-size:12px;">Nomor: ${Utils.sanitize(letter.letterNumber)}</p>
        </div>

        <!-- Isi Surat -->
        <div style="text-align:justify;margin:30px 0;">
          <p>Yang bertanda tangan di bawah ini Kepala Desa ${settings.desaName || 'CONTOH'}, Kecamatan ${settings.kecamatan || 'CONTOH'}, Kabupaten ${settings.kabupaten || 'CONTOH'}, menerangkan dengan sebenarnya bahwa:</p>
          
          <table style="margin:20px 0;">
            <tr>
              <td style="width:150px;padding:5px;">Nama</td>
              <td style="padding:5px;">: <strong>${Utils.sanitize(letter.applicantName)}</strong></td>
            </tr>
            <tr>
              <td style="padding:5px;">Tanggal Surat</td>
              <td style="padding:5px;">: ${Utils.formatDate(letter.date)}</td>
            </tr>
          </table>

          <div style="white-space:pre-wrap;padding:20px;background:#f9f9f9;border-left:3px solid #1B5E20;">
            ${Utils.sanitize(letter.content)}
          </div>
        </div>

        <!-- Tanda Tangan -->
        <div style="text-align:right;margin-top:50px;">
          <p>${settings.desaName || 'CONTOH'}, ${Utils.formatDate(new Date())}</p>
          <p style="margin-bottom:60px;">Kepala Desa ${settings.desaName || 'CONTOH'}</p>
          ${ttd.kepala_desa ? `<img src="${ttd.kepala_desa}" style="width:150px;height:auto;">` : ''}
          <p style="font-weight:bold;text-decoration:underline;">${settings.kepalaDesaName || 'Nama Kepala Desa'}</p>
        </div>
      </div>
    `;
  }
};
