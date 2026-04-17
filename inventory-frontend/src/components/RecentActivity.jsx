import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext'; 

// Functional component to display recent activity
const RecentActivity = ({ limit = 100 }) => {
  const { user } = useAuth(); // Get authenticated user (includes token)
  const [activities, setActivities] = useState([]); // Store fetched activities
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track error state

  // Fetch activities when component mounts or when user token / limit changes
  useEffect(() => {
    fetchActivities();
  }, [user.token, limit]);

  // Function to fetch activity data from API
  const fetchActivities = async () => {
    setLoading(true); // Start loading
    setError(null); // Reset error
    try {
      const response = await fetch(`http://localhost:7028/api/ActivityLogs?limit=${limit}`, {
        headers: { Authorization: `Bearer ${user.token}` } // Attach auth token
      });

      if (!response.ok) throw new Error('Failed to fetch activities'); // Handle bad response

      const data = await response.json(); // Parse JSON response
      setActivities(data); // Store activities in state
    } catch (error) {
      console.error('Fetch error:', error); // Log error
      setError('Failed to load recent activity.'); // Set error message
    } finally {
      setLoading(false); // Stop loading regardless of success/failure
    }
  };

  // Determine icon and color based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'LoanApproved':
        return { color: '#10b981', icon: '✓' }; // Green check
      case 'LoanRejected':
        return { color: '#ef4444', icon: '✗' }; // Red cross
      case 'EquipmentReturned':
        return { color: '#3b82f6', icon: '↩' }; // Blue return arrow
      case 'EquipmentAdded':
        return { color: '#8b5cf6', icon: '+' }; // Purple plus
      case 'UserRegistered':
        return { color: '#f59e0b', icon: '👤' }; // Orange user icon
      case 'LoanRequest':
        return { color: '#06b6d4', icon: '📝' }; // Cyan request icon
      case 'UserApproved':
        return { color: '#10b981', icon: '✓' }; // Green check
      case 'UserRejected':
        return { color: '#ef4444', icon: '✗' }; // Red cross
      default:
        return { color: '#6b7280', icon: '•' }; // Default grey dot
    }
  };

  // Convert timestamp into "time ago" format
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString); // Convert string to Date
    const now = new Date(); // Current time
    const seconds = Math.floor((now - date) / 1000); // Difference in seconds

    if (seconds < 60) return 'Just now'; // Less than 1 minute
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`; 
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`; 
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`; 
    return date.toLocaleDateString(); // Fallback to date
  };

  // Show loading message while fetching data
  if (loading) return <p>Loading activity...</p>;

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Recent Activity</h3>

      {/* Display error message if exists */}
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Container for activity list */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Show message if no activity */}
        {activities.length === 0 ? (
          <div style={{ padding: '40px', color: '#6b7280' }}>
            No recent activity
          </div>
        ) : (
          <div>
            {/* Loop through activities */}
            {activities.map((activity) => {
              const { color, icon } = getActivityIcon(activity.activityType); // Get icon config
              
              return (
                <div
                  key={activity.id} // Unique key for React list
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background-color 0.2s'
                  }}
                  // Highlight row on hover
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Icon section */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: `${color}20`, // Light background
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    <span style={{ color }}>{icon}</span>
                  </div>

                  {/* Activity description */}
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#111827',
                      marginBottom: '4px'
                    }}>
                      {activity.description}
                    </div>

                    {/* Show username if available */}
                    {activity.userName && (
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        by {activity.userName}
                      </div>
                    )}
                  </div>

                  {/* Time display */}
                  <div style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    whiteSpace: 'nowrap'
                  }}>
                    {formatTimeAgo(activity.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity; // Export component for use elsewhere