import { Routes, Route, Navigate } from 'react-router-dom';
import DoctorCourses from '../pages/DoctorCourses';
import DoctorWorkshops from '../pages/DoctorWorkshops';
import DoctorEnrollments from '../pages/DoctorEnrollments';


export default function DoctorRoutes() {
    return (
        <Routes>
            <Route path="courses" element={<DoctorCourses />} />
            <Route path="enrollments" element={<DoctorEnrollments />} />
            <Route path="workshops" element={<DoctorWorkshops />} />
            <Route path="" element={<Navigate to="courses" replace />} />
        </Routes>
    );
}
