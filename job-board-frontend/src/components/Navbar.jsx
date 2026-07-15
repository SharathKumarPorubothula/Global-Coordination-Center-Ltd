import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-pin" aria-hidden="true" />
          The Noticeboard
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className="nav-link">
            Browse Jobs
          </NavLink>

          {user?.role === 'employer' && (
            <>
              <NavLink to="/post-job" className="nav-link">Post a Job</NavLink>
              <NavLink to="/my-jobs" className="nav-link">My Postings</NavLink>
            </>
          )}

          {user?.role === 'jobseeker' && (
            <NavLink to="/my-applications" className="nav-link">My Applications</NavLink>
          )}

          {user ? (
            <div className="nav-user">
              <span className="nav-user-name">{user.name}</span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <div className="nav-user">
              <Link to="/login" className="btn btn-outline btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
