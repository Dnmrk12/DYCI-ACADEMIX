import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './headerdashboard.css';
import img0 from './iconshomepage/notifbell.png';
import img1 from './iconshomepage/userprofile.png';
import img2 from './iconshomepage/newest.png';
import img3 from './iconshomepage/markallread.png';
import img4 from './iconshomepage/notifprofile1.png';
import img5 from './iconshomepage/notifprofile2.png';
import img6 from './iconshomepage/notifprofile3.png';
import img7 from './iconshomepage/notifprofile4.png';
import { Link } from 'react-router-dom'; // Import useLocation
import { getFirestore, collection,limit, addDoc,doc , getDocs,getDoc,increment, deleteDoc ,setDoc, query,orderBy, onSnapshot, where,updateDoc, arrayRemove ,arrayUnion, serverTimestamp} from 'firebase/firestore';

import { getStorage, ref, uploadBytes,  getDownloadURL ,uploadString} from 'firebase/storage';

import { getAuth, setPersistence, browserLocalPersistence,signOut } from "firebase/auth";
import { db } from './firebase/firebaseConfig'; 
function Header() {
  const storedProjectDetails = JSON.parse(localStorage.getItem('selectedProject')) || {};
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [userPicture, setUserPicture] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const storedFirstName = localStorage.getItem('firstName');
    const storedUserPicture = localStorage.getItem('userPicture');
    if (storedFirstName && storedUserPicture) {
        setFirstName(storedFirstName);
        setUserPicture(storedUserPicture);
    }
}, []);


  // Toggle dropdown
  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear all relevant localStorage items
      localStorage.removeItem('firstName');
      localStorage.removeItem('email');
      localStorage.removeItem('password');
      navigate('/'); // Assuming the login form is at the root route
      console.log('Logout successful'); // Add this line for debugging
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };
  // Toggle notifications dropdown
  const [allRead, setAllRead] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [isFetching, setIsFetching] = useState(false); // Add a flag to prevent duplicate fetching
  const [notifications, setNotifications] = useState([]);
const unreadCount = notifications.filter((notif) => notif.unread).length;
  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    } else {
      fetchNotifications(); // Fetch if not already stored
    }
  }, []);

 
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    const seconds = diffInSeconds;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
  
    if (years > 0) {
      return years === 1 ? '1 year ago' : `${years} years ago`;
    }
    
    if (months > 0) {
      return months === 1 ? '1 month ago' : `${months} months ago`;
    }
    
    if (days > 0) {
      return days === 1 ? '1 day ago' : `${days} days ago`;
    }
    
    if (hours > 0) {
      return hours === 1 ? '1 hr ago' : `${hours} hrs ago`;
    }
    
    if (minutes > 0) {
      return minutes === 1 ? '1 min ago' : `${minutes} mins ago`;
    }
    
    if (seconds > 0) {
      return seconds === 1 ? '1 sec ago' : `${seconds} secs ago`;
    }
    
    return 'just now';
  };

  const fetchNotifications = async () => {
    try {
      const auth = getAuth();
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.error("User is not authenticated.");
        return;
      }
  
      const newNotifications = [];
  
      // Fetch Kanban notifications
      const kanbanRef = collection(db, `users/${uid}/Kanban`);
      const kanbanSnapshot = await getDocs(kanbanRef);
      const epicIds = [];
      kanbanSnapshot.forEach((doc) => epicIds.push(doc.id));
  
      // Kanban notification processing
      for (const epicId of epicIds) {
        const notifRef = collection(db, `Kanban/${epicId}/kanbanNotif`);
        const notifSnapshot = await getDocs(notifRef);
  
        for (const notifDoc of notifSnapshot.docs) {
          const notifData = notifDoc.data();
          const dynamicData = notifData.context;
  
          // Ensure all required fields are present
          if (!Array.isArray(notifData.receiver) || !notifData.receiver.includes(uid)) continue;
  
          const senderUid = notifData.sender;
          if (!senderUid) continue;
  
          const userRef = doc(db, `users/${senderUid}`);
          const userSnapshot = await getDoc(userRef);
          if (!userSnapshot.exists()) continue;
  
          const userData = userSnapshot.data();
          const userName = `${userData.firstName} ${userData.lastName}`;
  
          const epicDocRef = doc(db, `Kanban/${epicId}`);
          const epicDocSnapshot = await getDoc(epicDocRef);
          if (!epicDocSnapshot.exists()) continue;
  
          const epicData = epicDocSnapshot.data();
          const epicName = epicData.epicName || "Unknown Epic";
          const avatar = epicData.projectPicture || "https://firebasestorage.googleapis.com/v0/b/dyci-academix.appspot.com/o/Messenger_creation_509387898792656.jpeg?alt=media&token=8122ae8b-95e1-45b4-8a25-a180f6c0ff6f&fbclid=IwY2xjawHIQkxleHRuA2FlbQIxMAABHX0cibeCI97PahwfUeZTcAQIeCon4jAuNEWJALd1rZBsaSN1seKUH704lA_aem_OblAINjigEkiR3VF1nHM-Q";
          const endDate = epicData.endDate ? new Date(epicData.endDate) : null;
  
          let daysRemaining = null;
          if (endDate) {
            const timeDiff = endDate.getTime() - new Date().getTime();
            daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          }
  
          const notification = {
            id: notifData.id,
            key: `${notifData.id}-${epicId}`,
            type: notifData.type || "unknown",
            avatar,
            userName,
            action: notifData.action || "performed an action",
            context: epicName,
            timestamp: new Date(notifData.timeAgo),
            subType: notifData.subType || "general",
            unread: notifData.unread || false,
            daysRemaining,
            fetchdata: dynamicData,
          };
  
          newNotifications.push(notification);
        }
      }
  
      // Fetch Scrum notifications
      const scrumRef = collection(db, `users/${uid}/Scrum`);
      const scrumSnapshot = await getDocs(scrumRef);
  
      for (const scrumDoc of scrumSnapshot.docs) {
        const scrumId = scrumDoc.id;
        const notifRef = collection(db, `Scrum/${scrumId}/scrumNotif`);
        const notifSnapshot = await getDocs(notifRef);
  
        for (const notifDoc of notifSnapshot.docs) {
          const notifData = notifDoc.data();
          const dynamicData = notifData.context;
  
          // Ensure all required fields are present
          if (!Array.isArray(notifData.receiver) || !notifData.receiver.includes(uid)) continue;
  
          const senderUid = notifData.sender;
          if (!senderUid) continue;
  
          const userRef = doc(db, `users/${senderUid}`);
          const userSnapshot = await getDoc(userRef);
          if (!userSnapshot.exists()) continue;
  
          const userData = userSnapshot.data();
          const userName = `${userData.firstName} ${userData.lastName}`;
  
          const scrumDocRef = doc(db, `Scrum/${scrumId}`);
          const scrumDocSnapshot = await getDoc(scrumDocRef);
          if (!scrumDocSnapshot.exists()) continue;
  
          const scrumData = scrumDocSnapshot.data();
          const projectName = scrumData.projectName || "Unknown Project";
          const avatar = scrumData.icon || "https://firebasestorage.googleapis.com/v0/b/dyci-academix.appspot.com/o/Messenger_creation_509387898792656.jpeg?alt=media&token=8122ae8b-95e1-45b4-8a25-a180f6c0ff6f&fbclid=IwY2xjawHIQkxleHRuA2FlbQIxMAABHX0cibeCI97PahwfUeZTcAQIeCon4jAuNEWJALd1rZBsaSN1seKUH704lA_aem_OblAINjigEkiR3VF1nHM-Q";
          const endDate = scrumData.endDate ? new Date(scrumData.endDate) : null;
  
          let daysRemaining = null;
          if (endDate) {
            const timeDiff = endDate.getTime() - new Date().getTime();
            daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          }
  
          const notification = {
            id: notifData.id,
            key: `${notifData.id}-${scrumId}`,
            type: notifData.type || "unknown",
            avatar,
            userName,
            action: notifData.action || "performed an action",
            context: projectName,
            timestamp: new Date(notifData.timeAgo),
            subType: notifData.subType || "general",
            unread: notifData.unread || false,
            daysRemaining,
            fetchdata: dynamicData,
          };
  
          newNotifications.push(notification);
        }
      }
  
      // Fetch Roadmap notifications
      const roadmapRef = collection(db, `users/${uid}/roadmapNotif`);
      const roadmapSnapshot = await getDocs(roadmapRef);
      for (const roadmapDoc of roadmapSnapshot.docs) {
        const notifData = roadmapDoc.data();
        const dynamicData = notifData.context;
  
        // Ensure all required fields are present
        if (!Array.isArray(notifData.receiver) || !notifData.receiver.includes(uid)) continue;
  
        const userRef = doc(db, `users/${notifData.receiver[0]}`);
        const userSnapshot = await getDoc(userRef);
        if (!userSnapshot.exists()) continue;
  
        const userData = userSnapshot.data();
        const userName = `${userData.firstName} ${userData.lastName}`;
  
        const roadmapId = roadmapDoc.id;
        const roadmapDocRef = doc(db, `users/${uid}/Roadmap/${dynamicData}`);
        const roadmapDocSnapshot = await getDoc(roadmapDocRef);
        if (!roadmapDocSnapshot.exists()) continue;
  
        const roadmapData = roadmapDocSnapshot.data();
        const projectName = roadmapData.projectName || "Unknown Project";
        const avatar = roadmapData.icon || "https://firebasestorage.googleapis.com/v0/b/dyci-academix.appspot.com/o/Messenger_creation_509387898792656.jpeg?alt=media&token=8122ae8b-95e1-45b4-8a25-a180f6c0ff6f&fbclid=IwY2xjawHIQkxleHRuA2FlbQIxMAABHX0cibeCI97PahwfUeZTcAQIeCon4jAuNEWJALd1rZBsaSN1seKUH704lA_aem_OblAINjigEkiR3VF1nHM-Q";
        const endDate = roadmapData.endDate ? new Date(roadmapData.endDate) : null;
  
        let daysRemaining = null;
        if (endDate) {
          const timeDiff = endDate.getTime() - new Date().getTime();
          daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        }
  
        const notification = {
          id: notifData.id,
          key: `${notifData.id}-${roadmapId}`,
          type: notifData.type || "unknown",
          avatar,
          userName,
          action: notifData.action || "performed an action",
          context: projectName,
          timestamp: new Date(notifData.timeAgo),
          subType: notifData.subType || "general",
          unread: notifData.unread || false,
          daysRemaining,
          fetchdata: "",
        };
  
        newNotifications.push(notification);
      }
  
      // Sort notifications by timestamp (newest to oldest)
      newNotifications.sort((a, b) => b.timestamp - a.timestamp);
  
      // Update state and save to localStorage
      setNotifications(newNotifications);
      localStorage.setItem("notifications", JSON.stringify(newNotifications)); // Save to localStorage
      setIsFetching(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setIsFetching(false);
    }
  };
  
    
  
    // Fetch notifications when the component mounts

    useEffect(() => {
      fetchNotifications();
    }, []);



// Function to toggle sort order and sort notifications
const toggleSort = () => {
  const newSortOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
  setSortOrder(newSortOrder);

  // Sort the notifications based on the new sort order
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (newSortOrder === 'newest') {
      return new Date(b.timestamp) - new Date(a.timestamp); // Sort by latest timestamp
    } else {
      return new Date(a.timestamp) - new Date(b.timestamp); // Sort by oldest timestamp
    }
  });

  setNotifications(sortedNotifications); // Update the state with the sorted notifications
};


const getFilteredNotifications = () => {
  switch (activeTab) {
    case 'Assigned Tasks':
      return notifications.filter(notif => notif.type === 'assigned');
    case 'Deadlines':
      return notifications.filter(notif => notif.type === 'deadline');
    case 'Socials':
      return notifications.filter(notif => notif.type === 'social');
    default:
      return notifications;
  }
};

// Function to get notification count for each tab
const getNotificationCount = (tabName) => {
  switch (tabName) {
    case 'Assigned Tasks':
      return notifications.filter(notif => notif.type === 'assigned').length;
    case 'Deadlines':
      return notifications.filter(notif => notif.type === 'deadline').length;
    case 'Socials':
      return notifications.filter(notif => notif.type === 'social').length;
    default:
      return notifications.length;
  }
};

    const handleNotificationsToggle = () => {
      setShowNotifications(!showNotifications);
    };


  const HeaderDashboard = ({ showNotifications }) => {
    // State for active tab
    const navigate = useNavigate();


 

    // Helper function to convert time string to minutes with safety check
    const getTimeInMinutes = (timeString) => {
      // Return 0 if timeString is undefined
      if (!timeString) return 0;
      
      const number = parseInt(timeString.split(' ')[0]);
      const unit = timeString.toLowerCase();
      
      if (unit.includes('minute')) {
        return number;
      } else if (unit.includes('hour')) {
        return number * 60;
      }
      return 0;
    };
  
    // Sample notification data - replace with your actual data source
    const handleNotificationClick = async (id, type, epicOrScrumId) => {
      try {
        // Get the current user's UID
        const auth = getAuth();
        const uid = auth.currentUser?.uid;
    
        if (!uid) {
          console.error("User is not authenticated.");
          return;
        }
    
        let notifDocRef;
    
        if (type === "kanban") {
          notifDocRef = doc(db, `Kanban/${epicOrScrumId}/kanbanNotif`, id);
        } else if (type === "scrum") {
          notifDocRef = doc(db, `Scrum/${epicOrScrumId}/scrumNotif`, id);
        }
    
        // Fetch the notification document to check the receiver field
        if (notifDocRef) {
          const notifDoc = await getDoc(notifDocRef);
    
          if (notifDoc.exists()) {
            const notifData = notifDoc.data();
            
            // Check if the receiver array includes the current user's UID
            if (Array.isArray(notifData.receiver) && notifData.receiver.includes(uid)) {
              // Update the unread field to false for the current user
              await updateDoc(notifDocRef, {
                unread: false,
              });
              console.log(`Notification ID ${id} marked as read in ${type}`);
            }
          }
        }
    
        // Update local state for notifications
        const updatedNotifications = notifications.map((notif) =>
          notif.id === id ? { ...notif, unread: false } : notif
        );
    
        setNotifications(updatedNotifications); // Update state
        localStorage.setItem("notifications", JSON.stringify(updatedNotifications)); // Save to localStorage
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    };
    
    


    // Function to mark all notifications as read
    const markAllAsRead = async () => {
      try {
        // Step 1: Get the current user's UID
        const auth = getAuth();
        const uid = auth.currentUser?.uid;
    
        if (!uid) {
          console.error("User is not authenticated.");
          return;
        }
    
        // Step 2: Fetch epic IDs from users/${uid}/Kanban/
        const kanbanRef = collection(db, `users/${uid}/Kanban`);
        const kanbanSnapshot = await getDocs(kanbanRef);
    
        const epicIds = [];
        kanbanSnapshot.forEach((doc) => {
          epicIds.push(doc.id); // Collect all epicIds
        });
    
        // Step 3: Fetch Scrum IDs from users/${uid}/Scrum
        const scrumRef = collection(db, `users/${uid}/Scrum`);
        const scrumSnapshot = await getDocs(scrumRef);
    
        const scrumIds = [];
        scrumSnapshot.forEach((doc) => {
          scrumIds.push(doc.id); // Collect all scrumIds
        });
    
        // Step 4: Mark Kanban notifications as read
        for (const epicId of epicIds) {
          const notifRef = collection(db, `Kanban/${epicId}/kanbanNotif`);
          const notifSnapshot = await getDocs(notifRef);
    
          for (const notifDoc of notifSnapshot.docs) {
            const notifData = notifDoc.data();
    
            // Check if the current user's UID is in the receiver array
            if (Array.isArray(notifData.receiver) && notifData.receiver.includes(uid)) {
              // Update unread field to false
              const notifDocRef = doc(db, `Kanban/${epicId}/kanbanNotif`, notifDoc.id);
              await updateDoc(notifDocRef, {
                unread: false,
              });
    
              console.log(`Kanban notification ID ${notifDoc.id} marked as read`);
            }
          }
        }
    
        // Step 5: Mark Scrum notifications as read
        for (const scrumId of scrumIds) {
          const notifRef = collection(db, `Scrum/${scrumId}/scrumNotif`);
          const notifSnapshot = await getDocs(notifRef);
    
          for (const notifDoc of notifSnapshot.docs) {
            const notifData = notifDoc.data();
    
            // Check if the current user's UID is in the receiver array
            if (Array.isArray(notifData.receiver) && notifData.receiver.includes(uid)) {
              // Update unread field to false
              const notifDocRef = doc(db, `Scrum/${scrumId}/scrumNotif`, notifDoc.id);
              await updateDoc(notifDocRef, {
                unread: false,
              });
    
              console.log(`Scrum notification ID ${notifDoc.id} marked as read`);
            }
          }
        }
    
        // Step 6: Optionally, update the state to reflect that all notifications have been read
        setAllRead(true);
        console.log("All Kanban and Scrum notifications marked as read");
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
      }
    };
    
    
    // Function to get filtered notifications based on active tab
  

// Handle single notification click





 // New function to handle project title click
 const handleProjectClick = async (e, fetchdata) => {
  e.stopPropagation(); // Prevent notification click handler from firing

  if (!fetchdata) {
    return; // Return if fetchdata is empty or invalid
  }

  // First, check if the document exists in the 'Scrum' collection
  const scrumDocRef = doc(db, 'Scrum', fetchdata);
  const scrumDocSnapshot = await getDoc(scrumDocRef);

  if (scrumDocSnapshot.exists()) {
    // If the document exists in Scrum, navigate to the Scrum board
    navigate(`/scrumprojects`, {
          state: {
            id: fetchdata,  // Use project.id from Kanban data
          },
        });
  } else {
    // If the document doesn't exist in Scrum, check the 'Kanban' collection
    const kanbanDocRef = doc(db, 'Kanban', fetchdata);
    const kanbanDocSnapshot = await getDoc(kanbanDocRef);

    if (kanbanDocSnapshot.exists()) {
      // If the document exists in Kanban, navigate to the Kanban board
      navigate(`/kanbanboard`, {
          state: {
            id: fetchdata,  // Use project.id from Kanban data
          },
        });
    } else {
      // If the document doesn't exist in either collection, navigate to the personal roadmap
      navigate(`/personalroadmap`);
    }
  }
};



    if (!showNotifications) return null;

  
  
    return (
      <div className="notification-dropdown">
      <div className="notification-header">
        <h3>Notifications</h3>
        <div className="notification-options">
          <button className="sort-button" onClick={toggleSort}>
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            <img src={img2} alt="sort" className="newesticon" />
          </button>
          <button className="mark-all-read" onClick={markAllAsRead}>
            Mark all as read<img src={img3} alt="mark-all" className="markallicon" />
          </button>
        </div>
      </div>

      <div className="notification-tabs">
        {['All', 'Assigned Tasks', 'Deadlines', 'Socials'].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} <span className="badge">{getNotificationCount(tab)}</span>
          </button>
        ))}
      </div>

      <div className="dropdown-notification-items">
        {getFilteredNotifications().map((notification) => (
          <div 
            key={notification.id} 
            className={`dropdown-notification-item ${notification.unread ? 'unread' : ''}`}
            onClick={() => handleNotificationClick(notification.id)}
          >
            <img src={notification.avatar} alt="Avatar" className="avatar" />
            <div className="notification-details">
            {notification.type === 'deadline' ? (
                <>
                  <p>
                  <strong className="highlight-reminder">
                Reminder:
            </strong> Upcoming deadline for  <strong className="project-link hover:underline cursor-pointer"
                        onClick={(e) => handleProjectClick(e, notification.fetchdata)}>{notification.context}</strong>
                         <p className="remaining-days">
            ({notification.daysRemaining} days remaining)
        </p>
                  </p>
                  <span  className='notifTime'>{notification.timeAgo}</span>
                </>
              ): (
                <>
                  <p>
                    <strong>{notification.userName}</strong> {notification.action} <strong  className="project-link hover:underline cursor-pointer"
                        onClick={(e) => handleProjectClick(e, notification.fetchdata)}>{notification.context}</strong>
                  </p>
                  <span className='notifTime'>{formatTimeAgo(notification.timestamp)}</span>
                </>
              )}
            </div>
            
            {notification.unread && !allRead && <div className="unread-indicator"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};



  return (
    
    <header className="header">
      {/* Notification Bell */}
      <div className="notification" id="notification" onClick={handleNotificationsToggle}>
        <img src={img0} alt="Notification Bell" className="notificationbell" /> 
         {unreadCount > 0 && (
        <span className="notification-badge">{unreadCount}</span> // Badge Counter
      )}
      </div>
      
      {/* Notification Dropdown */}
     <HeaderDashboard showNotifications={showNotifications} />

      {/* User Profile Dropdown */}
      <div className="userprofilecontainer" onClick={handleDropdownToggle}>
        <label className="profilename" id="profilename">{firstName || 'Profile Name'}</label>
        <img src={userPicture} alt="" className="userprofileimg" />
       
      </div>

      {/* Dropdown for user profile */}
      {showDropdown && (
        <div className="dropdownuserprofile">
          <button className="dropdown-item-profile"><Link to="/ProfileDetails">Profile Details</Link>
          </button>
          <button 
            className="dropdown-item-logout" 
            onClick={(e) => {
              e.stopPropagation(); // Prevent event from bubbling up
              handleLogout();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}


export default Header;
