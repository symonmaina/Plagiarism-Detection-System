import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UploadCloud, CheckCircle, Clock, FileText, Download, X, AlertCircle } from 'lucide-react';
import api, { getUserContext } from '../api';

const StudentUnitDetail = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAssignmentId, setUploadingAssignmentId] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  
  const user = getUserContext();

  useEffect(() => {
    fetchData();
  }, [unitId]);
  
  // Auto-poll if any submissions are pending analysis
  useEffect(() => {
    const hasPending = submissions.some(s => s.status === 'pending');
    if (hasPending) {
      const timer = setTimeout(fetchData, 3000);
      return () => clearTimeout(timer);
    }
  }, [submissions]);

  const fetchData = async () => {
    try {
      const [unitRes, assignRes, subRes] = await Promise.all([
        api.get(`units/${unitId}/`),
        api.get('assignments/'),
        api.get('submissions/')
      ]);
      setUnit(unitRes.data);
      setAssignments(assignRes.data.filter(a => a.unit === Number(unitId)));
      // Filter submissions uploaded by this student
      setSubmissions(subRes.data.filter(s => s.uploaded_by?.id === user?.user_id || s.uploaded_by?.id === user?.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, assignmentId) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingAssignmentId(assignmentId);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('assignment', assignmentId);

    try {
      await api.post('submissions/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchData(); // Refresh submissions dynamically
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to post submission.");
    } finally {
      setUploadingAssignmentId(null);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }} className="container">
      <button onClick={() => navigate('/student')} className="btn-secondary" style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>{unit?.name} ({unit?.code})</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '40px' }}>Available assignments.</p>

      {assignments.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No assignments for this module yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '24px' }}>
          {assignments.map(a => {
            // Check if student already has a valid submission to this assignment
            const mySub = submissions.find(s => s.assignment === a.id && s.status !== 'withdrawn');
            const isUploading = uploadingAssignmentId === a.id;
            
            return (
              <div key={a.id} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>{a.title}</h3>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '14px' }}>{a.description}</p>
                    {a.deadline && (
                      <p style={{ margin: '8px 0 0', color: 'var(--color-warning)', fontSize: '13px' }}>
                        Due: {new Date(a.deadline).toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  {mySub ? (
                     <div style={{ textAlign: 'right' }}>
                       {mySub.status === 'scanned' ? (
                         <>
                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '16px' }}>
                             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontSize: '14px', fontWeight: 'bold' }}>
                               <CheckCircle size={16} /> Submitted
                             </div>
                           </div>
                           <div style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                             {mySub.file?.toLowerCase().endsWith('.pdf') ? (
                               <a href={mySub.file} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '4px' }}><FileText size={12}/> View PDF natively</a>
                             ) : (
                               <button onClick={() => setViewingDoc(mySub)} style={{ background: 'none', border: 'none', padding: 0, fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><FileText size={12}/> Read Document in Browser</button>
                             )}
                             <br />Uploaded: {new Date(mySub.uploaded_at).toLocaleString()}
                           </div>
                           <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                             <button 
                               className="btn-danger" 
                               onClick={async () => {
                                 if (window.confirm("Are you sure you want to withdraw this submission and redo the work?")) {
                                   await api.delete(`submissions/${mySub.id}/`);
                                   fetchData();
                                 }
                               }}
                               style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                             >
                               Withdraw Submission
                             </button>
                           </div>
                         </>
                       ) : mySub.status === 'error' ? (
                         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', textAlign: 'right' }}>
                           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', fontSize: '14px', fontWeight: 'bold' }}>
                             <AlertCircle size={16} /> Scan Failed
                           </div>
                           <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>An error occurred while processing this document. Please check the file and try again.</p>
                           <button 
                             className="btn-primary" 
                             onClick={async () => {
                               if (window.confirm("Delete the failed submission and try again?")) {
                                 await api.delete(`submissions/${mySub.id}/`);
                                 document.getElementById(`fileUpload-${a.id}`).click();
                               }
                             }} 
                             style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                           >
                             <UploadCloud size={14} /> Retry Upload
                           </button>
                         </div>
                       ) : (
                         <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-warning)', fontSize: '14px' }}>
                           <Clock size={16} /> Scan Processing...
                         </div>
                       )}
                     </div>
                  ) : (
                    <div>
                      <input 
                        type="file" 
                        id={`fileUpload-${a.id}`} 
                        style={{ display: 'none' }} 
                        accept=".pdf,.doc,.docx,.txt" 
                        onChange={(e) => handleFileUpload(e, a.id)}
                      />
                      <button 
                        className="btn-primary" 
                        disabled={isUploading}
                        onClick={() => document.getElementById(`fileUpload-${a.id}`).click()}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        <UploadCloud size={16} /> {isUploading ? 'Uploading...' : 'Submit Work'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Extracted Document Viewer Modal */}
      {viewingDoc && (
         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', maxHeight: '100%', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
               <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)' }}>
                  <div>
                     <h3 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={20} color="var(--color-primary)" /> My Submission</h3>
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

export default StudentUnitDetail;
