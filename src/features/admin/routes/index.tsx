import { Routes, Route, Navigate } from 'react-router-dom';
import AdminOverview from '../pages/AdminOverview';
import AdminUsers from '../pages/AdminUsers';
import AdminCertificates from '../pages/AdminCertificates';
import AdminJobs from '../pages/AdminJobs';
import AdminCourses from '../pages/AdminCourses';
import AdminPostgraduate from '../pages/AdminPostgraduate';
import AdminEnrollments from '../pages/AdminEnrollments';
import AdminWorkshops from '../pages/AdminWorkshops';
import AdminTopGraduates from '../pages/AdminTopGraduates';

export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="overview" element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="postgraduate" element={<AdminPostgraduate />} />
            <Route path="enrollments" element={<AdminEnrollments />} />
            <Route path="workshops" element={<AdminWorkshops />} />
            <Route path="top-graduates" element={<AdminTopGraduates />} />
            <Route path="" element={<Navigate to="overview" replace />} />
        </Routes>
    );
}
