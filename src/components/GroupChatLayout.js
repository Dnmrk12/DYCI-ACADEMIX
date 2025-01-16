import React from 'react';
import Header from './dashboardhome/headerdashboard';
import Dashboard from './dashboardhome/dashboard';
import GroupChat from './dashboardhome/groupchat';

function GroupChatLayout() {
  return (
    <div className='grid-container'>
      <Header />
      <Dashboard />
      <GroupChat />
    </div>
  );
  
}

export default GroupChatLayout;