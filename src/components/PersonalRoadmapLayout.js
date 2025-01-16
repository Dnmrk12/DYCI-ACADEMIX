import React from 'react';
import Header from './dashboardhome/headerdashboard';
import Dashboard from './dashboardhome/dashboard';
import PersonalRoadmap from './dashboardhome/personalroadmap';

function PersonalRoadmapLayout() {
  return (
    <div className='grid-container'>
      <Header />
      <Dashboard />
      <PersonalRoadmap />
    </div>
  );
  
}

export default PersonalRoadmapLayout;