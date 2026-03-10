import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

const CategoryManagement = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, [user.token]);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:7028/api/Categories', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:7028/api/Categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create category');
      
      await fetchCategories();
      setShowCreateForm(false);
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Create error:', error);
      setError('Failed to create category.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:7028/api/Categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update category');
      
      await fetchCategories();
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Update error:', error);
      setError('Failed to update category.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This may affect existing assets.')) return;
    
    try {
      const response = await fetch(`http://localhost:7028/api/Categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      if (!response.ok) throw new Error('Failed to delete category');
      await fetchCategories();
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete category.');
    }
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
  };

  if (loading) return <p>Loading categories...</p>;

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Category Management</h3>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <button onClick={() => setShowCreateForm(true)} style={{ padding: '8px 16px', marginBottom: '15px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Add New Category
      </button>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
          <h4>Create Category</h4>
          <input
            type="text"
            placeholder="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <button type="submit" style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create</button>
          <button type="button" onClick={() => setShowCreateForm(false)} style={{ padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
        </form>
      )}

      {/* Edit Form */}
      {editingCategory && (
        <form onSubmit={handleUpdate} style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', backgroundColor: '#fff3cd' }}>
          <h4>Edit Category</h4>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <button type="submit" style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Update</button>
          <button type="button" onClick={() => setEditingCategory(null)} style={{ padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
        </form>
      )}

      {/* Categories Table */}
      <table border="1" style={{ margin: '0 auto', borderCollapse: 'collapse', width: '100%', maxWidth: '800px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '12px' }}>Name</th>
            <th style={{ padding: '12px' }}>Description</th>
            <th style={{ padding: '12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr><td colSpan="3" style={{ padding: '20px' }}>No categories found.</td></tr>
          ) : (
            categories.map(cat => (
              <tr key={cat.id}>
                <td style={{ padding: '10px' }}>{cat.name}</td>
                <td style={{ padding: '10px' }}>{cat.description || '-'}</td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => startEdit(cat)} style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(cat.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryManagement;