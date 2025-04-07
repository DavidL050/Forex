export const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Token validation failed');
      }
  
      const data = await response.json();
      return data.isValid;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  };
  
  // You might want to add other auth-related functions here, such as:
  export const login = async (credentials) => {
    // Login implementation
  };
  
  export const logout = () => {
    localStorage.removeItem('token');
  };