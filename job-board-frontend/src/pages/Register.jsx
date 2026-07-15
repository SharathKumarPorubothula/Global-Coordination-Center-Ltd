import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'jobseeker',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(form.role === 'employer' ? { company: { name: form.companyName } } : {}),
      };
      const user = await register(payload);
      navigate(user.role === 'employer' ? '/my-jobs' : '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="container auth-container">
        <div className="auth-card">
          <span className="eyebrow">Join the board</span>
          <h1>Create your account</h1>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>I am a…</label>
              <div className="role-toggle">
                <button
                  type="button"
                  className={`role-option ${form.role === 'jobseeker' ? 'active' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, role: 'jobseeker' }))}
                >
                  Job seeker
                </button>
                <button
                  type="button"
                  className={`role-option ${form.role === 'employer' ? 'active' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, role: 'employer' }))}
                >
                  Employer
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" required value={form.name} onChange={handleChange} placeholder="Jamie Doe" />
            </div>

            {form.role === 'employer' && (
              <div className="field">
                <label htmlFor="companyName">Company name</label>
                <input
                  id="companyName"
                  name="companyName"
                  required
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Acme Corp"
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
