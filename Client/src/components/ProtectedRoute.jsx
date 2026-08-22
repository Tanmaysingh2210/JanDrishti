import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const storedRole = localStorage.getItem('jandrishti_user_role');
      const token = localStorage.getItem('jandrishti_token');

      // Check role condition if specified
      if (allowedRoles && allowedRoles.length > 0) {
        if (!storedRole || !allowedRoles.includes(storedRole)) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
      }

      // Check session via /me endpoints depending on role
      let endpoint = '';
      if (storedRole === 'govt') {
        endpoint = 'http://localhost:3000/api/government/auth/me';
      } else if (storedRole === 'univ') {
        endpoint = 'http://localhost:3000/api/university/auth/me';
      } else if (storedRole === 'industry') {
        endpoint = 'http://localhost:3000/api/industry/auth/me';
      } else if (storedRole === 'citizen') {
        endpoint = 'http://localhost:3000/api/citizen/auth/me';
      }

      if (!endpoint) {
        // Fallback: check token or cookie status
        setIsAuthenticated(Boolean(token || storedRole));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          credentials: 'include'
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setIsAuthenticated(true);
        } else {
          // If token verification fails, clear local storage and reject
          localStorage.removeItem('jandrishti_token');
          localStorage.removeItem('jandrishti_user_role');
          localStorage.removeItem('jandrishti_user_info');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        // If network issue, fall back to stored token presence or reject
        setIsAuthenticated(Boolean(token || storedRole));
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-on-surface-variant">Verifying Sovereign Credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
