import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../api/services';
import Loader from '../components/Loader';

const STATUS_PILL = {
  submitted: 'pill-muted',
  under_review: 'pill',
  shortlisted: 'pill-moss',
  hired: 'pill-moss',
  rejected: 'pill-brick',
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    applicationsApi
      .myApplications()
      .then((data) => setApplications(data.applications))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return;
    setBusyId(id);
    try {
      await applicationsApi.withdraw(id);
      setApplications((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="dash-header">
          <div>
            <span className="eyebrow">Job seeker dashboard</span>
            <h1>My applications</h1>
          </div>
          <Link to="/" className="btn btn-outline">Browse more jobs</Link>
        </div>

        {loading && <Loader />}
        {!loading && error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && applications.length === 0 && (
          <div className="empty-state">
            <h3>You haven't applied to anything yet</h3>
            <p>Browse the board and pin your first application.</p>
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="dash-list">
            {applications.map((app) => (
              <div className="dash-row" key={app._id}>
                <div className="dash-row-main">
                  <h3>{app.job?.title || 'Job no longer available'}</h3>
                  <span className="dash-sub">
                    {app.job?.company?.name} · Applied {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="dash-row-meta">
                  <span className={`pill ${STATUS_PILL[app.status] || 'pill-muted'}`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="dash-row-actions">
                  {app.job && (
                    <Link to={`/jobs/${app.job._id}`} className="btn btn-outline btn-sm">View job</Link>
                  )}
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={busyId === app._id}
                    onClick={() => handleWithdraw(app._id)}
                  >
                    {busyId === app._id ? 'Withdrawing…' : 'Withdraw'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
