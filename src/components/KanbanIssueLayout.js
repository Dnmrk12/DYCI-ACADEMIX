import React from 'react';
import Header from './dashboardhome/headerdashboard';
import Dashboard from './dashboardhome/dashboard';
import KanbanIssue from './dashboardhome/kanbanissue';

function KanbanIssueLayout() {
  return (
    <div className='grid-container'>
      <Header />
      <Dashboard />
      <KanbanIssue />
    </div>
  );
  
}

export default KanbanIssueLayout;