import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationsApi, jobsApi } from '../api/services';
import Loader from '../components/Loader';

const STATUSES = ['submitted', 'under_review', 'shortlisted', 'rejected', 'hired'];

export default function JobApplicants() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([jobsApi.get(jobId), applicationsApi.applicantsForJob(jobId)])
      .then(([jobData, appData]) => {
        setJob(jobData.job);
        setApplications(appData.applications);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatusChange = async (applicationId, status) => {
    setSavingId(applicationId);
    try {
      const { application } = await applicationsApi.updateStatus(applicationId, { status });
      setApplications((prev) => prev.map((a) => (a._id === applicationId ? { ...a, status: application.status } : a)));
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="page"><div className="container"><Loader /></div></div>;
  if (error) return <div className="page"><div className="container"><div className="alert alert-error">{error}</div></div></div>;

  return (
    <div className="page">
      <div className="container">
        <Link to="/my-jobs" className="back-link">← Back to my postings</Link>

        <div className="dash-header">
          <div>
            <span className="eyebrow">Applicants</span>
            <h1>{job?.title}</h1>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state">
            <h3>No applications yet</h3>
            <p>Check back once candidates start applying.</p>
          </div>
        ) : (
          <table className="applicant-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Resume</th>
                <th>Cover letter</th>
                <th>Applied</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td>
                    <strong>{app.applicant?.name}</strong>
                    <br />
                    <span className="dash-sub">{app.applicant?.email}</span>
                  </td>
                  <td>
                    <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="ticket">
                      View resume ↗
                    </a>
                  </td>
                  <td style={{ maxWidth: 260 }}>{app.coverLetter || '—'}</td>
                  <td className="dash-sub">{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      className="status-select"
                      value={app.status}
                      disabled={savingId === app._id}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
