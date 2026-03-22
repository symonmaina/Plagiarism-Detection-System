import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../api';

const LecturerUnitDetail = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Edit state
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    fetchData();
  }, [unitId]);

  const fetchData = async () => {
    try {
      const [unitRes, assignRes] = await Promise.all([
        api.get(`units/${unitId}/`),
        api.get('assignments/')
      ]);
      setUnit(unitRes.data);
      setAssignments(assignRes.data.filter(a => a.unit === Number(unitId)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('assignments/', {
        title: newTitle,
        description: newDesc,
        unit: Number(unitId),
        // created_by is handled by backend or needs to be passed depending on backend config.
        // If it's required as an ID on the frontend, let's just pass `user.user_id` but ModelViewSet might require it if perform_create isn't overridden.
        // Wait, AssignmentViewSet in views.py doesn't override perform_create to set created_by!
        // I need to provide it.
        created_by: JSON.parse(localStorage.getItem('user_profile')).id
      });
      setAssignments([res.data, ...assignments]);
      setShowForm(false);
      setNewTitle('');
      setNewDesc('');
    } catch (err) {
      console.error(err);
      alert('Failed to create assignment');
    }
  };

  const handleEditClick = (assignment) => {
    setEditingAssignmentId(assignment.id);
    setEditTitle(assignment.title);
    setEditDesc(assignment.description);
  };

  const handleUpdateAssignment = async (e, id) => {
    e.preventDefault();
    try {
      const res = await api.patch(`assignments/${id}/`, {
        title: editTitle,
        description: editDesc,
      });
      setAssignments(assignments.map(a => a.id === id ? res.data : a));
      setEditingAssignmentId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update assignment');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment? All submissions will also be deleted.")) return;
    try {
      await api.delete(`assignments/${id}/`);
      setAssignments(assignments.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete assignment');
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }} className="container">
      <button onClick={() => navigate('/lecturer')} className="btn-secondary" style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>{unit?.name} ({unit?.code})</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '40px' }}>Manage assignments for this module.</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', margin: 0 }}>Assignments</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => navigate(`/lecturer/unit/${unitId}/report`)}>
            View Unit Report
          </button>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Create Assignment
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreateAssignment} className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
          <h3 style={{ marginTop: 0 }}>New Assignment</h3>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Title</label>
            <input 
              type="text" 
              required 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)} 
              className="input-premium" 
              style={{ width: '100%' }} 
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
            <textarea 
              value={newDesc} 
              onChange={e => setNewDesc(e.target.value)} 
              className="input-premium" 
              style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} 
            />
          </div>
          <button type="submit" className="btn-primary">Save Assignment</button>
        </form>
      )}

      {assignments.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No assignments created yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {assignments.map(a => (
            <div key={a.id} className="glass-card" style={{ padding: '20px' }}>
              {editingAssignmentId === a.id ? (
                <form onSubmit={(e) => handleUpdateAssignment(e, a.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                     <h3 style={{ margin: 0, fontSize: '18px' }}>Edit Assignment</h3>
                     <button type="button" onClick={() => setEditingAssignmentId(null)} className="btn-secondary" style={{ padding: '4px' }}><X size={16} /></button>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-muted)' }}>Title</label>
                    <input type="text" required value={editTitle} onChange={e => setEditTitle(e.target.value)} className="input-premium" style={{ width: '100%' }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-muted)' }}>Description</label>
                    <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="input-premium" style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="btn-primary">Save Changes</button>
                    <button type="button" className="btn-secondary" onClick={() => setEditingAssignmentId(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>{a.title}</h3>
                    <p style={{ margin: '0 0 8px', color: 'var(--color-text-muted)', fontSize: '14px' }}>{a.description}</p>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Created on {new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button className="btn-secondary" onClick={() => handleEditClick(a)} title="Edit Assignment" style={{ padding: '8px' }}>
                      <Edit size={16} />
                    </button>
                    <button className="btn-secondary" onClick={() => handleDeleteAssignment(a.id)} title="Delete Assignment" style={{ padding: '8px', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                      <Trash2 size={16} />
                    </button>
                    <button className="btn-primary" onClick={() => navigate(`/lecturer/assignment/${a.id}`)}>
                      View Submissions
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LecturerUnitDetail;
