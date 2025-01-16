import React from 'react';
import Header from './dashboardhome/headerdashboard';
import Dashboard from './dashboardhome/dashboard';
import LogReport from './dashboardhome/log-report';

function LogReportLayout() {
  return (
    <div className='grid-container'>
      <Header />
      <Dashboard />
      <LogReport />
    </div>
  );
  
}

export default LogReportLayout;