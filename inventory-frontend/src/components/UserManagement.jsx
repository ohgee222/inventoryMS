import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [user.token]);

  useEffect(() => {
    applyFilters();
  }, [users, roleFilter, searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:7028/api/Users', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setApprovingId(userId);
    try {
      const response = await fetch(`http://localhost:7028/api/Auth/approve/${userId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error('Failed to approve user');
      // Update locally without refetching
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: true } : u));
    } catch (error) {
      console.error('Approve error:', error);
      setError('Failed to approve user. Please try again.');
    } finally {
      setApprovingId(null);
    }
  };
  const handleReject = async (userId) => {
  setApprovingId(userId);
  try {
    const response = await fetch(`http://localhost:7028/api/Users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.token}` }
    });
    if (!response.ok) throw new Error('Failed to reject user');
    setUsers(prev => prev.filter(u => u.id !== userId));
  } catch (error) {
    console.error('Reject error:', error);
    setError('Failed to reject user. Please try again.');
  } finally {
    setApprovingId(null);
  }
};

  const applyFilters = () => {
    let filtered = users.filter(u => u.isActive); // only active in main table

    if (roleFilter !== 'All') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.fullName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.universityId.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const pendingUsers = users.filter(u => !u.isActive);
  const totalUsers = users.filter(u => u.isActive).length;
  const studentCount = users.filter(u => u.role === 'Student' && u.isActive).length;
  const staffCount = users.filter(u => u.role === 'Staff' && u.isActive).length;
  const adminCount = users.filter(u => u.role === 'Admin' && u.isActive).length;

  const getRoleBadgeStyle = (role) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'inline-block'
    };
    switch (role) {
      case 'Admin': return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'Staff': return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'Student': return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
      default: return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading users...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>User Management</h2>
        <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
          {totalUsers} active users
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee', color: '#c33',
          padding: '12px 16px', borderRadius: '8px',
          marginBottom: '24px', border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #2d2b22',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px',
          marginTop: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6f5e4c" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              Pending Approvals ({pendingUsers.length})
            </h3>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000000' }}>
                <th style={{ ...tableHeaderStyle, color: '#111827' }}>User</th>
                <th style={{ ...tableHeaderStyle, color: '#111827' }}>Email</th>
                <th style={{ ...tableHeaderStyle, color: '#111827' }}>Role</th>
                <th style={{ ...tableHeaderStyle, color: '#111827' }}>Department</th>
                <th style={{ ...tableHeaderStyle, color: '#111827' }}>University ID</th>
                <th style={{ ...tableHeaderStyle, color: '#111827' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #fef3c7' }}>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        backgroundColor: '#dfdbcf',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: '600', color: '#111827'
                      }}>
                        {u.fname.charAt(0)}{u.lname.charAt(0)}
                      </div>
                      <div style={{ fontWeight: '500', color: '#111827' }}>{u.fullName}</div>
                    </div>
                  </td>
                  <td style={tableCellStyle}>{u.email}</td>
                  <td style={tableCellStyle}>
                    <span style={getRoleBadgeStyle(u.role)}>{u.role}</span>
                  </td>
                  <td style={tableCellStyle}>{u.department}</td>
                  <td style={tableCellStyle}>
                    <span style={{ fontFamily: 'monospace', color: '#6b7280' }}>{u.universityId}</span>
                  </td>
                 <td style={tableCellStyle}>
  <div style={{ display: 'flex', gap: '8px' }}>
    <button
      onClick={() => handleApprove(u.id)}
      disabled={approvingId === u.id}
      style={{
        padding: '8px 16px',
        backgroundColor: approvingId === u.id ? '#d1fae5' : '#059669',
        color: 'white', border: 'none', borderRadius: '6px',
        fontSize: '13px', fontWeight: '600',
        cursor: approvingId === u.id ? 'not-allowed' : 'pointer',
      }}
    >
      {approvingId === u.id ? 'Approving...' : 'Approve'}
    </button>
    <button
      onClick={() => handleReject(u.id)}
      disabled={approvingId === u.id}
      style={{
        padding: '8px 16px',
        backgroundColor: '#fee2e2',
        color: '#991b1b', border: 'none', borderRadius: '6px',
        fontSize: '13px', fontWeight: '600',
        cursor: approvingId === u.id ? 'not-allowed' : 'pointer',
      }}
    >
      Reject
    </button>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={statCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={statLabelStyle}>Total Users</div>
              <div style={statNumberStyle}>{totalUsers}</div>
              <div style={statSubtextStyle}>Active accounts</div>
            </div>
            <div style={{ ...iconBoxStyle, backgroundColor: '#f0f0f0' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={statLabelStyle}>Students</div>
              <div style={statNumberStyle}>{studentCount}</div>
              <div style={statSubtextStyle}>Student accounts</div>
            </div>
            <div style={{ ...iconBoxStyle, backgroundColor: '#d1fae5' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={statLabelStyle}>Staff</div>
              <div style={statNumberStyle}>{staffCount}</div>
              <div style={statSubtextStyle}>Staff accounts</div>
            </div>
            <div style={{ ...iconBoxStyle, backgroundColor: '#dbeafe' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={statLabelStyle}>Admins</div>
              <div style={statNumberStyle}>{adminCount}</div>
              <div style={statSubtextStyle}>Admin accounts</div>
            </div>
            <div style={{ ...iconBoxStyle, backgroundColor: '#fef3c7' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#ffffff', padding: '20px',
        borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'Admin', 'Staff', 'Student'].map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                style={{
                  padding: '8px 16px',
                  border: roleFilter === role ? '2px solid #2563eb' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: roleFilter === role ? '#eff6ff' : '#ffffff',
                  color: roleFilter === role ? '#2563eb' : '#374151',
                  fontWeight: roleFilter === role ? '600' : '500',
                  fontSize: '14px', cursor: 'pointer'
                }}
              >
                {role}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px',
                border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px'
              }}
            />
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
            Showing {filteredUsers.length} of {totalUsers} users
          </div>
        </div>
      </div>

      {/* Active Users Table */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '12px',
        border: '1px solid #e5e7eb', overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={tableHeaderStyle}>User</th>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Role</th>
              <th style={tableHeaderStyle}>Department</th>
              <th style={tableHeaderStyle}>University ID</th>
              <th style={tableHeaderStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                  No users found matching your criteria
                </td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        backgroundColor: '#e5e7eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: '600', color: '#374151'
                      }}>
                        {u.fname.charAt(0)}{u.lname.charAt(0)}
                      </div>
                      <div style={{ fontWeight: '500', color: '#111827' }}>{u.fullName}</div>
                    </div>
                  </td>
                  <td style={tableCellStyle}>{u.email}</td>
                  <td style={tableCellStyle}>
                    <span style={getRoleBadgeStyle(u.role)}>{u.role}</span>
                  </td>
                  <td style={tableCellStyle}>{u.department}</td>
                  <td style={tableCellStyle}>
                    <span style={{ fontFamily: 'monospace', color: '#6b7280' }}>{u.universityId}</span>
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '12px',
                      fontSize: '12px', fontWeight: '600',
                      backgroundColor: '#d1fae5', color: '#065f46'
                    }}>
                      Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const statCardStyle = {
  backgroundColor: '#ffffff', padding: '24px',
  borderRadius: '12px', border: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};
const statLabelStyle = { fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' };
const statNumberStyle = { fontSize: '36px', fontWeight: '700', color: '#111827', lineHeight: '1.2', marginBottom: '4px' };
const statSubtextStyle = { fontSize: '13px', color: '#9ca3af' };
const iconBoxStyle = { width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const tableHeaderStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tableCellStyle = { padding: '16px', fontSize: '14px' };

export default UserManagement;