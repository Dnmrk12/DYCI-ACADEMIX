import React from 'react';
import Header from './dashboardhome/headerdashboard';
import Dashboard from './dashboardhome/dashboard';
import VelocityChart from './dashboardhome/velocitychart';

function VelocityLayout() {
  return (
    <div className='grid-container'>
      <Header />
      <Dashboard />
      <VelocityChart />
    </div>
  );
  
}

export default VelocityLayout;