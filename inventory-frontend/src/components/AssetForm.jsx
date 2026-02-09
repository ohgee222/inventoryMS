import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

const AssetForm = ({ asset, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: asset?.name || '',
    serialNumber: asset?.serialNumber || '',
    categoryId: asset?.categoryId || '',
    isAvailable: asset?.isAvailable ?? true
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
    
    // Convert categoryId to number if it exists
    const submitData = {
      ...formData,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null
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
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
            />
            Available
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