import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, LayoutDashboard, Key } from 'lucide-react';
import api, { getUserContext, logoutUser, changePassword } from '../api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changeEmail, setChangeEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const user = getUserContext();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');
    setPassLoading(true);
    
    try {
      const response = await changePassword(changeEmail, newPassword, confirmPassword);
      setPassSuccess(response.message || 'Password changed successfully!');
      setChangeEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setIsChangingPassword(false), 2000);
    } catch (err) {
      setPassError(err.message || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

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
          <button onClick={() => setIsChangingPassword(true)} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
            <Key size={16} /> Change Password
          </button>
          <button onClick={logoutUser} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {isChangingPassword && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ padding: '32px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>Change Password</h3>
            
            {passError && <div style={{ color: 'var(--color-danger)', marginBottom: '16px', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px' }}>{passError}</div>}
            {passSuccess && <div style={{ color: 'var(--color-success)', marginBottom: '16px', fontSize: '14px', background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px' }}>{passSuccess}</div>}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-muted)' }}>Email Address verifying account</label>
                <input
                  type="email"
                  className="input-premium"
                  value={changeEmail}
                  onChange={(e) => setChangeEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-muted)' }}>New Password</label>
                <input
                  type="password"
                  className="input-premium"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-muted)' }}>Confirm Password</label>
                <input
                  type="password"
                  className="input-premium"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsChangingPassword(false)} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={passLoading} className="btn-primary" style={{ flex: 1, padding: '12px', opacity: passLoading ? 0.7 : 1 }}>
                  {passLoading ? 'Saving...' : 'Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
