import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, AlertTriangle, Search, ChevronRight, LogOut, LayoutDashboard, UploadCloud } from 'lucide-react';
import api, { getUserContext, logoutUser } from '../api';

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);
  
  const user = getUserContext();

  useEffect(() => {
    if (!user) {
        navigate('/');
        return;
    }
    fetchSubmissions();
  }, [navigate]);

  const fetchSubmissions = async () => {
    try {
      const res = await api.get('documents/');
      setSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    setUploading(true);
    setUploadStatus(`Uploading 0 of ${files.length}...`);
    
    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('title', file.name);
      formData.append('file', file);
      
      setUploadStatus(`Uploading ${i + 1} of ${files.length}...`);
      try {
        await api.post('documents/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        successCount++;
      } catch (err) {
        console.error("Upload failed for", file.name, err);
      }
    }
    
    setUploading(false);
    setUploadStatus('');
    alert(`Successfully uploaded ${successCount} out of ${files.length} documents.`);
    fetchSubmissions();
  };

  // Compute Stats
  const totalSubmissions = submissions.length;
  const uniqueStudents = new Set(submissions.map(s => s.uploaded_by?.id)).size;
  const highSimilarityFlags = submissions.filter(s => s.report?.overall_score > 30).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
       {/* Sidebar */}
       <div className="glass-panel" style={{ width: '250px', borderRadius: '0', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-border)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '20px', margin: 0 }}>Integrity<span className="text-gradient">Check</span></h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Lecturer Portal</p>
        </div>
        
        <div style={{ padding: '16px', flex: 1 }}>
          <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-start', border: 'none', background: 'var(--color-surface-hover)' }}>
            <LayoutDashboard size={18} /> Overview
          </button>
          <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-start', border: 'none', marginTop: '8px' }}>
            <FileText size={18} /> Submissions
          </button>
        </div>
        
        <div style={{ padding: '24px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'DR'}
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

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }} className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Dashboard Overview</h1>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Track academic integrity across your modules.</p>
          </div>
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept=".pdf,.doc,.docx,.txt"
          />
          <button 
            className="btn-primary" 
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
             <UploadCloud size={18} /> {uploading ? uploadStatus : 'Upload Batch Documents'}
          </button>
        </div>
        
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <FileText size={32} color="var(--color-primary)" />
            </div>
            <div>
              <p style={{ margin: '0 0 4px', color: 'var(--color-text-muted)', fontSize: '14px' }}>Total Submissions</p>
              <h2 style={{ margin: 0, fontSize: '28px' }}>{totalSubmissions}</h2>
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <Users size={32} color="var(--color-success)" />
            </div>
            <div>
              <p style={{ margin: '0 0 4px', color: 'var(--color-text-muted)', fontSize: '14px' }}>Active Students</p>
              <h2 style={{ margin: 0, fontSize: '28px' }}>{uniqueStudents}</h2>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <AlertTriangle size={32} color="var(--color-danger)" />
            </div>
            <div>
              <p style={{ margin: '0 0 4px', color: 'var(--color-text-muted)', fontSize: '14px' }}>High Similarity Flags</p>
              <h2 style={{ margin: 0, fontSize: '28px', color: '#fca5a5' }}>{highSimilarityFlags}</h2>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', margin: 0 }}>Recent Scans</h2>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input type="text" className="input-premium" placeholder="Search student or file..." style={{ paddingLeft: '40px' }} />
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                <th style={{ padding: '16px 8px', fontWeight: '500' }}>Student Name</th>
                <th style={{ padding: '16px 8px', fontWeight: '500' }}>Document</th>
                <th style={{ padding: '16px 8px', fontWeight: '500' }}>Date Submitted</th>
                <th style={{ padding: '16px 8px', fontWeight: '500' }}>Similarity Score</th>
                <th style={{ padding: '16px 8px', fontWeight: '500', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(doc => {
                const score = doc.report?.overall_score || 0;
                return (
                  <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '20px 8px' }}>
                      <div style={{ fontWeight: '500' }}>{doc.uploaded_by?.username}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{doc.uploaded_by?.id_number}</div>
                    </td>
                    <td style={{ padding: '20px 8px', fontSize: '14px' }}>{doc.title}</td>
                    <td style={{ padding: '20px 8px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '20px 8px' }}>
                      {doc.status === 'pending' ? (
                        <span style={{ fontSize: '13px', color: 'var(--color-warning)' }}>Scanning...</span>
                      ) : doc.status === 'not_implemented' ? (
                        <span style={{ 
                          padding: '6px 12px', 
                          borderRadius: 'var(--radius-full)', 
                          fontSize: '13px', 
                          fontWeight: 'bold',
                          background: 'rgba(168, 162, 158, 0.2)',
                          color: 'var(--color-text-muted)'
                        }}>
                          Not Implemented
                        </span>
                      ) : (
                        <span style={{ 
                          padding: '6px 12px', 
                          borderRadius: 'var(--radius-full)', 
                          fontSize: '13px', 
                          fontWeight: 'bold',
                          background: score > 30 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: score > 30 ? '#fca5a5' : 'var(--color-success)'
                        }}>
                          {score}%
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '20px 8px', textAlign: 'right' }}>
                      <button 
                        className="btn-secondary" 
                        disabled={!doc.report}
                        style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: doc.report ? 1 : 0.5 }}
                        onClick={() => doc.report && navigate(`/report/${doc.report.id}`)}
                      >
                        View Report <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
