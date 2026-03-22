import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, LayoutDashboard } from 'lucide-react';
import api, { getUserContext, logoutUser } from '../api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = getUserContext();

  useEffect(() => {
    if (!user) {
        navigate('/');
        return;
    }
    fetchUnits();
  }, [navigate]);

  const fetchUnits = async () => {
    try {
      const res = await api.get('units/');
      // Filter units to only those that include the student's program
      const enrolledUnits = res.data.filter(unit => 
        unit.programs.includes(user.program)
      );
      setUnits(enrolledUnits);
    } catch (err) {
      console.error("Failed to fetch units:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
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
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'ST'}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{user?.username || 'Student'}</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>{user?.program_details?.course_name || 'No Course'} - Y{user?.program_details?.year || '?'}</p>
            </div>
          </div>
          <button onClick={logoutUser} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px' }} className="container">
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>My Units</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '40px' }}>Select a unit to view assignments and submit your work.</p>
        
        {loading ? (
           <p>Loading units...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {units.map(unit => (
              <div 
                key={unit.id} 
                className="glass-card" 
                style={{ padding: '24px', cursor: 'pointer', transition: 'all 0.2s ease', ':hover': { transform: 'translateY(-2px)' } }}
                onClick={() => navigate(`/student/unit/${unit.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ background: 'var(--color-surface)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <BookOpen size={24} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{unit.name}</h3>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '14px' }}>{unit.code}</p>
                  </div>
                </div>
                <button className="btn-primary" style={{ width: '100%' }}>View Assignments</button>
              </div>
            ))}
            {units.length === 0 && <p style={{ color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>You are not enrolled in any units yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
