import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import "./performance-report.css";
import RocketIcon from './iconshomepage/Rocket.png';
import LikeIcon from './iconshomepage/Good.png';
import HurryUpIcon from './iconshomepage/hurryUp.png';
import {  getFirestore,  collection, limit, addDoc,doc,getDocs,getDoc, increment, deleteDoc, setDoc, query,orderBy,onSnapshot,where,updateDoc, arrayRemove,arrayUnion,serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { db } from "./firebase/firebaseConfig";
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);


const PerformanceReport = () => {
 const [currentData, setCurrentData] = useState([]);
  const [comparedData, setComparedData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('Last Month');
  const [selectedCategory, setSelectedCategory] = useState('Project');
  const [workProgressType, setWorkProgressType] = useState('Project');


  
  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  const fetchData = async (period, isCompared = false) => {
    const tasksByMonth = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
      Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,
    };
  
    if (!uid) {
      console.error('User ID not found');
      return Object.values(tasksByMonth);
    }
  
    try {
      // Handle Task category
      if (selectedCategory === 'Task') {
        const kanbanRef = collection(db, `Kanban`);
        const kanbanSnapshot = await getDocs(kanbanRef);
  
        for (const kanbanDoc of kanbanSnapshot.docs) {
          const epicId = kanbanDoc.id;
          const kanbanIssueRef = collection(db, `Kanban/${epicId}/kanbanIssue`);
          const kanbanIssueSnapshot = await getDocs(kanbanIssueRef);
  
          for (const issueDoc of kanbanIssueSnapshot.docs) {
            const { assignId, issueStatus, IssueDoneTime } = issueDoc.data();
  
            if (assignId === uid && issueStatus === 'Complete' && IssueDoneTime) {
              const issueDate = new Date(IssueDoneTime);
  
              if (isWithinPeriod(issueDate, period)) {
                const month = getMonthFromDate(issueDate);
                tasksByMonth[month] += 1;
              }
            }
          }
        }
  
        // Handle Scrum tasks
        const scrumRef = collection(db, `users/${uid}/Scrum`);
        const scrumSnapshot = await getDocs(scrumRef);
  
        for (const scrumDoc of scrumSnapshot.docs) {
          const scrumId = scrumDoc.id;
          const backlogRef = collection(db, `Scrum/${scrumId}/backlog`);
          const backlogSnapshot = await getDocs(backlogRef);
  
          for (const backlogDoc of backlogSnapshot.docs) {
            const { assignee, status, dateDone } = backlogDoc.data();
          
  
            if (assignee?.assignId === uid && status === 'Done' && dateDone) {
              const dateParts = dateDone.split(/[/\s:]+/);
              const [month, day, year, hour, minute, periodIndicator] = dateParts;
              const hour24 =
                periodIndicator.toLowerCase() === 'pm' && parseInt(hour) !== 12
                  ? parseInt(hour) + 12
                  : parseInt(hour);
  
              const scrumDate = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                hour24,
                parseInt(minute)
              );
  
              if (isWithinPeriod(scrumDate, period)) {
                const month = getMonthFromDate(scrumDate);
                tasksByMonth[month] += 1;
              }
            }
          }
        }
        const roadmapRef = collection(db, `users/${uid}/Roadmap`);
        const roadmapSnapshot = await getDocs(roadmapRef);
      
        for (const roadmapDoc of roadmapSnapshot.docs) {
          const roadmapId = roadmapDoc.id;
          const roadmapIssueRef = collection(db, `users/${uid}/Roadmap/${roadmapId}/roadmapIssue`);
          const roadmapIssueSnapshot = await getDocs(roadmapIssueRef);
      
          for (const issueDoc of roadmapIssueSnapshot.docs) {
            const { status, issuedateDone } = issueDoc.data();
      
            if (status === 'Done' && issuedateDone) {
              const [year, month, day] = issuedateDone.split('-');
              const roadmapDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
              if (isWithinPeriod(roadmapDate, period)) {
                const month = getMonthFromDate(roadmapDate);
                tasksByMonth[month] += 1;
              }
            }
          }
        }
      

      } else {
        const roadmapRef = collection(db, `users/${uid}/Roadmap`);
        const roadmapSnapshot = await getDocs(roadmapRef);
        
        for (const roadmapDoc of roadmapSnapshot.docs) {
          const { status, roadmapdoneDate } = roadmapDoc.data();
        
          if (status === 'Done' && roadmapdoneDate) {
            const [year, month, day] = roadmapdoneDate.split('-');
            const roadmapDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        
            if (isWithinPeriod(roadmapDate, period)) {
              const month = getMonthFromDate(roadmapDate);
              tasksByMonth[month] += 1;
            }
          }
        }
        
        // Log the value of tasksByMonth to the console

        
        // Handle Scrum projects
        const scrumRef = collection(db, `users/${uid}/Scrum`);
        const scrumSnapshot = await getDocs(scrumRef);
  
        for (const scrumDoc of scrumSnapshot.docs) {
          const scrumId = scrumDoc.id;
          const scrumDataRef = doc(db, `Scrum/${scrumId}`);
          const scrumDataSnapshot = await getDoc(scrumDataRef);
  
          if (!scrumDataSnapshot.exists()) continue;
  
          const { isDone, completedSprintDate } = scrumDataSnapshot.data();
  
          if (isDone && completedSprintDate) {
            const dateParts = completedSprintDate.split(/[/\s:]+/);
            const [month, day, year, hour, minute, periodIndicator] = dateParts;
            const hour24 =
              periodIndicator.toLowerCase() === 'pm' && parseInt(hour) !== 12
                ? parseInt(hour) + 12
                : parseInt(hour);
  
            const scrumDate = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              hour24,
              parseInt(minute)
            );
  
            if (isWithinPeriod(scrumDate, period)) {
              const month = getMonthFromDate(scrumDate);
              tasksByMonth[month] += 1;
            }
          }
        }
  
        // Handle Project logic (Kanban as before)
        const kanbanRef = collection(db, `users/${uid}/Kanban`);
        const kanbanSnapshot = await getDocs(kanbanRef);

        for (const kanbanDoc of kanbanSnapshot.docs) {
          const epicId = kanbanDoc.id;
        
          // Log the epic ID
        
        
          const epicRef = doc(db, `Kanban/${epicId}`);
          const epicSnapshot = await getDoc(epicRef);
        
          if (!epicSnapshot.exists()) {
            continue;
          }
        
          const { projectStatus, dateDone } = epicSnapshot.data();
         if ((projectStatus === 'Complete' || projectStatus === 'Finished') && dateDone) {
            const date = new Date(dateDone);        
            if (isWithinPeriod(date, period)) {
              const month = getMonthFromDate(date);       
              // Log the month being update
              tasksByMonth[month] += 1;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  
    // Adjust data for comparison
    if (isCompared && period === 'Last Month') {
      tasksByMonth['Dec'] = tasksByMonth['Nov'];
      tasksByMonth['Nov'] = 0;
    }
  
    return Object.values(tasksByMonth);
  };
  
 
  const isWithinPeriod = (date, period) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // Current month (0-11)
  
    switch (period) {
      case 'Current Year':
        return date.getFullYear() === currentYear;
      case 'Last Year':
        return date.getFullYear() === currentYear - 1;
      case 'Last Month':
        // If the selected period is "Last Month", show data for the previous month (e.g., if it's December, show November)
        const lastMonth = (currentMonth === 0) ? 11 : currentMonth - 1; // Handles December to November correctly
        return (
          date.getFullYear() === currentYear &&
          date.getMonth() === lastMonth
        );
      default:
        return false;
    }
  };
  

  const getMonthFromDate = (date) => {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return monthNames[date.getMonth()];
  };

  useEffect(() => {
    const fetchAllData = async () => {
      // Fetch data for the current year and for the selected comparison period
      const current = await fetchData('Current Year');
      const compared = await fetchData(selectedPeriod, true);
      setCurrentData(current);
      setComparedData(compared);
    };
  
    fetchAllData();
  }, [selectedPeriod, selectedCategory]);
  
  
  const generateChartData = () => {
    return {
      labels: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
      datasets: [
        {
          label: `Current Year`,
          data: currentData,
          backgroundColor: '#0078FF',
          borderColor: 'rgba(38, 101, 172, 1)',
          borderWidth: 1,
        },
        {
          label: `Compared (${selectedPeriod})`,
          data: comparedData,
          backgroundColor: '#7FB2EB',
          borderColor: 'rgba(200, 200, 200, 1)',
          borderWidth: 1,
        },
      ],
    };
  };
  
   

  const getMaxValue = () => {
    const maxCurrentData = Math.max(...currentData);
    const maxComparedData = Math.max(...comparedData);
    const maxValue = Math.max(maxCurrentData, maxComparedData);
  
    // Logic to set max value dynamically based on the max value
    if (maxValue <= 2) {
      return 3; // If max value is 2 or less, set max to 3
    } else if (maxValue <= 5) {
      return 6; // If max value is between 3 and 5, set max to 6
    } else {
      return Math.ceil((maxValue + 3) / 3) * 3; // Round up to next multiple of 3
    }
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: {
        display: true,
        text: `                                              (${selectedCategory})`,
        position: 'top',
        align: 'start',
        color: '#2665AC',
        font: { family: 'Montserrat, sans-serif', size: 15, weight: 600 },
        padding: { top: 10, bottom: 20, left: 30 },
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Removes vertical grid lines
        },
      },
      y: {
        beginAtZero: true,
        max: getMaxValue(), // Dynamically set the max value
        ticks: {
          stepSize: 1, // Display only whole numbers on the y-axis
          callback: function(value) {
            return Number.isInteger(value) ? value : ''; // Only show whole numbers
          },
        },
      },
    },
  };


  const ProductivityRate = () => {
    const [taskCompletionRate, setTaskCompletionRate] = useState(0);
    useEffect(() => {
      // Fetch the task completion rate from your data source
      const fetchTaskCompletionRate = async () => {
        try {
          // Fetch tasks from Kanban, Scrum, and Roadmap
          const kanbanTasksRef = collection(db, `users/${uid}/Kanban`);
          const scrumTasksRef = collection(db, `users/${uid}/Scrum`);
          const roadmapRef = collection(db, `users/${uid}/Roadmap`);
    
          let completedTasks = 0;
          let totalTasks = 0;
    
          // Kanban Tasks
          const kanbanSnapshot = await getDocs(kanbanTasksRef);
          for (const epicDoc of kanbanSnapshot.docs) {
            const tasksRef = collection(db, `Kanban/${epicDoc.id}/kanbanIssue`);
            const tasksSnapshot = await getDocs(tasksRef);
    
            for (const taskDoc of tasksSnapshot.docs) {
              const taskData = taskDoc.data();
    
              if (taskData.assignId === uid) { // Only count tasks where `uid` is assigned
                totalTasks++;
                if (taskData.issueStatus === 'Complete') {
                  completedTasks++;
                }
              }
            }
          }
    
          // Scrum Tasks
          const scrumSnapshot = await getDocs(scrumTasksRef);
          for (const scrumDoc of scrumSnapshot.docs) {
            const backlogRef = collection(db, `Scrum/${scrumDoc.id}/backlog`);
            const backlogSnapshot = await getDocs(backlogRef);
    
            for (const taskDoc of backlogSnapshot.docs) {
              const taskData = taskDoc.data();
    
              if (taskData.assignee?.assignId === uid) { // Only count tasks where `uid` is assigned
                totalTasks++;
                if (taskData.status === 'Done') {
                  completedTasks++;
                }
              }
            }
          }
    
          // Roadmap Tasks
          const roadmapSnapshot = await getDocs(roadmapRef);
    
          for (const roadmapDoc of roadmapSnapshot.docs) {
            const roadmapId = roadmapDoc.id;
            const roadmapIssueRef = collection(db, `users/${uid}/Roadmap/${roadmapId}/roadmapIssue`);
            const roadmapIssueSnapshot = await getDocs(roadmapIssueRef);
    
            for (const taskDoc of roadmapIssueSnapshot.docs) {
              const taskData = taskDoc.data();
    
              // Increment totalTasks for every task document
              totalTasks++;
    
              // Check if the task is marked as "Done" and increment completedTasks
              if (taskData.status === "Done") {
                completedTasks++;
              }
            }
          
          }
    
          // Calculate task completion rate
          const rate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
          setTaskCompletionRate(rate);
    
        } catch (error) {
          console.error('Error fetching task completion rate:', error);
        }
      };
    
      fetchTaskCompletionRate();
    }, [uid]); // dependency array to re-run if `uid` changes
    
let icon, message;
if (taskCompletionRate >= 80) {
  icon = <img src={RocketIcon} alt="Rocket Icon" className='completionrateIcon' />;
  message = "You're on track and excelling!";
} else if (taskCompletionRate >= 50 && taskCompletionRate < 80) {
  icon = <img src={LikeIcon} alt="Like Icon" className='completionrateIcon' />;
  message = "Keep Going! You're maintaining a steady pace.";
} else {
  icon = <img src={HurryUpIcon} alt="Hurry Up Icon" className='completionrateIcon' />;
  message = "You're falling behind, catch up!";
}

return (
  <div className="productivity-rate-container">
  <h2>Productivity Rate</h2>
  <div className="productivity-rate-content">
    <div className="productivity-rate-icon">{icon}</div>
    <div className="productivity-rate-info">
      <p>{taskCompletionRate.toFixed(0)}% Task Completion Rate</p>
      <p className="messagerate">{message.split("!")[1]?.trim()}</p> {/* Shows the remaining message */}
      <p className="highlight-message">{message.split("!")[0]}!</p> {/* Highlights the first part */}
    </div>
  </div>
</div>
);
  };
  
  const WorkProgressChart = () => {
    const [selectedWorkType, setSelectedWorkType] = useState('Project');
    const [completedWork, setCompletedWork] = useState(0);
    const [ongoingWork, setOngoingWork] = useState(0);
  
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
  
    const fetchWorkProgress = async (workType) => {
      if (!uid) {
        console.error('User ID not found');
        return { completed: 0, ongoing: 0 };
      }
    
      try {
        if (workType === 'Project') {
          // Kanban Summary
          const kanbanRef = collection(db, `users/${uid}/Kanban`);
          const kanbanSnapshot = await getDocs(kanbanRef);
    
          let completedProjects = 0;
          let totalProjects = 0;
    
          for (const docSnapshot of kanbanSnapshot.docs) {
            const epicId = docSnapshot.id;
    
            const epicDocRef = doc(db, `Kanban/${epicId}`);
            const epicDocSnap = await getDoc(epicDocRef);
    
            if (epicDocSnap.exists()) {
              const epicData = epicDocSnap.data();
              totalProjects++;
    
              if (
                epicData.projectStatus === "Complete" ||
                epicData.projectStatus === "Finished"
              ) {
                completedProjects++;
              }
            }
          }
    
          // Scrum Summary
          const scrumRef = collection(db, `users/${uid}/Scrum`);
          const scrumSnapshot = await getDocs(scrumRef);
    
          for (const docSnapshot of scrumSnapshot.docs) {
            const scrumId = docSnapshot.id;
    
            const scrumDocRef = doc(db, `Scrum/${scrumId}`);
            const scrumDocSnap = await getDoc(scrumDocRef);
    
            if (scrumDocSnap.exists()) {
              const scrumData = scrumDocSnap.data();
              totalProjects++;
    
              if (scrumData.isDone === true) {
                completedProjects++;
              }
            }
          }
    
          // Roadmap Summary
          const roadmapRef = collection(db, `users/${uid}/Roadmap`);
          const roadmapSnapshot = await getDocs(roadmapRef);
    
          let completedRoadmapItems = 0;
          let totalRoadmapItems = 0;
    
          for (const docSnapshot of roadmapSnapshot.docs) {
            const roadmapId = docSnapshot.id;
    
            const roadmapDocRef = doc(db, `users/${uid}/Roadmap/${roadmapId}`);
            const roadmapDocSnap = await getDoc(roadmapDocRef);
    
            if (roadmapDocSnap.exists()) {
              const roadmapData = roadmapDocSnap.data();
              totalRoadmapItems++;
    
              if (roadmapData.status === "Done") {
                completedRoadmapItems++;
              }
            }
          }
    
          // Combined Result
          const totalCompleted = completedProjects + completedRoadmapItems;
          const totalOngoing = totalProjects + totalRoadmapItems - totalCompleted;
    

          return {
            completed: totalCompleted,
            ongoing: totalOngoing,
          };
        } else {
          // Fetch tasks from Kanban, Scrum, and Roadmap
          const kanbanTasksRef = collection(db, `users/${uid}/Kanban`);
          const scrumTasksRef = collection(db, `users/${uid}/Scrum`);
          const roadmapRef = collection(db, `users/${uid}/Roadmap`);
    
          let completedTasks = 0;
          let totalTasks = 0;
    
          // Kanban Tasks
          const kanbanSnapshot = await getDocs(kanbanTasksRef);
          for (const epicDoc of kanbanSnapshot.docs) {
            const tasksRef = collection(db, `Kanban/${epicDoc.id}/kanbanIssue`);
            const tasksSnapshot = await getDocs(tasksRef);
    
            for (const taskDoc of tasksSnapshot.docs) {
              const taskData = taskDoc.data();
    
              if (taskData.assignId === uid) { // Only count tasks where you are assigned
                totalTasks++;
                if (taskData.issueStatus === 'Complete') {
                  completedTasks++;
                }
              }
            }
          }
    
          // Scrum Tasks
          const scrumSnapshot = await getDocs(scrumTasksRef);
          for (const scrumDoc of scrumSnapshot.docs) {
            const backlogRef = collection(db, `Scrum/${scrumDoc.id}/backlog`);
            const backlogSnapshot = await getDocs(backlogRef);
    
            for (const taskDoc of backlogSnapshot.docs) {
              const taskData = taskDoc.data();
    
              if (taskData.assignee?.assignId === uid) { // Only count tasks where you are assigned
                totalTasks++;
                if (taskData.status === 'Done') {
                  completedTasks++;
                }
              }
            }
          }
    
          // Roadmap Tasks
          const roadmapSnapshot = await getDocs(roadmapRef);
    
          for (const roadmapDoc of roadmapSnapshot.docs) {
            const roadmapId = roadmapDoc.id;
            const roadmapIssueRef = collection(db, `users/${uid}/Roadmap/${roadmapId}/roadmapIssue`);
            const roadmapIssueSnapshot = await getDocs(roadmapIssueRef);
    
            for (const taskDoc of roadmapIssueSnapshot.docs) {
              const taskData = taskDoc.data();
    
              // Increment totalTasks for every task document
              totalTasks++;
    
              // Check if the task is marked as "Done" and increment completedTasks
              if (taskData.status === "Done") {
                completedTasks++;
              }
            }
          }
    
          console.log('Completed Tasks:', completedTasks);
          console.log('Ongoing Tasks:', totalTasks - completedTasks);
    
          return { 
            completed: completedTasks, 
            ongoing: totalTasks - completedTasks 
          };
        }
      } catch (error) {
        console.error('Error fetching work progress:', error);
        return { completed: 0, ongoing: 0 };
      }
    };
    
  
    useEffect(() => {
      const loadWorkProgress = async () => {
        const { completed, ongoing } = await fetchWorkProgress(selectedWorkType);
        setCompletedWork(completed);
        setOngoingWork(ongoing);
      };
  
      loadWorkProgress();
    }, [selectedWorkType]);
  
    const generateWorkProgressData = () => {
      const labels = selectedWorkType === 'Task'
        ? ['Completed Tasks', 'Ongoing Tasks']
        : ['Completed Projects', 'Ongoing Projects'];
      
      return {
        labels: labels,
        datasets: [
          {
            data: [completedWork, ongoingWork],
            backgroundColor: ['#2665AC', '#D6E6F2'],
            hoverBackgroundColor: ['#005BB5', '#C4C4C4'],
          },
        ],
      };
    };
  
    const options = {
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
              const value = tooltipItem.raw;
              const percentage = ((value / total) * 100).toFixed(0);
              return `${tooltipItem.label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
      maintainAspectRatio: false,
      responsive: true,
      cutout: '70%',
    };
  
    const doughnutCenterText = {
      id: 'doughnutCenterText',
      beforeDraw: (chart) => {
        const { width, height, ctx } = chart;
        const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        const completed = chart.data.datasets[0].data[0];
        const text = total > 0 
          ? `${Math.round((completed / total) * 100)}%` 
          : '0%';
  
        ctx.save();
        ctx.font = '35px Arial';
        ctx.fillStyle = '#2665AC';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2.5);
        ctx.restore();
      },
    };
  
    return (
      <div className="work-progress-container">
        <h2>Work Progress</h2>
        <div className="work-progress-dropdown">
          <select
            className="work-progress-select"
            value={selectedWorkType}
            onChange={(e) => setSelectedWorkType(e.target.value)}
          >
            <option value="Project">Project</option>
            <option value="Task">Task</option>
          </select>
        </div>
        <div style={{ width: '220px', height: '220px', margin: '0 auto', position: 'relative', top: '30px' }}>
          <Doughnut
            data={generateWorkProgressData()}
            options={options}
            plugins={[doughnutCenterText]}
          />
        </div>
      </div>
    );
  };


  return (
    <div className="performance-report-container">
      <div className="Performance-report-header">
        <h1>Performance Report</h1>
      </div>
      <div className="Performance-report-content">
        {/* Chart Section */}
             <div className="Performance-chart-container">
             <label className="Performance-chart-title-label">Performance Overview</label>
             <div className="Performance-filter-dropdown-chart">
               <select
                 className="Performance-filter-select-lastYMW"
                 value={selectedPeriod}
                 onChange={(e) => setSelectedPeriod(e.target.value)}
               >
                 <option value="Last Year">Last Year</option>
                 <option value="Last Month">Last Month</option>
               </select>
               <select
                 className="Performance-filter-select-protask"
                 value={selectedCategory}
                 onChange={(e) => setSelectedCategory(e.target.value)}
               >
                 <option value="Project">Project</option>
                 <option value="Task">Task</option>
               </select>
             </div>
             <Bar data={generateChartData()} options={options} /></div>

             <ProductivityRate />

             <WorkProgressChart 
  completedProjects={10} 
  ongoingProjects={5}   
/>
      </div>
    </div>
  );
};

export default PerformanceReport;