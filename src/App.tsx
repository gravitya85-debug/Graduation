import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
import Landing from './features/landing/pages/Landing';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import Home from './features/dashboard/pages/Home';
import Profile from './features/profile/pages/Profile';
import Certificates from './features/certificates/pages/Certificates';
import Jobs from './features/jobs/pages/Jobs';
import ManageJobs from './features/jobs/pages/ManageJobs';
import Applicants from './features/jobs/pages/Applicants';
import Courses from './features/courses/pages/Courses';
import CourseDetails from './features/courses/pages/CourseDetails';
import Checkout from './features/payments/pages/Checkout';
import Postgraduate from './features/postgraduate/pages/Postgraduate';
import PostgraduateDetails from './features/postgraduate/pages/PostgraduateDetails';
import Workshops from './features/workshops/pages/Workshops';
import WorkshopDetails from './features/workshops/pages/WorkshopDetails';
import FAQ from './features/landing/pages/FAQ';
import AdminRoutes from './features/admin/routes';

// Components & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import DoctorRoutes from './features/doctor/routes';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (Require Authentication) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'company', 'graduate', 'doctor']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/certificates" element={<Certificates />} />

              {/* Jobs Module Routes */}
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/manage" element={<ManageJobs />} />
              <Route path="/applicants" element={<Applicants />} />

              {/* Courses Module */}
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              <Route path="/checkout/:type/:id" element={<Checkout />} />

              {/* Postgraduate Module */}
              <Route path="/postgraduate" element={<Postgraduate />} />
              <Route path="/postgraduate/:id" element={<PostgraduateDetails />} />

              {/* Workshops Module */}
              <Route path="/workshops" element={<Workshops />} />
              <Route path="/workshops/:id" element={<WorkshopDetails />} />

              {/* FAQ */}
              <Route path="/faq" element={<FAQ />} />

              {/* Doctor Panel */}
              <Route path="doctor/*" element={<DoctorRoutes />} />

              {/* Admin Panel */}
              <Route path="admin/*" element={<AdminRoutes />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
