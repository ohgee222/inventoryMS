const API_URL = 'http://localhost:7028/api'; 

export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      // Try to get error message from backend
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Invalid credentials');
    }

    const data = await response.json();
    return data; // Should return { token, userId, role, etc }
  },

  register: async (userData) => {
    const response = await fetch(`${API_URL}/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  },
};