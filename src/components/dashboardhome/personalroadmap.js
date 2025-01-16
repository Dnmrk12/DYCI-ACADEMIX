import React, { useState, useRef, useEffect, useMemo} from 'react';
import ReactDOM from 'react-dom';
import { Calendar, Plus } from 'lucide-react';
import { Pin } from "lucide-react";
import { MoreHorizontal } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import './personalroadmap.css';
import img0 from './iconshomepage/guidelinesICON.png';
import img1 from './iconshomepage/magnifyingglass.png';
import img3 from './iconshomepage/creatingICON.png'; 
import img4 from './iconshomepage/researchicon.png';
import img5 from './iconshomepage/bugfixicon.png';
import img6 from './iconshomepage/softwaredataicon.png';
import img7 from './iconshomepage/versionupdate.png';
import img8 from './iconshomepage/guidelinesoverall.png';
import img9 from './iconshomepage/representationInstruction.png';
import img10 from './iconshomepage/projectboardInstruction.png';
import img11 from './iconshomepage/credentials.png';
import img12 from './iconshomepage/researchicon.png';
import img13 from './iconshomepage/bugfixicon.png';
import img14 from './iconshomepage/ppticon.png';
import img15 from './iconshomepage/versionupdate.png';
import img16 from './iconshomepage/overdue.png';
import img17 from './iconshomepage/excelexporticon.png';
import profilePic from './iconshomepage/personalRMpic.png'; 
import { getFirestore, collection,limit, addDoc,doc , getDocs,getDoc,increment, deleteDoc ,setDoc, query,orderBy, onSnapshot, where,updateDoc, arrayRemove ,arrayUnion, serverTimestamp} from 'firebase/firestore';

import { getStorage, ref, uploadBytes,  getDownloadURL ,uploadString} from 'firebase/storage';

import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { db } from './firebase/firebaseConfig'; 
function PersonalRoadmap() 
{const tableContainerRef = useRef(null); // Reference to the scrollable container
 // const [isDropdownEpicOpen, setIsDropdownEpicOpen] = useState(false);
  const [dropdownVisibleRow, setDropdownVisibleRow] = useState(null);
  const [showEpicPopupPersonalRoadmap, setShowEpicPopupPersonalRoadmap] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState(null);  
//  const [visibleDropdownId, setVisibleDropdownId] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [createIssuePopup, setCreateIssuePopup] = useState(false);
  const [dropdownValue, setDropdownValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  //const [issues, setIssues] = useState([]);
  const [issueType, setIssueType] = useState('');
  const [projectIssueName, setProjectIssueName] = useState('');
  const [effort, setEffort] = useState('');
  const [status, setStatus] = useState('To Do');
  const [issueMenuOpen, setIssueMenuOpen] = useState(null);
  const [isEditingIssue, setIsEditingIssue] = useState(false);
  const [editIssueIndex, setEditIssueIndex] = useState(null);
  const [hoveredIssueIndex, setHoveredIssueIndex] = useState(null);
  const [issuedeleteConfirmation, setissueDeleteConfirmation] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [expandedIssueIndex, setExpandedIssueIndex] = useState(null);
  const [showSubtaskPopup, setShowSubtaskPopup] = useState(false);
  const [subtaskName, setSubtaskName] = useState('');
  const [subtasks, setSubtasks] = useState({});
  const [showCreateSubtaskButton, setShowCreateSubtaskButton] = useState(true);
  const [currentIssueIndex, setCurrentIssueIndex] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isEditingSubtask, setIsEditingSubtask] = useState(false);
  const [editingSubtaskIndex, setEditingSubtaskIndex] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false); // State for showing confirmation modal
  const [subtaskToDelete, setSubtaskToDelete] = useState(null); 
 //const [selectedRowId, setSelectedRowId] = useState(null);
 const [isCreating, setIsCreating] = useState(false);
 const [isCreatingIssue, setIsCreatingIssue] = useState(false);
 const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);

  const [expandedRows, setExpandedRows] = useState({});
const [issuesByEpic, setIssuesByEpic] = useState({});
const [expandedIssues, setExpandedIssues] = useState({});
const [currentEpicId, setCurrentEpicId] = useState(null);
const [searchTerm, setSearchTerm] = useState('');
const [rows, setRows] = useState([]);
const [doneRows, setDoneRows] = useState([]);
useEffect(() => {
  const fetchData = async () => {
    // Get the current user's UID
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("User is not authenticated. Please log in.");
      return;
    }

    const uid = user.uid;
    const db = getFirestore();
    const userRef = collection(db, `users/${uid}/Roadmap`);

    try {
      const querySnapshot = await getDocs(userRef);
      const rowsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,  // Use Firestore document ID as the id
        ...doc.data(), // Spread document data
      }));

      // Filter rows based on status
      const doneRowsData = rowsData.filter(row => row.status === 'Done');
      const activeRowsData = rowsData.filter(row => row.status !== 'Done');

      // Set the states for rows accordingly
      setDoneRows(doneRowsData); // Set state with the "Done" rows
      setRows(activeRowsData);    // Set state with active rows
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
    }
  };

  fetchData();
}, []);
  

const [epicFormData, setEpicFormData] = useState({
    icon: null,
  });
  
// Function to handle search input change
const handleSearchChange = (e) => {
  setSearchTerm(e.target.value);
};



// Filtered rows based on search term
const filteredRows = rows.filter(row => 
  row.projectName.toLowerCase().includes(searchTerm.toLowerCase())
);



const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setEpicFormData((prev) => ({
          ...prev,
          icon: file, // Store the file object in epicFormData
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
   // Handle form submission
   const handleCreateRow = async (e) => {
    e.preventDefault();

    if (isCreating) return; // Pigilan ang pag-execute kung may ongoing creation
    setIsCreating(true);
  
    // Check if the user is authenticated
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      console.error("User is not authenticated. Please log in.");
      setIsCreating(false); // Ibalik sa false kung may error
      return; // Stop the function if the user is not authenticated
    }
  
    const uid = user.uid; // Access user uid only after the null check
  
    const formatDate = (date) => (date ? date.toISOString().split('T')[0] : null);
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
  const defaultImageUrl = "https://firebasestorage.googleapis.com/v0/b/dyci-academix.appspot.com/o/wagdelete%2Facademixlogo.png?alt=media&token=8f83d11b-3604-41e5-9a46-d1df0d44aed5";
    let iconUrl = defaultImageUrl;
    if (epicFormData.icon) {
      const timestamp = new Date().getTime();
      const storage = getStorage();
      const storageRef = ref(storage, `Roadmap/${timestamp}/${epicFormData.icon.name}`);
      try {
        const snapshot = await uploadBytes(storageRef, epicFormData.icon);
        iconUrl = await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error("Error uploading image to Firebase Storage:", error);
      }
    }
  
    const db = getFirestore();
    const userRoadmapRef = collection(db, `users/${uid}/Roadmap`);
  
    try {
      // Get all documents in the user's Roadmap collection
      const querySnapshot = await getDocs(userRoadmapRef);
  
      // Find the maximum id in the current documents
      const maxId = querySnapshot.docs.reduce((max, doc) => {
        const data = doc.data();
        return Math.max(max, data.id || 0);
      }, 0);
  
      // Increment the maxId for the new document
      const newId = maxId + 1;
  
      const newRow = {
        id: newId,
        icon: iconUrl || "https://firebasestorage.googleapis.com/v0/b/dyci-academix.appspot.com/o/wagdelete%2Facademixlogo.png?alt=media&token=8f83d11b-3604-41e5-9a46-d1df0d44aed5",
        projectName,
        startDate: formattedStartDate || "No Start Date Selected",
        endDate: formattedEndDate || "No End Date Selected",
        startTime: startTime || "No Start Time Selected",
        endTime: endTime || "No End Time Selected",
        projectProgress: "",
        isPinned: false,
      };
  
      const userRef = doc(db, `users/${uid}/Roadmap/${newId}`); // Use the newId as the custom doc ID
  
      await setDoc(userRef, newRow); // Save the document with the specified ID
  
      // Create the notification document reference
      const notifRef = doc(collection(db, `users/${uid}/roadmapNotif`)); // Auto-generate an ID in the roadmapNotif collection
      
      // Now we can access the generated notifRef.id
      const timestamp = new Date().toISOString();
      const notification = {
        context: newId,
        id: notifRef.id, // Correctly use the generated notification document ID
        receiver: [uid], // Notifications for the user
        timeAgo: timestamp,
        type: "deadline",
        unread: false,
      };
  
      await setDoc(notifRef, notification); // Save the notification document
  
      // Update state and UI
      setRows((prevRows) => [...prevRows, { ...newRow }]);
      resetForm();
      setShowEpicPopupPersonalRoadmap(false);
    } catch (error) {
      console.error("Error adding epic to Firestore:", error);
    }
   finally {
    setIsCreating(false); // Ibalik sa default state pagkatapos ng proseso
}
  };
    
  
  

  
  
  
  // Reset form fields
  const resetForm = () => {
    setProjectName('');
    setStartDate(null);
    setEndDate(null);
    setStartTime(null);
    setEndTime(null);
    setSelectedImage(null);
    setIsEditing(false);
    setEditRowId(null);
};
  
  // Open popup for creating a new row
  const openCreateEpicPopup = () => {
    resetForm();
    setIsEditing(false);
    setShowEpicPopupPersonalRoadmap(true);
};


  // Open popup for editing an existing row
  const handleEditRow = (rowId) => {
    const row = rows.find(r => r.id === rowId);
    if (row) {
        setProjectName(row.projectName);
        setStartDate(new Date(row.startDate)); // Convert string to Date object
        setEndDate(new Date(row.endDate)); // Convert string to Date object
        setStartTime(row.startTime || null); // Set start time from row
        setEndTime(row.endTime || null); // Set end time from row
        setSelectedImage(row.icon);
        setEditRowId(rowId);
        setIsEditing(true);
        setShowEpicPopupPersonalRoadmap(true);
    }
};


  
   // Save edited row
   const handleSaveEdit = async (e) => {
    e.preventDefault();
  
    const formatDate = (date) => {
      return date ? date.toISOString().split('T')[0] : null; // Format date as a string
    };
  
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
  
    let iconUrl = selectedImage; // Default to the selected image if no new image is uploaded
  
    // If a new icon is selected, upload it to Firebase Storage
    if (epicFormData.icon) {
      const timestamp = new Date().getTime();
      const storage = getStorage();
      const storageRef = ref(storage, `Roadmap/${timestamp}/${epicFormData.icon.name}`);
      try {
        const snapshot = await uploadBytes(storageRef, epicFormData.icon);
        iconUrl = await getDownloadURL(snapshot.ref); // Get the download URL of the uploaded image
      } catch (error) {
        console.error('Error uploading image to Firebase Storage:', error);
      }
    }
  
    const updatedRow = {
      projectName,
      startDate: formattedStartDate || "No Start Date Selected",
      endDate: formattedEndDate || "No End Date Selected",
      icon: iconUrl, // Use the new icon URL or the existing one if no new image
      startTime: startTime || "No Start Time Selected",
      endTime: endTime || "No End Time Selected",
    };
  
    // Update the row in local state
    setRows(rows.map(row => row.id === editRowId
      ? { ...row, ...updatedRow }
      : row
    ));
  
    // Update the Firestore document
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (user) {
      const uid = user.uid;
      const db = getFirestore();
      const docRef = doc(db, `users/${uid}/Roadmap/${editRowId}`); // Use editRowId as the document ID
  
      try {
        await updateDoc(docRef, updatedRow); // Update the document in Firestore
      } catch (error) {
        console.error('Error updating epic in Firestore:', error);
      }
    }
  
    resetForm();
    setShowEpicPopupPersonalRoadmap(false);
  };
  
  
  
  // Toggle delete confirmation dialog
  const handleDeleteRow = (rowId) => {
      setRowToDelete(rowId);
      setShowDeleteConfirmation(true);
  };
  
  const confirmDeleteRow = async () => {
    console.log("Deleting row with id:", rowToDelete);
  
    const db = getFirestore();
    const auth = getAuth();
    const uid = auth.currentUser.uid; // Get current user UID
  
    try {
      // Path to the roadmapIssue collection
      const roadmapIssuePath = `users/${uid}/Roadmap/${rowToDelete}/roadmapIssue`;
      const roadmapIssueRef = collection(db, roadmapIssuePath);
  
      // Get all documents in the roadmapIssue collection
      const roadmapIssueDocs = await getDocs(roadmapIssueRef);
  
      // Delete all `subtasks` in each document of roadmapIssue
      const deleteSubtasksPromises = roadmapIssueDocs.docs.map(async (roadmapIssueDoc) => {
        const subtasksPath = `${roadmapIssuePath}/${roadmapIssueDoc.id}/subtasks`;
        const subtasksRef = collection(db, subtasksPath);
  
        // Get all documents in the subtasks collection
        const subtasksDocs = await getDocs(subtasksRef);
  
        // Delete all documents in the subtasks collection
        const deleteSubtasks = subtasksDocs.docs.map((subtaskDoc) =>
          deleteDoc(doc(db, subtasksPath, subtaskDoc.id))
        );
        await Promise.all(deleteSubtasks);
        console.log(`Deleted all subtasks for roadmapIssue: ${roadmapIssueDoc.id}`);
      });
  
      await Promise.all(deleteSubtasksPromises);
  
      // Delete all documents in the roadmapIssue collection
      const deleteRoadmapIssues = roadmapIssueDocs.docs.map((roadmapIssueDoc) =>
        deleteDoc(doc(db, roadmapIssuePath, roadmapIssueDoc.id))
      );
      await Promise.all(deleteRoadmapIssues);
      console.log("Deleted all roadmapIssue documents.");
  
      // Finally, delete the parent document in the Roadmap collection
      const parentDocRef = doc(db, `users/${uid}/Roadmap/${rowToDelete}`);
      await deleteDoc(parentDocRef);
      console.log("Deleted parent Roadmap document.");
  
      // Update local state
      setRows(rows.filter(row => row.id !== rowToDelete));
  
      // Close the confirmation modal and reset the rowToDelete
      setShowDeleteConfirmation(false);
      setRowToDelete(null);
    } catch (error) {
      console.error("Error deleting row from Firestore:", error);
    }
  };
  
  
  
  
  
  
  const cancelDeleteRow = () => {
      setShowDeleteConfirmation(false);
      setRowToDelete(null);
  };
  
  const togglePin = async (id) => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }
  
    const uid = user.uid;
    const db = getFirestore();
  
    // Update the local state first
    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) =>
        row.id === id ? { ...row, isPinned: !row.isPinned } : row
      );
  
      // Move pinned rows to the top
      const sortedRows = [
        ...updatedRows.filter((row) => row.isPinned),
        ...updatedRows.filter((row) => !row.isPinned),
      ];
  
      // Update the document in Firestore
      const rowDocRef = doc(db, `users/${uid}/Roadmap/${id}`);
      updateDoc(rowDocRef, {
        isPinned: updatedRows.find((row) => row.id === id).isPinned, // Update the `isPinned` field
      })
        .then(() => {
          console.log("Document successfully updated!");
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
  
      return sortedRows;
    });
  };

 
  const handleDropdownToggle = (rowId) => {
    setDropdownVisibleRow((prev) => (prev === rowId ? null : rowId));
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the dropdown menu
      if (!event.target.closest('.dropdown-menu') && !event.target.closest('.three-dots')) {
        setDropdownVisibleRow(null);
      }
    };
  
    // Add event listener when the dropdown is visible
    if (dropdownVisibleRow !== null) {
      document.addEventListener('click', handleClickOutside);
    }
  
    // Remove the event listener when the dropdown is hidden
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownVisibleRow]);

  
  const [activeRow, setActiveRow] = useState(null);

  const handleRowClick = (rowId) => {
    // Toggle active state
    setActiveRow(activeRow === rowId ? null : rowId);
    
    // Reset dropdown visibility
    setDropdownVisibleRow(null);
  };


  const isApproachingDeadline = (endDate) => {
    if (!endDate || endDate === "No End Date Selected") return false;
    
    const today = new Date();
    const deadline = new Date(endDate);
    
    // Calculate the difference in days
    const timeDiff = deadline.getTime() - today.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    
    // Consider it approaching deadline if within 7 days
    return daysDiff <= 7 && daysDiff > 0;
  };

 
   const [showMarkAsDonePopup, setShowMarkAsDonePopup] = useState(false);
const [popupMessage, setPopupMessage] = useState('');
const [isDoneSectionHovered, setIsDoneSectionHovered] = useState(false);
const [isDoneMenuOpen, setIsDoneMenuOpen] = useState(false);
const [doneRetentionPeriod, setDoneRetentionPeriod] = useState("2-weeks");

const handleDoneMenuClick = () => {
  setIsDoneMenuOpen(!isDoneMenuOpen);
};

const handleRetentionPeriodChange = (value) => {
  setDoneRetentionPeriod(value);
};


const handleMarkAsDone = (rowId) => {
  const issues = issuesByEpic[rowId] || [];

  // Check if there are no issues and subtasks
  if (issues.length === 0) {
    setPopupMessage('This project has no issues or subtasks. Please add them before marking it as done.');
    setShowMarkAsDonePopup(true);
    return;
  }

  let hasPending = false;

  // Check each issue and its subtasks
  issues.forEach((issue, issueIndex) => {
    if (issue.status !== 'Done') {
      hasPending = true;
    }

    const subtaskKey = `${rowId}-${issueIndex}`;
    const subtasksForIssue = subtasks[subtaskKey] || [];
    subtasksForIssue.forEach((subtask) => {
      if (subtask.status !== 'Done') {
        hasPending = true;
      }
    });
  });

  // Show confirmation popup if there are pending tasks
  if (hasPending) {
    setPopupMessage('Please complete all issues and subtasks before marking this project as done.');
    setShowMarkAsDonePopup(true);
    return;
  }

  // Move to Done section if all tasks are completed
  confirmMarkAsDone(rowId);
};


  

  
const confirmMarkAsDone = async (rowId) => {
  try {
    const doneProject = rows.find(row => row.id === rowId);
    if (doneProject) {
      // Remove from active rows and add to done rows
      setRows(rows.filter(row => row.id !== rowId));
      setDoneRows((prevDoneRows) => [
        ...prevDoneRows,
        { ...doneProject, status: 'Done' }
      ]);

      // Get current date in yyyy-mm-dd format
      const currentDate = new Date().toISOString().split('T')[0];

      // Update Firestore
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
        const db = getFirestore();
        const docRef = doc(db, `users/${uid}/Roadmap/${rowId}`);
        await updateDoc(docRef, { 
          roadmapdoneDate: currentDate, 
          status: 'Done' 
        });
      }
    }
  } catch (error) {
    console.error('Error marking project as done:', error);
  }
};
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isDoneMenuOpen &&
        !event.target.closest('.roadmap-done-dropdown-menu') &&
        !event.target.closest('.roadmap-done-menu-button')
      ) {
        setIsDoneMenuOpen(false); // Close the menu
      }
    };
  
    // Add the event listener
    document.addEventListener('click', handleClickOutside);
  
    // Clean up the event listener
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDoneMenuOpen]);
  

 

  


// PROJECT PROGERSS CALCULATION

// First, add this component at the top of your file
const ProjectProgressBar = ({ epicId, issuesByEpic, subtasks }) => {
  const [hoveredSection, setHoveredSection] = useState(null);


// Define colors for each status
const statusColors = {
  'Done': '#25AE88',
  'To Do': '#2665AC',
  'In Progress': '#2585AE',
  'Blocked': '#AE2525'
};


  // Calculate status distributions
  const calculateStatusDistribution = () => {
    const statusCounts = {
      Done: 0,
      'To Do': 0,
      'In Progress': 0,
      Blocked: 0
    }; 
    
    let totalItems = 0;
    
    // Count issues by status
    const issues = issuesByEpic[epicId] || [];
    issues.forEach((issue, issueIndex) => {
      statusCounts[issue.status]++;
      totalItems++;
      
      // Count subtasks by status
      const issueSubtasks = subtasks[`${epicId}-${issueIndex}`] || [];
      issueSubtasks.forEach(subtask => {
        statusCounts[subtask.status]++;
        totalItems++;
      });
    });
    
    // Calculate percentages
    const distribution = {
      Done: (statusCounts.Done / totalItems) * 100 || 0,
      'To Do': (statusCounts['To Do'] / totalItems) * 100 || 0,
      'In Progress': (statusCounts['In Progress'] / totalItems) * 100 || 0,
      Blocked: (statusCounts.Blocked / totalItems) * 100 || 0
    };
    
    return { distribution, totalItems };
  };

  const { distribution, totalItems } = calculateStatusDistribution();

  // Skip rendering if there are no items
  if (totalItems === 0) {
    return (
      <div className="progress-bar-container">
        <div className="progress-bar-wrapper">
          <div className="progress-bar-background">
            <div className="progress-bar-empty">No tasks yet</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-wrapper">
        <div className="progress-bar-background">
          {/* Done section */}
          <div 
            className="progress-bar-section done"
            style={{ 
              width: `${distribution.Done}%`,
              left: '0%',
              backgroundColor: statusColors['Done']
            }}
            onMouseEnter={() => setHoveredSection('Done')}
            onMouseLeave={() => setHoveredSection(null)}
          />
          {/* To Do section */}
          <div 
            className="progress-bar-section todo"
            style={{ 
              width: `${distribution['To Do']}%`,
              left: `${distribution.Done}%`,
              backgroundColor: statusColors['To Do']
            }}
            onMouseEnter={() => setHoveredSection('To Do')}
            onMouseLeave={() => setHoveredSection(null)}
          />
          {/* In Progress section */}
          <div 
            className="progress-bar-section in-progress"
            style={{ 
              width: `${distribution['In Progress']}%`,
              left: `${distribution.Done + distribution['To Do']}%`,
              backgroundColor: statusColors['In Progress']
            }}
            onMouseEnter={() => setHoveredSection('In Progress')}
            onMouseLeave={() => setHoveredSection(null)}
          />
          {/* Blocked section */}
          <div 
            className="progress-bar-section blocked"
            style={{ 
              width: `${distribution.Blocked}%`,
              left: `${distribution.Done + distribution['To Do'] + distribution['In Progress']}%`,
              backgroundColor: statusColors['Blocked']
            }}
            onMouseEnter={() => setHoveredSection('Blocked')}
            onMouseLeave={() => setHoveredSection(null)}
          />
        </div>
        
        {/* Hover tooltip with colored dot */}
        {hoveredSection && (
          <div 
            className="progress-tooltip"
            style={{ color: statusColors[hoveredSection] }}
          >
            <span 
              className="status-dot" 
              style={{ backgroundColor: statusColors[hoveredSection] }}
            />
            {hoveredSection} {Math.round(distribution[hoveredSection])}%
          </div>
        )}
      </div>
    </div>
  );
};



//TIMELINE BAR EPIC


// Generate a unique color for each epic project
const generateUniqueColor = (id) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#D4A5A5', '#9B59B6',
    '#3498DB', '#E67E22', '#1ABC9C', '#F1C40F', '#2ECC71', '#E74C3C',
    '#8E44AD', '#16A085', '#D35400', '#27AE60', '#2980B9', '#F39C12',
    '#C0392B', '#7F8C8D', '#2C3E50', '#D64161', '#26A69A', '#F06292',
    '#7986CB', '#C2185B', '#00796B', '#6D4C41', '#00ACC1', '#5D4037'
  ];
  return colors[id % colors.length];
};

// Function to dynamically extend months based on the project's startDate and endDate
const extendMonthsForRows = (rows) => {
  let extendedMonths = [];

  // Find the earliest start date and latest end date from all rows
  const earliestStartDate = rows.reduce((earliest, row) => {
    const start = new Date(row.startDate);
    return start < earliest ? start : earliest;
  }, new Date());

  const latestEndDate = rows.reduce((latest, row) => {
    const end = new Date(row.endDate);
    return end > latest ? end : latest;
  }, new Date(0));

  // Calculate the range of months to display
  const totalMonths =
    (latestEndDate.getFullYear() - earliestStartDate.getFullYear()) * 12 +
    (latestEndDate.getMonth() - earliestStartDate.getMonth()) + 1;

  // Generate the months to display, starting from the earliest start date
  for (let i = 0; i < totalMonths; i++) {
    const currentMonth = new Date(earliestStartDate.getFullYear(), earliestStartDate.getMonth() + i);
    const monthWithYear = currentMonth.toLocaleString('default', { month: 'long' }) + ' ' + currentMonth.getFullYear();
    extendedMonths.push(monthWithYear);
  }

  return extendedMonths;
};

// Dynamically extend the months for all rows
const extendedOverviewmonths = extendMonthsForRows(rows);

const TimelineBar = ({ startDate, endDate, id }) => {
  const [hovered, setHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Generate a unique color for the project
  const barColor = useMemo(() => generateUniqueColor(id - 1), [id]);

  // Convert start and end dates into indices in the extendedOverviewmonths array
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startMonthIndex = extendedOverviewmonths.findIndex(
    (month) => month === start.toLocaleString('default', { month: 'long' }) + ' ' + start.getFullYear()
  );
  const endMonthIndex = extendedOverviewmonths.findIndex(
    (month) => month === end.toLocaleString('default', { month: 'long' }) + ' ' + end.getFullYear()
  );

  const handleMouseEnter = (index) => {
    setHovered(true);
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setHoveredIndex(null);
  };

  return (
    <div
      className="timeline-bar-container"
      style={{
        display: "flex",
        position: "relative",
        marginLeft: "5px",
        marginRight: "5px",
      }}
    >
      {extendedOverviewmonths.map((monthWithYear, index) => (
        <div
          key={monthWithYear}
          onMouseEnter={() => index >= startMonthIndex && index <= endMonthIndex && handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          style={{
            flex: 1,
            position: "relative",
            height: "10px",
            backgroundColor: index >= startMonthIndex && index <= endMonthIndex ? barColor : "transparent",
            borderRadius: index === startMonthIndex ? "4px 0 0 4px" : index === endMonthIndex ? "0 4px 4px 0" : "0",
          }}
        />
      ))}
      {hovered && hoveredIndex !== null && (
        <div
          className="timeline-tooltip"
          style={{
            position: "absolute",
            top: "-45px",
            left: `${hoveredIndex * 2704 / extendedOverviewmonths.length}px`,
            background: "#F7FBFC",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            color: "#2665AC",
            padding: "5px 10px",
            borderRadius: "10px",
            fontSize: "12px",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <span>Start Date: {startDate}</span>
            <br />
            <span>End Date: {endDate}</span>
          </div>
        </div>
      )}
    </div>
  );
};




// FOR ISSUES
const icons = {
  Story: img4,
  Task: img6,
  Bug: img5,
};

const resetIssueForm = () => {
  setDropdownValue(''); // Reset dropdown value
  setIssueType('');
  setProjectIssueName('');
  setEffort('');
  setStatus('To Do');
  setIsEditingIssue(false);
  setEditIssueIndex(null);
  setIsDropdownOpen(false); // Close dropdown
};

const handleCreateIssuePopup = () => {
  resetIssueForm();
  setCreateIssuePopup(true);
};

const handleCloseCreateIssuePopup = () => {
  resetIssueForm();
  setCreateIssuePopup(false);
};

const handleDropdownChange = (type) => {
  setDropdownValue(type);
  setIssueType(type);
  setIsDropdownOpen(false);
};

// Handler for creating a new issue
const handleCreateIssue = async (epicId) => {
    if (issueType && projectIssueName && effort) {
      const newIssue = {
        issueType,
        projectIssueName,
        effort,
        status: 'To Do',
      };


      if (isCreatingIssue) return; // Prevent multiple clicks
      setIsCreatingIssue(true);
  
      // Get the current user's UID
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        console.error("User is not authenticated. Please log in.");
        setIsCreatingIssue(false); // Reset state if error occurs
        return;
      }
  
      const uid = user.uid;
  
      // Get Firestore reference
      const db = getFirestore();
      const issueRef = collection(db, `users/${uid}/Roadmap/${epicId}/roadmapIssue`);
  
      try {
        // Check if there are any existing issues to determine the next ID
        const snapshot = await getDocs(issueRef);
        
        // If there are no issues, start from 0, otherwise use the next available number
        const nextId = snapshot.size > 0 ? snapshot.size : 0;
  
        // Save the new issue with the incremented document ID
        await setDoc(doc(issueRef, nextId.toString()), newIssue); // Using nextId as the document ID
        
        // Update local state to reflect the new issue (if needed)
        setIssuesByEpic(prev => ({
          ...prev,
          [epicId]: [...(prev[epicId] || []), { ...newIssue, id: nextId.toString() }] // Adding the id field
        }));


        // Reset the form and close the popup
        resetIssueForm();
        setCreateIssuePopup(false);
      } catch (error) {
        console.error("Error saving issue to Firestore:", error);
      }
      finally {
        setIsCreatingIssue(false); // Reset loading state
    }
} else {
    alert('Please fill in all fields');
    setIsCreatingIssue(false); // Reset loading state if validation fails
}
  };
  
  
  
const fetchIssues = async (epicId) => {
    // Get the current user's UID
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      console.error("User is not authenticated. Please log in.");
      return;
    }
  
    const uid = user.uid;
  
    // Reference the Firestore collection for issues under a specific epic
    const db = getFirestore();
    const issueRef = collection(db, `users/${uid}/Roadmap/${epicId}/roadmapIssue`);
  
    try {
      // Fetch the issues for the epic from Firestore
      const querySnapshot = await getDocs(issueRef);
      const issuesData = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Use Firestore document ID as the issue ID
        ...doc.data(), // Spread document data
      }));
  
      // Update the state with the fetched data
      setIssuesByEpic(prev => ({
        ...prev,
        [epicId]: issuesData
      }));
    } catch (error) {
      console.error("Error fetching issues from Firestore:", error);
    }
  };
  useEffect(() => {
    // Call the fetchIssues function for each epic when the component is mounted
    rows.forEach(row => {
      fetchIssues(row.id);
    });
  }, [rows]); // This will run once when the component mounts or when `rows` changes
  

  const handleStatusChange = async (epicId, issueIndex, newStatus) => {
    // Get the Firestore database instance
    const db = getFirestore();
    const auth = getAuth();
    const uid = auth.currentUser.uid;
    
    // Get the issue ID (assumed to be in the issue object)
    const issueId = issuesByEpic[epicId][issueIndex].id; // Ensure your issues have an 'id' field
    
    // Update local state
    setIssuesByEpic(prev => {
      const updatedIssues = [...prev[epicId]];
      updatedIssues[issueIndex] = {
        ...updatedIssues[issueIndex],
        status: newStatus,
      };
      return {
        ...prev,
        [epicId]: updatedIssues,
      };
    });
  
    try {
      // Format current date as yyyy-mm-dd if the new status is 'Done'
      let issuedateDone = null;
      if (newStatus === 'Done') {
        const currentDate = new Date();
        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dd = String(currentDate.getDate()).padStart(2, '0');
        issuedateDone = `${yyyy}-${mm}-${dd}`;
      }
    
      // Update status in Firestore for the issue
      const issueRef = doc(db, `users/${uid}/Roadmap/${epicId}/roadmapIssue`, issueId);
      await updateDoc(issueRef, {
        status: newStatus,
        issuedateDone: issuedateDone, // Add or nullify the date when applicable
      });
  
      // Collect the necessary data to log
      const epicRef = doc(db, `users/${uid}/Roadmap/${epicId}`);
      const epicDoc = await getDoc(epicRef);
      if (epicDoc.exists()) {
        const epicData = epicDoc.data();
        const projectName = epicData.projectName;  // Get the project name
  
        // Collect issue details
        const issueData = issuesByEpic[epicId][issueIndex];
        const projectIssueName = issueData.projectIssueName || 'Unnamed Issue';  // Fallback to 'Unnamed Issue'
        const issueType = issueData.issueType || 'Unknown';  // Fallback to 'Unknown'
        const status = newStatus || 'Unknown';  // Current status
  
        // Format the current date and time as MM/DD/YYYY hh:mm AM/PM for the log entry
        const currentDateTime = new Date();
        const dateTime = currentDateTime.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).replace(',', ''); // Removes the comma after the day
  
        // Log entry for the user
        const logRef = doc(db, 'users', uid, 'logReport', Date.now().toString());
        await setDoc(logRef, {
          projectName: projectName,  // Project name
          projectIssueName: projectIssueName,  // Issue title
          issueType: issueType,  // Issue type (e.g., story, task, bug)
          status: status,  // New status
          dateTime: dateTime,  // Timestamp of the status update
        });
  
        console.log('Log report entry created successfully for the user');
      }
    } catch (error) {
      console.error('Error updating status in Firestore:', error);
    }
  };
  
  

// Updated issue handling functions
const handleEditIssue = (epicId, issueIndex) => {
    const issue = issuesByEpic[epicId][issueIndex];
  
    if (!issue) {
      console.error(`Issue at index ${issueIndex} for epic ${epicId} is undefined.`);
      return;
    }
  
    console.log("Editing issue:", issue);
  
    if (!issue.id) {
      console.error(`Issue at index ${issueIndex} for epic ${epicId} is missing an 'id' field.`);
    }
  
    setDropdownValue(issue.issueType || '');
    setIssueType(issue.issueType || '');
    setProjectIssueName(issue.projectIssueName || '');
    setEffort(issue.effort || '');
    setStatus(issue.status || 'To Do');
    setEditIssueIndex(issueIndex);
    setCurrentEpicId(epicId);
    setIsEditingIssue(true);
    setCreateIssuePopup(true);
    setIssueMenuOpen(null);
  };
  
  const handleSaveEditIssue = async () => {
    if (issueType && projectIssueName && effort) {
      console.log("Saving issue edits:", { issueType, projectIssueName, effort, status });
  
      // Update local state
      setIssuesByEpic((prev) => {
        const updatedIssues = [...prev[currentEpicId]];
        updatedIssues[editIssueIndex] = {
          ...updatedIssues[editIssueIndex],
          issueType,
          projectIssueName,
          effort,
          status,
        };
        return {
          ...prev,
          [currentEpicId]: updatedIssues,
        };
      });
  
      const currentIssues = issuesByEpic[currentEpicId] || [];
      const issueId = currentIssues[editIssueIndex]?.id;
  
      if (!issueId) {
        console.error("Issue ID is undefined or missing.");
        console.log("Current Issues:", currentIssues);
        console.log("Edit Issue Index:", editIssueIndex);
        return;
      }
  
      console.log("Updating issue with ID:", issueId);
  
      // Get Firestore reference
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        console.error("User is not authenticated. Please log in.");
        return;
      }
  
      const uid = user.uid;
      const db = getFirestore();
      const issueRef = doc(db, `users/${uid}/Roadmap/${currentEpicId}/roadmapIssue/${issueId}`);
  
      try {
        // Update the issue in Firestore
        await updateDoc(issueRef, {
          issueType,
          projectIssueName,
          effort,
          status,
        });
  
        console.log("Issue updated in Firestore successfully.");
        resetIssueForm();
        setCreateIssuePopup(false);
      } catch (error) {
        console.error("Error updating issue in Firestore:", error.message);
      }
    } else {
      alert("Please fill in all fields.");
    }
  };
  
  const handleDeleteClick = (epicId, issueIndex) => {
    const issue = issuesByEpic[epicId][issueIndex];
    if (!issue) {
      console.error(`Issue at index ${issueIndex} for epic ${epicId} is undefined.`);
      return;
    }
  
    if (!issue.id) {
      console.error(`Issue at index ${issueIndex} for epic ${epicId} is missing an 'id' field.`);
    }
  
    console.log("Preparing to delete issue:", issue);
  
    setIssueToDelete({ 
      epicId, 
      issueIndex, 
      projectIssueName: issue.projectIssueName, 
      id: issue.id // Pass the ID of the issue for logging and Firestore deletion
    });
    setissueDeleteConfirmation(true);
    setIssueMenuOpen(null);
  };
  
  const handleConfirmDelete = async () => {
    if (issueToDelete) {
      console.log("Deleting issue with ID:", issueToDelete.id);
  
      // Update local state
      setIssuesByEpic((prev) => {
        const updatedIssues = [...prev[issueToDelete.epicId]];
        updatedIssues.splice(issueToDelete.issueIndex, 1);
        return {
          ...prev,
          [issueToDelete.epicId]: updatedIssues
        };
      });
  
      // Get Firestore reference
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        console.error("User is not authenticated. Please log in.");
        return;
      }
  
      const uid = user.uid;
      const db = getFirestore();
      const documentPath = `users/${uid}/Roadmap/${issueToDelete.epicId}/roadmapIssue/${issueToDelete.id}`;
  
      try {
        // Fetch subcollections under the issue document
        const subcollectionPath = `users/${uid}/Roadmap/${issueToDelete.epicId}/roadmapIssue/${issueToDelete.id}/subcollectionName`; // Replace `subcollectionName` with your actual subcollection name
        const subDocs = await getDocs(collection(db, subcollectionPath));
        for (const subDoc of subDocs.docs) {
          await deleteDoc(doc(db, `${subcollectionPath}/${subDoc.id}`));
          console.log(`Subcollection document ${subDoc.id} deleted.`);
        }
  
        // Delete the main document
        await deleteDoc(doc(db, documentPath));
        console.log("Issue and its subcollections deleted successfully from Firestore.");
      } catch (error) {
        console.error("Error deleting issue and subcollections from Firestore:", error.message);
      }
  
      // Reset state and close active menus
      setissueDeleteConfirmation(false);
      setIssueToDelete(null);
      setExpandedIssueIndex(null);
      setIssueMenuOpen(null);
      setShowSubtaskPopup(false); // Close subtask popup if open
    }
  };
  
  

const handleCancelDelete = () => {
  setissueDeleteConfirmation(false);
  setIssueToDelete(null);
};

const handleMouseEnter = (index) => setHoveredIssueIndex(index);
const handleMouseLeave = () => setHoveredIssueIndex(null);

// Toggle functions for menus
const toggleIssueMenu = (epicId, issueIndex) => {
  const menuId = `${epicId}-${issueIndex}`;
  setIssueMenuOpen((prev) => (prev === menuId ? null : menuId));
};


// Updated click handlers
const handleIssueClick = (epicId, issueIndex) => {
  const key = `${epicId}-${issueIndex}`;
  setExpandedIssues(prev => ({
    ...prev,
    [key]: !prev[key]
  }));
  setCurrentIssueIndex(issueIndex);
};



useEffect(() => {
  const handleClickOutside = (event) => {
    // Check if the click is outside the issue menu and the three dots trigger
    if (
      !event.target.closest('.issue-menu') &&
      !event.target.closest('.three-dots-issue')
    ) {
      setIssueMenuOpen(null);
    }
  };

  // Add the event listener when the issue menu is open
  if (issueMenuOpen !== null) {
    document.addEventListener('click', handleClickOutside);
  }

  // Clean up the event listener when the menu is closed
  return () => {
    document.removeEventListener('click', handleClickOutside);
  };
}, [issueMenuOpen]);




//FOR SUBTASKS


// Handler for opening subtask popup
const handleCreateSubtaskPopup = (epicId, issueIndex) => {
  setCurrentEpicId(epicId);
  setCurrentIssueIndex(issueIndex);
  setShowSubtaskPopup(true);
  setIsEditingSubtask(false);
};

// Updated subtask handling functions
const handleEditSubtask = (epicId, issueIndex, subtaskIndex) => {
  const subtaskKey = `${epicId}-${issueIndex}`;
  const subtask = subtasks[subtaskKey][subtaskIndex];
  setSubtaskName(subtask.name);
  setCurrentEpicId(epicId);
  setCurrentIssueIndex(issueIndex);
  setEditingSubtaskIndex(subtaskIndex);
  setShowSubtaskPopup(true);
  setIsEditingSubtask(true);
  console.log(subtaskKey);
};

// Function to close the subtask popup and reset input fields
const handleCloseSubtaskPopup = () => {
  setShowSubtaskPopup(false);
  setSubtaskName('');
  setIsEditingSubtask(false);
  setEditingSubtaskIndex(null);
};




const handleCreateSubtask = async (epicId) => { 
  if (isCreatingSubtask) return; // Prevent further clicks if already creating

  if (subtaskName) {
    setIsCreatingSubtask(true); // Disable the button
      const subtaskKey = `${epicId}-${currentIssueIndex}`; 
      const newSubtask = { 
        name: subtaskName, 
        status: 'To Do' 
      }; 


      
  
      // Update local state
      setSubtasks(prev => ({ 
        ...prev, 
        [subtaskKey]: [...(prev[subtaskKey] || []), newSubtask] 
      })); 
  
      try {
        // Save subtask to Firestore
        const db = getFirestore();
        const auth = getAuth();
        const uid = auth.currentUser.uid;
        const issueId = issuesByEpic[epicId][currentIssueIndex].id; // Ensure issue has an 'id' field
        const subtasksCollectionRef = collection(db, `users/${uid}/Roadmap/${epicId}/roadmapIssue/${issueId}/subtasks`);
        
        await addDoc(subtasksCollectionRef, newSubtask);
  
        // Reset form and close popup
        setSubtaskName(''); 
        setShowSubtaskPopup(false); 
        setShowCreateSubtaskButton(false); // Hide the create button after creating a subtask
      } catch (error) {
        console.error('Error saving subtask to Firestore:', error);
      }
      finally {
        setIsCreatingSubtask(false); // Re-enable the button
      }
    } else {
      alert('Please enter a subtask name');
    }
  };
  useEffect(() => {
    const fetchSubtasks = async () => {
      try {
        const db = getFirestore();
        const auth = getAuth();
        const uid = auth.currentUser.uid; // Replace with actual user ID from context or props
  
        // Iterate through all epics to fetch their subtasks
        const updatedSubtasks = {};
        for (const epicId in issuesByEpic) {
          const issues = issuesByEpic[epicId] || [];
          for (let issueIndex = 0; issueIndex < issues.length; issueIndex++) {
            const issue = issues[issueIndex];
            const subtasksRef = collection(db, `users/${uid}/Roadmap/${epicId}/roadmapIssue/${issue.id}/subtasks`);
            const subtaskSnapshots = await getDocs(subtasksRef);
            
            const subtaskKey = `${epicId}-${issueIndex}`;
            updatedSubtasks[subtaskKey] = subtaskSnapshots.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
          }
        }
  
        setSubtasks(updatedSubtasks);
      } catch (error) {
        console.error('Error fetching subtasks:', error);
      }
    };
  
    fetchSubtasks();
  }, [issuesByEpic]);
  



  const handleSaveEditSubtask = async () => {
    const subtaskKey = `${currentEpicId}-${currentIssueIndex}`;
    
    // Get the current subtask from the subtasks state
    const subtask = subtasks[subtaskKey]?.[editingSubtaskIndex];
    
    if (!subtask) {
      console.error("Subtask is undefined or missing.");
      return;
    }
  
    console.log("Saving subtask edits:", { subtaskName });
  
    // Get the issueId from the issuesByEpic state
    const currentIssues = issuesByEpic[currentEpicId] || [];
    const issueId = currentIssues[currentIssueIndex]?.id;
  
    if (!issueId) {
      console.error("Issue ID is undefined or missing.");
      return;
    }
  
    console.log("Updating subtask for issue with ID:", issueId);
  
    // Get Firestore reference
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      console.error("User is not authenticated. Please log in.");
      return;
    }
  
    const uid = user.uid;
    const db = getFirestore();
  
    // Construct the subtask Firestore document reference
    const subtaskRef = doc(
      db,
      `users/${uid}/Roadmap/${currentEpicId}/roadmapIssue/${issueId}/subtasks/${subtask.id}`
    );
  
    try {
      // Update local state first for real-time feedback
      setSubtasks((prev) => {
        const updatedSubtasks = { ...prev };
        updatedSubtasks[subtaskKey][editingSubtaskIndex] = {
          ...subtask,
          name: subtaskName, // Update the name in the local state
        };
        return updatedSubtasks;
      });
  
      // Update Firestore asynchronously
      await updateDoc(subtaskRef, {
        name: subtaskName,
      });
  
      console.log("Subtask updated in Firestore successfully.");
      handleCloseSubtaskPopup(); // Close the popup after saving
    } catch (error) {
      console.error("Error updating subtask in Firestore:", error.message);
    }
  };
  
  
  
  
const handleSubtaskStatusChange = async (epicId, issueIndex, subtaskIndex, newStatus) => {
    const subtaskKey = `${epicId}-${issueIndex}`;
    const updatedSubtasks = [...(subtasks[subtaskKey] || [])];
  
    if (updatedSubtasks[subtaskIndex]) {
      updatedSubtasks[subtaskIndex] = {
        ...updatedSubtasks[subtaskIndex],
        status: newStatus
      };
  
      // Update local state
      setSubtasks(prev => ({
        ...prev,
        [subtaskKey]: updatedSubtasks
      }));
  
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const uid = user ? user.uid : null; // Ensure that uid is correctly extracted
  
        if (!uid) {
          console.error("No user is authenticated.");
          return;
        }
        const issueId = issuesByEpic[epicId][issueIndex].id;  // Ensure your issues have an 'id' field
        const subtaskIds = updatedSubtasks[subtaskIndex].id; // Assuming each subtask has a unique `id` field
        const db = getFirestore();
  
        if (!subtaskIds) {
          console.error("No subtask ID found.");
          return;
        }
  
        // Reference to the subtask document in Firestore
        const subtaskRef = doc(
          db,
          `users/${uid}/Roadmap/${epicId}/roadmapIssue/${issueId}/subtasks/${subtaskIds}`
        );
  
        // Check if the document exists
        const subtaskDoc = await getDoc(subtaskRef);
        if (!subtaskDoc.exists()) {
          // If the document doesn't exist, create it
          await setDoc(subtaskRef, {
            name: updatedSubtasks[subtaskIndex].name, // Add other necessary fields
            status: newStatus // Initialize the subtask status if creating
          });
          console.log("Subtask created in Firestore.");
        } else {
          // Document exists, update the status
          await updateDoc(subtaskRef, {
            status: newStatus // Update the status field
          });
          console.log("Subtask status updated in Firestore.");
        }
      } catch (error) {
        console.error("Error updating subtask status in Firestore:", error);
      }
    }
  };
  
  
  const handleToggleSubtaskMenu = (epicId, issueIndex, subtaskIndex) => {
    const menuId = `${epicId}-${issueIndex}-${subtaskIndex}`;
    setActiveMenu((prev) => (prev === menuId ? null : menuId));
  };
  

useEffect(() => {
  const handleClickOutside = (event) => {
    // Check if the click is outside the subtask menu and the three dots trigger
    if (
      !event.target.closest('.subtask-menu') &&
      !event.target.closest('.three-dots-subtask')
    ) {
      setActiveMenu(null);
    }
  };

  // Add the event listener when the subtask menu is open
  if (activeMenu !== null) {
    document.addEventListener('click', handleClickOutside);
  }

  // Clean up the event listener when the menu is closed
  return () => {
    document.removeEventListener('click', handleClickOutside);
  };
}, [activeMenu]);



// Fixed subtask deletion handler
const handleDeleteSubtask = (epicId, issueIndex, subtaskIndex) => {
    const subtaskKey = `${epicId}-${issueIndex}`;
    const subtask = subtasks[subtaskKey][subtaskIndex];
    setSubtaskToDelete({ 
      epicId,
      issueIndex,
      subtaskIndex,
      name: subtask.name,
      subtaskId: subtask.id  // Assuming `id` exists for each subtask
    });
    setActiveMenu(null);
    setDeleteConfirmation(true);
  };
  
  // Fixed confirm subtask deletion handler
  const handleConfirmSubtaskDelete = async () => {
    if (subtaskToDelete) {
      const subtaskKey = `${subtaskToDelete.epicId}-${subtaskToDelete.issueIndex}`;
      
      // Get the issueId from the issuesByEpic state
      const currentIssues = issuesByEpic[subtaskToDelete.epicId] || [];
      const issueId = currentIssues[subtaskToDelete.issueIndex]?.id;
  
      if (!issueId) {
        console.error("Issue ID is undefined or missing.");
        return;
      }
  
      // Get Firestore reference
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        console.error("User is not authenticated. Please log in.");
        return;
      }
  
      const uid = user.uid;
      const db = getFirestore();
  
      // Construct the subtask Firestore document reference
      const subtaskRef = doc(
        db,
        `users/${uid}/Roadmap/${subtaskToDelete.epicId}/roadmapIssue/${issueId}/subtasks/${subtaskToDelete.subtaskId}`
      );
  
      try {
        // Delete the subtask in Firestore
        await deleteDoc(subtaskRef);
  
        console.log("Subtask deleted from Firestore successfully.");
  
        // Update local state
        setSubtasks(prev => {
          const updatedSubtasks = [...prev[subtaskKey]];
          updatedSubtasks.splice(subtaskToDelete.subtaskIndex, 1);
          return {
            ...prev,
            [subtaskKey]: updatedSubtasks
          };
        });
  
        setDeleteConfirmation(false);
        setSubtaskToDelete(null);
      } catch (error) {
        console.error("Error deleting subtask in Firestore:", error.message);
      }
    }
  };
  
// Function to cancel deletion
const handleCancelSubtaskDelete = () => {
  setDeleteConfirmation(false); // Hide confirmation modal
  setSubtaskToDelete(null); // Reset the subtask to delete
};






        // State to track visibility of the guidelines popup
        const [showGuidelines, setShowGuidelines] = useState(false);
      
        // Function to toggle the popup
        const toggleGuidelines = () => {
          setShowGuidelines(!showGuidelines);
        };
      
        // Function to close the popup
        const closeGuidelines = () => {
          setShowGuidelines(false);
        };
   

    const [toggle, setToggle] = useState(1)

    function updateToggle(id) {
         setToggle(id)

    }



 // Time formatting utility
 const formatTimeToAMPM = (time24) => {
  if (!time24) return '';
  const [hours24, minutes] = time24.split(':');
  const hours = parseInt(hours24);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
};

const DateTimePicker = ({ label, date, time, onDateChange, onTimeChange }) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Generate time options in 30-minute intervals with AM/PM
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of ['00', '30']) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute}`;
      timeOptions.push(time24);
    }
  }

  return (
    <div className="createEpic-date-group">
      <p className="createEpic-date-label">{label}</p>
      <div className="createEpic-date-row">
        <div className="createEpic-date-input-container">
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="createEpic-date-input"
          />
          <Calendar className="createEpic-calendar-icon" size={16} />
        </div>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="createEpic-time-button"
            onClick={() => setShowTimePicker(!showTimePicker)}
          >
            {time ? formatTimeToAMPM(time) : 'Set Time'}
          </button>
          
          {showTimePicker && (
            <div className="createEpic-time-dropdown" >
              {timeOptions.map((time24) => (
                <button
                  key={time24}
                  onClick={() => {
                    onTimeChange(time24);
                    setShowTimePicker(false);
                  }}
                  className="createEpic-time-dropdown-option" 
                >
                  {formatTimeToAMPM(time24)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
};
  
  

    return (
        <div className="personalRoadmap-container">
            <div className="personalroadmap-header">
                <h1>Personal Roadmap</h1>
               
                <div>
                
                </div>
            </div>
            

        
            <img src={img0} alt="" className="personalroadmapguidelinesIcon" onClick={toggleGuidelines}/>

            {showGuidelines && (
          <div className="personalroadmap-guidelines">
           <h4> Personal Roadmap </h4>
           <div className="scrollpersonalroadmap-guidelines">
            <div className="guidelinesinstruction">
            <img src={img8} alt="" className="overallICONS"/>
                <p>A personal roadmap is a plan that outlines steps, priorities, and deadlines to achieve specific goals. 
                It breaks down larger tasks, tracks progress, and ensures focus and accountability throughout the process.</p>
                </div>
            <div className="epicissueinstruction">
              <b><img src={img11} alt="" className="iconsEpicIssue"/>Epic - A large body of work that can be broken down into smaller tasks or stories.</b> 
              <b><img src={img12} alt="" className="iconsEpicIssue"/>Story - A feature or requirement to be implemented.</b> 
              <b><img src={img13} alt="" className="iconsEpicIssue"/>Bug - A defect that needs to be fixed.</b> 
              <b><img src={img14} alt="" className="iconsEpicIssue"/>Task - A general work item.</b> 
              <b><img src={img15} alt="" className="iconsEpicIssue"/>Sub-task - A smaller unit that breaks down a parent issue.</b> 

              <p>"Issue Type" represents different types of work items or tasks that need to be tracked and managed.</p>

           </div>
           
           <div className="representationinstruction">
           <img src={img9} alt="" className="overallICONS"/>
            <p>A project timeline is a visual representation of the schedule, 
                showing the start and end dates of tasks or milestones, and their sequence,
                 to help manage project progress and deadlines.</p>
           </div>
           

      
                </div>
            <button className="guidelinesDone" onClick={closeGuidelines}>Done</button>
          </div>
       )}


<div className="search-box-projectname">
  <input 
    type="text" 
    placeholder="Search Project Name" 
    className="searchprojectname" 
    value={searchTerm} 
    onChange={handleSearchChange} 
  />
  <img src={img1} alt="" className="magnifyingglassSearchproj" />
</div>

{/*
            <button className="export-btn" onClick={() => alert('Export to Excel triggered!')}>
            <img src={img17} alt="" className="exportIcon"/>  Export to Excel </button>

            <div className={toggle === 1 ? "show-content" : "content"}>*/}
            <div className="overview-content">
         
            <div
  className="roadmap-table-container"
  ref={tableContainerRef}
 // style={{ overflowX: "auto", whiteSpace: "nowrap" }}  Ensure scrollable container
>
  <table className="roadmap-table"  >
    <thead>
      <tr>
        <th className="projectname">Project Name</th>
        <th className="projectprogress">Project Progress</th>

        {extendedOverviewmonths.map((month) => (
          <th key={month} className="scrollmonth">
            {month}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
    {filteredRows.map((row, index) => (
        <React.Fragment key={row.id}>
          <tr>
            <td
               className={`hoverable-row ${activeRow === row.id ? 'active' : ''}`}
              
              onClick={(e) => {handleRowClick(row.id)
                e.stopPropagation(); // Prevent event propagation
                setExpandedRows((prev) => ({
                  ...prev,
                  [row.id]: !prev[row.id], // Toggle expanded state
                }));
              }}
              
              style={{ zIndex: 100}}
            >
              {/* Pin Icon */}
              <span
                className="pin-icon"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event propagation
                  togglePin(row.id);
                }}
                style={{
                  cursor: "pointer",
                  marginRight: "10px",
                  verticalAlign: "middle",
                }}
              >
                <Pin
                  size={22}
                  style={{
                    color: row.isPinned ? "#ED8A19" : "#3A74B4",
                    fill: row.isPinned ? "#ED8A19" : "none",
                  }}
                />
              </span>

              {/* Dropdown Toggle */}
              <span
                className="dropdown-toggle-epic"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event propagation
                  setExpandedRows((prev) => ({
                    ...prev,
                    [row.id]: !prev[row.id], // Toggle expanded state
                  }));
                }}
              >
                {expandedRows[row.id] ? "▼" : "►"}
              </span>

              {row.icon && (
                <img
                  src={row.icon}
                  alt="Icon"
                  
                  className="profilePicEpic"
                />
              )}

              {/* Project Name */}
<span
  key={row.id}
  className={`projectName ${row.isPinned ? "highlight" : ""}`}
  style={{ marginRight: "10px" }}
  onMouseEnter={() => {
    if (row.projectName.length > 30) {
      setHoveredRowId(row.id); 
      setShowTooltip(true);  // Ensure tooltip is shown
    }
  }}
  onMouseLeave={() => {
    setHoveredRowId(null); 
    setShowTooltip(false);  // Hide tooltip
  }}
>
  {row.projectName.length > 30
    ? `${row.projectName.substring(0, 27)}...`
    : row.projectName}
  {hoveredRowId === row.id && showTooltip && (
    <div className="projectName-tooltip">
      {row.projectName}
    </div>
  )}
</span>





              {isApproachingDeadline(row.endDate) && (
                 <div className="tooltip-container">
 <img 
   src={img16} 
   alt="Project Deadline Approaching" 
   className="overdue" 
   style={{ 
     marginLeft: '-10px', 
     verticalAlign: 'middle',
     width: '15px',  // Adjust size as needed
     height: '15px',  // Adjust size as needed
     zIndex: 1
   }} 
 />
    <span className="tooltip-text">
      Just a quick reminder that your project due date is coming up soon.
      Please make sure to finish all tasks.
    </span>
  </div>
)}
              {/* Three Dots Dropdown */}
              <span
  className="three-dots"
  onClick={(e) => {
    e.stopPropagation(); // Prevent event propagation
    handleDropdownToggle(row.id);
  }}
  style={{ cursor: "pointer", float: 'right' }}
>
  . . .
</span>

              {dropdownVisibleRow === row.id && (
  <div className="dropdown-menu">
    <button
      className="editepicactionbtn"
      onClick={(e) => {
        e.stopPropagation();
        handleEditRow(row.id);
      }}
    >
      Edit
    </button>
    <button
      className="markasdoneactionbtn"
      onClick={(e) => {
        e.stopPropagation();
        handleMarkAsDone(row.id); // Implement the handleMarkAsDone function
      }}
    >
      Mark as Done
    </button>
    <button
      className="deleteEpicactionbtn"
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteRow(row.id);
      }}
    >
      Delete
    </button>
  </div>
)}
            </td>

            {/* Project Progress */}
            <td className="project-progress-cell">
              <ProjectProgressBar
                epicId={row.id}
                issuesByEpic={issuesByEpic}
                subtasks={subtasks}
              />
            </td>

            {/* Timeline Bar */}
            <td colSpan={extendedOverviewmonths.length} style={{ padding: 0 }}>
              <TimelineBar
                startDate={row.startDate}
                endDate={row.endDate}
                id={row.id}
                
              /> 
              </td>

             
           
          </tr>

          {/* Issues and Subtasks */}
          {expandedRows[row.id] && (
            <tr>
              <td colSpan="1">
                <div className="dropdown-content-issue">
                  {/* Display issues for this epic */}
                  {(issuesByEpic[row.id] || []).map((issue, issueIndex) => (
                    <div key={issueIndex}>
                      <div
                        className="issue-item"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event propagation
                          handleIssueClick(row.id, issueIndex);
                        }}
                      >
                        <img
                          src={
                            issue.issueType === "Story"
                              ? img4
                              : issue.issueType === "Task"
                              ? img6
                              : issue.issueType === "Bug"
                              ? img5
                              : ""
                          }
                          alt=""
                          className="issue-icon"
                        />
                      <span className="project-issue-name">
  {issue.projectIssueName}
  <span className="project-issue-name-tooltip">
    {issue.projectIssueName} {/* Or the text you want to show in the tooltip */}
  </span>
</span>

                        <span className="effort-badge">{issue.effort}</span>

                        <select
                          className={`status-dropdown ${issue.status.replace(
                            /\s+/g,
                            "-"
                          ).toLowerCase()}`}
                          value={issue.status}
                          onChange={(e) =>
                            handleStatusChange(row.id, issueIndex, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option className="blocked-option" value="Blocked">
                            Blocked
                          </option>
                          <option className="in-progress-option" value="In Progress">
                            In Progress
                          </option>
                          <option className="to-do-option" value="To Do">
                            To Do
                          </option>
                          <option className="done-option" value="Done">
                            Done
                          </option>
                        </select>

                        <span
  className="three-dots-issue"
  onClick={(e) => {
    e.stopPropagation(); // Prevent event propagation
    toggleIssueMenu(row.id, issueIndex);
  }}
>
  . . .
</span>

{issueMenuOpen === `${row.id}-${issueIndex}` && (
  <div className="issue-menu">
    <button
      className="edit-issue-btn"
      onClick={(e) => {
        e.stopPropagation();
        handleEditIssue(row.id, issueIndex);
      }}
    >
      Edit
    </button>
    <button
      className="delete-issue-btn"
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteClick(row.id, issueIndex);
      }}
    >
      Delete
    </button>
  </div>
)}

                      </div>

                      {/* Subtasks section */}
                      {expandedIssues[`${row.id}-${issueIndex}`] && (
                        <div className="subtasks">
                          {/* Display subtasks */}
                          {(subtasks[`${row.id}-${issueIndex}`] || []).map(
                            (subtask, subtaskIndex) => (
                              <div key={subtaskIndex} className="subtask-item">
                              <span className="subtask-name">
  {subtask.name}
  <span className="subtask-name-tooltip">
    {subtask.name} {/* Or the text you want to show in the tooltip */}
  </span>
</span>

                                <select
                                  className={`status-subtask-dropdown ${subtask.status.replace(
                                    /\s+/g,
                                    "-"
                                  ).toLowerCase()}`}
                                  value={subtask.status}
                                  onChange={(e) =>
                                    handleSubtaskStatusChange(
                                      row.id,
                                      issueIndex,
                                      subtaskIndex,
                                      e.target.value
                                    )
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option className="blocked-option" value="Blocked">
                                    Blocked
                                  </option>
                                  <option className="in-progress-option" value="In Progress">
                                    In Progress
                                  </option>
                                  <option className="to-do-option" value="To Do">
                                    To Do
                                  </option>
                                  <option className="done-option" value="Done">
                                    Done
                                  </option>
                                </select>

                                <div
  className="three-dots-subtask"
  onClick={(e) => {
    e.stopPropagation();
    handleToggleSubtaskMenu(row.id, issueIndex, subtaskIndex);
  }}
>
  . . .
</div>

{activeMenu === `${row.id}-${issueIndex}-${subtaskIndex}` && (
  <div className="subtask-menu">
    <button
      className="edit-subtask-btn"
      onClick={(e) => {
        e.stopPropagation();
        handleEditSubtask(row.id, issueIndex, subtaskIndex);
      }}
    >
      Edit
    </button>
    <button
      className="delete-subtask-btn"
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteSubtask(row.id, issueIndex, subtaskIndex);
      }}
    >
      Delete
    </button>
  </div>
)}

                              </div>
                            )
                          )}

                          {/* Create Subtask button */}
                          
                          <button
                            className="createsubtaskbtn"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event propagation
                              handleCreateSubtaskPopup(row.id, issueIndex);
                            }}
                          >
                           <Plus size={16} className='Plus-Icon-subtask' />
                            Create Subtask
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Create Issue button */}
                  <button
                    className="createissuebtn"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event propagation
                      setCurrentEpicId(row.id);
                      handleCreateIssuePopup();
                    }}

                    
                  >
                    <Plus size={16}  className='Plus-Icon-issue' />
                    Create Issue
                  </button>
                </div>
              </td>
            </tr>
          )}
</React.Fragment>
      ))}
        
            <tr>
             <td style={{ border: 'none', zIndex: 10, background: 'none' }}>
                <div className="dropdown-content">
                  <button
                    className="createepicbtn"
                    onClick={openCreateEpicPopup}
                    
                  >
                     <Plus size={16}  className='Plus-Icon-epic' />
                    Create Epic
                  </button>
                </div>
              </td>
            </tr>


{/* Done Section */}

<tr> 
  <td style={{ border: 'none', zIndex: 1000, background: 'none' }}>
  <div
      className="roadmap-done-section"
      onMouseEnter={() => setIsDoneSectionHovered(true)}
      onMouseLeave={() => setIsDoneSectionHovered(false)}
    >
      <span className="roadmap-done-name">Done</span>
      <div className="roadmap-done-menu-container">
        <button
          className="roadmap-done-menu-button"
          onClick={handleDoneMenuClick}
          style={{
            opacity: isDoneSectionHovered ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
          }}
        >
          <MoreHorizontal size={20} color="#2665AC" />
        </button>

        {isDoneMenuOpen && (
          <div className="roadmap-done-dropdown-menu">
            <div className="roadmap-done-dropdown-header">
              How long does the completed project last here?
            </div>
            <div className="roadmap-done-dropdown-options">
              <label className="roadmap-done-dropdown-option">
                <input
                  type="radio"
                  name="retentionPeriod"
                  value="1-minute"
                  checked={doneRetentionPeriod === "1-minute"}
                  onChange={() => handleRetentionPeriodChange("1-minute")}
                  className="roadmap-done-radio"
                />
                <span className="roadmap-done-radio-label">1 Minute</span>
              </label>
              <label className="roadmap-done-dropdown-option">
                <input
                  type="radio"
                  name="retentionPeriod"
                  value="2-weeks"
                  checked={doneRetentionPeriod === "2-weeks"}
                  onChange={() => handleRetentionPeriodChange("2-weeks")}
                  className="roadmap-done-radio"
                />
                <span className="roadmap-done-radio-label">2 Weeks</span>
              </label>
              <label className="roadmap-done-dropdown-option">
                <input
                  type="radio"
                  name="retentionPeriod"
                  value="3-weeks"
                  checked={doneRetentionPeriod === "3-weeks"}
                  onChange={() => handleRetentionPeriodChange("3-weeks")}
                  className="roadmap-done-radio"
                />
                <span className="roadmap-done-radio-label">3 Weeks</span>
              </label>
              <label className="roadmap-done-dropdown-option">
                <input
                  type="radio"
                  name="retentionPeriod"
                  value="no-limit"
                  checked={doneRetentionPeriod === "no-limit"}
                  onChange={() => handleRetentionPeriodChange("no-limit")}
                  className="roadmap-done-radio"
                />
                <span className="roadmap-done-radio-label">No Limit</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
      </td>
      </tr>

          {doneRows.map((row) => (
            <React.Fragment key={row.id}>
              <tr>
                <td
                  className={`hoverable-done-row ${activeRow === row.id ? 'active' : ''}`}
                  onClick={(e) => {
                    handleRowClick(row.id);
                    e.stopPropagation();
                    setExpandedRows((prev) => ({
                      ...prev,
                      [row.id]: !prev[row.id], // Toggle expanded state
                    }));
                  }}
                  style={{ zIndex: 100 }}
                >
                  {/* Pin Icon */}
                  <span
                    className="pin-icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event propagation
                      togglePin(row.id);
                    }}
                    style={{
                      cursor: 'pointer',
                      marginRight: '10px',
                      verticalAlign: 'middle',
                    }}
                  >
                    <Pin
                      size={22}
                      style={{
                        color: row.isPinned ? '#ED8A19' : '#3A74B4',
                        fill: row.isPinned ? '#ED8A19' : 'none',
                      }}
                    />
                  </span>

                  {/* Dropdown Toggle */}
                  <span
                    className="dropdown-toggle-epic"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event propagation
                      setExpandedRows((prev) => ({
                        ...prev,
                        [row.id]: !prev[row.id], // Toggle expanded state
                      }));
                    }}
                  >
                    {expandedRows[row.id] ? '▼' : '►'}
                  </span>

                  {/* Profile Picture */}
                  {row.icon && (
                    <img src={row.icon} alt="Icon" className="profilePicEpic" />
                  )}

                  {/* Project Name with Line-through */}
                  <span
                    className="done-project-name"
                    
                  >
                    {row.projectName}
                  </span>

              
                 

                  {/* Three Dots Dropdown */}
                  <span
                    className="three-dots"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event propagation
                      handleDropdownToggle(row.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    . . .
                  </span>

                  {dropdownVisibleRow === row.id && (
                    <div className="dropdown-menu" style={{ top: -4}}>
                      <button
                        className="editepicactionbtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditRow(row.id);
                        }}
                        
                        style={{ width: 120}}
                      >
                        Edit
                      </button>
                      <button
                        className="deleteEpicactionbtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRow(row.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>

                {/* Project Progress */}
                <td className="project-progress-cell">
                  <ProjectProgressBar
                    epicId={row.id}
                    issuesByEpic={issuesByEpic}
                    subtasks={subtasks}
                  />
                </td>

                {/* Timeline Bar */}
                <td colSpan={extendedOverviewmonths.length} style={{ padding: 0 }}>
                  <TimelineBar
                    startDate={row.startDate}
                    endDate={row.endDate}
                    id={row.id}
                  />
                </td>
              </tr>

            </React.Fragment>
          ))}
        
     
    </tbody>
  </table>
</div>


            </div>



        {/* CREATING ISSUE FORM */}
        {createIssuePopup && (
  <div className='create-issue-modal'>
    <div className='create-issue-popup'>
      <div className="create-issue-popup-content">
        <h2>{isEditingIssue ? "Edit Issue" : "Create Issue"}<hr /></h2>
        <form>
          <div className="custom-dropdown-with-tooltips">
            <div className="dropdown-selected" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {dropdownValue && <img src={icons[dropdownValue]} alt="" className="selected-icon" />}
              <FontAwesomeIcon icon={faAngleDown} className={`angle-icon ${isDropdownOpen ? 'open' : ''}`} />
              {dropdownValue || "Select Issue Type"}
            </div>
            
            {isDropdownOpen && (
              <div className="dropdown-options">
                <div className="dropdown-option" onClick={() => handleDropdownChange("Story")}>
                  <img src={img4} alt="" className="createicon" /> Story
                  <span className="tooltip">A feature or requirement to be implemented</span>
                </div>
                <div className="dropdown-option" onClick={() => handleDropdownChange("Task")}>
                  <img src={img6} alt="" className="createicon" /> Task
                  <span className="tooltip">A general work item</span>
                </div>
                <div className="dropdown-option" onClick={() => handleDropdownChange("Bug")}>
                  <img src={img5} alt="" className="createicon" /> Bug
                  <span className="tooltip">A defect that needs to be fixed</span>
                </div>
              </div>
            )}
          </div>

          <input
            type="number"
            placeholder="Enter Effort"
            className="entereffort"
            value={effort}
            onChange={(e) => setEffort(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter Project Issue Name"
            className="enterprojectissuename"
            value={projectIssueName}
            onChange={(e) => setProjectIssueName(e.target.value)}
          />
        </form>
        <div className="issue-actions">
        <button
          className="issue-action-button"
          onClick={isEditingIssue ? handleSaveEditIssue : () => handleCreateIssue(currentEpicId)}
        >
          {isEditingIssue ? "Save Changes" : "Create"}
        </button>
        <button className="issue-action-button" onClick={handleCloseCreateIssuePopup}>Close</button>
      </div>
      </div>
    </div>
  </div>
)}


{/* Delete Issue Confirmation Popup */}
{issuedeleteConfirmation && (
        <div className="issue-delete-confirmation-modal">
          <div className="issue-delete-confirmation-content">
            <p>Are you sure you want to delete {issueToDelete?.projectIssueName}?</p>
            <div className="issue-delete-confirmation-buttons">
              <button 
                className="confirm-delete-btn"
                onClick={handleConfirmDelete}
              >
                Yes
              </button>
              <button 
                className="cancel-delete-btn"
                onClick={handleCancelDelete}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

        {/* CREATING SUBTASK FORM */}
        {showSubtaskPopup && (
  <div className='create-subtask-modal'>
    <div className="create-subtask-popup">
      <div className="create-subtask-popup-content">
        <h2>{isEditingSubtask ? 'Edit Subtask' : 'Create Subtask'} <hr /></h2>
        <form>
          <input
            type="text"
            placeholder="Enter Project Subtask Name"
            className="subtask-name-input"
            value={subtaskName}
            onChange={(e) => setSubtaskName(e.target.value)}
          />
        </form>
        <div className="subtask-actions">
          {isEditingSubtask ? (
            <button className="subtask-action-button" onClick={handleSaveEditSubtask}>Save Changes</button>
          ) : (
            <button 
              className="subtask-action-button" 
              onClick={() => handleCreateSubtask(currentEpicId)}
              disabled={isCreatingSubtask}>
              Create
            </button>
          )}
          <button className="subtask-action-button" onClick={handleCloseSubtaskPopup}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
)}


 {/* Delete Subtask Confirmation Popup */}
 {deleteConfirmation && (
  <div className="subtask-delete-confirmation-modal">
    <div className="subtask-delete-confirmation-content">
      <p>Are you sure you want to delete {subtaskToDelete?.name}?</p>
      <div className="subtask-delete-confirmation-buttons">
        <button 
          className="subtask-confirm-delete-btn"

          
          onClick={(e) => { e.stopPropagation(); handleConfirmSubtaskDelete();}}
        >
          Yes
        </button>
        <button 
          className="subtask-cancel-delete-btn"
          onClick={handleCancelSubtaskDelete}
        >
          No
        </button>
      </div>
    </div>
  </div>
)}


           

{/* CREATING EPIC FORM */}

{showEpicPopupPersonalRoadmap && (
    <div className="create-epic-modal">
        <div className="create-epic-popup">
            <div className="create-epic-popup-content">
                <h2>{isEditing ? 'Edit Epic' : 'Create Epic'}</h2>
                <hr />
                <form onSubmit={isEditing ? handleSaveEdit : handleCreateRow}>
                    <div className="create-epic-file-upload-container">
                        <div className="profile-picture-container">
                            {selectedImage && (
                                <img src={selectedImage} alt="Selected" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                        </div>
                        <div className="create-epic-file-upload">
                            <input
                                type="file"
                                id="file-upload"
                                accept="image/*"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                            <div className="create-epic-upload-content">
                                <p className="create-epic-upload-text">
                                    {selectedImage ? 'File Selected' : 'No File Selected'}
                                </p>
                                <label htmlFor="file-upload" className="create-epic-upload-button">
                                    Upload File
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="create-epic-enter-proname">
                        <input
                            type="text"
                            id="project-name"
                            placeholder="Enter Project Name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                        ></input>
                    </div>

                
                    <DateTimePicker
  label="Start Date"
  date={startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} // Default to today's date if no start date
  time={startTime} // Pass the start time to display
  onDateChange={(dateString) => {
    const date = new Date(dateString); // Convert string to Date object
    const today = new Date();
    
    // Allow selecting the current date or any future date
    if (date >= today) {
      setStartDate(date);
      console.log("Start Date Selected:", dateString);
    } else {
      console.error("Start Date cannot be in the past");
    }
  }}
  onTimeChange={(time) => {
    setStartTime(time);
    console.log("Start Time Selected:", time);
  }}
  min={new Date().toISOString().split('T')[0]} // Set the min date to today
/>

<DateTimePicker
  label="End Date"
  date={endDate ? endDate.toISOString().split('T')[0] : ''} // Format date for input
  time={endTime} // Pass the end time to display
  onDateChange={(dateString) => {
    const date = new Date(dateString); // Convert string to Date object
    if (!isNaN(date)) {
      // Ensure the end date is not before the start date
      if (date >= startDate) {
        setEndDate(date);
        console.log("End Date Selected:", dateString);
      } else {
        console.error("End Date cannot be before Start Date");
      }
    } else {
      console.error("Invalid date format:", dateString);
    }
  }}
  onTimeChange={(time) => {
    setEndTime(time);
    console.log("End Time Selected:", time);
  }}
/>



                    <div className="create-epic-actions">
                        <button type="submit" className="create-epic-action-btn" disabled={isCreating}>
                            {isEditing ? 'Save Changes' : 'Create'}
                        </button>
                        <button type="button" className="create-epic-action-btn" onClick={() => setShowEpicPopupPersonalRoadmap(false)}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
)}




 {/* Delete Epic Confirmation Popup */}
 {showDeleteConfirmation && (
            <div className="delete-confirmation-modal">
                <div className="delete-confirmation-popup">
                    <p>Are you sure you want to delete {rows.find(row => row.id === rowToDelete)?.projectName}?</p>
                    <div className="confirmation-actions-roadmap">
                    <button onClick={confirmDeleteRow} className='confirmation-yes'>Yes</button>
                    <button onClick={cancelDeleteRow}  className='confirmation-no'>No</button>
                    </div>
                </div>
            </div>
        )}




{showMarkAsDonePopup && (
  <div className="mark-as-done-modal">
    <div className="confirm-popup-content">
      <p>{popupMessage}</p>
      <button
        onClick={() => setShowMarkAsDonePopup(false)}
        className="popup-confirm-button"
      >
        Confirm
      </button>
    </div>
  </div>
)}



</div>


    );
}

export default PersonalRoadmap;