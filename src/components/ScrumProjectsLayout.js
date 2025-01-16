import React from 'react';
import Header from './dashboardhome/headerdashboard';
import Dashboard from './dashboardhome/dashboard';
import ScrumProjects from './dashboardhome/scrumprojects';

function ScrumProjectsLayout() {
  return (
    <div className='grid-container'>
      <Header />
      <Dashboard />
      <ScrumProjects />
    </div>
  );
  
}

export default ScrumProjectsLayout;