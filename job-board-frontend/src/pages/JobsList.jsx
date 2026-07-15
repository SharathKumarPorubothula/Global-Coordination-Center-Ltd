import { useEffect, useState, useCallback } from 'react';
import { jobsApi } from '../api/services';
import JobCard from '../components/JobCard';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';

const initialFilters = {
  search: '',
  location: '',
  jobType: '',
  experienceLevel: '',
  remote: '',
};

export default function JobsList() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ jobs: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 9 };
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const result = await jobsApi.list(params);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, appliedFilters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setPage(1);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="board-header">
          <span className="eyebrow">{data.total ?? 0} notices pinned</span>
          <h1>Jobs, posted plainly.</h1>
          <p className="board-subtitle">
            Search what's open right now — filtered, sorted, no noise.
          </p>
        </div>

        <form className="filter-bar" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search title, company, or skill…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
          <input
            type="text"
            placeholder="City"
            value={filters.location}
            onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
          />
          <select
            value={filters.jobType}
            onChange={(e) => setFilters((f) => ({ ...f, jobType: e.target.value }))}
          >
            <option value="">Any job type</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="temporary">Temporary</option>
          </select>
          <select
            value={filters.experienceLevel}
            onChange={(e) => setFilters((f) => ({ ...f, experienceLevel: e.target.value }))}
          >
            <option value="">Any level</option>
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
            <option value="executive">Executive</option>
          </select>
          <select
            value={filters.remote}
            onChange={(e) => setFilters((f) => ({ ...f, remote: e.target.value }))}
          >
            <option value="">Remote or onsite</option>
            <option value="true">Remote only</option>
            <option value="false">Onsite only</option>
          </select>
          <div className="filter-actions">
            <button type="submit" className="btn btn-primary btn-sm">Apply filters</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={handleReset}>Clear</button>
          </div>
        </form>

        {loading && <Loader />}
        {!loading && error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && data.jobs.length === 0 && (
          <div className="empty-state">
            <h3>No notices match that search</h3>
            <p>Try clearing a filter or searching a broader term.</p>
          </div>
        )}

        {!loading && !error && data.jobs.length > 0 && (
          <>
            <div className="board-grid">
              {data.jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
