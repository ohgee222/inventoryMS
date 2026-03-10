import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';

const MyLoanRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All'); // All, Pending, Approved, Rejected

  useEffect(() => {
    fetchMyRequests();
  }, [user.token]);

  const fetchMyRequests = async () => {
  setLoading(true);
  setError(null);
  try {
    // Add empty status parameter to avoid validation error
    const response = await fetch('http://localhost:7028/api/LoanRequests?status=null', {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error('Failed to fetch requests');
    }
    
    const data = await response.json();
    console.log('All requests:', data);
    
    // Filter to only this student's requests
    const myRequests = data.filter(r => r.userId === parseInt(user.userId, 10));
    console.log('My requests:', myRequests);
    
    setRequests(myRequests);
  } catch (error) {
    console.error('Fetch error:', error);
    setError('Failed to load requests. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const formatDate = (isoDate) => {
    return new Date(isoDate).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: { backgroundColor: '#fef3c7', color: '#92400e' },
      Approved: { backgroundColor: '#d1fae5', color: '#065f46' },
      Rejected: { backgroundColor: '#fee2e2', color: '#991b1b' }
    };
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        ...styles[status]
      }}>
        {status}
      </span>
    );
  };

  const filteredRequests = filter === 'All' 
    ? requests 
    : requests.filter(r => r.status === filter);

  if (loading) return <p>Loading your requests...</p>;

  return (
    <div>
      <h3>My Loan Requests</h3>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Track all your equipment loan requests
      </p>

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

      {/* Filter Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              border: filter === status ? '2px solid #10b981' : '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: filter === status ? '#d1fae5' : '#ffffff',
              color: filter === status ? '#065f46' : '#374151',
              fontWeight: filter === status ? '600' : '500',
              cursor: 'pointer'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={thStyle}>Asset</th>
            <th style={thStyle}>Serial No.</th>
            <th style={thStyle}>Start Date</th>
            <th style={thStyle}>End Date</th>
            <th style={thStyle}>Purpose</th>
            <th style={thStyle}>Requested On</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Rejection Reason</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ padding: '20px', textAlign: 'center' }}>
                No {filter !== 'All' ? filter.toLowerCase() : ''} requests found.
              </td>
            </tr>
          ) : (
            filteredRequests.map(req => (
              <tr key={req.id}>
                <td style={tdStyle}>{req.assetName}</td>
                <td style={tdStyle}>{req.serialNumber}</td>
                <td style={tdStyle}>{formatDate(req.requestedStartDate)}</td>
                <td style={tdStyle}>{formatDate(req.requestedEndDate)}</td>
                <td style={tdStyle}>{req.purpose}</td>
                <td style={tdStyle}>{formatDate(req.requestDate)}</td>
                <td style={tdStyle}>{getStatusBadge(req.status)}</td>
                <td style={tdStyle}>{req.rejectionReason || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  padding: '12px',
  textAlign: 'center',
  fontSize: '14px',
  fontWeight: '600'
};

const tdStyle = {
  padding: '10px',
  textAlign: 'center',
  fontSize: '14px',
  borderBottom: '1px solid #ddd'
};

export default MyLoanRequests;