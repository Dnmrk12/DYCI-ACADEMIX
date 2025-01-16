import React, { useState, useEffect, useRef } from 'react';
import { useNavigate ,Link } from 'react-router-dom'; // Import useNavigate
import { useLocation } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { enUS } from 'date-fns/locale'; 
import bug from "./iconshomepage/bugfixicon.png";
import story from "./iconshomepage/researchicon.png";
import task from "./iconshomepage/ppticon.png";
import img0 from './iconshomepage/magnifyingglass.png'; 
import img1 from './iconshomepage/addnewbutton.png'; 
import img2 from './iconshomepage/notifprofile1.png';
import img3 from './iconshomepage/notifprofile2.png';
import img4 from './iconshomepage/notifprofile3.png';
import img5 from './iconshomepage/notifprofile4.png';
import img6 from './iconshomepage/credentials.png';
import img7 from './iconshomepage/sortduedateacttask.png';
import img8 from './iconshomepage/researchicon.png';
import img9 from './iconshomepage/ppticon.png';
import epicIcon from './iconshomepage/epicIcon.png';
import ReminderIcon from './iconshomepage/ReminderIcon.png';
import DoneIcon from './iconshomepage/DoneIcon.png';
import AddWidgetPopup from './addwidgetpopup';
import './homedashboard.css';
import { db, auth } from './firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection,limit, addDoc,doc , getDocs,getDoc,increment,get, deleteDoc ,setDoc, query,orderBy, onSnapshot, where,updateDoc, arrayRemove ,arrayUnion, serverTimestamp} from 'firebase/firestore';

import { getStorage, ref, uploadBytes,  getDownloadURL ,uploadString} from 'firebase/storage';

import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";



ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Home() {

  const handleAddWidget = (widgetName) => {
    if (widgetName === 'Calendar') {
      setShowCalendar(true);
      setShowNotifications(false);
      localStorage.setItem('showCalendar', 'true');
      localStorage.setItem('showNotifications', 'false');
    } else if (widgetName === 'Notifications') {
      setShowNotifications(true);
      setShowCalendar(false);
      localStorage.setItem('showNotifications', 'true');
      localStorage.setItem('showCalendar', 'false');
    } else if (widgetName === 'Active Tasks') {
      setShowActiveTasks(true);
      setShowMessage(false);
      localStorage.setItem('showActiveTasks', 'true');
      localStorage.setItem('showMessage', 'false');
    } else if (widgetName === 'Recent Messages') {
      setShowMessage(true);
      setShowActiveTasks(false);
      localStorage.setItem('showMessage', 'true');
      localStorage.setItem('showActiveTasks', 'false');
    } else if (widgetName === 'Total Projects') {
      setShowTotalProjects(true);
      localStorage.setItem('showTotalProjects', 'true');
    } else if (widgetName === 'Ongoing Projects') {
      setShowOngoingProjects(true);
      localStorage.setItem('showOngoingProjects', 'true');
    } else if (widgetName === 'Completed Projects') {
      setShowCompletedProjects(true);
      localStorage.setItem('showCompletedProjects', 'true');
    } else if (widgetName === 'Total Tasks') {
      setShowTotalTasks(true);
      localStorage.setItem('showTotalTasks', 'true');
    } else if (widgetName === 'Ongoing Tasks') {
      setShowOngoingTasks(true);
      localStorage.setItem('showOngoingTasks', 'true');
    } else if (widgetName === 'Completed Tasks') {
      setShowCompletedTasks(true);
      localStorage.setItem('showCompletedTasks', 'true');
    } else if (widgetName === 'Project Overview') {
      setShowProjectOverview(true);
      localStorage.setItem('showProjectOverview', 'true');
    } else if (widgetName === 'Performance Overview') {
      setShowPerformanceOverview(true);
      localStorage.setItem('showPerformanceOverview', 'true');
    }
  };

  const handleConfirmRemove = (cardId) => {
    console.log(`Card with id ${cardId} removed`);
    if (cardId === 'react-calendar') {
      setShowCalendar(false);
      localStorage.setItem('showCalendar', 'false');
    } else if (cardId === 'notification-container') {
      setShowNotifications(false);
      localStorage.setItem('showNotifications', 'false');
    } else if (cardId === 'activetaskcon') {
      setShowActiveTasks(false);
      localStorage.setItem('showActiveTasks', 'false');
    } else if (cardId === 'recentmessages') {
      setShowMessage(false);
      localStorage.setItem('showMessage', 'false');
    } else if (cardId === 'totalProjects') {
      setShowTotalProjects(false);
      localStorage.setItem('showTotalProjects', 'false');
    } else if (cardId === 'ongoingProjects') {
      setShowOngoingProjects(false);
      localStorage.setItem('showOngoingProjects', 'false');
    } else if (cardId === 'completeProjects') {
      setShowCompletedProjects(false);
      localStorage.setItem('showCompletedProjects', 'false');
    } else if (cardId === 'totalTasks') {
      setShowTotalTasks(false);
      localStorage.setItem('showTotalTasks', 'false');
    } else if (cardId === 'ongoingTasks') {
      setShowOngoingTasks(false);
      localStorage.setItem('showOngoingTasks', 'false');
    } else if (cardId === 'completeTasks') {
      setShowCompletedTasks(false);
      localStorage.setItem('showCompletedTasks', 'false');
    } else if (cardId === 'Projectoverview') {
      setShowProjectOverview(false);
      localStorage.setItem('showProjectOverview', 'false');
    } else if (cardId === 'chart') {
      setShowPerformanceOverview(false);
      localStorage.setItem('showPerformanceOverview', 'false');
    }
    setConfirmPopup(null);
  };
  
  
  const [showPopup, setShowPopup] = useState(false); // State for the Add Widget Popup
  const [date, setDate] = useState(new Date()); // Calendar date state
  const [activeCard, setActiveCard] = useState(null); // State for tracking which card's remove button is active
  const [confirmPopup, setConfirmPopup] = useState(null); // State for tracking which card's confirmation popup is active


  const toggleRemoveMenu = (cardId) => {
    setActiveCard(prevState => prevState === cardId ? null : cardId); // Toggle the remove button for the specific card
  };

  const handleClosePopup = () => {
    setShowPopup(false); // Close the add widget popup
  };

  const handleRemoveCard = (cardId) => {
    setConfirmPopup(cardId); // Show confirmation popup for the clicked card
  };

  const handleCancelRemove = () => {
    setConfirmPopup(null); // Close the confirmation popup without removing
  };
  const [currentData, setCurrentData] = useState([]);
  const [comparedData, setComparedData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('Last Month');
  const [selectedCategory, setSelectedCategory] = useState('Project');

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
        console.log(tasksByMonth);
        
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
          console.log('Processing Epic ID:', epicId);
        
          const epicRef = doc(db, `Kanban/${epicId}`);
          const epicSnapshot = await getDoc(epicRef);
        
          if (!epicSnapshot.exists()) {
            console.log(`Epic ID ${epicId} does not exist.`);
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
  
  

  
  const [searchQuery, setSearchQuery] = useState('');
  
  
  
  // Group Chats messages
  const [messages, setMessages] = useState([]);

  const [userId, setUserId] = useState(null); // Renamed state variable to userId


  // Fetch userId from Firebase Auth
  useEffect(() => {
    const fetchUserId = () => {
      const user = getAuth().currentUser;
      if (user) {
        setUserId(user.uid); // Set userId when available
      }
    };

    fetchUserId();
  }, []); // This effect only runs once on component mount

  // Fetch messages once userId is available
  useEffect(() => {
    if (!userId) return; // If userId is not yet available, skip the message fetching logic

    const fetchMessages = async () => {
      try {
        const scrumCollectionRef = collection(db, `users/${userId}/Scrum`);
        const scrumSnapshot = await getDocs(scrumCollectionRef);

        if (scrumSnapshot.empty) {
          console.log('No Scrum documents found');
          return;
        }

        const fetchedMessages = [];

        // Loop through each scrum document
        for (const scrumDoc of scrumSnapshot.docs) {
          const scrumId = scrumDoc.id;
          const scrumRef = doc(db, `Scrum/${scrumId}`);
          const scrumDocSnapshot = await getDoc(scrumRef);

          if (!scrumDocSnapshot.exists()) {
            console.log('Scrum document not found');
            continue;
          }

          const { projectName, icon } = scrumDocSnapshot.data(); // Get projectName and icon
          console.log('Scrum Data:', { projectName, icon });

          const groupChatRef = collection(db, `Scrum/${scrumId}/GroupChat`);
          const groupChatQuery = query(groupChatRef, orderBy('dateTime', 'desc'), limit(1));
          const groupChatSnapshot = await getDocs(groupChatQuery);

          if (!groupChatSnapshot.empty) {
            const groupChatDoc = groupChatSnapshot.docs[0];
            const { text, sender, dateTime } = groupChatDoc.data();
            console.log('Latest GroupChat Message:', { text, sender, dateTime });

            const senderRef = doc(db, `users/${sender}`);
            const senderDoc = await getDoc(senderRef);
            const senderLastName = senderDoc.exists() ? senderDoc.data().lastName : 'Unknown';
            console.log('Sender LastName:', senderLastName);

            const time = new Date(dateTime.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            console.log('Formatted Time:', time);

            fetchedMessages.push({
              id: groupChatDoc.id,
              title: projectName,
              sender: senderLastName,
              snippet: text,
              time: time,
              icon: icon,
              scrumId: scrumId
            });
          }
        }

        console.log('Fetched Messages:', fetchedMessages);
        setMessages(fetchedMessages); // Set the state with the fetched messages
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchMessages();
  }, [userId]); // This effect runs when userId is available

  // Function to handle title click and navigate to specific Scrum project and group chat
 const handleTitleClick = (scrumId) => {
  navigate('/scrumprojects', { state: { id: scrumId } });
};
  
  

  const timeAgo = (timestamp) => {
    const now = new Date();
    const timeDiff = now - timestamp; // Difference in milliseconds
  
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
  
    if (seconds < 60) {
      return seconds === 1 ? '1 second ago' : `${seconds} seconds ago`;
    } else if (minutes < 60) {
      return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    } else if (hours < 24) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (days < 30) {
      return days === 1 ? '1 day ago' : `${days} days ago`;
    } else if (months < 12) {
      return months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
      return years === 1 ? '1 year ago' : `${years} years ago`;
    }
  };
  const [activeTaskSearchQuery, setActiveTaskSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('Newest'); // Default sort option
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
 const [activeTasks, setActiveTasks] = useState([]);

 
 useEffect(() => {
  const fetchTasks = async () => {
    const defaultImage = 'https://firebasestorage.googleapis.com/v0/b/dyci-academix.appspot.com/o/wagdelete%2Facademixlogo.png?alt=media&token=8f83d11b-3604-41e5-9a46-d1df0d44aed5';
    const kanbanCollectionRef = collection(db, 'Kanban');
    const kanbanQuery = query(kanbanCollectionRef);
    
    try {
      // Fetch Kanban epicId references
      const kanbanSnapshot = await getDocs(kanbanQuery);
      const epicIds = kanbanSnapshot.docs.map((doc) => doc.id);
    
      let tasks = [];
    
      for (const epicId of epicIds) {
        // Fetch the Kanban document to get projectPicture
        const epicDocRef = doc(db, `Kanban/${epicId}`);
        const epicDoc = await getDoc(epicDocRef);
    
        // Skip if the document does not exist
        if (!epicDoc.exists()) continue;
    
        const projectPicture = epicDoc.data()?.projectPicture;
    
        const kanbanIssueRef = collection(db, `Kanban/${epicId}/kanbanIssue`);
        const issueQuery = query(kanbanIssueRef);
    
        const issueSnapshot = await getDocs(issueQuery);
        issueSnapshot.forEach((doc) => {
          const issueData = doc.data();
          const assignTimestamp = issueData.assignTimestamp;
          const issueStatus = issueData.issueStatus; // Assuming issueStatus is a field in your Firestore document
          const issueId = issueData.issueId;
          const assignId = issueData.assignId; // Assuming assignId is the field for assigned user UID
    
          // Skip issue if status is "Complete" or assignId doesn't match the current uid
          if (issueStatus === "Complete" || assignId !== uid) {
            return; // Skip to the next issue
          }
    
          // Check if assignTimestamp exists before accessing it
          if (assignTimestamp && assignTimestamp.seconds) {
            const timestamp = new Date(assignTimestamp.seconds * 1000); // Convert Firestore timestamp to JavaScript date
            tasks.push({
              id: issueId,
              title: issueData.IssueName,
              description: issueData.description,
              time: timeAgo(timestamp), // Use the timeAgo function to show relative time
              timestamp: timestamp.getTime(), // Save the timestamp as JavaScript timestamp for internal use
              epicId: epicId,
               img: projectPicture || defaultImage, // Set the default image if no projectPicture exists
              type: issueData.issueType?.toLowerCase() || 'unknown', // Default type to 'unknown'
            });
          }
        });
      }
  
      // Fetch Scrum backlog data
      const scrumCollectionRef = collection(db, 'Scrum');
      const scrumQuery = query(scrumCollectionRef);
      
      const scrumSnapshot = await getDocs(scrumQuery);
      for (const scrumDoc of scrumSnapshot.docs) {
        const scrumId = scrumDoc.id;
        const scrumData = scrumDoc.data(); // Get Scrum document data
        const icon = scrumData.icon || ''; // Retrieve the icon field or set a default value
      
        const backlogRef = collection(db, `Scrum/${scrumId}/backlog`);
        const backlogSnapshot = await getDocs(backlogRef);
      
        backlogSnapshot.forEach((doc) => {
          const backlogData = doc.data();
          const status = backlogData.status; // Assuming the status field exists
          const id = backlogData.id;
      
          // Skip the task if status is "Done"
          if (status === "Done") {
            return; // Skip to the next backlog item
          }
      
          // Check if backlogData.assignId matches the current uid
          if (backlogData.assignId === uid) {
            const assignTimestamp = backlogData.assignTimestamp;
      
            // Check if assignTimestamp exists before accessing it
            if (assignTimestamp && assignTimestamp.seconds) {
              const timestamp = new Date(assignTimestamp.seconds * 1000); // Convert Firestore timestamp to JavaScript date
              tasks.push({
                id: id,
                title: backlogData.title,
                description: backlogData.description,
                time: timeAgo(timestamp), // Use the timeAgo function to show relative time
                timestamp: timestamp.getTime(), // Save the timestamp as JavaScript timestamp for internal use
                epicId: scrumId,
                img: icon, // Include the Scrum document's icon
                type: backlogData.type // Include issue type
              });
            }
          }
        });
      }
      
      console.log(tasks);
      
  
      setActiveTasks(tasks); // Set tasks to state
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    }
  };
  

  fetchTasks();
}, [db, uid]);



  // Sort the tasks based on the selected sort option
  const sortedTasks = [...activeTasks]
  .sort((a, b) => {
    if (selectedSort === 'Newest') {
      return b.timestamp - a.timestamp; // Newest first
    } else {
      return a.timestamp - b.timestamp; // Oldest first
    }
  })
  .filter((task) =>
    task.title.toLowerCase().includes(activeTaskSearchQuery.trim().toLowerCase())
  );

   const determineTaskSource = (taskId) => {
  // Check if the task belongs to Kanban
  for (const epic of kanbanData) {
    const issues = epic.issues || [];
    if (issues.some((issue) => issue.id === taskId)) {
      return { type: "Kanban", epicId: epic.id };
    }
  }

  // Check if the task belongs to Scrum
  for (const scrum of scrumData) {
    const backlog = scrum.backlog || [];
    if (backlog.some((item) => item.id === taskId)) {
      return { type: "Scrum", scrumId: scrum.id };
    }
  }

  return null; // Task not found
};


  const notifications = [
    {
      id: 1,
      title: 'Personal Roadmap',
      description: 'Credentials Management',
      time: '9 Minutes Ago',
      avatar: img5,
      icon: img6,
      category: 'deadlines',
    },
    {
      id: 2,
      title: 'Group Research Project',
      description: 'Franco Bayani Assigned....',
      time: '1 Hour Ago',
      avatar: img2,
      category: 'assignedtasks',
    },
    {
      id: 3,
      title: 'Group Research Project',
      description: 'Anmark commented on.....',
      time: '1 Hour Ago',
      avatar: img4,
      category: 'socials',
    },
    {
      id: 4,
      title: 'Group Research Project',
      description: 'Franco Bayani Assigned....',
      time: '1 Hour Ago',
      avatar: img2,
      category: 'assignedtasks',
    },
  ];

  
  const [filteredNotifications, setFilteredNotifications] = React.useState(notifications);

  const filterNotifications = (filterValue) => {
    if (filterValue === "all") {
      return notifications; // Show all notifications
    }
    
    return notifications.filter((notification) => {
      if (filterValue === "assignedtasks" && notification.category === "assignedtasks") {
        return true;
      } else if (filterValue === "socials" && notification.category === "socials") {
        return true;
      } else if (filterValue === "deadlines" && notification.category === "deadlines") {
        return true;
      }
      return false;
    });
  };
  
  const handleFilterChangenotification = (event) => {
    const filterValue = event.target.value;
    const filtered = filterNotifications(filterValue); // Use the separate filtering function
    setFilteredNotifications(filtered);
  };




  // para sa calendar ito nakahighlight ang endDate 

  const [popupData, setPopupData] = useState([]); // State for popup data
  const [timeRemaining, setTimeRemaining] = useState(""); // State for dynamic time remaining

   const [projects, setProjects] = useState([]);

    {/*const projects = [
   
    {
      id: "1",
      projectName: "Mobile App Launch",
      endDate: "2024-12-10",
      projectStatus: true,
    },
    
   
  ];*/}

  
// calendar function 
useEffect(() => {
  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchData(user.uid);
    } else {
      console.warn("User is not authenticated.");
    }
  });

  return () => unsubscribe();
}, []);
useEffect(() => {
  const fetchData = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.warn("No user is currently authenticated.");
      return; // Exit the function if no user is logged in
    }

    const uid = currentUser.uid;
    const db = getFirestore();

    try {
      const newProjects = [];

      // Fetch Kanban data
      const kanbanRef = collection(db, `users/${uid}/Kanban`);
      const kanbanSnapshot = await getDocs(kanbanRef);

      for (const docSnap of kanbanSnapshot.docs) {
        const kanbanData = docSnap.data();
        const epicId = docSnap.id; // The epicId is the document ID

        // Get epicName and endDate from the epicId
        const epicRef = doc(db, `Kanban/${epicId}`);
        const epicSnap = await getDoc(epicRef);
        if (epicSnap.exists()) {
          const epicData = epicSnap.data();
          const isProjectDone =
            epicData.projectStatus === "Complete" || epicData.projectStatus === "Finished";

          newProjects.push({
            id: epicId,
            projectName: epicData.epicName,
            endDate: epicData.endDate,
            projectStatus: isProjectDone, // True if projectStatus is 'Complete' or 'Finished'
          });
        }
      }

      // Fetch Scrum data
      const scrumRef = collection(db, `users/${uid}/Scrum`);
      const scrumSnapshot = await getDocs(scrumRef);

      for (const docSnap of scrumSnapshot.docs) {
        const scrumId = docSnap.id; // The scrumId is the document ID

        // Get projectName and endDate from the Scrum collection
        const scrumDataRef = doc(db, `Scrum/${scrumId}`);
        const scrumSnap = await getDoc(scrumDataRef);
        if (scrumSnap.exists()) {
          const scrumData = scrumSnap.data();
          const isDone = scrumData.isDone;
          newProjects.push({
            id: scrumId,
            projectName: scrumData.projectName,
            endDate: scrumData.endDate,
            projectStatus: isDone,
          });
        }
      }

      const roadmapRef = collection(db, `users/${uid}/Roadmap`);
      const roadmapSnapshot = await getDocs(roadmapRef);

      for (const docSnap of roadmapSnapshot.docs) {
        const roadmapData = docSnap.data();
        const roadmapId = docSnap.id; // The roadmapId is the document ID

        // Get projectName and endDate from the roadmapId
        const roadmapDocRef = doc(db, `users/${uid}/Roadmap/${roadmapId}`);
        const roadmapDocSnap = await getDoc(roadmapDocRef);

        if (roadmapDocSnap.exists()) {
          const roadmapDocData = roadmapDocSnap.data();
          const isProjectDone = roadmapDocData.status === "Done";

          newProjects.push({
            id: roadmapId,
            projectName: roadmapDocData.projectName,
            endDate: roadmapDocData.endDate,
            projectStatus: isProjectDone, // True if status is 'Done'
          });
        }
      }

      // Update state with all projects (Kanban, Scrum, Roadmap)
      setProjects(newProjects);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();
}, []);

  
  
  // Function to calculate time remaining
  const calculateTimeRemaining = (endDate) => {
    const currentDateTime = new Date();
    const endDateTime = new Date(`${endDate}T23:59`);

    // Ensure end date is in the future
    if (endDateTime <= currentDateTime) {
      return "Days Remaining";
    }

    // Calculate time difference
    const timeDiff = endDateTime - currentDateTime; // Difference in milliseconds
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24)); // Full days
    const hoursDiff = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600)); // Remaining hours
    const minutesDiff = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60)); // Remaining minutes
    const secondsDiff = Math.floor((timeDiff % (1000 * 60)) / 1000); // Remaining seconds

    // Determine what to display
    let timeRemaining = "";

    if (daysDiff > 0 && hoursDiff === 0) {
      timeRemaining = `${daysDiff} Day${daysDiff === 1 ? "" : "s"}, ${minutesDiff} Minute${minutesDiff === 1 ? "" : "s"}`;
    } else if (daysDiff > 0) {
      timeRemaining = `${daysDiff} Day${daysDiff === 1 ? "" : "s"}, ${hoursDiff} Hour${hoursDiff === 1 ? "" : "s"}`;
    } else if (hoursDiff > 0) {
      timeRemaining = `${hoursDiff} Hour${hoursDiff === 1 ? "" : "s"}, ${minutesDiff} Minute${minutesDiff === 1 ? "" : "s"}`;
    } else if (minutesDiff > 0) {
      timeRemaining = `${minutesDiff} Minute${minutesDiff === 1 ? "" : "s"}, ${secondsDiff} Second${secondsDiff === 1 ? "" : "s"}`;
    } else {
      timeRemaining = `${secondsDiff} Second${secondsDiff === 1 ? "" : "s"}`;
    }

    return timeRemaining;
  };

  // Update timeRemaining dynamically
  useEffect(() => {
    if (popupData) {
      const interval = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining(popupData.endDate));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [popupData]);


  useEffect(() => {
    const fetchPersonalRoadmapData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        console.error("User is not authenticated.");
        return;
      }
  
      const uid = user.uid;
      const db = getFirestore();
      const userroadmapRef = collection(db, `users/${uid}/Roadmap`);
  
      try {
        const querySnapshot = await getDocs(userroadmapRef);
        const roadmapProjects = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(roadmapProjects); // Save the fetched roadmap projects
      } catch (error) {
        console.error("Error fetching Personal Roadmap data:", error);
      }
    };
  
    fetchPersonalRoadmapData();
  }, []);
  

  // Highlight dates logic
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const matchingProjects = projects.filter((project) => {
        const projectEndDate = new Date(project.endDate);
        return projectEndDate.toDateString() === date.toDateString();
      });
  
      if (matchingProjects.length > 0) {
        // Check if any project is incomplete
        const hasIncompleteProjects = matchingProjects.some(
          (project) => !project.projectStatus
        );
  
        if (hasIncompleteProjects) {
          return "highlightWarning"; // Keep highlighting red if any project is incomplete
        }
  
        // If all projects with this date are completed
        return "highlightCompleted"; // Highlight completed projects in green
      }
  
      return null;
    }
  };
  
  
  

  useEffect(() => {
    // Function to handle closing the popup when clicking outside
    const handleOutsideClick = (event) => {
      if (!event.target.closest('.popupdaysRemaining') && !event.target.closest('.react-calendar')) {
        setPopupData(null); // Close the popup if clicked outside
      }
    };
  
    // Add event listener for outside clicks
    document.addEventListener('click', handleOutsideClick);
  
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []); // Empty dependency array to run only once

  // Handle date click
  const handleDateClick = (selectedDate, event) => {
    const matchedProjects = projects.filter(
      (project) =>
        new Date(project.endDate).toDateString() === selectedDate.toDateString()
    );
  
    if (matchedProjects.length > 0) {
      const rect = event.target.getBoundingClientRect();
      const popupPosition = {
        top: rect.top + window.scrollY + 20,
        left: rect.left + window.scrollX + rect.width / 2,
      };
  
      const projectsData = matchedProjects.map((project) => {
        const currentDate = new Date();
        const projectEndDate = new Date(project.endDate);
        const daysRemaining = Math.ceil(
          (projectEndDate - currentDate) / (1000 * 3600 * 24)
        );
  
        return {
          projectName: project.projectName,
          endDate: project.endDate,
          projectId: project.id,
          projectType: determineProjectType(project.id),
          daysRemaining:
            project.projectStatus
              ? "Project Completed"
              : daysRemaining > 0
              ? `${daysRemaining} days remaining`
              : `Past due! ${daysRemaining === 0 ? 'No time left!' : `Overdue by ${Math.abs(daysRemaining)} days`}`,
          isCompleted: project.projectStatus,
          showReminder: !project.projectStatus && daysRemaining <= 7 && daysRemaining > 0,
        };
        
      });
  
      setPopupData({
        projects: projectsData,
        position: popupPosition,
      });
    }
  };
  
  
  const determineProjectType = (projectId) => {
    if (kanbanData.some((kanban) => kanban.id === projectId)) {
      return "Kanban";
    }
    if (scrumData.some((scrum) => scrum.id === projectId)) {
      return "Scrum";
    }
    if (roadmapData.some((roadmap) => roadmap.id === projectId)) {
      return "Roadmap";
    }
    return null;
  };
  

  const [isAuthenticated, setIsAuthenticated] = useState(false);
 

  const [projectCounts, setProjectCounts] = useState({
    total:0 ,
    ongoing:0,
    completed: 0
  });

  
  useEffect(() => {
    const fetchProjectCounts = async () => {
      const auth = getAuth();
      await setPersistence(auth, browserLocalPersistence);
  
      const uid = auth.currentUser ? auth.currentUser.uid : '';
      if (!uid) {
        console.error("No user logged in");
        return;
      }
  
      const db = getFirestore();
      
      // Kanban collection
      const kanbanRef = collection(db, `users/${uid}/Kanban`);
      const kanbanSnapshot = await getDocs(kanbanRef);
  
      let kanbanTotal = 0;
      let kanbanOngoing = 0;
      let kanbanCompleted = 0;
  
      // Kanban task counting
      await Promise.all(
        kanbanSnapshot.docs.map(async (kanbanDoc) => {
          const epicId = kanbanDoc.id;
          const epicRef = doc(db, `Kanban/${epicId}`);
          const epicSnapshot = await getDoc(epicRef);
          const projectStatus = epicSnapshot.data()?.projectStatus;
  
          if (projectStatus === "Complete" || projectStatus === "Finished") {
            kanbanCompleted++;
          } else {
            kanbanOngoing++;
          }
          kanbanTotal++;
        })
      );
  
      // Scrum collection
      const scrumRef = collection(db, `users/${uid}/Scrum`);
      const scrumSnapshot = await getDocs(scrumRef);
  
      let scrumTotal = 0;
      let scrumOngoing = 0;
      let scrumCompleted = 0;
  
      // Scrum task counting
      await Promise.all(
        scrumSnapshot.docs.map(async (scrumDoc) => {
          const scrumId = scrumDoc.id;
          const scrumRef = doc(db, `Scrum/${scrumId}`);
          const scrumSnapshot = await getDoc(scrumRef);
          const isDone = scrumSnapshot.data()?.isDone;
  
          if (isDone === true) {
            scrumCompleted++;
          } else {
            scrumOngoing++;
          }
          scrumTotal++;
        })
      );
  
      // Roadmap collection
      const roadmapRef = collection(db, `users/${uid}/Roadmap`);
      const roadmapSnapshot = await getDocs(roadmapRef);
      
      let roadmapTotal = 0;
      let roadmapOngoing = 0;
      let roadmapCompleted = 0;
      
      // Roadmap task counting
      await Promise.all(
        roadmapSnapshot.docs.map(async (roadmapDoc) => {
          const roadmapId = roadmapDoc.id;
          const roadmapData = roadmapDoc.data();
      
          // Check the status of the roadmap directly
          if (roadmapData.status === "Done") {
            roadmapCompleted++;
          } else {
            roadmapOngoing++;
          }
          
          roadmapTotal++;
        })
      );
      
  
      // Aggregate counts
      const total = kanbanTotal + scrumTotal + roadmapTotal;
      const ongoing = kanbanOngoing + scrumOngoing + roadmapOngoing;
      const completed = kanbanCompleted + scrumCompleted + roadmapCompleted;
  
      // Update state with new counts
      setProjectCounts({
        total,
        ongoing,
        completed
      });
    };
  
    fetchProjectCounts();
  }, []);
  
  
  
  const [subtasksCounts, setSubtaskCounts] = useState({
    Subtasktotal: 0,
    Subtaskongoing: 0,
    Subtaskcompleted: 0,
  });
  
  useEffect(() => {
    const fetchProjectCounts = async () => {
      const auth = getAuth();
      await setPersistence(auth, browserLocalPersistence);
  
      const uid = auth.currentUser ? auth.currentUser.uid : '';
      if (!uid) {
        console.error("No user logged in");
        return;
      }
  
      const db = getFirestore();
  
      // Initialize counts
      let subtotal = 0;
      let subongoing = 0;
      let subcompleted = 0;
  
      // 1. Fetch Kanban data
      const kanbanRef = collection(db, `users/${uid}/Kanban`);
      const kanbanSnapshot = await getDocs(kanbanRef);
  
      // Loop through each document in the Kanban collection
      await Promise.all(
        kanbanSnapshot.docs.map(async (kanbanDoc) => {
          const epicId = kanbanDoc.id;
  
          // Reference to the subcollection containing issues
          const kanbanIssueRef = collection(db, `Kanban/${epicId}/kanbanIssue`);
          const kanbanIssueSnapshot = await getDocs(kanbanIssueRef);
  
          // Iterate through each issue in the subcollection
          kanbanIssueSnapshot.docs.forEach((issueDoc) => {
            const issueData = issueDoc.data();
            const issueStatus = issueData?.issueStatus;
            const assignId = issueData?.assignId;
  
            // Count tasks assigned to the current user
            if (assignId === uid) {
              subtotal++; // Increment total task count
              if (issueStatus === 'Complete') {
                subcompleted++; // Increment completed count
              } else {
                subongoing++; // Increment ongoing count
              }
            }
          });
        })
      );
  
      // 2. Fetch Scrum data
      const scrumRef = collection(db, `users/${uid}/Scrum`);
      const scrumSnapshot = await getDocs(scrumRef);
  
      // Iterate through each Scrum document to check backlog items
      await Promise.all(
        scrumSnapshot.docs.map(async (scrumDoc) => {
          const scrumId = scrumDoc.id;
  
          // Reference to the backlog subcollection
          const backlogRef = collection(db, `Scrum/${scrumId}/backlog`);
          const backlogSnapshot = await getDocs(backlogRef);
  
          backlogSnapshot.docs.forEach((backlogDoc) => {
            const backlogData = backlogDoc.data();
            const backlogStatus = backlogData?.status; // Assuming 'status' indicates Done/Ongoing
            const assigneeList = backlogData?.assignee; // Assuming assignee is an object with assignId
  
            // Ensure assigneeList is an object and check if assignId matches uid
            if (assigneeList?.assignId === uid) {
              
  
              subtotal++; // Increment total task count
              if (backlogStatus === 'Done') {
                subcompleted++; // Increment completed count
              } else {
                subongoing++; // Increment ongoing count
              }
            }
          });
        })
      );
  
      // 3. Fetch Roadmap data
      const roadmapRef = collection(db, `users/${uid}/Roadmap`);
      const roadmapSnapshot = await getDocs(roadmapRef);
  
      // Iterate through each document in the Roadmap collection
      await Promise.all(
        roadmapSnapshot.docs.map(async (roadmapDoc) => {
          const roadmapId = roadmapDoc.id;
  
          // Reference to the roadmapIssues subcollection
          const roadmapIssuesRef = collection(db, `users/${uid}/Roadmap/${roadmapId}/roadmapIssue`);
          const roadmapIssuesSnapshot = await getDocs(roadmapIssuesRef);
  
          // Iterate through each issue in the subcollection
          await Promise.all(
            roadmapIssuesSnapshot.docs.map(async (issueDoc) => {
              const issueData = issueDoc.data();
              const issueStatus = issueData?.status; // Assuming status indicates Done/Ongoing
  
              // Reference to the subtasks for the current roadmapIssue
              const subtasksRef = collection(db, `users/${uid}/Roadmap/${roadmapId}/roadmapIssue/${issueDoc.id}/subtasks`);
              const subtasksSnapshot = await getDocs(subtasksRef);
  
              let allSubtasksDone = true; // Flag to check if all subtasks are done
  
              subtasksSnapshot.docs.forEach((subtaskDoc) => {
                const subtaskStatus = subtaskDoc.data()?.status;
                if (subtaskStatus !== 'Done') {
                  allSubtasksDone = false;
                }
              });
  
              // If all subtasks are done, check the issue status
              if (allSubtasksDone) {
                if (issueStatus === 'Done') {
                  subcompleted++; // If both issue and subtasks are done, it's completed
                } else {
                  subongoing++; // If issue is ongoing, count as ongoing
                }
              } else {
                subongoing++; // If any subtask is not done, count as ongoing
              }
              subtotal++; // Increment total count for each roadmapIssue
            })
          );
        })
      );
  
      // Update state with the final counts
      setSubtaskCounts({
        Subtasktotal: subtotal,
        Subtaskongoing: subongoing,
        Subtaskcompleted: subcompleted,
      });
    };
  
    // Call the fetch function inside useEffect
    fetchProjectCounts();
  }, []); // Empty dependency array means it runs only once when the component mounts
  
  

 
  const [showCalendar, setShowCalendar] = useState(() => JSON.parse(localStorage.getItem('showCalendar')) ?? true);
  const [showNotifications, setShowNotifications] = useState(() => JSON.parse(localStorage.getItem('showNotifications')) ?? true);
  const [showMessage, setShowMessage] = useState(() => JSON.parse(localStorage.getItem('showMessage')) ?? true);
  const [showActiveTasks, setShowActiveTasks] = useState(() => JSON.parse(localStorage.getItem('showActiveTasks')) ?? true);
  const [showTotalProjects, setShowTotalProjects] = useState(() => JSON.parse(localStorage.getItem('showTotalProjects')) ?? true);
  const [showOngoingProjects, setShowOngoingProjects] = useState(() => JSON.parse(localStorage.getItem('showOngoingProjects')) ?? true);
  const [showCompletedProjects, setShowCompletedProjects] = useState(() => JSON.parse(localStorage.getItem('showCompletedProjects')) ?? true);
  const [showTotalTasks, setShowTotalTasks] = useState(() => JSON.parse(localStorage.getItem('showTotalTasks')) ?? true);
  const [showOngoingTasks, setShowOngoingTasks] = useState(() => JSON.parse(localStorage.getItem('showOngoingTasks')) ?? true);
  const [showCompletedTasks, setShowCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('showCompletedTasks')) ?? true);
  const [showProjectOverview, setShowProjectOverview] = useState(() => JSON.parse(localStorage.getItem('showProjectOverview')) ?? true);
  const [showPerformanceOverview, setShowPerformanceOverview] = useState(() => JSON.parse(localStorage.getItem('showPerformanceOverview')) ?? true);
  //
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("Scrum");
  const [selectedFilternotifcon, setSelectedFilternotifcon] = useState("");
  const [currentStartIndex, setCurrentStartIndex] = useState(0);
  const [kanbanData, setKanbanData] = useState([]); // New state for Kanban data
  const [scrumData, setScrumData] = useState([]); // State for Scrum data
  const [roadmapData, setRoadmapData] = useState([]); //
  const navigate = useNavigate();
  // Static projectData remains for Scrum and Roadmap filters
  const projectData = { };

  // Fetch Kanban data from Firestore only once on component mount
  useEffect(() => {
    const fetchKanbanData = async () => {
      try {
        const auth = getAuth();
        await setPersistence(auth, browserLocalPersistence);
  
        const uid = auth.currentUser ? auth.currentUser.uid : '';
        if (!uid) {
          console.error("No user logged in");
          return;
        }
  
        const db = getFirestore();
        const kanbanRef = collection(db, `users/${uid}/Kanban`);
        const kanbanSnapshot = await getDocs(kanbanRef);
  
        const tasksData = await Promise.all(
          kanbanSnapshot.docs.map(async (kanbanDoc) => {
            const epicId = kanbanDoc.id;
            const epicRef = doc(db, `Kanban/${epicId}`);
            const epicSnapshot = await getDoc(epicRef);
  
            if (!epicSnapshot.exists()) {
              console.error(`Epic with ID ${epicId} does not exist.`);
              return null;
            }
  
            const epicData = epicSnapshot.data();
            
            // Check project status and skip if it is "Complete" or "Finished"
            if (epicData.projectStatus === "Complete" || epicData.projectStatus === "Finished") {
              return null;
            }
  
            // Fetch issues to calculate progress
            const kanbanIssueRef = collection(db, `Kanban/${epicId}/kanbanIssue`);
            const kanbanIssueSnapshot = await getDocs(kanbanIssueRef);
  
            const issues = kanbanIssueSnapshot.docs.map((issueDoc) => {
              const issueData = issueDoc.data();
              return {
                effort: issueData.issueEffort || 0, // Default to 0 if not defined
                status: issueData.issueStatus || "To-do",
              };
            });
  
            // Calculate total effort and completed effort for progress calculation
            const totalEffort = issues.reduce(
              (sum, issue) => sum + (issue.status !== "To-do" ? issue.effort : 0),
              0
            );
            const completedEffort = issues.reduce(
              (sum, issue) => sum + (issue.status === "Complete" ? issue.effort : 0),
              0
            );
            const progress = totalEffort > 0 ? (completedEffort / totalEffort) * 100 : 0;
  
            // Fetch members for the epic
            const membersRef = collection(db, `Kanban/${epicId}/Member`);
            const membersSnapshot = await getDocs(membersRef);
  
            const assignees = await Promise.all(
              membersSnapshot.docs.map(async (memberDoc) => {
                const memberUid = memberDoc.id;
                const memberRef = doc(db, `users/${memberUid}`);
                const memberSnapshot = await getDoc(memberRef);
  
                if (memberSnapshot.exists()) {
                  const memberData = memberSnapshot.data();
                  return {
                    name: memberData.firstName || 'Unknown', // Ensure a fallback name
                    userpicture: memberData.userPicture, // URL to the profile picture
                  };
                } else {
                  return null;
                }
              })
            );
  
            // Filter out any null assignees
            const filteredAssignees = assignees.filter((assignee) => assignee !== null);
            const profilePictures = filteredAssignees.map((assignee) => assignee.userpicture);
            const profileImagesName = filteredAssignees.map((assignee) => assignee.name);
            return {
              title: epicData.epicName || "Unnamed Epic",
              progress: Math.round(progress), // Round to nearest integer
              profiles: profilePictures, // Array of profile picture URLs
              profileImagesName: profileImagesName, // Array of profile image names
              id: epicData.projectId || "", // Store epic project ID
            };
          })
        );
  
        // Filter out any null responses if a doc didn't exist or was excluded
        const filteredTasksData = tasksData.filter((task) => task !== null);
  
        // Update the Kanban data state
        setKanbanData(filteredTasksData);
      } catch (error) {
        console.error("Error fetching Kanban data:", error);
      }
    };
  
    fetchKanbanData();
  }, []); // Empty dependency array to run only once
  
  // Fetch Scrum data from Firestore
  useEffect(() => {
    const fetchScrumData = async () => {
      try {
        const auth = getAuth();
        await setPersistence(auth, browserLocalPersistence);
  
        const uid = auth.currentUser ? auth.currentUser.uid : '';
        if (!uid) {
          console.error("No user logged in");
          return;
        }
  
        const db = getFirestore();
        const scrumRef = collection(db, `users/${uid}/Scrum`);
        const scrumSnapshot = await getDocs(scrumRef);
  
        const scrumTasks = await Promise.all(
          scrumSnapshot.docs.map(async (scrumDoc) => {
            const scrumId = scrumDoc.id;
            const scrumRef = doc(db, `Scrum/${scrumId}`);
            const scrumSnapshot = await getDoc(scrumRef);
  
            // Skip if the scrum is marked as done
            if (scrumSnapshot.exists() && scrumSnapshot.data().isDone === true) {
         
              return null; // Skip this scrum
            }
  
            if (scrumSnapshot.exists()) {
              const scrumData = scrumSnapshot.data();
              const projectName = scrumData.projectName || "Unnamed Project";
  
              // Get backlog data for progress calculation
              const backlogRef = collection(db, `Scrum/${scrumId}/backlog`);
              const backlogSnapshot = await getDocs(backlogRef);
  
              let totalEffort = 0;
              let completedEffort = 0;
  
              // Process each task in the backlog
              const backlogTasks = backlogSnapshot.docs.map((taskDoc) => {
                const taskData = taskDoc.data();
                const stats = taskData.stats || {}; // Default to an empty object if stats is missing
                const effort = stats.effort || 0;   // Default to 0 if effort is not defined
                const status = taskData.status || "Unknown"; // Default to "Unknown"
                const issueStatus = taskData.issueStatus || "Unknown"; // Default to "Unknown"
  
                // Skip tasks with issueStatus "backlog"
                if (issueStatus.toLowerCase() === "backlog") {
                
                  return { id: taskDoc.id, effort, status, issueStatus };
                }
  
                // Calculate total and completed effort
                totalEffort += effort;
                if (status === "Done") {
                  completedEffort += effort;
                }
  
                return { id: taskDoc.id, effort, status, issueStatus };
              });
  
              // Calculate the progress as a percentage
              const progress = totalEffort > 0 ? (completedEffort / totalEffort) * 100 : 0;
  
              // Fetch members and their profile pictures
              const memberRef = collection(db, `Scrum/${scrumId}/member`);
              const memberSnapshot = await getDocs(memberRef);
  
              // Fetch the user picture for each member
              const memberProfiles = await Promise.all(
                memberSnapshot.docs.map(async (memberDoc) => {
                  const memberUid = memberDoc.id;
                  const userRef = doc(db, `users/${memberUid}`);
                  const userSnapshot = await getDoc(userRef);
  
                  if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    const userPicture = userData.userPicture || "https://via.placeholder.com/40"; // Default to a placeholder if no picture
                    return userPicture;
                  } else {
                    return "https://via.placeholder.com/40"; // Fallback if user data does not exist
                  }
                })
              );
  
              return {
                title: projectName,
                progress: Math.round(progress), // Round the progress percentage
                profiles: memberProfiles, // Array of profile pictures for members
                id: scrumId,
              };
            } else {
              return null;
            }
          })
        );
  
        // Filter out any null responses
        const filteredScrumData = scrumTasks.filter((task) => task !== null);
  
        // Update the Scrum data state
        setScrumData(filteredScrumData);
      } catch (error) {
        console.error("Error fetching Scrum data:", error);
      }
    };
  
    fetchScrumData();
  }, []); // Empty dependency array to run only once
  

 useEffect(() => {
  const fetchRoadmapData = async () => {
    try {
      const auth = getAuth();
      await setPersistence(auth, browserLocalPersistence);

      const uid = auth.currentUser ? auth.currentUser.uid : '';
      if (!uid) {
        console.error("No user logged in");
        return;
      }

      const db = getFirestore();
      const roadmapRef = collection(db, `users/${uid}/Roadmap`);
      const roadmapSnapshot = await getDocs(roadmapRef);

      let completedTasks = 0; // Counter for completed tasks
      let totalTasks = 0; // Total number of tasks

      const roadmapTasks = await Promise.all(
        roadmapSnapshot.docs.map(async (roadmapDoc) => {
          const roadmapData = roadmapDoc.data();

          // Fetch user profile picture (userPicture) for Roadmap projects
          const userRef = doc(db, `users/${uid}`);
          const userSnapshot = await getDoc(userRef);
          const userPicture = userSnapshot.exists() ? userSnapshot.data().userPicture : null;

          let completedTasksForRoadmap = 0; // Counter for completed tasks specific to this roadmap
          let totalTasksForRoadmap = 0; // Total tasks in this roadmap

          // Fetch roadmapIssue statuses
          const roadmapIssueRef = collection(db, `users/${uid}/Roadmap/${roadmapDoc.id}/roadmapIssue`);
          const roadmapIssueSnapshot = await getDocs(roadmapIssueRef);

          for (const roadmapIssueDoc of roadmapIssueSnapshot.docs) {
            const roadmapIssueData = roadmapIssueDoc.data();
            if (roadmapIssueData.status) {
              totalTasksForRoadmap++; // Increment total task count
              if (roadmapIssueData.status === "Done") {
                completedTasksForRoadmap++; // Increment completed task count
              }
            }

            // Fetch subtasks statuses
            const subtasksRef = collection(
              db,
              `users/${uid}/Roadmap/${roadmapDoc.id}/roadmapIssue/${roadmapIssueDoc.id}/subtasks`
            );
            const subtasksSnapshot = await getDocs(subtasksRef);

            for (const subtaskDoc of subtasksSnapshot.docs) {
              const subtaskData = subtaskDoc.data();
              if (subtaskData.status) {
                totalTasksForRoadmap++; // Increment total task count
                if (subtaskData.status === "Done") {
                  completedTasksForRoadmap++; // Increment completed task count
                }
              }
            }
          }

          // Calculate the percentage of "done" tasks for this roadmap
          let completionPercentage = 0;
          if (totalTasksForRoadmap > 0) {
            completionPercentage = Math.round((completedTasksForRoadmap / totalTasksForRoadmap) * 100);
          }

          // Log the completion percentage for this roadmap
        


          return {
            title: roadmapData.projectName || "Unnamed Roadmap", // Extract only projectName
            profiles: [userPicture || "https://via.placeholder.com/40"], // Include profile picture
            progress: completionPercentage, // Add progress percentage
            id: roadmapDoc.id,
          };
        })
      );

      // Update the Roadmap data state
      setRoadmapData(roadmapTasks);

      // Optional: Log all statuses at the end

    } catch (error) {
      console.error("Error fetching Roadmap data:", error);
    }
  };

  fetchRoadmapData();
}, []); // Empty dependency array to run only once


useEffect(() => {
  if (selectedFilter === "Kanban") {
    setFilteredProjects(kanbanData);
  } else if (selectedFilter === "Scrum") {
    setFilteredProjects(scrumData);
  } else if (selectedFilter === "Roadmap") {
    setFilteredProjects(roadmapData); // Use roadmapData for filtering
  } else {
    setFilteredProjects([]); // No other filters for now
  }
  setCurrentStartIndex(0);
}, [selectedFilter, kanbanData, scrumData, roadmapData]);  

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  const handleLeftNavigation = () => {
    setCurrentStartIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleRightNavigation = () => {
    setCurrentStartIndex((prevIndex) =>
      Math.min(prevIndex + 1, Math.max(filteredProjects.length - 3, 0))
    );
  };


// Now, inside the filtered projects loop or UI rendering, you can retrieve and compare the `title`
const handleProjectClick = (project) => {
  if (project.title) {
    console.log("Project Title:", project.title);
    // You can now use project.title to compare with Kanban or Scrum data
    // Example: Comparing with Kanban data epicName or Scrum projectName

    // Example logic to navigate if title matches epicName or projectName
    if (selectedFilter === "Kanban") {
      // Look for Kanban matching epicName
      const kanbanMatch = kanbanData.find(kanban => kanban.title === project.title);
      if (kanbanMatch) {
        console.log("Redirecting to Kanban for epic:", kanbanMatch);
        // Perform navigation to Kanban board or appropriate route with state
        navigate(`/kanbanboard`, {
          state: {
            id: project.id,  // Use project.id from Kanban data
            epicId: project.id,
          },
        });
      }
    } else if (selectedFilter === "Scrum") {
      // Look for Scrum matching projectName
      const scrumMatch = scrumData.find(scrum => scrum.title === project.title);
      if (scrumMatch) {
        console.log("Redirecting to Scrum project:", scrumMatch);
        // Perform navigation to Scrum project or appropriate route
        navigate(`/scrumprojects`, {
          state: {
            id: project.id,  // Use scrumMatch.id from Scrum data
            scrumId: project.id,
          },
        });
      }
    }else{
      navigate(`/personalroadmap`);
    }
  }
};

async function getTaskType(epicId, db) { // Change taskId to epicId
  const kanbanDocRef = doc(db, `Kanban/${epicId}`); // Use epicId here
  const scrumDocRef = doc(db, `Scrum/${epicId}`); // Use epicId here

  try {
    const kanbanDoc = await getDoc(kanbanDocRef);
    if (kanbanDoc.exists()) {
      return "Kanban";
    }

    const scrumDoc = await getDoc(scrumDocRef);
    if (scrumDoc.exists()) {
      return "Scrum";
    }

    return null; // Task not found in either collection
  } catch (error) {
    console.error("Error checking task existence:", error);
    return null;
  }
}
const getIconSrc = (type) => {
  const typeLowerCase = type?.toLowerCase(); // Handle case insensitivity
  switch (typeLowerCase) {
    case 'bug':
      return bug; // Bug icon
    case 'task':
      return task; // Task icon
    case 'story':
      return story; // Story icon
    default:
      return ''; // Fallback for unknown types, or you can provide a generic default icon
  }
};




const [tooltipStatesOverview, setTooltipStatesOverview] = useState({});
const titleOverviewRefs = useRef({});

// Add this useEffect to check for text overflow
useEffect(() => {
  // Check each title element for overflow
  Object.keys(titleOverviewRefs.current).forEach(projectId => {
    const element = titleOverviewRefs.current[projectId];
    if (element) {
      const isOverflow = element.offsetWidth < element.scrollWidth;
      setTooltipStatesOverview(prev => ({
        ...prev,
        [projectId]: {
          isOverflowing: isOverflow,
          showTooltip: false
        }
      }));
    }
  });
}, [projects]);


const [tooltipStatesRecent, setTooltipStatesRecent] = useState({});
const titleRecentRefs = useRef({});

// Add this useEffect to check for text overflow
useEffect(() => {
  // Check each title element for overflow
  Object.keys(titleRecentRefs.current).forEach(scrumId => {
    const element = titleRecentRefs.current[scrumId];
    if (element) {
      const isOverflow = element.offsetWidth < element.scrollWidth;
      setTooltipStatesRecent(prev => ({
        ...prev,
        [scrumId]: {
          isOverflowing: isOverflow,
          showTooltip: false
        }
      }));
    }
  });
}, [projects]);


const [tooltipStatesActiveTask, setTooltipStatesActiveTask] = useState({});
const titleActiveTaskRefs = useRef({});

// Add this useEffect to check for text overflow
useEffect(() => {
  // Check each title element for overflow
  Object.keys(titleActiveTaskRefs.current).forEach(epicId => {
    const element = titleActiveTaskRefs.current[epicId];
    if (element) {
      const isOverflow = element.offsetWidth < element.scrollWidth;
      setTooltipStatesActiveTask(prev => ({
        ...prev,
        [epicId]: {
          isOverflowing: isOverflow,
          showTooltip: false
        }
      }));
    }
  });
}, [projects]);

  return (
    
    <main className="main-container">
      <div className="main-title">
        <h1 className="dashboardtitle">Dashboard</h1>
      </div>

      {/* Dashboard Cards and Calendar Section */}
      <div className="flex">
        {/* Dashboard Cards */}
        <div className="main-cards grid grid-cols-3 gap-4 flex-grow">
        <div className={`card ${showTotalProjects ? 'visible-content' : 'invisible-content'}`} draggable="true">
        <div className="card-inner">
            <div className="menu-dots" onClick={() => toggleRemoveMenu('totalProjects')}>. . .</div>
            {activeCard === 'totalProjects' && <div className="remove-button-totalP" onClick={() => handleRemoveCard('totalProjects')}>Remove</div>}
            <h1 className="TotalProCount" id="TotalProCount">{projectCounts.total}</h1>
            <label className="TotalPro" id="TotalPro">Total Projects</label>
          </div>
        </div>

{/* Add confirmation popup for Total Projects */}
{showTotalProjects && confirmPopup === 'totalProjects' && (
              <div className='modal-confirmation'>
            <div className="confirmation-popup-totalproj">
              <p>Are you sure you want to remove the Total Projects Widget?</p>
              <div className="action-buttons">
              <button className="btnYestotalproj" onClick={() => handleConfirmRemove('totalProjects')}>Yes</button>
              <button className="btnNototalproj" onClick={handleCancelRemove}>No</button>
              </div>
            </div>
            </div>
          )}


<div className={`card ${showOngoingProjects ? 'visible-content' : 'invisible-content'}`} draggable="true">
<div className="card-inner">
            <div className="menu-dots" onClick={() => toggleRemoveMenu('ongoingProjects')}>. . .</div>
            {activeCard === 'ongoingProjects' && <div className="remove-button-ongoingP" onClick={() => handleRemoveCard('ongoingProjects')}>Remove</div>}
            <h1 className="ongoingproj" id="ongoingproj">{projectCounts.ongoing}</h1>
            <label className="TotalPro" id="ongoingprolabel">Ongoing Projects</label>
          </div>
        </div>


          {/* Add confirmation popup for Total Projects */}
{showOngoingProjects && confirmPopup === 'ongoingProjects' && (
  <div className='modal-confirmation-ongoingproj'>
            <div className="confirmation-popupongoingproj">
              <p>Are you sure you want to remove the Ongoing Projects Widget?</p>
              <div className="action-buttons">
              <button className="btnYesongoingproj" onClick={() => handleConfirmRemove('ongoingProjects')}>Yes</button>
              <button className="btnNoongoingproj" onClick={handleCancelRemove}>No</button>
              </div>
            </div>
            </div>
          )}

<div className={`card ${showCompletedProjects ? 'visible-content' : 'invisible-content'}`} draggable="true">
<div className="card-inner">
            <div className="menu-dots" onClick={() => toggleRemoveMenu('completeProjects')}>. . .</div>
            {activeCard === 'completeProjects' && <div className="remove-button-complP" onClick={() => handleRemoveCard('completeProjects')}>Remove</div>}
            <h1 className="completeproj" id="completeproj">{projectCounts.completed}</h1>
            <label className="TotalPro" id="completeprojlabel">Completed Projects</label>
          </div>
        </div>


          {showCompletedProjects && confirmPopup === 'completeProjects' && (
            <div className='modal-confirmation-completeproj'>
            <div className="confirmation-popupcompleteproj">
              <p>Are you sure you want to remove the Completed Projects Widget?</p>
              <div className="action-buttons">
              <button className="btnYescompleteproj" onClick={() => handleConfirmRemove('completeProjects')}>Yes</button>
              <button className="btnNocompleteproj" onClick={handleCancelRemove}>No</button>
              </div>
            </div>
            </div>
          )}

<div className={`card ${showTotalTasks ? 'visible-content' : 'invisible-content'}`} draggable="true">
<div className="card-inner">
            <div className="menu-dots" onClick={() => toggleRemoveMenu('totalTasks')}>. . .</div>
            {activeCard === 'totalTasks' && <div className="remove-button-taskstotal" onClick={() => handleRemoveCard('totalTasks')}>Remove</div>}
              <h1 className="totaltask" id="totaltask">{subtasksCounts.Subtasktotal}</h1>
              <label className="TotalPro" id="totaltasklabel">Total Tasks</label>
            </div>
          </div>


          {showTotalTasks && confirmPopup === 'totalTasks' && (
             <div className='modal-confirmation-totaltasks'>
            <div className="confirmation-popuptotaltasks">
              <p>Are you sure you want to remove the Total Tasks Widget?</p>
              <div className="action-buttons">
              <button className="btnYestotaltasks" onClick={() => handleConfirmRemove('totalTasks')}>Yes</button>
              <button className="btnNototaltasks" onClick={handleCancelRemove}>No</button>
              </div>
            </div>
            </div>
          )}

<div className={`card ${showOngoingTasks ? 'visible-content' : 'invisible-content'}`} draggable="true">
<div className="card-inner">
            <div className="menu-dots" onClick={() => toggleRemoveMenu('ongoingTasks')}>. . .</div>
            {activeCard === 'ongoingTasks' && <div className="remove-button-ongoingtasks" onClick={() => handleRemoveCard('ongoingTasks')}>Remove</div>}
              <h1 className="taskongoing" id="taskongoing">{subtasksCounts.Subtaskongoing}</h1>
              <label className="TotalPro" id="taskongoinglabel">Ongoing Tasks</label>
            </div>
          </div>


          {showOngoingTasks && confirmPopup === 'ongoingTasks' && (
            <div className='modal-confirmation-ongoingtasks'>
            <div className="confirmation-popup-ongoingtasks">
              <p>Are you sure you want to remove the Ongoing Tasks Widget?</p>
              <div className="action-buttons">
              <button className="btnYesongoingtasks" onClick={() => handleConfirmRemove('ongoingTasks')}>Yes</button>
              <button className="btnNoongoingtasks" onClick={handleCancelRemove}>No</button>
              </div>
            </div>
            </div>  
          )}

<div className={`card ${showCompletedTasks ? 'visible-content' : 'invisible-content'}`} draggable="true">
<div className="card-inner">
            <div className="menu-dots" onClick={() => toggleRemoveMenu('completeTasks')}>. . .</div>
            {activeCard === 'completeTasks' && <div className="remove-button-completetasks" onClick={() => handleRemoveCard('completeTasks')}>Remove</div>}
              <h1 className="completedtask" id="completedtask">{subtasksCounts.Subtaskcompleted}</h1>
              <label className="TotalPro" id="completedtasklabel">Completed Tasks</label>
            </div>
          </div>
        </div>


        {showCompletedTasks && confirmPopup === 'completeTasks' && (
          <div className='modal-confirmation-completetasks'>
            <div className="confirmation-popupcompletetasks">
              <p>Are you sure you want to remove the Completed Tasks Widget?</p>
              <div className="action-buttons">
              <button className="btnYescompletetasks" onClick={() => handleConfirmRemove('completeTasks')}>Yes</button>
              <button className="btnNocompletetasks" onClick={handleCancelRemove}>No</button>
              </div>
            </div>
            </div>
          )}

<div className="ml-6 flex-shrink-0 bg-white shadow-md rounded-lg p-4">
  <div className={`calendar-container ${showCalendar ? 'visible-content' : 'invisible-content'}`}>
   <div className="menu-dots-calendar" onClick={() => toggleRemoveMenu('react-calendar')}>. . .</div>
    {activeCard === 'react-calendar' && <div className="remove-button-calendar" onClick={() => handleRemoveCard('react-calendar')}>Remove</div>}
    <Calendar onChange={setDate} value={date}   tileClassName={tileClassName}
  onClickDay={handleDateClick} locale={enUS} className="react-calendar" draggable/>



{popupData && popupData.projects && (
  <div
    className="popupdaysRemaining"
    style={{
      position: "absolute",
      top: popupData.position?.top ? `${popupData.position.top}px` : "-50%",
      left: popupData.position?.left ? `${popupData.position.left}px` : "-50%",
      transform: "translate(-50%, -50%)",
    }}
  >
    {popupData.projects.map((project, index) => (
      <div className="dateRemindGroup" key={index}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {project.isCompleted ? (
            <div className="iconCompleted">
              <img
                src={DoneIcon} // Replace with actual icon path
                alt="Completed Icon"
                style={{ width: "24px", height: "24px" }}
              />
              <div className="tooltipCompleted">This Project is Completed</div>
            </div>
          ) : (
            project.showReminder && (
              <div className="iconReminder">
                <img
                  src={ReminderIcon} // Replace with actual icon path
                  alt="Reminder Icon"
                  style={{ width: "24px", height: "24px" }}
                />
                <div className="tooltipReminder">
                  Just a quick reminder that your project due date is coming up
                  soon. Please make sure to finish all tasks.
                </div>
              </div>
            )
          )}
          <p
            className="calendarProjectName"
            onClick={() => {
              if (project.projectType === "Kanban") {
                navigate(`/kanbanboard`, {
                  state: { id: project.projectId, epicId: project.projectId },
                });
              } else if (project.projectType === "Scrum") {
                navigate(`/scrumprojects`, {
                  state: { id: project.projectId, scrumId: project.projectId },
                });
              } else if (project.projectType === "Roadmap") {
                navigate(`/personalroadmap`, {
                  state: { id: project.projectId, roadmapId: project.projectId },
                });
              }
            }}
          >
            <img
              src={epicIcon} // Replace with actual icon path
              alt=""
              className="projectIcon"
              style={{ width: "15px", height: "15px" }}
            />
            {project.projectName}
          </p>
        </div>
        <p className="daysRemaining">{project.daysRemaining}</p>
      </div>
    ))}
  </div>
)}




     
  </div> 
</div>
{showCalendar && confirmPopup === 'react-calendar' && (
  <div className='modal-confirmation-calendar'>
  <div className="confirmation-popupcalendar">
    <p>Are you sure you want to remove the Calendar Widget?</p>
    <div className="action-buttons">
    <button className="btnYescalendar" onClick={() => handleConfirmRemove('react-calendar')}>Yes</button>
    <button className="btnNocalendar" onClick={handleCancelRemove}>No</button>
    </div>
  </div>
  </div>
)}
</div>

      {/* Project Overview Section */}
       <div
      className={`project-overview-container ${
        showProjectOverview ? 'visible-content' : 'invisible-content'
      }`}
      id="project-overview-container"
      draggable

      style={{ height: 200}}
    >
      <h2 className="overview-title">Project Overview</h2>

      {/* Filter Dropdown */}
      <div className="filter-dropdown">
        <select
          value={selectedFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="filter-select"
        >
          <option value="Scrum">Scrum</option>
          <option value="Roadmap">Roadmap</option>
          <option value="Kanban">Kanban</option>
        </select>




        {/* Navigation Buttons */}
        <div className="nav-buttons">
          <button
            className="left-button"
            onClick={handleLeftNavigation}
            disabled={currentStartIndex === 0}
          >
            &lt;
          </button>
          <button
            className="right-button"
            onClick={handleRightNavigation}
            disabled={currentStartIndex >= filteredProjects.length - 3}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="overview-cards">
      {filteredProjects.length === 0 ? (
    <div className="no-projects-message">No active project yet!</div>
  ) : (
    filteredProjects.slice(currentStartIndex, currentStartIndex + 3).map((project, index) => (
      <div
        key={index}
        onClick={() => handleProjectClick(project)}
        className="overview-card"
        style={{ textDecoration: 'none', cursor: 'pointer' }}
      >
        <h3 className='overview-project-title' 
        
        ref={el => titleOverviewRefs.current[project.id] = el}
           onMouseEnter={() => {
             if (tooltipStatesOverview[project.id]?.isOverflowing) {
               setTooltipStatesOverview(prev => ({
                 ...prev,
                 [project.id]: {
                   ...prev[project.id],
                   showTooltip: true
                 }
               }));
             }
           }}
           onMouseLeave={() => {
             setTooltipStatesOverview(prev => ({
               ...prev,
               [project.id]: {
                 ...prev[project.id],
                 showTooltip: false
               }
             }));
           }}
         >
           {project.title}
           {tooltipStatesOverview[project.id]?.showTooltip && (
             <div className="overview-title-tooltip">{project.title}</div>
           )}</h3>
        <p>Project Progress: {project.progress}%</p>
        <progress value={project.progress} max="100" className="progress-bar"></progress>
        <div className="assignees">
          {Array.isArray(project.profiles) &&
            project.profiles.slice(0, 3).map((profile, idx) => {
              const assigneeName =
                project.members && Array.isArray(project.members)
                  ? project.members[idx]?.name
                  : project.profileImagesName?.[idx] || 'Unknown';

              return (
                <div key={idx} className="assignee-user-image">
                  {profile ? (
                    <img src={profile} alt={`${assigneeName}'s avatar`} />
                  ) : (
                    <span className="assignee-avatar">
                      {assigneeName && assigneeName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              );
            })}
          {Array.isArray(project.profiles) && project.profiles.length === 3 && (
            <div className="assignee-count">+1</div>
          )}
          {Array.isArray(project.profiles) && project.profiles.length > 3 && (
            <div className="extra-count">+{project.profiles.length - 3}</div>
          )}
        </div>
      </div>
    ))
  )}
</div>

<div className="menu-dots" onClick={() => toggleRemoveMenu('Projectoverview')}>. . .</div>
        {activeCard === 'Projectoverview' && <div className="remove-button-projectoverview" onClick={() => handleRemoveCard('Projectoverview')}>Remove</div>}
        
        {showProjectOverview && confirmPopup === 'Projectoverview' && (
          <div className='modal-confirmation-projoverview'>
            <div className="confirmation-popupprojoverview">
              <p>Are you sure you want to remove the Project Overview Widget?</p>
               <div className="action-buttons">
              <button className="btnYesprojoverview" onClick={() => handleConfirmRemove('Projectoverview')}>Yes</button>
              <button className="btnNoprojoverview" onClick={handleCancelRemove}>No</button>
              </div>
            </div>
            </div>
          )}
    </div>



{/* Recent Messages Section */}
<div className={`recent-messages-container ${showMessage ? 'visible-content' : 'invisible-content'}`} draggable>
    <div className="menu-dots" onClick={() => toggleRemoveMenu('recentmessages')}>. . .</div>
    {activeCard === 'recentmessages' && (
      <div className="remove-button-recentmessages" onClick={() => handleRemoveCard('recentmessages')}>
        Remove
      </div>
    )}

    {/* Recent Messages Header */}
    <div className="recent-messages-header">
  <h2>Recent Messages</h2>
  <div className="search-box">
    <input
      type="text"
      placeholder="Search"
      className="searchrecent"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    <img src={img0} alt="" className="magnifyingglass" />
  </div>
</div>

<div className="messages-list">
{messages.length === 0 ? (
    <div className="no-messages">
      <p>No Recent Message yet!</p>
    </div>
  ) : (
    messages
      .filter((msg) =>
        msg.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((msg) => (
        <div key={msg.id} className="message-item">
          <div className="message-icon">
            <img src={msg.icon} alt="Project Icon" />
          </div>
          <div className="message-details">
          <div
              className="message-title"
              onClick={() => handleTitleClick(msg.scrumId)}
              style={{ cursor: "pointer" }}
             ref={el => titleRecentRefs.current[msg.scrumId] = el}
                onMouseEnter={() => {
                  if (tooltipStatesRecent[msg.scrumId]?.isOverflowing) {
                    setTooltipStatesRecent(prev => ({
                      ...prev,
                      [msg.scrumId]: {
                        ...prev[msg.scrumId],
                        showTooltip: true
                      }
                    }));
                  }
                }}
                onMouseLeave={() => {
                  setTooltipStatesRecent(prev => ({
                    ...prev,
                    [msg.scrumId]: {
                      ...prev[msg.scrumId],
                      showTooltip: false
                    }
                  }));
                }}
            >
              {msg.title}
              {tooltipStatesRecent[msg.scrumId]?.showTooltip && (
      <div className="recent-title-tooltip">{msg.title}</div>
    )}
              {msg.unreadCount > 0 && (
                <span className="unread-badge">+{msg.unreadCount}</span>
              )}
            </div>
            <div className="message-snippet">
              {msg.sender}: {msg.snippet}
            </div>
          </div>
          <div className="message-time">{msg.time}</div>
        </div>
      ))
  )}
</div>
</div>

  {/* Remove confirmation popup for Recent Messages */}
  {showMessage && confirmPopup === 'recentmessages' && (
    <div className='modal-confirmation-recentmessages'>
    <div className="confirmation-popup-recentmessage">
      <p>Are you sure you want to remove the Recent Messages Widget?</p>
      <div className="action-buttons">
      <button className="btnYesRecentM" onClick={() => handleConfirmRemove('recentmessages')}>Yes</button>
      <button className="btnNoRecentM" onClick={handleCancelRemove}>No</button>
      </div>
    </div>
    </div>
  )}


      


      {/* Chart Section */}
      <div className="chart-container visible-content" id="chartcontainer" draggable>
      <label className="chart-title-label">Performance Overview</label>
      <div className="filter-dropdown-chart">
        <select
          className="filter-select-lastYMW"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="Last Year">Last Year</option>
          <option value="Last Month">Last Month</option>
        </select>
        <select
          className="filter-select-protask"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="Project">Project</option>
          <option value="Task">Task</option>
        </select>
      </div>
      <div className="menu-dots" onClick={() => toggleRemoveMenu('chart')}>. . .</div>
      <Bar data={generateChartData()} options={options} />
    
    {activeCard === 'chart' && <div className="remove-button-chart" onClick={() => handleRemoveCard('chart')}>Remove</div>}
      {showPerformanceOverview && confirmPopup === 'chart' && (
        <div className='modal-confirmation-chart'>
            <div className="confirmation-popup-chart">
              <p>Are you sure you want to remove the Chart Widget?</p>
              <div className="action-buttons">
              <button className="btnYeschart" onClick={() => handleConfirmRemove('chart')}>Yes</button>
              <button className="btnNochart" onClick={handleCancelRemove}>No</button>
              </div>
            </div>
            </div>
          )} 
</div>

      {/* Add New Widget Button */}
      <div className="addnewWidget">
        <button className="addwidgetbutton" onClick={() => setShowPopup(true)}>
          <img src={img1} alt="" className="addnewwidgetIcon" />
          Add New Widget
        </button>

        {/* Popup component, only shown when showPopup is true */}
        <AddWidgetPopup show={showPopup} onClose={() => setShowPopup(false)} onAddWidget={handleAddWidget} />
      </div>

      <div className={`notification-container ${showNotifications ? 'visible-content' : 'invisible-content'}`}>
      <div className="menu-dots-notif" onClick={() => toggleRemoveMenu('notification-container')}>. . .</div>
      {activeCard === 'notification-container' && <div className="remove-button-notifcon" onClick={() => handleRemoveCard('notification-container')}>Remove</div>}


      {showNotifications && confirmPopup === 'notification-container' && (
        <div className='modal-confirmation-notifcontainer'>
            <div className="confirmation-popup-notification-container">
              <p>Are you sure you want to remove the Notification Widget?</p>
              <div className="action-buttons">
              <button className="btnYesnotifcon" onClick={() => handleConfirmRemove('notification-container')}>Yes</button>
              <button className="btnNonotifcon" onClick={handleCancelRemove}>No</button>
              </div>
            </div>
            </div>
          )} 
            <h3>Notifications</h3>
            <select
      className="notificationfilter"
      onChange={handleFilterChangenotification} // Use the dedicated handler
    >
      <option value="all">All</option>
      <option value="assignedtasks">Assigned Task</option>
      <option value="deadlines">Deadlines</option>
      <option value="socials">Socials</option>
    </select>

    <div className="notification-widget-item">
      {filteredNotifications.map((notification) => (
        <div key={notification.id} className="notification-item">
          <img src={notification.avatar} alt="Avatar" className="avatar" />
          <div className="notification-details">
            <h4 className="notifname">{notification.title}</h4>
            <p>
              {notification.icon && (
                <img src={notification.icon} alt="" className="credentialsicon" />
              )}
              {notification.description}
            </p>
            <span className="time">{notification.time}</span>
          </div>
        </div>
      ))}


              </div>
            </div>

            <div className={`activetaskcon ${showActiveTasks ? 'visible-content' : 'invisible-content'}`}>
  <div className="menu-dots-activetask" onClick={() => toggleRemoveMenu('activetaskcon')}>. . .</div>
  {activeCard === 'activetaskcon' && <div className="remove-button-activetask" onClick={() => handleRemoveCard('activetaskcon')}>Remove</div>}

  {showActiveTasks && confirmPopup === 'activetaskcon' && (
    <div className='modal-confirmation-activetasks'>
      <div className="confirmation-popup-activetask-container">
        <p>Are you sure you want to remove the Active Task Widget?</p>
        <div className="action-buttons">
        <button className="btnYesactivetask" onClick={() => handleConfirmRemove('activetaskcon')}>Yes</button>
        <button className="btnNoactivetask" onClick={handleCancelRemove}>No</button>
        </div>
      </div>
    </div>
  )}
  
  <h3>Active Tasks</h3>
  {/* Sort By Dropdown */}
  <span className="sortduedate">
      Sort by: 
      <button 
        onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} 
        className="sort-dropdown-btn"
       
      >
        {selectedSort}
      </button>
      {isSortDropdownOpen && (
        <div className="sort-dropdown-menu" >
          <button 
            onClick={() => {
              setSelectedSort('Newest');
              setIsSortDropdownOpen(false);
            }} 
           
          >
            Newest
          </button>
          <button 
            onClick={() => {
              setSelectedSort('Oldest');
              setIsSortDropdownOpen(false);
            }} 
            style={{ padding: '10px', width: '100%', textAlign: 'left', cursor: 'pointer' }}
          >
            Oldest
          </button>
        </div>
      )}
    </span>

  <div className="acttask-search-box">
    <input
      type="text"
      placeholder="Search"
      className="searchacttask"
      value={activeTaskSearchQuery}
      onChange={(e) => setActiveTaskSearchQuery(e.target.value)}
    />
    <img src={img0} alt="" className="magnifyingglass-acttask" />
  </div>

 {/* Task List */}
 <div className="activetask-widget-item">
 {sortedTasks.length === 0 ? (
    <p className="no-tasks-message">No active task yet!</p>
  ) : (
    sortedTasks.map((task) => (
      <div key={task.id} className="activetask-item">
        <img src={task.img} alt="Avatar" className="activetaskavatar" />
        <div className="activetask-details">
        <h4
            className="activetaskname"
            onClick={async () => {
              const taskType = await getTaskType(task.epicId, db);
              if (taskType === "Kanban") {
                navigate(`/kanbanboard`, {
                  state: { id: task.epicId },
                });
              } else if (taskType === "Scrum") {
                navigate(`/scrumprojects`, {
                  state: { id: task.epicId },
                });
              } else {
                console.log("Task not found in Kanban or Scrum");
              }
            }}
            ref={el => titleActiveTaskRefs.current[task.title] = el}
            onMouseEnter={() => {
              if (tooltipStatesActiveTask[task.title]?.isOverflowing) {
                setTooltipStatesActiveTask(prev => ({
                  ...prev,
                  [task.title]: {
                    ...prev[task.title],
                    showTooltip: true
                  }
                }));
              }
            }}
            onMouseLeave={() => {
              setTooltipStatesActiveTask(prev => ({
                ...prev,
                [task.title]: {
                  ...prev[task.title],
                  showTooltip: false
                }
              }));
            }}>
            {task.title}
            {tooltipStatesActiveTask[task.title]?.showTooltip && (
      <div className="Activetask-title-tooltip">{task.title}</div>
    )}
          </h4>
          <p>
            <img src={getIconSrc(task.type)} alt="" className="credentialsicon" />
            {task.description}
          </p>
          <span className="activetasktime">{task.time}</span>
        </div>
      </div>
    ))
  )}
</div>

        </div>

        

      
    </main>
  );
}

export default Home;