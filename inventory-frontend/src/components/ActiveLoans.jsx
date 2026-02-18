import { useState, useEffect, use } from 'react';
import { useAuth } from '../auth/AuthContext';



const ActiveLoans = () => {

const { user } = useAuth();
const [loans, setLoans] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [successMessage, setSuccessMessage] = useState(null);
const [actionLoading, setActionLoading] = useState(false);
const [filterOverdue, setFilterOverdue] = useState(false); // Filter toggle


useEffect(() => {
 fetchActiveLoans();
}, [user.token]);

const fetchActiveLoans = async () => {
 setLoading(true);
 setError(null);
 try {
   const response = await fetch('http://localhost:7028/api/Loans/active', {
     headers: {
       Authorization: `Bearer ${user.token}`
     }
   });
   if (!response.ok) {
     throw new Error('Failed to fetch active loans');
   }
   const data = await response.json();
      // Filter to only active loans (returnDate is null)
      const activeOnly = data.filter(loan => loan.returnDate === null);
      setLoans(activeOnly);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load active loans. Please try again.');
    } finally {
      setLoading(false);
    }
    };

    const handleReturn = async (loanId) => {
        if(!window.confirm('Are you sure you want to mark this loan as returned?')) return
        setActionLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
          const response = await fetch(`http://localhost:7028/api/Loans/${loanId}/return`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({recievedByStaffId: user.userId}) // no return condition
          });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to return loan');
            }
            const result = await response.json();
            console.log('Return success: ', result);

            setSuccessMessage(`Equipment returned successfully. ${result.overdueDays > 0 ? `Was ${result.overdueDays} days overdue.` : ''}`);    
            await fetchActiveLoans(); }// Refresh the list after returning
        catch (error) {
                console.error('Return error:', error);
                setError(error.message || 'Failed to process return ');
        }finally {
                setActionLoading(false);
            }
        };
        const isOverdue=(dueDate) => {
            return new Date(dueDate) < new Date();
        };
        const formatDate =(isoDate) => {
            return new Date(isoDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        };
        const formatDateTime =(isoDate) => {
            return new Date(isoDate).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };
        //apply filter
                const displayedLoans = filterOverdue 
            ? loans.filter(loan => isOverdue(loan.dueDate))
            : loans;

        if (loading) return <p>Loading active loans...</p>;

     return (
    <div>
      <h3>Active Loans</h3>

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

      {/* Controls */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={fetchActiveLoans} disabled={loading}>
          Refresh
        </button>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="checkbox"
            checked={filterOverdue}
            onChange={(e) => setFilterOverdue(e.target.checked)}
          />
          Show Overdue Only
        </label>

        <span style={{ marginLeft: '10px', color: '#666' }}>
          {filterOverdue 
            ? `${displayedLoans.length} overdue loan(s)`
            : `${loans.length} active loan(s)`}
        </span>
      </div>

      {/* Loans Table */}
      {displayedLoans.length === 0 ? (
        <p>{filterOverdue ? 'No overdue loans.' : 'No active loans.'}</p>
      ) : (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={thStyle}>Asset</th>
              <th style={thStyle}>Serial No.</th>
              <th style={thStyle}>Borrowed By</th>
              <th style={thStyle}>University ID</th>
              <th style={thStyle}>Check Out Date</th>
              <th style={thStyle}>Due Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedLoans.map(loan => {
              const overdueStatus = isOverdue(loan.dueDate);
              const rowStyle = overdueStatus 
                ? { ...tdStyle, backgroundColor: '#ffebee' }  // Light red for overdue
                : tdStyle;

              return (
                <tr key={loan.id}>
                  <td style={rowStyle}>{loan.assetName}</td>
                  <td style={rowStyle}>{loan.serialNumber || 'N/A'}</td>
                  <td style={rowStyle}>{loan.userName}</td>
                  <td style={rowStyle}>{loan.userUniversityId}</td>
                  <td style={rowStyle}>{formatDateTime(loan.checkOutDate)}</td>
                  <td style={rowStyle}>{formatDate(loan.dueDate)}</td>
                  <td style={rowStyle}>
                    {overdueStatus ? (
                      <span style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        OVERDUE
                      </span>
                    ) : (
                      <span style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        Active
                      </span>
                    )}
                  </td>
                  <td style={rowStyle}>
                    <button
                      onClick={() => handleReturn(loan.id)}
                      disabled={actionLoading}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '5px 12px',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      Return
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

export default ActiveLoans;