import React from 'react';
import Header from './dashboardhome/headerdashboard';
import Dashboard from './dashboardhome/dashboard';
import BurndownChart from './dashboardhome/burndownchart';

function BurndownLayout() {
  return (
    <div className='grid-container'>
      <Header />
      <Dashboard />
      <BurndownChart />
    </div>
  );
  
}

export default BurndownLayout;