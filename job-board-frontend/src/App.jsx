import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import JobsList from './pages/JobsList';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import PostJob from './pages/PostJob';
import MyPostings from './pages/MyPostings';
import JobApplicants from './pages/JobApplicants';
import MyApplications from './pages/MyApplications';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<JobsList />} />
        <Route path="/jobs/:idOrSlug" element={<JobDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/post-job"
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-jobs"
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <MyPostings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-jobs/:jobId/applicants"
          element={
            <ProtectedRoute allowedRoles={['employer', 'admin']}>
              <JobApplicants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute allowedRoles={['jobseeker']}>
              <MyApplications />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
