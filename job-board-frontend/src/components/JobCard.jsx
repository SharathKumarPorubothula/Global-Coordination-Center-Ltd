import { Link } from 'react-router-dom';

function formatSalary(salary) {
  if (!salary || !salary.isDisclosed || (!salary.min && !salary.max)) return null;
  const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
  const currency = salary.currency || 'INR';
  if (salary.min && salary.max) return `${currency} ${fmt(salary.min)} – ${fmt(salary.max)}`;
  if (salary.min) return `${currency} ${fmt(salary.min)}+`;
  return `Up to ${currency} ${fmt(salary.max)}`;
}

function isFresh(createdAt) {
  const hours = (Date.now() - new Date(createdAt).getTime()) / 36e5;
  return hours <= 48;
}

export default function JobCard({ job }) {
  const salary = formatSalary(job.salary);
  const location = job.location?.remote
    ? 'Remote'
    : [job.location?.city, job.location?.country].filter(Boolean).join(', ') || 'Location TBD';

  return (
    <article className="job-card">
      {isFresh(job.createdAt) && <span className="fresh-ribbon">New</span>}

      <h3 className="job-card-title">{job.title}</h3>
      <p className="job-card-company">{job.company?.name}</p>

      <div className="job-card-meta">
        <span className="stamp">{location}</span>
        <span className="stamp">{job.jobType?.replace('-', ' ')}</span>
        <span className="stamp">{job.experienceLevel} level</span>
      </div>

      <div className="job-card-footer">
        <span className="job-card-salary">{salary || 'Salary undisclosed'}</span>
        <span>{job.applicantCount ?? 0} applied</span>
      </div>

      <Link to={`/jobs/${job.slug || job._id}`} className="job-card-link" aria-label={`View ${job.title}`} />
    </article>
  );
}
