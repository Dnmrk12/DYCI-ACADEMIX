import React from 'react';
import Header from './dashboardhome/headerdashboard';
import Dashboard from './dashboardhome/dashboard';
import ProfileDetails from './dashboardhome/ProfileDetails';

function ProfileDetailsLayout() {
  return (
    <div className='grid-container'>
      <Header />
      <Dashboard />
      <ProfileDetails />
    </div>
  );
  
}

export default ProfileDetailsLayout;