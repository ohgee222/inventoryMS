import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

const RecentActivity = ({ limit = 20 }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  fetchActivities();
}, [user.token, limit]);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:7028/api/ActivityLogs?limit=${limit}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch activities');

      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load recent activity.');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'LoanApproved':
        return { color: '#10b981', icon: '✓' };
      case 'LoanRejected':
        return { color: '#ef4444', icon: '✗' };
      case 'EquipmentReturned':
        return { color: '#3b82f6', icon: '↩' };
      case 'EquipmentAdded':
        return { color: '#8b5cf6', icon: '+' };
      case 'UserRegistered':
        return { color: '#f59e0b', icon: '👤' };
      case 'LoanRequest':
        return { color: '#06b6d4', icon: '📝' };
      default:
        return { color: '#6b7280', icon: '•' };
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) return <p>Loading activity...</p>;

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Recent Activity</h3>

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

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {activities.length === 0 ? (
          <div style={{ padding: '40px', color: '#6b7280' }}>
            No recent activity
          </div>
        ) : (
          <div>
            {activities.map((activity) => {
              const { color, icon } = getActivityIcon(activity.activityType);
              
              return (
                <div
                  key={activity.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: `${color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    <span style={{ color }}>{icon}</span>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#111827',
                      marginBottom: '4px'
                    }}>
                      {activity.description}
                    </div>
                    {activity.userName && (
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        by {activity.userName}
                      </div>
                    )}
                  </div>

                  {/* Time */}
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

export default RecentActivity;