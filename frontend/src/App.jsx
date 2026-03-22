import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import ReportView from './pages/ReportView';
// Optional new components will be created
import LecturerUnitDetail from './pages/LecturerUnitDetail';
import LecturerAssignmentDetail from './pages/LecturerAssignmentDetail';
import StudentUnitDetail from './pages/StudentUnitDetail';
import UnitReportView from './pages/UnitReportView';
import { getUserContext } from './api';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = getUserContext();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/unit/:unitId" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentUnitDetail />
          </ProtectedRoute>
        } />
        
        {/* Lecturer Routes */}
        <Route path="/lecturer" element={
          <ProtectedRoute allowedRoles={['lecturer']}>
            <LecturerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/lecturer/unit/:unitId" element={
          <ProtectedRoute allowedRoles={['lecturer']}>
            <LecturerUnitDetail />
          </ProtectedRoute>
        } />
        <Route path="/lecturer/unit/:unitId/report" element={
          <ProtectedRoute allowedRoles={['lecturer']}>
            <UnitReportView />
          </ProtectedRoute>
        } />
        <Route path="/lecturer/assignment/:assignmentId" element={
          <ProtectedRoute allowedRoles={['lecturer']}>
            <LecturerAssignmentDetail />
          </ProtectedRoute>
        } />
        
        {/* Shared/Admin Routes */}
        <Route path="/report/:id" element={
          <ProtectedRoute allowedRoles={['lecturer', 'admin']}>
            <ReportView />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
