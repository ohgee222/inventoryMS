import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import AssetForm from './AssetForm';

const AssetManagement = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [error, setError] = useState(null);

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
        throw new Error('Failed to create asset');
      }
      
      await fetchAssets();
      setShowCreateForm(false);
    } catch (error) {
      console.error(error);
      setError('Failed to create asset. Please try again.');
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
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>
                No assets found. Add one to get started.
              </td>
            </tr>
          ) : (
            assets.map(asset => (
              <tr key={asset.id}>
                <td>{asset.name}</td>
                <td>{asset.serialNumber}</td>
                <td>{asset.category?.name ?? 'Uncategorised'}</td>
                <td>{asset.isAvailable ? 'Yes' : 'No'}</td>
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