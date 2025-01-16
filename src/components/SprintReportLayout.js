import React from 'react';
import Header from './dashboardhome/headerdashboard';
import Dashboard from './dashboardhome/dashboard';
import SprintReport from './dashboardhome/sprintreport';

function SprintReportLayout() {
  return (
    <div className='grid-container'>
      <Header />
      <Dashboard />
      <SprintReport />
    </div>
  );
  
}

export default SprintReportLayout;