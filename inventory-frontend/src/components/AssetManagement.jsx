import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import AssetForm from './AssetForm';
import CategoryManagement from './CategoryManagement';

const AssetManagement = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [error, setError] = useState(null);
  
  const isAdmin = user?.role === 'Admin';
  
  const getStatusLabel = (status) => {
    const labels = ['Available', 'Checked Out', 'Reserved'];
    return labels[status] || 'Unknown';
  };

  const getConditionLabel = (condition) => {
    const labels = ['Good', 'Fair', 'Poor', 'In Repair', 'Retired'];
    return labels[condition] || 'Unknown';
  };

  useEffect(() => {
    fetchAssets();
  }, [user.token]);

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:7028/api/Assets', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error(error);
      setError('Failed to load assets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (assetData) => {
    setError(null);
    try {
      const response = await fetch('http://localhost:7028/api/Assets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assetData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || JSON.stringify(errorData));
      }

      await fetchAssets();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Create asset error:', error);
      setError(error.message || 'Failed to create asset');
    }
  };

  const handleUpdate = async (id, assetData) => {
    setError(null);
    try {
      const response = await fetch(`http://localhost:7028/api/Assets/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assetData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update asset');
      }

      await fetchAssets();
      setEditingAsset(null);
    } catch (error) {
      console.error(error);
      setError('Failed to update asset. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) {
      return;
    }
    
    setError(null);
    try {
      const response = await fetch(`http://localhost:7028/api/Assets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }
      
      await fetchAssets();
    } catch (error) {
      console.error(error);
      setError('Failed to delete asset. Please try again.');
    }
  };

  if (loading) return <p>Loading assets...</p>;

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Assets</h3>
      
      {error && (
        <div style={{ 
          color: 'red', 
          marginBottom: '10px',
          padding: '10px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      {/* Button Group */}
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: '#2b2b2b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Add New Asset
        </button>
        
        {isAdmin && (
          <button 
            onClick={() => setShowCategoryManagement(!showCategoryManagement)}
            style={{
              padding: '8px 16px',
              backgroundColor: showCategoryManagement ? '#6b7280' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {showCategoryManagement ? 'Hide Categories' : 'Manage Categories'}
          </button>
        )}
      </div>

      {/* Category Management Section */}
      {showCategoryManagement && isAdmin && (
        <div style={{
          border: '2px solid #10b981',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px',
          backgroundColor: '#f5f5f5'
        }}>
          <CategoryManagement />
        </div>
      )}

      {/* Asset Forms */}
      {showCreateForm && (
        <AssetForm 
          onSubmit={handleCreate} 
          onCancel={() => setShowCreateForm(false)} 
        />
      )}

      {editingAsset && (
        <AssetForm 
          asset={editingAsset}
          onSubmit={(data) => handleUpdate(editingAsset.id, data)} 
          onCancel={() => setEditingAsset(null)} 
        />
      )}

      {/* Assets Table */}
      <table border="1" style={{ 
        margin: '0 auto',
        borderCollapse: 'collapse',
        width: '100%',
        maxWidth: '1200px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={tableHeaderStyle}>Name</th>
            <th style={tableHeaderStyle}>Serial</th>
            <th style={tableHeaderStyle}>Category</th>
            <th style={tableHeaderStyle}>Status</th>
            <th style={tableHeaderStyle}>Condition</th>
            <th style={tableHeaderStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>
                No assets found. Add one to get started.
              </td>
            </tr>
          ) : (
            assets.map(asset => (
              <tr key={asset.id}>
                <td style={tableCellStyle}>{asset.name}</td>
                <td style={tableCellStyle}>{asset.serialNumber}</td>
                <td style={tableCellStyle}>{asset.category?.name ?? 'Uncategorised'}</td>
                <td style={tableCellStyle}>{getStatusLabel(asset.status)}</td>
                <td style={tableCellStyle}>{getConditionLabel(asset.physicalCondition)}</td>
                <td style={tableCellStyle}>
                  <button 
                    onClick={() => setEditingAsset(asset)}
                    style={{
                      padding: '6px 12px',
                      marginRight: '8px',
                      backgroundColor: '#2b2b2b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(asset.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'center',
  fontSize: '14px',
  fontWeight: '600',
  backgroundColor: '#f5f5f5'
};

const tableCellStyle = {
  padding: '10px',
  textAlign: 'center',
  fontSize: '14px',
  borderBottom: '1px solid #ddd'
};

export default AssetManagement;