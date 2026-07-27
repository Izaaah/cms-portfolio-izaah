import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot,
  serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// ──────────────────────────────────────────────
// Icons (inline SVG for zero dependencies)
// ──────────────────────────────────────────────
const Icon = ({ name, size = 18, color = 'currentColor' }) => {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/></>,
    folder: <><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke={color} strokeWidth="2" strokeLinejoin="round"/></>,
    code: <><polyline points="16 18 22 12 16 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="8 6 2 12 8 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2"/></>,
    settings: <><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="2"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    trash: <><polyline points="3 6 5 6 21 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    link: <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/></>,
    search: <><circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    check: <><polyline points="20 6 9 17 4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    chevronLeft: <><polyline points="15 18 9 12 15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    menu: <><line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v4M10 14h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={color} strokeWidth="2" strokeLinejoin="round"/></>,
    archive: <><polyline points="21 8 21 21 3 21 3 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="1" y="3" width="22" height="5" rx="1" stroke={color} strokeWidth="2"/><line x1="10" y1="12" x2="14" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    alertTriangle: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="2" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      {paths[name]}
    </svg>
  );
};

// ──────────────────────────────────────────────
// Nav items
// ──────────────────────────────────────────────
const NAV = [
  { id: 'overview', label: 'Ringkasan', icon: 'grid' },
  { id: 'projects', label: 'Proyek', icon: 'folder' },
  { id: 'skills', label: 'Keahlian', icon: 'code' },
  { id: 'experience', label: 'Pengalaman', icon: 'briefcase' },
];

// Tech stack suggestions
const TECH_OPTIONS = ['React', 'Vue', 'Next.js', 'Node.js', 'Express', 'Laravel', 'Django', 'Flask', 'Firebase', 'MongoDB', 'PostgreSQL', 'MySQL', 'TypeScript', 'Python', 'PHP', 'Tailwind CSS', 'Docker', 'AWS', 'Vercel', 'Figma'];
const SKILL_CATEGORIES = ['Frontend', 'Backend', 'Mobile', 'Database', 'DevOps', 'Design', 'Lainnya'];

// ──────────────────────────────────────────────
// Greeting helper
// ──────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Selamat Pagi';
  if (h < 17) return 'Selamat Siang';
  if (h < 20) return 'Selamat Sore';
  return 'Selamat Malam';
}

// ──────────────────────────────────────────────
// Stat Card
// ──────────────────────────────────────────────
function StatCard({ icon, label, value, color, delta }) {
  return (
    <div style={{ ...s.statCard, '--accent-color': color }} className="animate-fade-in">
      <div style={{ ...s.statIcon, background: `${color}22`, color }}>
        <Icon name={icon} size={20} color={color} />
      </div>
      <div style={s.statInfo}>
        <div style={s.statValue}>{value}</div>
        <div style={s.statLabel}>{label}</div>
      </div>
      {delta !== undefined && (
        <div style={{ ...s.statDelta, color: delta >= 0 ? '#34d399' : '#f87171' }}>
          {delta >= 0 ? '+' : ''}{delta}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Project Form Modal
// ──────────────────────────────────────────────
function ProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState(project || {
    title: '', description: '', techStack: [], link: '', repo: '',
    status: 'active', featured: false, thumbnail: '',
  });
  const [techInput, setTechInput] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addTech = (tech) => {
    if (tech && !form.techStack.includes(tech)) {
      set('techStack', [...form.techStack, tech]);
    }
    setTechInput('');
  };

  const removeTech = (t) => set('techStack', form.techStack.filter(x => x !== t));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={s.modalBackdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal} className="animate-scale-in">
        {/* Header */}
        <div style={s.modalHeader}>
          <div>
            <h2 style={{ color: '#f0f0f8', margin: 0, fontSize: '18px' }}>
              {project ? 'Edit Proyek' : 'Tambah Proyek Baru'}
            </h2>
            <p style={{ color: '#8b8fa8', margin: '4px 0 0', fontSize: '13px' }}>
              {project ? 'Perbarui informasi proyek' : 'Isi detail proyek portofoliomu'}
            </p>
          </div>
          <button style={s.iconBtn} onClick={onClose}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={s.modalBody}>
          <div style={s.formGrid}>
            {/* Title */}
            <div style={s.field}>
              <label style={s.fieldLabel}>Nama Proyek *</label>
              <input
                style={s.fieldInput}
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Misal: E-Commerce Platform"
                required
                onFocus={e => Object.assign(e.target.style, s.fieldInputFocus)}
                onBlur={e => Object.assign(e.target.style, { borderColor: 'rgba(255,255,255,0.08)', boxShadow: 'none' })}
              />
            </div>

            {/* Status */}
            <div style={s.field}>
              <label style={s.fieldLabel}>Status</label>
              <select
                style={s.fieldSelect}
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                <option value="active">🟢 Aktif</option>
                <option value="archived">🗂️ Diarsipkan</option>
                <option value="wip">🔨 Dalam Pengerjaan</option>
              </select>
            </div>

            {/* Description — full width */}
            <div style={{ ...s.field, gridColumn: '1 / -1' }}>
              <label style={s.fieldLabel}>Deskripsi</label>
              <textarea
                style={{ ...s.fieldInput, minHeight: '90px', resize: 'vertical', paddingTop: '12px', fontFamily: 'Inter, sans-serif' }}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Ceritakan tentang proyek ini..."
                onFocus={e => Object.assign(e.target.style, { ...s.fieldInputFocus, minHeight: '90px' })}
                onBlur={e => Object.assign(e.target.style, { borderColor: 'rgba(255,255,255,0.08)', boxShadow: 'none', minHeight: '90px' })}
              />
            </div>

            {/* Tech Stack */}
            <div style={{ ...s.field, gridColumn: '1 / -1' }}>
              <label style={s.fieldLabel}>Tech Stack</label>
              <div style={s.techInputRow}>
                <input
                  style={{ ...s.fieldInput, flex: 1 }}
                  value={techInput}
                  onChange={e => setTechInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(techInput.trim()); } }}
                  placeholder="Ketik lalu Enter atau pilih..."
                  list="tech-suggestions"
                  onFocus={e => Object.assign(e.target.style, s.fieldInputFocus)}
                  onBlur={e => { Object.assign(e.target.style, { borderColor: 'rgba(255,255,255,0.08)', boxShadow: 'none' }); if (techInput.trim()) addTech(techInput.trim()); }}
                />
                <datalist id="tech-suggestions">
                  {TECH_OPTIONS.map(t => <option key={t} value={t} />)}
                </datalist>
                <button type="button" style={s.addTechBtn} onClick={() => addTech(techInput.trim())}>
                  <Icon name="plus" size={16} />
                </button>
              </div>
              {form.techStack.length > 0 && (
                <div style={s.techTags}>
                  {form.techStack.map(t => (
                    <span key={t} style={s.techTag}>
                      {t}
                      <button type="button" style={s.techTagRemove} onClick={() => removeTech(t)}>
                        <Icon name="x" size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Link */}
            <div style={s.field}>
              <label style={s.fieldLabel}>Link Live</label>
              <input
                style={s.fieldInput}
                value={form.link}
                onChange={e => set('link', e.target.value)}
                placeholder="https://..."
                type="url"
                onFocus={e => Object.assign(e.target.style, s.fieldInputFocus)}
                onBlur={e => Object.assign(e.target.style, { borderColor: 'rgba(255,255,255,0.08)', boxShadow: 'none' })}
              />
            </div>

            {/* Repo */}
            <div style={s.field}>
              <label style={s.fieldLabel}>Link Repository</label>
              <input
                style={s.fieldInput}
                value={form.repo}
                onChange={e => set('repo', e.target.value)}
                placeholder="https://github.com/..."
                type="url"
                onFocus={e => Object.assign(e.target.style, s.fieldInputFocus)}
                onBlur={e => Object.assign(e.target.style, { borderColor: 'rgba(255,255,255,0.08)', boxShadow: 'none' })}
              />
            </div>

            {/* Thumbnail URL */}
            <div style={{ ...s.field, gridColumn: '1 / -1' }}>
              <label style={s.fieldLabel}>URL Thumbnail (opsional)</label>
              <input
                style={s.fieldInput}
                value={form.thumbnail}
                onChange={e => set('thumbnail', e.target.value)}
                placeholder="https://..."
                type="url"
                onFocus={e => Object.assign(e.target.style, s.fieldInputFocus)}
                onBlur={e => Object.assign(e.target.style, { borderColor: 'rgba(255,255,255,0.08)', boxShadow: 'none' })}
              />
            </div>

            {/* Featured */}
            <div style={{ ...s.field, gridColumn: '1 / -1' }}>
              <label style={s.checkLabel}>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={e => set('featured', e.target.checked)}
                  style={{ accentColor: '#7c3aed' }}
                />
                <span style={{ color: '#c0c0d0', fontSize: '14px' }}>Tandai sebagai proyek unggulan ⭐</span>
              </label>
            </div>
          </div>

          <div style={s.modalFooter}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>Batal</button>
            <button type="submit" disabled={saving} style={s.saveBtn}>
              {saving ? (
                <><span style={s.spinner} /> Menyimpan...</>
              ) : (
                <><Icon name="check" size={16} /> {project ? 'Simpan Perubahan' : 'Tambah Proyek'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Delete Confirm Modal
// ──────────────────────────────────────────────
function DeleteModal({ item, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try { await onConfirm(); onClose(); }
    catch (e) { console.error(e); setDeleting(false); }
  };
  return (
    <div style={s.modalBackdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...s.modal, maxWidth: '420px' }} className="animate-scale-in">
        <div style={{ textAlign: 'center', padding: '32px 32px 0' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(248,113,113,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="alertTriangle" size={24} color="#f87171" />
          </div>
          <h3 style={{ color: '#f0f0f8', marginBottom: '8px' }}>Hapus Proyek?</h3>
          <p style={{ color: '#8b8fa8', fontSize: '14px' }}>
            Proyek <strong style={{ color: '#c0c0d0' }}>"{item?.title}"</strong> akan dihapus permanen dan tidak bisa dikembalikan.
          </p>
        </div>
        <div style={{ ...s.modalFooter, padding: '24px 32px' }}>
          <button style={s.cancelBtn} onClick={onClose}>Batal</button>
          <button style={s.deleteBtnConfirm} onClick={handleDelete} disabled={deleting}>
            {deleting ? <><span style={s.spinner} /> Menghapus...</> : <><Icon name="trash" size={16} /> Hapus</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Skill Modal
// ──────────────────────────────────────────────
function SkillModal({ skill, onClose, onSave }) {
  const [form, setForm] = useState(skill || { name: '', category: 'Frontend', level: 75, icon: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err) { console.error(err); setSaving(false); }
  };

  return (
    <div style={s.modalBackdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...s.modal, maxWidth: '440px' }} className="animate-scale-in">
        <div style={s.modalHeader}>
          <div>
            <h2 style={{ color: '#f0f0f8', margin: 0, fontSize: '18px' }}>{skill ? 'Edit Keahlian' : 'Tambah Keahlian'}</h2>
            <p style={{ color: '#8b8fa8', margin: '4px 0 0', fontSize: '13px' }}>Tambahkan keahlian ke portofoliomu</p>
          </div>
          <button style={s.iconBtn} onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={s.modalBody}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={s.field}>
              <label style={s.fieldLabel}>Nama Keahlian *</label>
              <input style={s.fieldInput} value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Misal: React.js" required
                onFocus={e => Object.assign(e.target.style, s.fieldInputFocus)}
                onBlur={e => Object.assign(e.target.style, { borderColor: 'rgba(255,255,255,0.08)', boxShadow: 'none' })} />
            </div>
            <div style={s.field}>
              <label style={s.fieldLabel}>Kategori</label>
              <select style={s.fieldSelect} value={form.category} onChange={e => set('category', e.target.value)}>
                {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.fieldLabel}>Level: <strong style={{ color: '#a78bfa' }}>{form.level}%</strong></label>
              <input type="range" min="5" max="100" step="5" value={form.level}
                onChange={e => set('level', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5a5e78', marginTop: '4px' }}>
                <span>Pemula</span><span>Menengah</span><span>Mahir</span>
              </div>
            </div>
          </div>
          <div style={s.modalFooter}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>Batal</button>
            <button type="submit" disabled={saving} style={s.saveBtn}>
              {saving ? <><span style={s.spinner} /> Menyimpan...</> : <><Icon name="check" size={16} /> {skill ? 'Simpan' : 'Tambah'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Projects Section
// ──────────────────────────────────────────────
function ProjectsSection({ projects, loading, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const statusBadge = (status) => {
    const map = {
      active: { cls: 'badge-success', label: 'Aktif' },
      archived: { cls: 'badge-default', label: 'Arsip' },
      wip: { cls: 'badge-warning', label: 'WIP' },
    };
    return map[status] || map.active;
  };

  return (
    <div style={s.section}>
      <div style={s.sectionHeader}>
        <div>
          <h2 style={s.sectionTitle}>Manajemen Proyek</h2>
          <p style={s.sectionSub}>{projects.length} proyek tersimpan</p>
        </div>
        <button style={s.primaryBtn} onClick={onAdd}>
          <Icon name="plus" size={16} /> Tambah Proyek
        </button>
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.searchWrapper}>
          <Icon name="search" size={15} color="#5a5e78" />
          <input
            style={s.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari proyek..."
          />
        </div>
        <div style={s.filterTabs}>
          {['all', 'active', 'wip', 'archived'].map(f => (
            <button key={f} style={{ ...s.filterTab, ...(filter === f ? s.filterTabActive : {}) }}
              onClick={() => setFilter(f)}>
              {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : f === 'wip' ? 'WIP' : 'Arsip'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={s.skeletonGrid}>
          {[1, 2, 3].map(i => (
            <div key={i} style={s.projectCard}>
              <div className="skeleton" style={{ height: '140px', borderRadius: '10px', marginBottom: '16px' }} />
              <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '10px' }} />
              <div className="skeleton" style={{ height: '14px', width: '90%', marginBottom: '6px' }} />
              <div className="skeleton" style={{ height: '14px', width: '70%' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}><Icon name="folder" size={40} color="#3a3e52" /></div>
          <h3 style={{ color: '#5a5e78', margin: '16px 0 8px', fontSize: '16px' }}>
            {search || filter !== 'all' ? 'Tidak ada hasil' : 'Belum ada proyek'}
          </h3>
          <p style={{ color: '#3a3e52', fontSize: '14px', margin: 0 }}>
            {search || filter !== 'all' ? 'Coba ubah kata kunci atau filter.' : 'Klik "+ Tambah Proyek" untuk mulai.'}
          </p>
          {!search && filter === 'all' && (
            <button style={{ ...s.primaryBtn, marginTop: '20px' }} onClick={onAdd}>
              <Icon name="plus" size={16} /> Tambah Proyek Pertama
            </button>
          )}
        </div>
      ) : (
        <div style={s.projectGrid}>
          {filtered.map((p, i) => {
            const badge = statusBadge(p.status);
            return (
              <div key={p.id} style={{ ...s.projectCard, animationDelay: `${i * 60}ms` }} className="animate-fade-in">
                {/* Thumbnail */}
                <div style={s.projectThumb}>
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt={p.title} style={s.projectImg} onError={e => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div style={s.projectThumbFallback}>
                      <Icon name="folder" size={32} color="#3a3e52" />
                    </div>
                  )}
                  <span className={`badge ${badge.cls}`} style={s.projectBadge}>{badge.label}</span>
                  {p.featured && <span style={s.featuredBadge}>⭐ Unggulan</span>}
                </div>

                {/* Info */}
                <div style={s.projectInfo}>
                  <h3 style={s.projectTitle}>{p.title}</h3>
                  {p.description && (
                    <p style={s.projectDesc}>{p.description}</p>
                  )}

                  {/* Tech tags */}
                  {p.techStack?.length > 0 && (
                    <div style={s.techTagsSmall}>
                      {p.techStack.slice(0, 4).map(t => (
                        <span key={t} style={s.techTagSmall}>{t}</span>
                      ))}
                      {p.techStack.length > 4 && (
                        <span style={s.techTagSmall}>+{p.techStack.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={s.projectActions}>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noopener noreferrer" style={s.actionLink}>
                      <Icon name="eye" size={14} /> Live
                    </a>
                  )}
                  {p.repo && (
                    <a href={p.repo} target="_blank" rel="noopener noreferrer" style={s.actionLink}>
                      <Icon name="link" size={14} /> Repo
                    </a>
                  )}
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                    <button style={s.actionIconBtn} onClick={() => onEdit(p)} title="Edit">
                      <Icon name="edit" size={15} color="#a78bfa" />
                    </button>
                    <button style={{ ...s.actionIconBtn, background: 'rgba(248,113,113,0.08)' }}
                      onClick={() => onDelete(p)} title="Hapus">
                      <Icon name="trash" size={15} color="#f87171" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Skills Section
// ──────────────────────────────────────────────
function SkillsSection({ skills, loading, onAdd, onEdit, onDelete }) {
  const grouped = SKILL_CATEGORIES.reduce((acc, cat) => {
    const items = skills.filter(s => s.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div style={s.section}>
      <div style={s.sectionHeader}>
        <div>
          <h2 style={s.sectionTitle}>Keahlian</h2>
          <p style={s.sectionSub}>{skills.length} keahlian tersimpan</p>
        </div>
        <button style={s.primaryBtn} onClick={onAdd}>
          <Icon name="plus" size={16} /> Tambah Keahlian
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '56px', borderRadius: '10px' }} />)}
        </div>
      ) : skills.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}><Icon name="code" size={40} color="#3a3e52" /></div>
          <h3 style={{ color: '#5a5e78', margin: '16px 0 8px', fontSize: '16px' }}>Belum ada keahlian</h3>
          <p style={{ color: '#3a3e52', fontSize: '14px', margin: 0 }}>Tambahkan keahlian teknis kamu.</p>
          <button style={{ ...s.primaryBtn, marginTop: '20px' }} onClick={onAdd}>
            <Icon name="plus" size={16} /> Tambah Keahlian
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: '28px' }}>
            <h3 style={{ color: '#8b8fa8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>{cat}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map((sk, i) => (
                <div key={sk.id} style={s.skillRow} className="animate-fade-in">
                  <span style={s.skillName}>{sk.name}</span>
                  <div style={s.skillBarWrapper}>
                    <div style={{ ...s.skillBarFill, width: `${sk.level}%` }} />
                  </div>
                  <span style={s.skillLevel}>{sk.level}%</span>
                  <button style={s.actionIconBtn} onClick={() => onEdit(sk)}>
                    <Icon name="edit" size={14} color="#a78bfa" />
                  </button>
                  <button style={{ ...s.actionIconBtn, background: 'rgba(248,113,113,0.08)' }} onClick={() => onDelete(sk)}>
                    <Icon name="trash" size={14} color="#f87171" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Overview Section
// ──────────────────────────────────────────────
function OverviewSection({ projects, skills, user }) {
  const active = projects.filter(p => p.status === 'active').length;
  const techs = new Set(projects.flatMap(p => p.techStack || [])).size;

  return (
    <div style={s.section}>
      <h2 style={s.sectionTitle}>Ringkasan</h2>
      <p style={{ color: '#8b8fa8', marginBottom: '28px', fontSize: '14px' }}>
        Overview portofolio kamu secara keseluruhan.
      </p>

      <div style={s.statsGrid}>
        <StatCard icon="folder" label="Total Proyek" value={projects.length} color="#a78bfa" />
        <StatCard icon="star" label="Proyek Aktif" value={active} color="#34d399" />
        <StatCard icon="code" label="Teknologi" value={techs} color="#60a5fa" />
        <StatCard icon="briefcase" label="Keahlian" value={skills.length} color="#fbbf24" />
      </div>

      {/* Recent projects */}
      {projects.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ color: '#c0c0d0', fontSize: '14px', fontWeight: '600', marginBottom: '14px' }}>
            Proyek Terbaru
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {projects.slice(0, 5).map((p, i) => (
              <div key={p.id} style={s.recentRow} className="animate-fade-in">
                <div style={s.recentIcon}>
                  <Icon name="folder" size={16} color="#7c3aed" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#f0f0f8', fontSize: '14px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  {p.techStack?.length > 0 && (
                    <div style={{ color: '#5a5e78', fontSize: '12px', marginTop: '2px' }}>{p.techStack.slice(0, 3).join(', ')}</div>
                  )}
                </div>
                <span className={`badge ${p.status === 'active' ? 'badge-success' : p.status === 'wip' ? 'badge-warning' : 'badge-default'}`}>
                  {p.status === 'active' ? 'Aktif' : p.status === 'wip' ? 'WIP' : 'Arsip'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// MAIN DASHBOARD
// ──────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [time, setTime] = useState(new Date());

  // Data states
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(true);

  // Modal states
  const [projectModal, setProjectModal] = useState(null); // null | 'new' | project obj
  const [skillModal, setSkillModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null); // { type, item }

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) navigate('/login');
      else setUser(u);
    });
    return unsub;
  }, [navigate]);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Firestore: projects
  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingProjects(false);
    }, () => setLoadingProjects(false));
    return unsub;
  }, []);

  // Firestore: skills
  useEffect(() => {
    const q = query(collection(db, 'skills'), orderBy('name'));
    const unsub = onSnapshot(q, snap => {
      setSkills(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingSkills(false);
    }, () => setLoadingSkills(false));
    return unsub;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  // CRUD Projects
  const saveProject = async (form) => {
    if (form.id) {
      const { id, ...data } = form;
      await updateDoc(doc(db, 'projects', id), { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, 'projects'), { ...form, createdAt: serverTimestamp() });
    }
  };

  const deleteProject = async (id) => {
    await deleteDoc(doc(db, 'projects', id));
  };

  // CRUD Skills
  const saveSkill = async (form) => {
    if (form.id) {
      const { id, ...data } = form;
      await updateDoc(doc(db, 'skills', id), data);
    } else {
      await addDoc(collection(db, 'skills'), { ...form, createdAt: serverTimestamp() });
    }
  };

  const deleteSkill = async (id) => {
    await deleteDoc(doc(db, 'skills', id));
  };

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'AD';
  const isMobile = window.innerWidth < 768;

  return (
    <div style={s.dashLayout}>
      {/* ── SIDEBAR ── */}
      <aside style={{ ...s.sidebar, width: sidebarOpen ? '260px' : '72px' }}>
        {/* Brand */}
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          {sidebarOpen && (
            <div style={s.brandText}>
              <div style={s.brandName}>CMS Portofolio</div>
              <div style={s.brandSub}>Panel Admin</div>
            </div>
          )}
          <button style={s.collapseBtn} onClick={() => setSidebarOpen(o => !o)} title="Toggle sidebar">
            <Icon name={sidebarOpen ? 'chevronLeft' : 'menu'} size={16} color="#8b8fa8" />
          </button>
        </div>

        {/* Avatar */}
        <div style={s.avatarSection}>
          <div style={s.avatar}>{initials}</div>
          {sidebarOpen && (
            <div style={s.avatarInfo}>
              <div style={s.avatarName}>{user?.displayName || 'Admin'}</div>
              <div style={s.avatarEmail}>{user?.email}</div>
            </div>
          )}
        </div>

        <div style={s.sidebarDivider} />

        {/* Nav */}
        <nav style={s.nav}>
          {NAV.map(item => (
            <button
              key={item.id}
              style={{ ...s.navItem, ...(activeNav === item.id ? s.navItemActive : {}) }}
              onClick={() => setActiveNav(item.id)}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon name={item.icon} size={18} color={activeNav === item.id ? '#a78bfa' : '#8b8fa8'} />
              {sidebarOpen && <span style={s.navLabel}>{item.label}</span>}
              {sidebarOpen && activeNav === item.id && <div style={s.navActiveDot} />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={s.sidebarBottom}>
          <div style={s.sidebarDivider} />
          <button style={s.logoutBtn} onClick={handleLogout} title="Logout">
            <Icon name="logout" size={18} color="#f87171" />
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={s.main}>
        {/* Header */}
        <header style={s.header}>
          <div>
            <h1 style={s.headerTitle}>
              {NAV.find(n => n.id === activeNav)?.label || 'Dashboard'}
            </h1>
            <p style={s.headerSub}>
              {getGreeting()}, <strong style={{ color: 'var(--text-primary)' }}>{user?.displayName || user?.email?.split('@')[0] || 'Admin'}</strong>
            </p>
          </div>
          <div style={s.headerRight}>
            <div style={s.clockBadge}>
              <div style={s.clockDot} />
              {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>
                · {time.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <ThemeToggle size="sm" />
          </div>
        </header>

        {/* Content */}
        <div style={s.content}>
          {activeNav === 'overview' && (
            <OverviewSection projects={projects} skills={skills} user={user} />
          )}
          {activeNav === 'projects' && (
            <ProjectsSection
              projects={projects}
              loading={loadingProjects}
              onAdd={() => setProjectModal('new')}
              onEdit={p => setProjectModal(p)}
              onDelete={p => setDeleteModal({ type: 'project', item: p })}
            />
          )}
          {activeNav === 'skills' && (
            <SkillsSection
              skills={skills}
              loading={loadingSkills}
              onAdd={() => setSkillModal('new')}
              onEdit={sk => setSkillModal(sk)}
              onDelete={sk => setDeleteModal({ type: 'skill', item: sk })}
            />
          )}
          {activeNav === 'experience' && (
            <div style={s.section}>
              <div style={s.sectionHeader}>
                <div>
                  <h2 style={s.sectionTitle}>Pengalaman</h2>
                  <p style={s.sectionSub}>Segera hadir</p>
                </div>
              </div>
              <div style={s.emptyState}>
                <div style={s.emptyIcon}><Icon name="briefcase" size={40} color="#3a3e52" /></div>
                <h3 style={{ color: '#5a5e78', margin: '16px 0 8px', fontSize: '16px' }}>Fitur Segera Hadir</h3>
                <p style={{ color: '#3a3e52', fontSize: '14px', margin: 0 }}>Manajemen pengalaman kerja sedang dalam pengembangan.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── MODALS ── */}
      {projectModal && (
        <ProjectModal
          project={projectModal === 'new' ? null : projectModal}
          onClose={() => setProjectModal(null)}
          onSave={saveProject}
        />
      )}

      {skillModal && (
        <SkillModal
          skill={skillModal === 'new' ? null : skillModal}
          onClose={() => setSkillModal(null)}
          onSave={saveSkill}
        />
      )}

      {deleteModal && (
        <DeleteModal
          item={deleteModal.item}
          onClose={() => setDeleteModal(null)}
          onConfirm={() =>
            deleteModal.type === 'project'
              ? deleteProject(deleteModal.item.id)
              : deleteSkill(deleteModal.item.id)
          }
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────
const s = {
  // Layout
  dashLayout: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-base)',
    fontFamily: 'Inter, sans-serif',
  },

  // Sidebar
  sidebar: {
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    transition: 'width 300ms cubic-bezier(0.4,0,0.2,1)',
    overflow: 'hidden',
    position: 'sticky',
    top: 0,
    height: '100vh',
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 16px',
    borderBottom: '1px solid var(--border)',
    minHeight: '72px',
  },
  brandIcon: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(124,58,237,0.35)',
  },
  brandText: { flex: 1, minWidth: 0 },
  brandName: { color: 'var(--text-primary)', fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap' },
  brandSub: { color: 'var(--text-muted)', fontSize: '11px', marginTop: '1px' },
  collapseBtn: {
    background: 'var(--bg-overlay)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: 'auto',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px',
    margin: '8px',
    background: 'var(--bg-overlay)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    overflow: 'hidden',
  },
  avatar: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0,
  },
  avatarInfo: { flex: 1, minWidth: 0 },
  avatarName: { color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  avatarEmail: { color: 'var(--text-muted)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  sidebarDivider: { height: '1px', background: 'var(--border)', margin: '4px 16px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', flex: 1 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    position: 'relative',
    textAlign: 'left',
  },
  navItemActive: {
    background: 'rgba(124,58,237,0.12)',
    color: '#a78bfa',
  },
  navLabel: { flex: 1 },
  navActiveDot: {
    width: '6px',
    height: '6px',
    background: '#7c3aed',
    borderRadius: '50%',
    flexShrink: 0,
  },
  sidebarBottom: { padding: '8px', marginTop: 'auto' },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(248,113,113,0.06)',
    border: '1px solid rgba(248,113,113,0.12)',
    borderRadius: '10px',
    color: '#f87171',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 200ms',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },

  // Main
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 32px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-surface)',
    backdropFilter: 'blur(16px)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    gap: '16px',
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  headerSub: { color: 'var(--text-secondary)', fontSize: '13px', margin: '3px 0 0' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  clockBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '9999px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  clockDot: {
    width: '6px',
    height: '6px',
    background: '#34d399',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },
  content: { padding: '28px 32px', flex: 1 },

  // Stats
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '20px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    transition: 'all 200ms ease',
  },
  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 },
  statLabel: { fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' },
  statDelta: { fontSize: '13px', fontWeight: '600' },

  // Section
  section: { maxWidth: '1100px' },
  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '20px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  sectionTitle: { fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 },
  sectionSub: { color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' },

  // Toolbar
  toolbar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '0 12px',
    flex: '1',
    minWidth: '180px',
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    padding: '10px 0',
    width: '100%',
  },
  filterTabs: {
    display: 'flex',
    gap: '4px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '4px',
  },
  filterTab: {
    padding: '6px 14px',
    background: 'transparent',
    border: 'none',
    borderRadius: '7px',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    whiteSpace: 'nowrap',
  },
  filterTabActive: {
    background: 'rgba(124,58,237,0.15)',
    color: '#a78bfa',
  },

  // Project grid
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  skeletonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  projectCard: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 200ms ease',
  },
  projectThumb: {
    height: '140px',
    background: 'var(--bg-elevated)',
    position: 'relative',
    overflow: 'hidden',
  },
  projectImg: { width: '100%', height: '100%', objectFit: 'cover' },
  projectThumbFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-elevated)',
  },
  projectBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
  },
  featuredBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(251,191,36,0.15)',
    color: '#fbbf24',
    border: '1px solid rgba(251,191,36,0.3)',
    borderRadius: '9999px',
    padding: '2px 8px',
    fontSize: '10px',
    fontWeight: '600',
  },
  projectInfo: {
    padding: '16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  projectTitle: { fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 },
  projectDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  techTagsSmall: { display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '4px' },
  techTagSmall: {
    padding: '2px 8px',
    background: 'var(--accent-subtle)',
    color: 'var(--accent-light)',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
    border: '1px solid rgba(124,58,237,0.2)',
  },
  projectActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 16px',
    borderTop: '1px solid var(--border)',
  },
  actionLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: '500',
    textDecoration: 'none',
  },
  actionIconBtn: {
    background: 'rgba(167,139,250,0.08)',
    border: '1px solid rgba(167,139,250,0.12)',
    borderRadius: '8px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 150ms',
  },

  // Skills
  skillRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
  },
  skillName: { color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500', minWidth: '120px' },
  skillBarWrapper: {
    flex: 1,
    height: '6px',
    background: 'var(--bg-elevated)',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  skillBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #7c3aed, #3b82f6)',
    borderRadius: '999px',
    transition: 'width 500ms ease',
  },
  skillLevel: { color: 'var(--text-secondary)', fontSize: '13px', minWidth: '36px', textAlign: 'right' },

  // Recent
  recentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
  },
  recentIcon: {
    width: '32px',
    height: '32px',
    background: 'rgba(124,58,237,0.1)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Empty state
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 24px',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '80px',
    height: '80px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Buttons
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
    whiteSpace: 'nowrap',
  },
  iconBtn: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    color: '#8b8fa8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 150ms',
    flexShrink: 0,
  },
  cancelBtn: {
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
  },
  deleteBtnConfirm: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'rgba(248,113,113,0.15)',
    border: '1px solid rgba(248,113,113,0.3)',
    borderRadius: '10px',
    color: '#f87171',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
  },

  // Modal
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modal: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '24px 24px 0',
    gap: '12px',
  },
  modalBody: {
    padding: '20px 24px',
    overflowY: 'auto',
    flex: 1,
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border)',
  },

  // Form
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  fieldLabel: { fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' },
  fieldInput: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '11px 14px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'all 200ms',
    width: '100%',
    boxSizing: 'border-box',
  },
  fieldInputFocus: {
    borderColor: 'rgba(124,58,237,0.6)',
    boxShadow: '0 0 0 3px rgba(124,58,237,0.12)',
  },
  fieldSelect: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '11px 14px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
  },
  techInputRow: { display: 'flex', gap: '8px' },
  addTechBtn: {
    padding: '11px 14px',
    background: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.3)',
    borderRadius: '10px',
    color: '#a78bfa',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  techTags: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
  techTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    background: 'rgba(124,58,237,0.12)',
    color: '#a78bfa',
    border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  techTagRemove: {
    background: 'none',
    border: 'none',
    color: '#a78bfa',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
    opacity: 0.7,
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
};
