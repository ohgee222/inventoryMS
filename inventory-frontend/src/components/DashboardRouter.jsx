import { useAuth } from '../auth/AuthContext';
import StudentDashboard from '../pages/StudentDashboard';
import StaffAdminDashboard from '../pages/StaffAdminDashboard';


const DashboardRouter = () => {
  // Get user object from AuthContext (contains role from decoded JWT)
  const { user } = useAuth();
  
  // Get role - backend sends it as string ("Admin", "Staff", "Student")
  const role = user?.role;

  // Route to StudentDashboard if role is "Student"
  if (role === 'Student') {
    return <StudentDashboard />;
  }

  // Route to StaffAdminDashboard if role is "Admin" or "Staff"
  if (role === 'Admin' || role === 'Staff') {
    return <StaffAdminDashboard />;
  }

  // Fallback UI if role is not recognized
  return (
    <div>
      <h2>Unknown Role</h2>
      <p>Your account role ({user?.role}) is not recognized.</p>
      <p>Expected: "Admin", "Staff", or "Student"</p>
    </div>
  );
};

export default DashboardRouter;