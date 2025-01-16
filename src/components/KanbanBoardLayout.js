import React from 'react';
import Header from './dashboardhome/headerdashboard';
import Dashboard from './dashboardhome/dashboard';
import KanbanBoard from './dashboardhome/kanbanboard';

function KanbanBoardLayout() {
  return (
    <div className='grid-container'>
      <Header />
      <Dashboard />
      <KanbanBoard />
    </div>
  );
  
}

export default KanbanBoardLayout;