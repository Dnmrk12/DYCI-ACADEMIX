import React from 'react';

function AuthLayout({ children }) {
  return (
    <div className="auth-container">
      {/* You can add a logo or branding here if needed */}
      {children}
    </div>
  );
}

export default AuthLayout;
