import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import RecentActivity from './RecentActivity';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAssets: 0,
    availableAssets: 0,
    onLoanAssets: 0,
    maintenanceAssets: 0,
    overdueLoans: 0,
    activeLoans: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [recentActivity, setRecentActivity] = useState([0]);

useEffect(() => {
  fetchPendingRequests();
  fetchRecentActivity();
}, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [user.token]);
  useEffect(() => {

}, []);

const fetchPendingRequests = async () => {
  const response = await fetch(
    "http://localhost:7028/api/LoanRequests/pending/count",
    {
      headers: { Authorization: `Bearer ${user.token}` }
    }
  );

  const data = await response.json();
  setPendingRequests(data.pendingRequests);
};

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const [assetsRes, loansRes] = await Promise.all([
        fetch('http://localhost:7028/api/Assets', {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        fetch('http://localhost:7028/api/Loans', {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      ]);

      if (!assetsRes.ok || !loansRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const assets = await assetsRes.json();
      const loans = await loansRes.json();

      // Calculate stats
      const totalAssets = assets.length;
      const availableAssets = assets.filter(a => a.status === 0).length; // Available
      const onLoanAssets = assets.filter(a => a.status === 1).length; // CheckedOut
      const maintenanceAssets = assets.filter(a => a.physicalCondition === 3).length; // InRepair

      const activeLoans = loans.filter(l => l.returnDate === null).length;
      const overdueLoans = loans.filter(l => 
        l.returnDate === null && new Date(l.dueDate) < new Date()
      ).length;
      setStats({
  totalAssets,
  availableAssets,
  onLoanAssets,
  maintenanceAssets,
  overdueLoans,
  activeLoans
});

      

    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError('Failed to load dashboard stats. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  const fetchRecentActivity = async () => {
  const response = await fetch(
    "http://localhost:7028/api/Loans/recent",
    {
      headers: { Authorization: `Bearer ${user.token}` }
    }
  );

  const data = await response.json();
  setRecentActivity(data);
};

  // Calculate percentages for pie chart
  const availablePercent = stats.totalAssets > 0 
    ? Math.round((stats.availableAssets / stats.totalAssets) * 100) 
    : 0;
  const onLoanPercent = stats.totalAssets > 0 
    ? Math.round((stats.onLoanAssets / stats.totalAssets) * 100) 
    : 0;
  const maintenancePercent = stats.totalAssets > 0 
    ? Math.round((stats.maintenanceAssets / stats.totalAssets) * 100) 
    : 0;

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: '0' }}>
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

     

      {/* Stats Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Total Equipment Card */}
        <div style={statCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={statLabelStyle}>Total Equipment</div>
              <div style={statNumberStyle}>{stats.totalAssets}</div>
              <div style={statSubtextStyle}>Across all categories</div>
            </div>
            <div style={{ ...iconBoxStyle, backgroundColor: '#f0f0f0' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Available Card */}
        <div style={statCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={statLabelStyle}>Available</div>
              <div style={statNumberStyle}>{stats.availableAssets}</div>
              <div style={statSubtextStyle}>Ready for loan</div>
            </div>
            <div style={{ ...iconBoxStyle, backgroundColor: '#e8f5e9' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          
        </div>
  {/* Pending Requests Card */}
<div style={statCardStyle}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <div>
      <div style={statLabelStyle}>Pending Requests</div>
      <div style={statNumberStyle}>{pendingRequests}</div>
      <div style={statSubtextStyle}>Awaiting approval</div>
    </div>

    <div style={{ ...iconBoxStyle, backgroundColor: '#fff3e0' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb8c00" strokeWidth="2">
        <path d="M12 8v4l3 3"></path>
        <circle cx="12" cy="12" r="10"></circle>
      </svg>
    </div>
  </div>
</div>


        {/* On Loan Card */}
        <div style={statCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={statLabelStyle}>On Loan</div>
              <div style={statNumberStyle}>{stats.onLoanAssets}</div>
              <div style={statSubtextStyle}>{stats.activeLoans} active loans</div>
            </div>
            <div style={{ ...iconBoxStyle, backgroundColor: '#e3f2fd' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2196f3" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Alerts Card */}
        <div style={statCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={statLabelStyle}>Alerts</div>
              <div style={statNumberStyle}>{stats.overdueLoans + stats.maintenanceAssets}</div>
              <div style={statSubtextStyle}>
                {stats.overdueLoans} overdue, {stats.maintenanceAssets} in maintenance
              </div>
            </div>
            <div style={{ ...iconBoxStyle, backgroundColor: '#ffebee' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Equipment Status Distribution - Pie Chart */}
        <div style={chartCardStyle}>
          <h3 style={chartTitleStyle}>Equipment Status Charts</h3>
          
          {/* Simple CSS Pie Chart */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '60px',
            padding: '40px 20px'
          }}>
            {/* Pie Chart Visual */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: `conic-gradient(
                  #4caf50 0% ${availablePercent}%,
                  #2196f3 ${availablePercent}% ${availablePercent + onLoanPercent}%,
                  #ff9800 ${availablePercent + onLoanPercent}% 100%
                )`
              }}></div>
              {/* Center white circle for donut effect */}
              <div style={{
                position: 'absolute',
                top: '25%',
                left: '25%',
                width: '50%',
                height: '50%',
                backgroundColor: 'white',
                borderRadius: '50%'
              }}></div>
              {/* Percentage label */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '24px',
                fontWeight: '600',
                color: '#4caf50'
              }}>
                Available: {availablePercent}%
              </div>
            </div>

            {/* Percentage Labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {maintenancePercent > 0 && (
                <div style={{ fontSize: '18px', color: '#ff9800', fontWeight: '500' }}>
                  Maintenance: {maintenancePercent}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Equipment Status Legend */}
        <div style={chartCardStyle}>
          <h3 style={chartTitleStyle}>Equipment Status</h3>
          
          <div style={{ padding: '20px 0' }}>
            {/* Available */}
            <div style={legendItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...legendDotStyle, backgroundColor: '#4caf50' }}></div>
                <span style={legendLabelStyle}>Available</span>
              </div>
              <span style={legendValueStyle}>{stats.availableAssets}</span>
            </div>

            {/* On Loan */}
            <div style={legendItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...legendDotStyle, backgroundColor: '#2196f3' }}></div>
                <span style={legendLabelStyle}>On Loan</span>
              </div>
              <span style={legendValueStyle}>{stats.onLoanAssets}</span>
            </div>

            {/* Maintenance */}
            <div style={legendItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...legendDotStyle, backgroundColor: '#ff9800' }}></div>
                <span style={legendLabelStyle}>Maintenance</span>
              </div>
              <span style={legendValueStyle}>{stats.maintenanceAssets}</span>
            </div>
          </div>
          
        </div>
{/* Recent Activity */}
<div style={chartCardStyle}>
  <h3 style={chartTitleStyle}>Recent Activity</h3>





  <RecentActivity limit={5} />

</div>

      </div>
    </div>
    
  );
};

// Styles 
const statCardStyle = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const statLabelStyle = {
  fontSize: '14px',
  color: '#6b7280',
  marginBottom: '8px',
  fontWeight: '500'
};

const statNumberStyle = {
  fontSize: '36px',
  fontWeight: '700',
  color: '#111827',
  lineHeight: '1.2',
  marginBottom: '4px'
};

const statSubtextStyle = {
  fontSize: '13px',
  color: '#9ca3af'
};

const iconBoxStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const chartCardStyle = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const chartTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '20px',
  marginTop: '0'
};

const legendItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid #f3f4f6'
};

const legendDotStyle = {
  width: '12px',
  height: '12px',
  borderRadius: '50%'
};

const legendLabelStyle = {
  fontSize: '14px',
  color: '#374151',
  fontWeight: '500'
};

const legendValueStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827'
};

export default Dashboard;