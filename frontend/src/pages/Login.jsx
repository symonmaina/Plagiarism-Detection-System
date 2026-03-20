import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Users } from 'lucide-react';

import { loginUser } from '../api';

const Login = () => {
  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const decodedToken = await loginUser(identifier, password);

      // Navigate based on selected role tab (or we could use decodedToken.role if present)
      if (role === 'student') {
        navigate('/student');
      } else {
        navigate('/lecturer');
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      <div className="glass-card" style={{ padding: '48px', width: '100%', maxWidth: '420px', zIndex: 1, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ background: 'var(--color-surface-hover)', padding: '16px', borderRadius: '50%' }}>
              <ShieldCheck size={48} color="var(--color-primary)" />
            </div>
          </div>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Integrity<span className="text-gradient">Check</span></h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Academic Plagiarism Detection System</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <button
            type="button"
            className={role === 'student' ? 'btn-primary' : 'btn-secondary'}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => setRole('student')}
          >
            <User size={18} /> Student
          </button>
          <button
            type="button"
            className={role === 'lecturer' ? 'btn-primary' : 'btn-secondary'}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => setRole('lecturer')}
          >
            <Users size={18} /> Lecturer
          </button>
        </div>

        {error && <div style={{ color: 'var(--color-danger)', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
              {role === 'student' ? 'Username' : 'Username'}
            </label>
            <input
              type="text"
              className="input-premium"
              placeholder={role === 'student' ? 'Enter username' : 'Enter username'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-muted)' }}>Password</label>
            <input
              type="password"
              className="input-premium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '12px', padding: '14px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing In...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
