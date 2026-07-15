import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/services';

const initial = {
  title: '',
  description: '',
  jobType: 'full-time',
  experienceLevel: 'mid',
  city: '',
  country: '',
  remote: false,
  salaryMin: '',
  salaryMax: '',
  currency: 'INR',
  skills: '',
  category: '',
};

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        jobType: form.jobType,
        experienceLevel: form.experienceLevel,
        category: form.category,
        location: {
          city: form.city,
          country: form.country,
          remote: form.remote,
        },
        salary: {
          min: form.salaryMin ? Number(form.salaryMin) : undefined,
          max: form.salaryMax ? Number(form.salaryMax) : undefined,
          currency: form.currency,
          isDisclosed: Boolean(form.salaryMin || form.salaryMax),
        },
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const { job } = await jobsApi.create(payload);
      navigate(`/jobs/${job.slug}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="container auth-container">
        <div className="auth-card" style={{ maxWidth: 620 }}>
          <span className="eyebrow">New notice</span>
          <h1>Post a job</h1>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="title">Job title</label>
              <input id="title" name="title" required value={form.title} onChange={handleChange} placeholder="Backend Engineer (Node.js)" />
            </div>

            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                required
                value={form.description}
                onChange={handleChange}
                placeholder="What will this person do, and why does the role exist?"
                style={{ minHeight: 140 }}
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="jobType">Job type</label>
                <select id="jobType" name="jobType" value={form.jobType} onChange={handleChange}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="experienceLevel">Experience level</label>
                <select id="experienceLevel" name="experienceLevel" value={form.experienceLevel} onChange={handleChange}>
                  <option value="entry">Entry</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="city">City</label>
                <input id="city" name="city" value={form.city} onChange={handleChange} placeholder="Hyderabad" />
              </div>
              <div className="field">
                <label htmlFor="country">Country</label>
                <input id="country" name="country" value={form.country} onChange={handleChange} placeholder="India" />
              </div>
            </div>

            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" name="remote" checked={form.remote} onChange={handleChange} style={{ width: 'auto' }} />
                This role can be done remotely
              </label>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="salaryMin">Salary min (annual)</label>
                <input id="salaryMin" name="salaryMin" type="number" value={form.salaryMin} onChange={handleChange} placeholder="800000" />
              </div>
              <div className="field">
                <label htmlFor="salaryMax">Salary max (annual)</label>
                <input id="salaryMax" name="salaryMax" type="number" value={form.salaryMax} onChange={handleChange} placeholder="1400000" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <input id="category" name="category" value={form.category} onChange={handleChange} placeholder="Engineering" />
            </div>

            <div className="field">
              <label htmlFor="skills">Skills (comma-separated)</label>
              <input id="skills" name="skills" value={form.skills} onChange={handleChange} placeholder="Node.js, Express, MongoDB" />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Pinning notice…' : 'Post job'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
