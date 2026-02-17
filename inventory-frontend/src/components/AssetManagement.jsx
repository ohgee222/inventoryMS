import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import AssetForm from './AssetForm';


/*
TO DO;
RESTRICT ACCESS TO STAFF/ADMIN ONLY
RESTRIC EDIT/DELETE TO ADMIN ONLY (STUDENTS AND STAFF CAN VIEW ONLY)

*/
const AssetManagement = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [error, setError] = useState(null);
  
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
        headers: {
          Authorization: `Bearer ${user.token}`
        }
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
    
    // SEE WHAT YOU'RE SENDING
    console.log('Sending asset data:', assetData);
    console.log('Stringified:', JSON.stringify(assetData));
    
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
            console.error('API Error Response:', errorData);
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
  
  console.log('UPDATE - Asset ID:', id);
  console.log('UPDATE - Sending data:', assetData);
  console.log('UPDATE - Stringified:', JSON.stringify(assetData));
  
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
      const errorData = await response.json();
      console.error('UPDATE - API Error:', errorData);
      throw new Error('Failed to update asset');
    }
    // 
    // Attempt to parse JSON but tolerate empty/no-body responses.
    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const result = await response.json();
        console.log('UPDATE - API Response:', result);
      } else {
        console.log('UPDATE - No JSON response (status:', response.status, ')');
      }
    } catch (err) {
      console.log('UPDATE - Ignoring response parse error:', err);
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
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
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
    <div>
      <h3>Assets</h3>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      
      <button onClick={() => setShowCreateForm(true)}>Add New Asset</button>

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

      <table border="1">
        <thead>
  <tr>
    <th>Name</th>
    <th>Serial</th>
    <th>Category</th>
    <th>Status</th>  {/* ← Changed from "Available" */}
    <th>Condition</th>  {/* ← Added */}
    <th>Actions</th>
  </tr>
</thead>
<tbody>
  {assets.length === 0 ? (
    <tr>
      <td colSpan="6" style={{ textAlign: 'center' }}>  {/* ← Changed from 5 to 6 */}
        No assets found. Add one to get started.
      </td>
    </tr>
  ) : (
    assets.map(asset => (
      <tr key={asset.id}>
        <td>{asset.name}</td>
        <td>{asset.serialNumber}</td>
        <td>{asset.category?.name ?? 'Uncategorised'}</td>
        <td>{getStatusLabel(asset.status)}</td>  {/* ← Changed */}
        <td>{getConditionLabel(asset.physicalCondition)}</td>  {/* ← Added */}
        <td>
          <button onClick={() => setEditingAsset(asset)}>Edit</button>
          <button onClick={() => handleDelete(asset.id)}>Delete</button>
        </td>
      </tr>
    ))
  )}
</tbody>
      </table>
    </div>
  );
};

export default AssetManagement;