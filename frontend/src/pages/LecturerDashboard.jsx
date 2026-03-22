import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, LayoutDashboard, FileText, ChevronRight, Download, X } from 'lucide-react';
import api, { getUserContext, logoutUser } from '../api';

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [instanceChecks, setInstanceChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingDoc, setViewingDoc] = useState(null);
  
  const user = getUserContext();

  useEffect(() => {
    if (!user) {
        navigate('/');
        return;
    }
    fetchUnits();
  }, [navigate]);
  
  // Auto-poll if any instance checks are pending analysis
  useEffect(() => {
    const hasPending = instanceChecks.some(s => s.status === 'pending');
    if (hasPending) {
      const timer = setTimeout(fetchUnits, 3000);
      return () => clearTimeout(timer);
    }
  }, [instanceChecks]);

  const fetchUnits = async () => {
    try {
      const [res, subRes] = await Promise.all([
        api.get('units/'),
        api.get('submissions/')
      ]);
      
      // Filter to units where the user is listed in lecturers
      const teachingUnits = res.data.filter(unit => 
        unit.lecturers.includes(user.user_id) || unit.lecturers.includes(user.id)
      );
      setUnits(teachingUnits);
      
      // Filter submissions that have no assignment (Instance checks) uploaded by this lecturer
      const adhoc = subRes.data.filter(s => 
        s.assignment === null && (s.uploaded_by?.id === user?.user_id || s.uploaded_by?.id === user?.id)
      );
      setInstanceChecks(adhoc);
    } catch (err) {
      console.error("Failed to fetch units:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    try {
      const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        return api.post('submissions/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      });

      await Promise.all(uploadPromises);
      alert(`${files.length} document(s) uploaded for Instance Plagiarism Check! Please check back shortly for scans.`);
      fetchUnits(); // Optional refresh
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to post some or all submissions.");
    } finally {
      // Clear the input so the same files can't be uploaded twice by accident
      e.target.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ width: '250px', borderRadius: '0', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-border)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '20px', margin: 0 }}>Integrity<span className="text-gradient">Check</span></h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Lecturer Portal</p>
        </div>
        
        <div style={{ padding: '16px', flex: 1 }}>
          <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-start', border: 'none', background: 'var(--color-surface-hover)' }}>
            <LayoutDashboard size={18} /> My Modules
          </button>
          
          <div style={{ marginTop: '24px' }}>
             <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Instance Plagiarism Check</p>
             <input type="file" id="adhocUpload" style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt" multiple onChange={handleFileUpload} />
             <button onClick={() => document.getElementById('adhocUpload').click()} className="btn-primary" style={{ width: '100%', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Upload & Scan
             </button>
          </div>
        </div>
        
        <div style={{ padding: '24px', borderTop: '1px solid var(--color-border)' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'LT'}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{user?.username || 'Lecturer'}</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>{user?.id_number || 'Staff ID'}</p>
            </div>
          </div>
          <button onClick={logoutUser} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px' }} className="container">
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Teaching Modules</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '40px' }}>Select a module to manage assignments and review submissions.</p>
        
        {loading ? (
           <p>Loading modules...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {units.map(unit => (
              <div 
                key={unit.id} 
                className="glass-card" 
                style={{ padding: '24px', cursor: 'pointer' }}
                onClick={() => navigate(`/lecturer/unit/${unit.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <BookOpen size={24} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{unit.name}</h3>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '14px' }}>{unit.code}</p>
                  </div>
                </div>
                <button className="btn-primary" style={{ width: '100%' }}>Manage Assignments</button>
              </div>
            ))}
            {units.length === 0 && <p style={{ color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>You are not assigned to any modules yet.</p>}
          </div>
        )}

        <div className="glass-panel" style={{ padding: '0', marginTop: '40px' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', margin: 0 }}>Recent Instance Checks</h2>
            <span style={{ background: 'var(--color-primary)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>
              {instanceChecks.length} Scans
            </span>
          </div>
          
          {instanceChecks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No instance checks performed yet.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface)', textAlign: 'left', fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px 24px', fontWeight: 'bold' }}>Document</th>
                  <th style={{ padding: '16px 24px', fontWeight: 'bold' }}>Upload Date</th>
                  <th style={{ padding: '16px 24px', fontWeight: 'bold' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontWeight: 'bold' }}>Score</th>
                  <th style={{ padding: '16px 24px', fontWeight: 'bold', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {instanceChecks.map(doc => {
                  const getGradeColor = (grade) => {
                    if (grade === 'A' || grade === 'B') return 'var(--color-success)';
                    if (grade === 'C') return 'var(--color-warning)';
                    return 'var(--color-danger)';
                  };
  
                  const isPdf = doc.file?.toLowerCase().endsWith('.pdf');
  
                  return (
                    <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} color="var(--color-primary)" /> {doc.file?.split('/').pop() || 'Document'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          {isPdf ? (
                             <a href={doc.file} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none' }}>View PDF natively</a>
                          ) : (
                             <button onClick={() => setViewingDoc(doc)} style={{ background: 'none', border: 'none', padding: 0, fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }}>Read Document in Browser</button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        {doc.status === 'scanned' ? (
                          <span style={{ padding: '4px 8px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-success)', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Complete</span>
                        ) : (
                          <span style={{ padding: '4px 8px', background: 'rgba(252, 211, 77, 0.2)', color: 'var(--color-warning)', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{doc.status}</span>
                        )}
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        {doc.report ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: getGradeColor(doc.report.grade) }}>
                              {doc.report.overall_score}%
                            </div>
                            <div style={{ fontSize: '12px', padding: '2px 6px', background: 'var(--color-surface)', borderRadius: '4px', color: getGradeColor(doc.report.grade) }}>
                              {doc.report.grade}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Processing...</span>
                        )}
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <button 
                           className="btn-primary" 
                           disabled={!doc.report}
                           onClick={() => navigate(`/report/${doc.report?.id}`)}
                           style={{ opacity: doc.report ? 1 : 0.5 }}
                        >
                          Full Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Extracted Document Viewer Modal */}
      {viewingDoc && (
         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', maxHeight: '100%', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
               <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)' }}>
                  <div>
                     <h3 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={20} color="var(--color-primary)" /> Document Viewer</h3>
                     <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>Plagiarism Engine Extracted Text Preview</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <a href={viewingDoc.file} download className="btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Download size={16} /> Download Source
                    </a>
                    <button onClick={() => setViewingDoc(null)} className="btn-secondary" style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                       <X size={20} />
                    </button>
                  </div>
               </div>
               <div style={{ padding: '32px', overflowY: 'auto', flex: 1, fontSize: '15px', lineHeight: '1.8', color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: '"Inter", sans-serif' }}>
                  {viewingDoc.clean_text ? viewingDoc.clean_text : <p style={{ color: 'var(--color-danger)', textAlign: 'center', padding: '40px' }}>Extraction failed or document is empty.</p>}
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default LecturerDashboard;
