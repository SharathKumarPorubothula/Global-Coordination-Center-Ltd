import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobsApi, applicationsApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

function formatSalary(salary) {
  if (!salary || !salary.isDisclosed || (!salary.min && !salary.max)) return 'Undisclosed';
  const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
  const currency = salary.currency || 'INR';
  if (salary.min && salary.max) return `${currency} ${fmt(salary.min)} – ${fmt(salary.max)} / year`;
  if (salary.min) return `${currency} ${fmt(salary.min)}+ / year`;
  return `Up to ${currency} ${fmt(salary.max)} / year`;
}

export default function JobDetail() {
  const { idOrSlug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [applyForm, setApplyForm] = useState({ resumeUrl: '', coverLetter: '' });
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    jobsApi
      .get(idOrSlug)
      .then((data) => !cancelled && setJob(data.job))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [idOrSlug]);

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${idOrSlug}` } });
      return;
    }
    setShowApply(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    setSubmitting(true);
    try {
      await applicationsApi.apply(job._id, applyForm);
      setApplySuccess(true);
      setShowApply(false);
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page"><div className="container"><Loader /></div></div>;
  if (error) return <div className="page"><div className="container"><div className="alert alert-error">{error}</div></div></div>;
  if (!job) return null;

  const location = job.location?.remote
    ? 'Remote'
    : [job.location?.city, job.location?.country].filter(Boolean).join(', ') || 'Location TBD';

  return (
    <div className="page">
      <div className="container">
        <Link to="/" className="back-link">← Back to all jobs</Link>

        <div className="detail-notice">
          <div className="detail-notice-pin" aria-hidden="true" />
          <div className="detail-header">
            <div>
              <h1>{job.title}</h1>
              <p className="detail-company">{job.company?.name}</p>
            </div>
            {job.status && <span className={`pill ${job.status === 'published' ? 'pill-moss' : 'pill-muted'}`}>{job.status}</span>}
          </div>

          <div className="detail-meta-row">
            <span className="stamp">{location}</span>
            <span className="stamp">{job.jobType?.replace('-', ' ')}</span>
            <span className="stamp">{job.experienceLevel} level</span>
            <span className="stamp">{job.views} views</span>
            <span className="stamp">{job.applicantCount} applicants</span>
          </div>

          <div className="detail-salary">{formatSalary(job.salary)}</div>

          {applySuccess && <div className="alert alert-success">Application submitted — good luck!</div>}

          <div className="detail-actions">
            {user?.role !== 'employer' && (
              <button className="btn btn-primary" onClick={handleApplyClick} disabled={applySuccess}>
                {applySuccess ? 'Applied' : 'Apply now'}
              </button>
            )}
            {user?.role === 'jobseeker' && (
              <button
                className="btn btn-outline"
                onClick={() => jobsApi.toggleSave(job._id)}
              >
                Save job
              </button>
            )}
          </div>

          <section className="detail-section">
            <h3>About this role</h3>
            <p className="detail-body">{job.description}</p>
          </section>

          {job.responsibilities?.length > 0 && (
            <section className="detail-section">
              <h3>Responsibilities</h3>
              <ul className="detail-list">
                {job.responsibilities.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>
          )}

          {job.requirements?.length > 0 && (
            <section className="detail-section">
              <h3>Requirements</h3>
              <ul className="detail-list">
                {job.requirements.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>
          )}

          {job.skills?.length > 0 && (
            <section className="detail-section">
              <h3>Skills</h3>
              <div className="job-card-meta">
                {job.skills.map((skill) => <span key={skill} className="pill">{skill}</span>)}
              </div>
            </section>
          )}
        </div>
      </div>

      {showApply && (
        <div className="modal-overlay" onClick={() => setShowApply(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Apply to {job.title}</h3>
            {applyError && <div className="alert alert-error">{applyError}</div>}
            <form onSubmit={handleApplySubmit}>
              <div className="field">
                <label htmlFor="resumeUrl">Resume URL</label>
                <input
                  id="resumeUrl"
                  required
                  placeholder="https://example.com/your-resume.pdf"
                  value={applyForm.resumeUrl}
                  onChange={(e) => setApplyForm((f) => ({ ...f, resumeUrl: e.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="coverLetter">Cover letter (optional)</label>
                <textarea
                  id="coverLetter"
                  placeholder="Why you're a great fit…"
                  value={applyForm.coverLetter}
                  onChange={(e) => setApplyForm((f) => ({ ...f, coverLetter: e.target.value }))}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowApply(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
