import React from 'react';
import Header from './dashboardhome/headerdashboard';
import Dashboard from './dashboardhome/dashboard';
import PerformanceReport from './dashboardhome/performance-report';

function PerformanceReportLayout() {
  return (
    <div className='grid-container'>
      <Header />
      <Dashboard />
      <PerformanceReport />
    </div>
  );
  
}

export default PerformanceReportLayout;