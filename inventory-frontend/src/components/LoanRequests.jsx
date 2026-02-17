import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';


const LoanRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, [user.token]);

  const fetchPendingRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:7028/api/LoanRequests?status=pending', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch loan requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load loan requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this loan request?')) return;

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`http://localhost:7028/api/LoanRequests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ staffId: user.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve request');
      }

      setSuccessMessage('Loan request approved. Loan has been created successfully.');
      await fetchPendingRequests();
    } catch (error) {
      console.error('Approve error:', error);
      setError(error.message || 'Failed to approve request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`http://localhost:7028/api/LoanRequests/${selectedRequest.id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          staffId: user.id,
          rejectionReason: rejectionReason.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject request');
      }

      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      setSuccessMessage('Loan request rejected successfully.');
      await fetchPendingRequests();
    } catch (error) {
      console.error('Reject error:', error);
      setError(error.message || 'Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const formatDate = (isoDate) => {
    return new Date(isoDate).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <p>Loading loan requests...</p>;

  return (
    <div>
      <h3>Pending Loan Requests</h3>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '10px 15px',
          borderRadius: '4px',
          marginBottom: '15px',
          border: '1px solid #c3e6cb'
        }}>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px 15px',
          borderRadius: '4px',
          marginBottom: '15px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      <button
        onClick={fetchPendingRequests}
        disabled={loading}
        style={{ marginBottom: '15px' }}
      >
        Refresh
      </button>

      {/* Requests Table */}
      {requests.length === 0 ? (
        <p>No pending loan requests.</p>
      ) : (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}> {/* Added table for better presentattion  */}
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={thStyle}>Student</th>
              <th style={thStyle}>University ID</th>
              <th style={thStyle}>Asset</th>
              <th style={thStyle}>Serial No.</th>
              <th style={thStyle}>Start Date</th>
              <th style={thStyle}>End Date</th>
              <th style={thStyle}>Purpose</th>
              <th style={thStyle}>Requested On</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request.id}>
                <td style={tdStyle}>{request.userName}</td>
                <td style={tdStyle}>{request.universityId}</td>
                <td style={tdStyle}>{request.assetName}</td>
                <td style={tdStyle}>{request.serialNumber || 'N/A'}</td>
                <td style={tdStyle}>{formatDate(request.requestedStartDate)}</td>
                <td style={tdStyle}>{formatDate(request.requestedEndDate)}</td>
                <td style={tdStyle}>{request.purpose || 'N/A'}</td>
                <td style={tdStyle}>{formatDate(request.requestDate)}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={actionLoading}
                    style={{
                      marginRight: '8px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      borderRadius: '4px'
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectClick(request)}
                    disabled={actionLoading}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      borderRadius: '4px'
                    }}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '450px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h4 style={{ marginTop: 0 }}>Reject Loan Request</h4>

            <p><strong>Student:</strong> {selectedRequest.userName}</p>
            <p><strong>Asset:</strong> {selectedRequest.assetName}</p>
            <p>
              <strong>Period:</strong> {formatDate(selectedRequest.requestedStartDate)} → {formatDate(selectedRequest.requestedEndDate)}
            </p>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                <strong>Rejection Reason:</strong>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={4}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={handleRejectCancel}
                disabled={actionLoading}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading || !rejectionReason.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: actionLoading || !rejectionReason.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const thStyle = {
  padding: '10px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd'
};

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #ddd'
};

export default LoanRequests;