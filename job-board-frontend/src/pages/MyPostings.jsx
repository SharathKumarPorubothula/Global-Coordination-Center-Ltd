import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../api/services';
import Loader from '../components/Loader';

export default function MyPostings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    jobsApi
      .myPostings()
      .then((data) => setJobs(data.jobs))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting? This also removes its applications.')) return;
    setBusyId(id);
    try {
      await jobsApi.remove(id);
      setJobs((prev) => prev.filter((j) => j._id !== id));
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
            <span className="eyebrow">Employer dashboard</span>
            <h1>My postings</h1>
          </div>
          <Link to="/post-job" className="btn btn-primary">Post a job</Link>
        </div>

        {loading && <Loader />}
        {!loading && error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && jobs.length === 0 && (
          <div className="empty-state">
            <h3>No notices pinned yet</h3>
            <p>Post your first job to start receiving applications.</p>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="dash-list">
            {jobs.map((job) => (
              <div className="dash-row" key={job._id}>
                <div className="dash-row-main">
                  <h3>{job.title}</h3>
                  <span className="dash-sub">
                    {job.jobType?.replace('-', ' ')} · {job.location?.remote ? 'Remote' : job.location?.city || 'No location set'}
                  </span>
                </div>
                <div className="dash-row-meta">
                  <span className={`pill ${job.status === 'published' ? 'pill-moss' : 'pill-muted'}`}>{job.status}</span>
                  <span>{job.applicantCount} applicants</span>
                  <span>{job.views} views</span>
                </div>
                <div className="dash-row-actions">
                  <Link to={`/jobs/${job.slug}`} className="btn btn-outline btn-sm">View</Link>
                  <Link to={`/my-jobs/${job._id}/applicants`} className="btn btn-outline btn-sm">Applicants</Link>
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={busyId === job._id}
                    onClick={() => handleDelete(job._id)}
                  >
                    {busyId === job._id ? 'Removing…' : 'Delete'}
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
