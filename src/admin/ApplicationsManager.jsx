import React, { useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import {
  FaUser, FaPhone, FaSchool, FaCalendarAlt, FaTrash,
  FaCheckCircle, FaTimesCircle, FaSearch, FaEye, FaTimes,
  FaDownload, FaFilter,
} from 'react-icons/fa';

const STATUS_COLORS = {
  pending:  { bg: '#FEF3C7', color: '#92400E', label: 'Pending'  },
  reviewed: { bg: '#DBEAFE', color: '#1E40AF', label: 'Reviewed' },
  accepted: { bg: '#D1FAE5', color: '#065F46', label: 'Accepted' },
  rejected: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
};

const ApplicationsManager = () => {
  const [applications, setApplications] = useFirestore('admin_applications', []);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all'); // all | pending | reviewed | accepted | rejected
  const [selected, setSelected] = useState(null); // full-screen detail view

  /* ── helpers ────────────────────────────────────────────────────────── */

  const filtered = applications.filter(a => {
    const matchStatus = filter === 'all' || a.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.studentName?.toLowerCase().includes(q) ||
      a.grade?.toLowerCase().includes(q) ||
      a.fatherName?.toLowerCase().includes(q) ||
      a.guardianPhone?.includes(q);
    return matchStatus && matchSearch;
  });

  const updateStatus = (id, status) => {
    setApplications(prev =>
      prev.map(a => a.id === id ? { ...a, status } : a)
    );
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
  };

  const deleteApplication = (id) => {
    if (!window.confirm('Delete this application? This cannot be undone.')) return;
    setApplications(prev => prev.filter(a => a.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const exportCSV = () => {
    const headers = [
      'Submitted At', 'Status', 'Student Name', 'Student Name (Nepali)',
      'DOB', 'Gender', 'Grade', "Father's Name", "Mother's Name",
      'Guardian Phone', 'Previous School', 'Address',
    ];
    const rows = applications.map(a => [
      new Date(a.submittedAt).toLocaleString(),
      a.status,
      a.studentName,
      a.studentNameNepali,
      a.dob,
      a.gender,
      a.grade,
      a.fatherName,
      a.motherName,
      a.guardianPhone,
      a.previousSchool,
      `"${(a.address || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'applications.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── status badge ────────────────────────────────────────────────────── */
  const Badge = ({ status }) => {
    const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
    return (
      <span style={{
        background: s.bg, color: s.color,
        padding: '3px 10px', borderRadius: '999px',
        fontSize: '0.75rem', fontWeight: 700,
      }}>
        {s.label}
      </span>
    );
  };

  /* ── detail modal ────────────────────────────────────────────────────── */
  const DetailModal = ({ app, onClose }) => (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '20px',
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '12px',
        padding: '32px', maxWidth: '640px', width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }} onClick={e => e.stopPropagation()}>
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--color-secondary)', fontSize: '1.4rem' }}>
              {app.studentName}
            </h2>
            {app.studentNameNepali && (
              <p style={{ margin: '4px 0 0', color: 'var(--color-muted)', fontFamily: 'var(--font-nepali)' }}>
                {app.studentNameNepali}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.4rem', color: 'var(--color-muted)',
          }}>
            <FaTimes />
          </button>
        </div>

        {/* photo */}
        {app.photo && (
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img src={app.photo} alt="Student"
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover',
                       border: '3px solid var(--color-primary)' }} />
          </div>
        )}

        {/* info grid */}
        {[
          ['Grade Applying For', app.grade],
          ['Date of Birth', app.dob],
          ['Gender', app.gender],
          ["Father's Name", app.fatherName],
          ["Mother's Name", app.motherName],
          ['Guardian Phone', app.guardianPhone],
          ['Previous School', app.previousSchool || '—'],
          ['Address', app.address],
          ['Submitted At', new Date(app.submittedAt).toLocaleString()],
        ].map(([label, val]) => (
          <div key={label} style={{
            display: 'flex', gap: '12px',
            borderBottom: '1px solid #f3f4f6', padding: '10px 0',
          }}>
            <span style={{ fontWeight: 600, minWidth: '160px', color: 'var(--color-secondary)', fontSize: '0.9rem' }}>
              {label}
            </span>
            <span style={{ color: '#374151', fontSize: '0.9rem' }}>{val}</span>
          </div>
        ))}

        {/* status + actions */}
        <div style={{ marginTop: '24px' }}>
          <p style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--color-secondary)' }}>
            Status: <Badge status={app.status} />
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['pending', 'reviewed', 'accepted', 'rejected'].map(s => (
              <button key={s}
                onClick={() => updateStatus(app.id, s)}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: 'none',
                  cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  background: app.status === s ? STATUS_COLORS[s].bg : '#f3f4f6',
                  color: app.status === s ? STATUS_COLORS[s].color : '#374151',
                  outline: app.status === s ? `2px solid ${STATUS_COLORS[s].color}` : 'none',
                }}>
                {STATUS_COLORS[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* delete */}
        <button onClick={() => { deleteApplication(app.id); onClose(); }}
          style={{
            marginTop: '20px', background: '#FEE2E2', color: '#991B1B',
            border: 'none', padding: '10px 20px', borderRadius: '6px',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
          }}>
          <FaTrash style={{ marginRight: '6px' }} /> Delete Application
        </button>
      </div>
    </div>
  );

  /* ── main render ─────────────────────────────────────────────────────── */

  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)', margin: 0 }}>
          Admission Applications
        </h2>
        <button onClick={exportCSV}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--color-secondary)', color: 'white',
            border: 'none', padding: '10px 20px', borderRadius: '8px',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
          }}>
          <FaDownload /> Export CSV
        </button>
      </div>

      {/* stat cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px', marginBottom: '28px',
      }} className="app-stats">
        {[
          { label: 'Total', count: applications.length, color: '#6366F1', bg: '#EEF2FF' },
          { label: 'Pending',  count: counts.pending  || 0, ...STATUS_COLORS.pending  },
          { label: 'Accepted', count: counts.accepted || 0, ...STATUS_COLORS.accepted },
          { label: 'Rejected', count: counts.rejected || 0, ...STATUS_COLORS.rejected },
        ].map(({ label, count, color, bg }) => (
          <div key={label} style={{
            background: bg || 'white', borderRadius: '10px',
            padding: '20px', border: `1px solid ${color}22`,
          }}>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color }}>{count}</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color, fontWeight: 600 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* search + filter */}
      <div style={{
        background: 'white', borderRadius: '10px', padding: '16px',
        boxShadow: 'var(--shadow-card)', marginBottom: '20px',
        display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <FaSearch style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-muted)',
          }} />
          <input
            type="text"
            placeholder="Search by name, grade, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              border: '2px solid #e5e7eb', borderRadius: '8px',
              fontSize: '0.9rem', fontFamily: 'var(--font-body)',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaFilter style={{ color: 'var(--color-muted)' }} />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{
              padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: '8px',
              fontSize: '0.9rem', fontFamily: 'var(--font-body)', background: 'white',
            }}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* table */}
      {filtered.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: '10px', padding: '60px',
          textAlign: 'center', boxShadow: 'var(--shadow-card)',
        }}>
          <FaUser size={48} style={{ color: '#e5e7eb', marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--color-muted)', margin: 0 }}>
            {applications.length === 0
              ? 'No applications received yet.'
              : 'No applications match your filter.'}
          </h3>
        </div>
      ) : (
        <div style={{
          background: 'white', borderRadius: '10px',
          boxShadow: 'var(--shadow-card)', overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'var(--color-secondary)', color: 'white' }}>
                  {['#', 'Student Name', 'Grade', 'Guardian Phone', 'Submitted', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '14px 16px', textAlign: 'left',
                      fontFamily: 'var(--font-display)', fontSize: '0.85rem',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((app, idx) => (
                  <tr key={app.id} style={{
                    borderBottom: '1px solid #f3f4f6',
                    background: idx % 2 === 0 ? 'white' : '#fafafa',
                  }}>
                    <td style={{ padding: '12px 16px', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {app.photo ? (
                          <img src={app.photo} alt="" style={{
                            width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover',
                          }} />
                        ) : (
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: 'var(--color-light)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--color-muted)',
                          }}>
                            <FaUser size={14} />
                          </div>
                        )}
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                            {app.studentName}
                          </p>
                          {app.studentNameNepali && (
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'var(--font-nepali)' }}>
                              {app.studentNameNepali}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{app.grade}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{app.guardianPhone}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge status={app.status} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setSelected(app)}
                          title="View Details"
                          style={{
                            background: '#EEF2FF', color: '#6366F1',
                            border: 'none', padding: '6px 10px', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '0.85rem',
                          }}>
                          <FaEye />
                        </button>
                        <button onClick={() => updateStatus(app.id, 'accepted')}
                          title="Accept"
                          style={{
                            background: '#D1FAE5', color: '#065F46',
                            border: 'none', padding: '6px 10px', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '0.85rem',
                          }}>
                          <FaCheckCircle />
                        </button>
                        <button onClick={() => updateStatus(app.id, 'rejected')}
                          title="Reject"
                          style={{
                            background: '#FEE2E2', color: '#991B1B',
                            border: 'none', padding: '6px 10px', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '0.85rem',
                          }}>
                          <FaTimesCircle />
                        </button>
                        <button onClick={() => deleteApplication(app.id)}
                          title="Delete"
                          style={{
                            background: '#F3F4F6', color: '#6B7280',
                            border: 'none', padding: '6px 10px', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '0.85rem',
                          }}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
            Showing {filtered.length} of {applications.length} applications
          </div>
        </div>
      )}

      {selected && <DetailModal app={selected} onClose={() => setSelected(null)} />}

      <style>{`
        @media (max-width: 768px) {
          .app-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .app-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ApplicationsManager;