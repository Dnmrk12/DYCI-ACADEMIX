import React from 'react';
import Header from './dashboardhome/headerdashboard';
import Dashboard from './dashboardhome/dashboard';
import ActiveSprint from './dashboardhome/activesprint';

function SprintLayout() {
  return (
    <div className='grid-container'>
      <Header />
      <Dashboard />
      <ActiveSprint />
    </div>
  );
  
}

export default SprintLayout;