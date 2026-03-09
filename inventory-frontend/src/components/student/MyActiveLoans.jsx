import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';

const MyActiveLoans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyLoans();
  }, [user.token]);

  const fetchMyLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:7028/api/Loans', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch loans');
      const data = await response.json();
      // Filter to only this student's active loans
      const myActiveLoans = data.filter(l => 
        l.userId === parseInt(user.userId, 10) && l.returnDate === null
      );
      setLoans(myActiveLoans);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load loans. Please try again.');
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

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) return <p>Loading your loans...</p>;

  return (
    <div>
      <h3>My Active Loans</h3>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Equipment you currently have on loan
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

      {loans.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
          You don't have any equipment on loan.
        </p>
      ) : (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={thStyle}>Asset</th>
              <th style={thStyle}>Serial No.</th>
              <th style={thStyle}>Check Out Date</th>
              <th style={thStyle}>Due Date</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loans.map(loan => {
              const overdue = isOverdue(loan.dueDate);
              return (
                <tr key={loan.id} style={overdue ? { backgroundColor: '#fee' } : {}}>
                  <td style={tdStyle}>{loan.assetName}</td>
                  <td style={tdStyle}>{loan.serialNumber}</td>
                  <td style={tdStyle}>{formatDate(loan.checkOutDate)}</td>
                  <td style={tdStyle}>{formatDate(loan.dueDate)}</td>
                  <td style={tdStyle}>
                    {overdue ? (
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: '#fee2e2',
                        color: '#991b1b'
                      }}>
                        OVERDUE
                      </span>
                    ) : (
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: '#d1fae5',
                        color: '#065f46'
                      }}>
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {loans.some(l => isOverdue(l.dueDate)) && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#fef3c7',
          color: '#92400e',
          borderRadius: '6px',
          border: '1px solid #fde68a'
        }}>
          ⚠️ You have overdue equipment. Please return it to the IT desk as soon as possible.
        </div>
      )}
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

export default MyActiveLoans;