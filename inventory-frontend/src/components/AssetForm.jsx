import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

const AssetForm = ({ asset, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: asset?.name || '',
    serialNumber: asset?.serialNumber || '',
    categoryId: asset?.categoryId || '',
    description: asset?.description || '',
    purchaseDate: asset?.purchaseDate || '',
    purchasePrice: asset?.purchasePrice || 0,
    // Only include these for EDIT, not CREATE
    ...(asset && {
      physicalCondition: asset.physicalCondition ?? 0,
      status: asset.status ?? 0
    })
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [user.token]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:7028/api/Categories', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (asset) {
      // EDIT - send everything including status/condition
      const submitData = {
        name: formData.name,
        serialNumber: formData.serialNumber,
        categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
        description: formData.description,
        physicalCondition: parseInt(formData.physicalCondition, 10) || 0,
        status: parseInt(formData.status, 10) || 0,
        purchaseDate: formData.purchaseDate || null,
        purchasePrice: parseFloat(formData.purchasePrice) || 0
      };
      onSubmit(submitData);
    } else {
      // CREATE - only send what backend accepts
      const submitData = {
        name: formData.name,
        serialNumber: formData.serialNumber,
        categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
        description: formData.description,
        itemCondition: "Good", // Backend needs this
        purchaseDate: formData.purchaseDate || null,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        notes: "" // Backend needs this
      };
      onSubmit(submitData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  if (loading) return <p>Loading form...</p>;

  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '20px', 
      marginBottom: '20px',
      backgroundColor: '#f9f9f9',
      maxWidth: '600px',
      margin: '0 auto 20px auto'
    }}>
      <h4 style={{ textAlign: 'center' }}>{asset ? 'Edit Asset' : 'Create New Asset'}</h4>
      <form onSubmit={handleSubmit}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>Name:</td>
              <td style={{ padding: '8px' }}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '6px' }}
                />
              </td>
            </tr>

            <tr>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>Serial Number:</td>
              <td style={{ padding: '8px' }}>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '6px' }}
                />
              </td>
            </tr>

            <tr>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>Category:</td>
              <td style={{ padding: '8px' }}>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '6px' }}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>

            <tr>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>Description:</td>
              <td style={{ padding: '8px' }}>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '6px' }}
                />
              </td>
            </tr>

            {/* Only show status and condition for EDIT */}
            {asset && (
              <>
                <tr>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>Physical Condition:</td>
                  <td style={{ padding: '8px' }}>
                    <select
                      name="physicalCondition"
                      value={formData.physicalCondition}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '6px' }}
                    >
                      <option value="0">Good</option>
                      <option value="1">Fair</option>
                      <option value="2">Poor</option>
                      <option value="3">In Repair</option>
                      <option value="4">Retired</option>
                    </select>
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>Status:</td>
                  <td style={{ padding: '8px' }}>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '6px' }}
                    >
                      <option value="0">Available</option>
                      <option value="1">Checked Out</option>
                      <option value="2">Reserved</option>
                    </select>
                  </td>
                </tr>
              </>
            )}

            <tr>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>Purchase Date:</td>
              <td style={{ padding: '8px' }}>
                <input
                  type="datetime-local"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '6px' }}
                />
              </td>
            </tr>

            <tr>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>Purchase Price:</td>
              <td style={{ padding: '8px' }}>
                <input
                  type="number"
                  step="0.01"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '6px' }}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button type="submit" style={{ 
            marginRight: '10px',
            padding: '8px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            {asset ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={onCancel} style={{
            padding: '8px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;