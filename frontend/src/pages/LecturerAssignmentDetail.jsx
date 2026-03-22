import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, X } from 'lucide-react';
import api from '../api';

const LecturerAssignmentDetail = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingDoc, setViewingDoc] = useState(null); // Document Viewer State

  useEffect(() => {
    fetchData();
  }, [assignmentId]);
  
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
      const [assignRes, subRes] = await Promise.all([
        api.get(`assignments/${assignmentId}/`),
        api.get('submissions/')
      ]);
      setAssignment(assignRes.data);
      // Filter submissions for this assignment
      setSubmissions(subRes.data.filter(s => s.assignment === Number(assignmentId)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }} className="container">
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={16} /> Back to Unit
      </button>

      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', margin: '0 0 8px' }}>{assignment?.title}</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: '0 0 16px' }}>{assignment?.description}</p>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '14px' }}>
          Deadline: {assignment?.deadline ? new Date(assignment.deadline).toLocaleString() : 'No deadline set'}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px', margin: 0 }}>Student Submissions</h2>
          <span style={{ background: 'var(--color-primary)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>
            {submissions.length} Total
          </span>
        </div>
        
        {submissions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No submissions yet for this assignment.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface)', textAlign: 'left', fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 24px', fontWeight: 'bold' }}>Student</th>
                <th style={{ padding: '16px 24px', fontWeight: 'bold' }}>Submission Date</th>
                <th style={{ padding: '16px 24px', fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: '16px 24px', fontWeight: 'bold' }}>Plagiarism Score</th>
                <th style={{ padding: '16px 24px', fontWeight: 'bold', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(doc => {
                const getGradeColor = (grade) => {
                  if (grade === 'A' || grade === 'B') return 'var(--color-success)';
                  if (grade === 'C') return 'var(--color-warning)';
                  return 'var(--color-danger)';
                };

                const isPdf = doc.file?.toLowerCase().endsWith('.pdf');

                return (
                  <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: '500' }}>{doc.uploaded_by?.username}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{doc.uploaded_by?.id_number}</div>
                      
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {isPdf ? (
                           <a href={doc.file} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                             <FileText size={12} /> View PDF natively
                           </a>
                        ) : (
                           <button onClick={() => setViewingDoc(doc)} style={{ background: 'none', border: 'none', padding: 0, fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                             <FileText size={12} /> Read Document in Browser
                           </button>
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

      {/* Extracted Document Viewer Modal */}
      {viewingDoc && (
         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', maxHeight: '100%', display: 'flex', flexDirection: 'column' }}>
               <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)' }}>
                  <div>
                     <h3 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={20} color="var(--color-primary)" /> Document Viewer</h3>
                     <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>{viewingDoc.uploaded_by?.username} - Plagiarism Engine Extracted Text</p>
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

export default LecturerAssignmentDetail;
