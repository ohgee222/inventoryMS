import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

const AssetForm = ({ asset, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: asset?.name || '',
    serialNumber: asset?.serialNumber || '',
    categoryId: asset?.categoryId || '',
    description: asset?.description || '',
    physicalCondition: asset?.physicalCondition ?? 0,
    purchaseDate: asset?.purchaseDate || '',
    purchasePrice: asset?.purchasePrice || 0,
    notes: asset?.notes || '',
    status: asset?.status ?? 0
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [user.token]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:7028/api/Categories', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
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
    
    const submitData = {
      name: formData.name,
      serialNumber: formData.serialNumber,
      categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
      description: formData.description,
      // Ensure the backend fields match: send numeric enums for condition and status
      physicalCondition: parseInt(formData.physicalCondition, 10) || 0,
      status: parseInt(formData.status, 10) || 0,
      purchaseDate: formData.purchaseDate || null,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      notes: formData.notes
    };
    
    onSubmit(submitData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  if (loading) return <p>Loading form...</p>;

  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '20px', 
      marginBottom: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h4>{asset ? 'Edit Asset' : 'Create New Asset'}</h4>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ marginLeft: '10px', width: '200px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            Serial Number:
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              required
              style={{ marginLeft: '10px', width: '200px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            Category:
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              style={{ marginLeft: '10px', width: '200px' }}
            >
              <option value="">-- Select Category --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            Description:
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ marginLeft: '10px', width: '200px' }}
            />
          </label>
        </div>

       <div style={{ marginBottom: '10px' }}>
  <label>
    Physical Condition:
    <select
      name="physicalCondition"
      value={formData.physicalCondition}
      onChange={handleChange}
      style={{ marginLeft: '10px', width: '200px' }}
    >
      <option value="0">Good</option>
      <option value="1">Fair</option>
      <option value="2">Poor</option>
      <option value="3">In Repair</option>
      <option value="4">Retired</option>
    </select>
  </label>
</div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            Purchase Date:
            <input
              type="datetime-local"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              style={{ marginLeft: '10px', width: '200px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            Purchase Price:
            <input
              type="number"
              step="0.01"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              style={{ marginLeft: '10px', width: '200px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            Notes:
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              style={{ marginLeft: '10px', width: '200px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
  <label>
        Status:
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          style={{ marginLeft: '10px', width: '200px' }}
        >
          <option value="0">Available</option>
          <option value="1">Checked Out</option>
          <option value="2">Reserved</option>
        </select>
      </label>
    </div>

        <div>
          <button type="submit" style={{ marginRight: '10px' }}>
            {asset ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;