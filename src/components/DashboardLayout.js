import React from 'react';
import Header from './dashboardhome/headerdashboard';
import Dashboard from './dashboardhome/dashboard';
import Home from './dashboardhome/homedashboard';
import AddWidgetPopup from './dashboardhome/addwidgetpopup';

function DashboardLayout() {
  return (
    <div className='grid-container'>
      <Header />
      <Dashboard />
      <Home />
      <AddWidgetPopup />
    </div>
  );
}

export default DashboardLayout;