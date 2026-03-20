import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, Clock, FileText, LogOut, LayoutDashboard } from 'lucide-react';
import api, { getUserContext, logoutUser } from '../api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
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
      // Filter logic can either be on backend or frontend. Backend is better, but doing it here just in case.
      const studentDocs = res.data.filter(doc => doc.uploaded_by === user?.user_id);
      setSubmissions(studentDocs);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      await api.post('documents/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
      });
      fetchSubmissions(); // Refresh the list
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: '250px', borderRadius: '0', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-border)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '20px', margin: 0 }}>Integrity<span className="text-gradient">Check</span></h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Student Portal</p>
        </div>
        
        <div style={{ padding: '16px', flex: 1 }}>
          <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-start', border: 'none', background: 'var(--color-surface-hover)' }}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
        </div>
        
        <div style={{ padding: '24px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'EW'}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{user?.username || 'Student'}</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>{user?.id_number || 'ID Number'}</p>
            </div>
          </div>
          <button onClick={logoutUser} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px' }} className="container">
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Welcome back, Erick</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '40px' }}>Upload your assignments below for plagiarism similarity checks.</p>
        
        {/* Upload Zone */}
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '40px' }}>
          <div 
            style={{ 
              border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '60px 20px',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
              background: isDragging ? 'var(--color-surface-hover)' : 'transparent',
              opacity: isUploading ? 0.6 : 1
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { 
              e.preventDefault(); 
              setIsDragging(false); 
              if (!isUploading && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => !isUploading && document.getElementById('fileUpload').click()}
          >
            <input 
              type="file" 
              id="fileUpload" 
              style={{ display: 'none' }} 
              accept=".pdf,.doc,.docx,.txt" 
              onChange={(e) => {
                if (e.target.files[0]) handleFileUpload(e.target.files[0]);
              }}
            />
            <UploadCloud size={48} color={isDragging ? 'var(--color-primary)' : 'var(--color-text-muted)'} style={{ margin: '0 auto 16px' }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>
              {isUploading ? 'Uploading & Scanning...' : 'Click to upload or drag and drop'}
            </h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '14px' }}>DOCX, PDF, or TXT (max. 10MB)</p>
          </div>
        </div>

        {/* Submissions List */}
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>Recent Submissions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {submissions.map(sub => (
              <div key={sub.id} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'var(--color-surface)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <FileText size={24} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '16px' }}>{sub.title}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      {new Date(sub.uploaded_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  {sub.status === 'pending' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)' }}>
                      <Clock size={16} /> <span>Scanning in progress...</span>
                    </div>
                  ) : sub.status === 'error' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)' }}>
                      <Clock size={16} /> <span>Scan failed</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
                        <CheckCircle size={16} /> <span>Scan complete</span>
                      </div>
                      <div style={{ background: 'var(--color-surface)', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>
                        Similarity: <span style={{ color: sub.report?.overall_score > 20 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                          {sub.report?.overall_score || 0}%
                        </span>
                      </div>
                      <button onClick={() => navigate(`/report/${sub.report?.id}`)} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '13px' }}>
                        View Report
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {submissions.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No submissions yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
