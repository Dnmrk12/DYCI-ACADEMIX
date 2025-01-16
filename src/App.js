import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/loginform';
import Signupform from './components/signupform';
import ResetPass from './components/resetpass';
import CheckEmail from './components/checkEmail';
import Successfulchange from './components/successfulchange';
import ForgotPassword from './components/forgotpassword';
import DashboardLayout from './components/DashboardLayout';
import AuthLayout from './components/AuthLayout';
import './App.css';
import PersonalRoadmapLayout from './components/PersonalRoadmapLayout';
import KanbanBoardLayout from './components/KanbanBoardLayout';
import ScrumProjectsLayout from './components/ScrumProjectsLayout';
import BacklogsLayout from './components/BacklogsLayout';
import SprintLayout from './components/SprintLayout';
import BurndownLayout from './components/BurndownLayout';
import VelocityLayout from './components/VelocityLayout';
import SprintReportLayout from './components/SprintReportLayout';
import GroupChatLayout from './components/GroupChatLayout';
import ProfileDetailsLayout from './components/ProfileDetailsLayout';
import PerformanceReportLayout from './components/PerformanceReportLayout';
import LogReportLayout from './components/LogReportLayout';
import KanbanIssueLayout from './components/KanbanIssueLayout';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication routes */}
        <Route path='/' element={
          <AuthLayout>
            <LoginForm />
          </AuthLayout>
        } />
        
        <Route path='/signupform' element={
          <AuthLayout>
            <Signupform />
          </AuthLayout>
        } />
        
        <Route path='/resetpass' element={
          <AuthLayout>
            <ResetPass />
          </AuthLayout>
        } />
        
        <Route path='/checkEmail' element={
          <AuthLayout>
            <CheckEmail />
          </AuthLayout>
        } />
        
        <Route path='/successfulchange' element={
          <AuthLayout>
            <Successfulchange />
          </AuthLayout>
        } />
        
        <Route path='/forgotpassword' element={
          <AuthLayout>
            <ForgotPassword />
          </AuthLayout>
        } />
        
        {/* Main application routes */}
        <Route path='/dashboard' element={<DashboardLayout />} />
        <Route path='/personalroadmap' element={<PersonalRoadmapLayout />} />
        <Route path='/kanbanboard' element={<KanbanBoardLayout />} />
        <Route path='/kanbanissue' element={<KanbanIssueLayout />} />
        <Route path='/scrumprojects' element={<ScrumProjectsLayout />} />
        
        {/* Backlogs routes - add both with and without project ID */}
        <Route path='/backlogs' element={<BacklogsLayout />} />
        <Route path='/backlogs/:projectId' element={<BacklogsLayout />} />
        <Route path='/activesprint' element={<SprintLayout />} />
        <Route path='/burndownchart' element={<BurndownLayout />} />
        <Route path='/velocitychart' element={<VelocityLayout />} />
        <Route path='/sprintreport' element={<SprintReportLayout />} />
        <Route path='/groupchat' element={<GroupChatLayout />} />

        {/* Profile Details route */}
        <Route path='/ProfileDetails' element={<ProfileDetailsLayout />} />
        <Route path="/profile/:id" element={<ProfileDetailsLayout />} />;
        <Route
          path='/performance-report'
          element={<PerformanceReportLayout/>}>

          </Route>

          <Route
          path='/log-report'
          element={<LogReportLayout/>}>

          </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;