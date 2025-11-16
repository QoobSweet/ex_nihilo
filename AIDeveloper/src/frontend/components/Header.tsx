import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header>
      <h1>AIDeveloper</h1>
      {isAuthenticated ? (
        <div>
          <span>Welcome, {user?.email}</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>Please log in</div>
      )}
    </header>
  );
};

export default Header;