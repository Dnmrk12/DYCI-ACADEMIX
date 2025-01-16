import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from './dashboardhome/headerdashboard';
import Dashboard from './dashboardhome/dashboard';
import Backlogs from './dashboardhome/backlogs';

function BacklogsLayout() {
    const { projectId } = useParams();
    const location = useLocation();
    const projectName = location.state?.projectName;
    const key = location.state?.key;
    const startDate = location.state?.startDate;
    const startTime = location.state?.startTime;
    const endDate = location.state?.endDate;
    const endTime = location.state?.endTime;
    const icon = location.state?.icon;
    const scrumMaster = location.state?.scrumMaster;
    const masterIcon = location.state?.masterIcon;
    const members = location.state?.members; // Retrieve members or default to an empty array

    return (
        <div className='grid-container'>
            <Header />
            <Dashboard />
            <Backlogs 
                projectId={projectId} 
                projectName={projectName} 
                key={key} 
                startDate={startDate} 
                startTime={startTime} 
                endDate={endDate} 
                endTime={endTime} 
                icon={icon} 
                scrumMaster={scrumMaster} 
                masterIcon={masterIcon} 
                members={members} // Pass the members as a prop
            />
        </div>
    );
}

export default BacklogsLayout;
