import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page">
      <div className="container" style={{ textAlign: 'center', paddingTop: 60 }}>
        <span className="eyebrow">404</span>
        <h1 style={{ fontSize: '2.2rem', marginBottom: 12 }}>This notice has been taken down.</h1>
        <p style={{ color: 'var(--board-text-soft)', marginBottom: 24 }}>
          The page you're looking for doesn't exist or was removed.
        </p>
        <Link to="/" className="btn btn-primary">Back to the board</Link>
      </div>
    </div>
  );
}
