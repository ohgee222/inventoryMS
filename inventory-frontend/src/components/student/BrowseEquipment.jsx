import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';

const BrowseEquipment = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestStartDate, setRequestStartDate] = useState('');
  const [requestEndDate, setRequestEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
   const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchAvailableAssets();
  }, [user.token]);

  const fetchAvailableAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:7028/api/Assets', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch assets');
      const data = await response.json();
      // Filter to only available assets
      const available = data.filter(a => a.status === 0);
      setAssets(available);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClick = (asset) => {
    setSelectedAsset(asset);
    setShowRequestForm(true);
    setRequestStartDate('');
    setRequestEndDate('');
    setPurpose('');
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:7028/api/LoanRequests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: parseInt(user.userId, 10),
          assetId: selectedAsset.id,
          requestedStartDate: requestStartDate,
          requestedEndDate: requestEndDate,
          purpose: purpose
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create request');
      }

      setSuccessMessage(`Request submitted successfully for ${selectedAsset.name}!`);
      setShowRequestForm(false);
      setSelectedAsset(null);
      await fetchAvailableAssets(); // Refresh list
    } catch (error) {
      console.error('Request error:', error);
      setError(error.message || 'Failed to submit request.');
    }
  };

  if (loading) return <p>Loading equipment...</p>;
  const filteredAssets = assets.filter(asset =>
  asset.name.toLowerCase().includes(searchTerm.toLowerCase())
);


  return (
    <div>
      <h3>Available Equipment</h3>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Browse and request equipment for loan
      </p>

      {/* SEARCH BAR */}
    <div style={{ marginBottom: '25px' }}>
      <input
        type="text"
        placeholder="🔍 Search equipment by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '10px 14px',
          borderRadius: '6px',
          border: '1px solid #d1d5db',
          fontSize: '14px'
        }}
      />
    </div>

      {successMessage && (
        <div style={{
          backgroundColor: '#d1fae5',
          color: '#065f46',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #a7f3d0'
        }}>
          {successMessage}
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}
      

      {/* Request Form Modal */}
      {showRequestForm && selectedAsset && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
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
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
         
            <h4>Request: {selectedAsset.name}</h4>
            <form onSubmit={handleSubmitRequest}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Start Date:
                </label>
                
               
                <input
                
                  type="date"
                  value={requestStartDate}
                  onChange={(e) => setRequestStartDate(e.target.value)}
                  min={today}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  End Date:
                </label>
                <input
                  type="date"
                  value={requestEndDate}
                  onChange={(e) => setRequestEndDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Purpose:
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Why do you need this equipment?"
                  rows={4}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowRequestForm(false); setSelectedAsset(null); }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Grid */}
     {filteredAssets.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
          No equipment currently available.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredAssets.map(asset => (
            <div key={asset.id} style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#111827' }}>
                {asset.name}
              </h4>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#6b7280' }}>
                <strong>Serial:</strong> {asset.serialNumber}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#6b7280' }}>
                <strong>Category:</strong> {asset.category?.name || 'Uncategorised'}
              </p>
              <p style={{ margin: '5px 0 15px 0', fontSize: '14px', color: '#6b7280' }}>
                <strong>Description:</strong> {asset.description || 'No description'}
              </p>
              <button
                onClick={() => handleRequestClick(asset)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Request This Equipment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseEquipment;