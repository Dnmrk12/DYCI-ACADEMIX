import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MoreHorizontal, Bookmark, Calendar, X, Pin, Trash2 } from "lucide-react";
import grpProfile from "./iconshomepage/notifprofile4.png";
import sdProfile from "./iconshomepage/sdProfile.png";
import img1 from "./iconshomepage/memberIcon1.png";
import img2 from "./iconshomepage/memberIcon2.png";
import img3 from "./iconshomepage/memberIcon3.png";
import francoProfile from "./iconshomepage/francoProfile.png";
import searchIcon from "./iconshomepage/magnifyingglass.png";
import guidelinesICON from "./iconshomepage/guidelinesICON.png";
import img8 from "./iconshomepage/scrumInstruction.png";
import img9 from "./iconshomepage/priorityLevel.png";
import img10 from "./iconshomepage/kanbanColumn.png";
import img11 from "./iconshomepage/credentials.png";
import img12 from "./iconshomepage/researchicon.png";
import img13 from "./iconshomepage/bugfixicon.png";
import img14 from "./iconshomepage/ppticon.png";
import img15 from "./iconshomepage/versionupdate.png";
import overdueIcon from "./iconshomepage/overdueIcon.png";
import cautionIcon from "./iconshomepage/exclamation.png";
import calendarIcon from "./iconshomepage/calendar.png";
import clockIcon from "./iconshomepage/clock.png";
import timeIcon from "./iconshomepage/time.png";
import successPopup from "./iconshomepage/successPopup.png";
import errorPopup from "./iconshomepage/errorPopup.png";
import "./scrumprojects.css";
import {
  getFirestore,
  collection,
  limit,
  addDoc,
  doc,
  getDocs,
  getDoc,
  increment,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  updateDoc,
  arrayRemove,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { db } from "./firebase/firebaseConfig";
const gen = (name) => {
  if (!name) return ""; // Add safeguard to check for undefined or null name
  return name
    .split(" ") // Split the name into words
    .map((word) => word.charAt(0).toUpperCase()) // Take the first letter of each word and capitalize it
    .join("") // Join the letters together
    .substring(0, 3); // Take the first 3 characters
};
const ScrumProjects = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showEpicPopup, setShowEpicPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [clickedBookmarks, setClickedBookmarks] = useState({});
  const [searchQuery, setSearchQuery] = useState(""); // Add state for search query
  const [isDoneSectionHovered, setIsDoneSectionHovered] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [isDoneMenuOpen, setIsDoneMenuOpen] = useState(false);
  const [doneRetentionPeriod, setDoneRetentionPeriod] = useState("no-limit");
  const [removalTimers, setRemovalTimers] = useState({});
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const taskRefs = useRef({});
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUid(currentUser.uid); // Set the uid if user is authenticated
    } else {
      setUid(null); // Reset if no user is authenticated
    }

    // Optional: Set up a listener for auth state changes (e.g., when user logs in or out)
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
      }
    });

    // Cleanup listener on component unmount
    return () => {
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs once on component mount

  const [id, setId] = useState(location.state?.id || null);
  useEffect(() => {
    const targetTaskId = id; // Replace this with the ID you're looking for
    const taskDiv = taskRefs.current[targetTaskId];

    if (taskDiv) {
      // Simulate click event
      taskDiv.click();
    }
  }, [projects]); // Only run when tasks update
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const auth = getAuth();
        await setPersistence(auth, browserLocalPersistence);
        const uid = auth.currentUser ? auth.currentUser.uid : "";
        if (!uid) {
          console.error("No user logged in");
          setLoading(false);
          return;
        }

        const db = getFirestore();
        const scrumRef = collection(db, `users/${uid}/Scrum`);
        const scrumSnapshot = await getDocs(scrumRef);

        // Fetch tasks for each Scrum
        const tasksData = await Promise.all(
          scrumSnapshot.docs.map(async (scrumDoc) => {
            const scrumId = scrumDoc.id;
            const scrumDetailRef = doc(db, `Scrum/${scrumId}`);
            const scrumDetailSnapshot = await getDoc(scrumDetailRef);

            if (!scrumDetailSnapshot.exists()) {
              console.error(`Scrum with ID ${scrumId} does not exist.`);
              return null;
            }

            const epicData = scrumDetailSnapshot.data();

            // Fetch backlog to calculate progress
            const backlogRef = collection(db, `Scrum/${scrumId}/backlog`);
            const backlogSnapshot = await getDocs(backlogRef);

            let totalEffort = 0;
            let completedEffort = 0;

            const backlogTasks = backlogSnapshot.docs.map((taskDoc) => {
              const taskData = taskDoc.data();

              const stats = taskData.stats || {};
              const effort = stats.effort || 0;
              const status = taskData.status || "Unknown";
              const issueStatus = taskData.issueStatus || "Unknown";

              if (issueStatus.toLowerCase() === "backlog") {
                return { id: taskDoc.id, effort, status, issueStatus };
              }

              totalEffort += effort;
              if (status === "Done") {
                completedEffort += effort;
              }

              return { id: taskDoc.id, effort, status, issueStatus };
            });

            const progress = totalEffort ? ((completedEffort / totalEffort) * 100).toFixed(2) : 0;

            const scrumMasterId = epicData.scrumMaster;
            const scrumMasterRef = doc(db, `users/${scrumMasterId}`);
            const scrumMasterSnapshot = await getDoc(scrumMasterRef);
            const scrumMasterData = scrumMasterSnapshot.data();

            const scrumMasterName = `${scrumMasterData.firstName} ${scrumMasterData.lastName}`;
            const masterIcon = scrumMasterData.userPicture;

            const membersRef = collection(db, `Scrum/${scrumId}/member`);
            const membersSnapshot = await getDocs(membersRef);
            const members = await Promise.all(
              membersSnapshot.docs.map(async (memberDoc) => {
                const memberUid = memberDoc.id;
                const memberData = memberDoc.data();

                const memberRef = doc(db, `users/${memberUid}`);
                const memberSnapshot = await getDoc(memberRef);
                const memberProfileData = memberSnapshot.data();

                const memberName = `${memberProfileData.firstName} ${memberProfileData.lastName}`;
                const memberRole = memberData.role;
                const memberAccess = memberData.access;
                const memberImg = memberProfileData.userPicture;

                return {
                  id: memberUid,
                  img: memberImg,
                  name: memberName,
                  role: memberRole,
                  access: memberAccess,
                };
              }),
            );

            // Add canEdit field based on scrumMaster
            const canEdit = scrumMasterId === uid;

            return {
              id: epicData.id,
              icon: epicData.icon,
              name: epicData.projectName || "",
              key: gen(epicData.projectName),
              scrumMaster: scrumMasterName,
              masterIcon: masterIcon,
              startDate: epicData.startDate,
              startTime: epicData.startTime,
              leader: epicData.scrumMaster,
              endDate: epicData.endDate,
              bookMark: epicData.bookMark,
              endTime: epicData.endTime,
              isDone: epicData.isDone,
              members: members,
              progress,
              backlogTasks,
              canEdit, // Add canEdit property
            };
          }),
        );

        const validTasksData = tasksData.filter((task) => task !== null);

        setProjects(validTasksData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Scrum data:", error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Add handler for done menu toggle
  const handleDoneMenuClick = (e) => {
    e.stopPropagation();
    setIsDoneMenuOpen(!isDoneMenuOpen);
  };
  const handleProfileNavigation = (member) => {
    console.log("Navigating to profile with data:", member); // Log the member to check

    navigate("/ProfileDetails", {
      state: {
        memberId: member.memberId,
        name: `${member.firstName} ${member.lastName}`,
        profileImage: member.userPicture,
        edit: uid === member.memberId ? false : true, // If uid matches memberId, set edit to false, otherwise true
      },
    });
  };

  const handleProjectClick = async (project) => {
    // Create a reference to the member's document

    // Store project details in localStorage
    localStorage.setItem(
      "selectedProject",
      JSON.stringify({
        id: project.id,
        projectName: project.name,
        key: project.key,
        startDate: project.startDate,
        startTime: project.startTime,
        endDate: project.endDate,
        endTime: project.endTime,
        icon: project.icon,
        scrumMaster: project.scrumMaster,
        masterIcon: project.masterIcon,
        members: project.members.map((member) => ({
          memberId: member.id,
          img: member.img,
          name: member.name,
          role: member.role,
          access: member.access,
        })),
      }),
    );

    // Navigate to backlogs with state
    navigate(`/backlogs/${project.id}`, {
      state: {
        id: project.id,
        key: project.key,
        projectName: project.name,
        startDate: project.startDate,
        startTime: project.startTime,
        endDate: project.endDate,
        endTime: project.endTime,
        icon: project.icon,
        scrumMaster: project.scrumMaster,
        masterIcon: project.masterIcon,
        members: project.members.map((member) => ({
          memberId: member.id,
          img: member.img,
          name: member.name,
          role: member.role,
          access: member.access,
        })),
      },
    });
  };

  // Add handler for retention period selection
  const handleRetentionPeriodChange = (period) => {
    setDoneRetentionPeriod(period);
    setIsDoneMenuOpen(false);

    // Clear any existing timers before setting a new one
    Object.values(removalTimers).forEach((timer) => clearTimeout(timer));
    setRemovalTimers({});

    // Set new removal timer based on selected retention period
    if (period !== "no-limit") {
      const time = period === "1-minute" ? 60000 : period === "2-weeks" ? 1209600000 : period === "3-weeks" ? 1814400000 : 0;
      doneProjects.forEach((project) => {
        const timer = setTimeout(() => {
          // Remove project after the selected retention time
          setProjects((prevProjects) => prevProjects.filter((p) => p.id !== project.id));
        }, time);

        setRemovalTimers((prev) => ({ ...prev, [project.id]: timer }));
      });
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".scrum-done-dropdown-menu")) {
        setIsDoneMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleIconClick = async (e, projectId, currentBookmarkState) => {
    e.stopPropagation();

    const projectRef = doc(db, "Scrum", projectId);

    try {
      const projectDoc = await getDoc(projectRef);
      if (projectDoc.exists()) {
        const projectData = projectDoc.data();
        const currentBookmarkArray = Array.isArray(projectData.bookMark) ? projectData.bookMark : [];

        let updatedBookmarkState;

        if (currentBookmarkArray.includes(uid)) {
          console.log(`Removing UID: ${uid} from bookMark array`);
          updatedBookmarkState = currentBookmarkArray.filter((userId) => userId !== uid);
        } else {
          console.log(`Adding UID: ${uid} to bookMark array`);
          updatedBookmarkState = [...currentBookmarkArray, uid];
        }

        await updateDoc(projectRef, { bookMark: updatedBookmarkState });
        console.log("Bookmark state updated in Firestore");

        setClickedBookmarks((prevState) => ({
          ...prevState,
          [projectId]: updatedBookmarkState,
        }));

        setProjects((prevProjects) => prevProjects.map((project) => (project.id === projectId ? { ...project, bookMark: updatedBookmarkState } : project)));
      } else {
        console.log("Project not found in Firestore");
      }
    } catch (error) {
      console.error("Error updating bookmark in Firestore:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProjects = projects.filter((project) => project.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const activeProjects = filteredProjects.filter((project) => !project.isDone);
  const doneProjects = filteredProjects.filter((project) => project.isDone);

  const handleMoreClick = (e, projectId) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === projectId ? null : projectId);
  };

  const handleEditProject = (projectId) => {
    const projectToEdit = projects.find((p) => p.id === projectId);
    setEditingProject(projectToEdit);
    setIsEditMode(true);
    setShowEpicPopup(true);
    setActiveDropdown(null);
    setHoveredRow(null); // Reset hover state when entering edit mode
  };

  const handleDeleteProject = (projectId) => {
    const projectToDelete = projects.find((p) => p.id === projectId);
    setActiveDropdown(null);
    setHoveredRow(null); // Reset hover state when deleting
    setShowDeleteConfirmation(true);
    setEditingProject(projectToDelete);
  };

  // Update the handleConfirmDelete function
  const handleConfirmDelete = async () => {
    if (editingProject) {
      const firestore = getFirestore();
      const projectId = editingProject.id;

      try {
        // Step 1: Get all members of the project from Scrum/${projectId}/member
        const membersRef = collection(firestore, `Scrum/${projectId}/member`);
        const membersSnapshot = await getDocs(membersRef);

        // Step 2: Delete the user references in users/${memberUid}/Scrum/${projectId}
        const deleteMemberPromises = membersSnapshot.docs.map(async (memberDoc) => {
          const memberUid = memberDoc.id; // memberUid from Scrum/${projectId}/member

          // Delete the reference from users/${memberUid}/Scrum/${projectId}
          const userScrumRef = doc(firestore, `users/${memberUid}/Scrum/${projectId}`);
          await deleteDoc(userScrumRef);
        });

        // Step 3: Wait for all member deletions to complete
        await Promise.all(deleteMemberPromises);

        // Step 4: Delete the Scrum project document
        const projectRef = doc(firestore, `Scrum/${projectId}`);
        await deleteDoc(projectRef);

        // Step 5: Delete the project from the local state (if applicable)
        setProjects((prevProjects) => prevProjects.filter((project) => project.id !== editingProject.id));

        // Close the confirmation dialog and reset the editing project
        setShowDeleteConfirmation(false);
        setEditingProject(null);

        console.log("Project and related data deleted successfully!");
      } catch (error) {
        console.error("Error deleting Scrum project and related data:", error);
      }
    }
  };

  const handleClosePopup = () => {
    setShowEpicPopup(false);
    setIsEditMode(false);
    setEditingProject(null);
    setShowDeleteConfirmation(false);
    setHoveredRow(null); // Reset hover state when closing popup
  };

  React.useEffect(() => {
    const completedProject = location.state?.completedProject;

    if (completedProject) {
      // Check if the project is already in the projects list
      const existingProjectIndex = projects.findIndex((p) => p.name === completedProject.name);

      if (existingProjectIndex !== -1) {
        // Update existing project
        const updatedProjects = [...projects];
        updatedProjects[existingProjectIndex] = {
          ...updatedProjects[existingProjectIndex],
          progress: 100,
          isDone: true,
        };

        setProjects(updatedProjects);
      } else {
        // Add new completed project
        setProjects((prevProjects) => [
          ...prevProjects,
          {
            ...completedProject,
            id: prevProjects.length + 1, // Generate a new unique ID
          },
        ]);
      }
    }
  }, [location.state]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Reset hover state when popup is shown
  React.useEffect(() => {
    if (showEpicPopup || showDeleteConfirmation) {
      setHoveredRow(null);
    }
  }, [showEpicPopup, showDeleteConfirmation]);

  // Add this function to generate key from project name
  const generateKeyFromName = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 3);
  };

  // Modify handleUpdateProject to include key update

  const handleUpdateProject = async (updatedProject) => {
    if (!updatedProject || !updatedProject.id) {
      console.error("Invalid project data");
      return;
    }

    try {
      const firestore = getFirestore();

      // Update the local state
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === updatedProject.id
            ? {
                ...project,
                name: updatedProject.projectName,
                key: generateKeyFromName(updatedProject.projectName),
                startDate: updatedProject.startDate,
                startTime: updatedProject.startTime,
                endDate: updatedProject.endDate,
                endTime: updatedProject.endTime,
                icon: updatedProject.icon,
              }
            : project,
        ),
      );

      // Update the database
      const projectDocRef = doc(firestore, "Scrum", updatedProject.id); // Adjust the path based on your Firestore structure
      await updateDoc(projectDocRef, {
        projectName: updatedProject.projectName,
        key: generateKeyFromName(updatedProject.projectName),
        startDate: updatedProject.startDate,
        startTime: updatedProject.startTime,
        endDate: updatedProject.endDate,
        endTime: updatedProject.endTime,
        icon: updatedProject.icon,
      });

      console.log("Project updated successfully in Firestore!");
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const toggleGuidelines = () => {
    setShowGuidelines(!showGuidelines);
  };

  const closeGuidelines = () => {
    setShowGuidelines(false);
  };

  // function to check if a project is nearing its deadline
  const isProjectNearingDeadline = (endDate) => {
    if (!endDate) return false;

    const deadline = new Date(endDate);
    const today = new Date();
    const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

    return daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
  };

  // function to get tooltip message based on days remaining
  const getIconBasedOnDeadline = (startDate, endDate, status, dateDone) => {
    if (status !== "Complete") {
      if (!startDate || !endDate) return calendarIcon;

      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      const totalDuration = end - start;
      const elapsedTime = today - start;
      const percentageElapsed = (elapsedTime / totalDuration) * 100;

      if (percentageElapsed >= 75) return overdueIcon;
      if (percentageElapsed >= 50) return cautionIcon;
      return calendarIcon;
    }

    if (status === "Complete" && dateDone && endDate) {
      const end = new Date(endDate);
      const done = new Date(dateDone);
      return done <= end ? timeIcon : clockIcon;
    }

    return null;
  };

  // Updated function to get the deadline message
  const getDeadlineMessage = (startDate, endDate, status, dateDone) => {
    if (status !== "Complete" && startDate && endDate) {
      const end = new Date(endDate);
      const today = new Date();
      const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

      if (daysRemaining === 0) return "This project is due today!";
      if (daysRemaining === 1) return "This project is due tomorrow!";
      return `This project is due in ${daysRemaining} days.`;
    }

    if (status === "Complete" && dateDone && endDate) {
      const done = new Date(dateDone);
      const end = new Date(endDate);
      const daysOverdue = Math.ceil((done - end) / (1000 * 60 * 60 * 24));

      if (done <= end) return "Project completed on time!";
      return `Project completed ${daysOverdue} days late.`;
    }

    return "";
  };

  // Update the handleMembersClick function
  const handleMembersClick = (e, projectId) => {
    e.stopPropagation();
    setShowMembersPopup(true);
    setHoveredRow(null); // Reset hover state
    setSelectedRow(projectId);
  };

  // Update the members popup close handler
  const handleCloseMembersPopup = (e) => {
    e.stopPropagation(); // Stop the event from bubbling up to parent elements
    setShowMembersPopup(false);
    setSelectedRow(null);
  };

  const [tooltipStates, setTooltipStates] = useState({});
const titleRefs = useRef({});

// Add this useEffect to check for text overflow
useEffect(() => {
  // Check each title element for overflow
  Object.keys(titleRefs.current).forEach(projectId => {
    const element = titleRefs.current[projectId];
    if (element) {
      const isOverflow = element.offsetWidth < element.scrollWidth;
      setTooltipStates(prev => ({
        ...prev,
        [projectId]: {
          isOverflowing: isOverflow,
          showTooltip: false
        }
      }));
    }
  });
}, [projects]);

  return (
    <div className="scrum-container">
      {/* Header */}
      <div className="scrum-header">
        <h1 className="scrum-title">Scrum Projects</h1>
        <img src={guidelinesICON} alt="" className="scrum-guidelinesIcon" onClick={toggleGuidelines} />
      </div>

      {/* Guidelines Popup */}
      {showGuidelines && (
        <div className="scrum-guidelines">
          <h4>Scrum</h4>
          <div className="scrum-guidelines-scroll">
            <div className="scrum-instruction">
              <img src={img8} alt="" className="scrum-icons" />
              <p>Scrum is an Agile framework for managing complex projects, particularly in software development. It emphasizes iterative progress through time-boxed iterations called sprints.</p>
            </div>
            <div className="scrum-epic-instruction">
              <b>
                <img src={img11} alt="" className="scrum-epic-icons" />
                Epic - A large body of work that can be broken down into smaller tasks or stories.
              </b>
              <b>
                <img src={img12} alt="" className="scrum-epic-icons" />
                Story - A feature or requirement to be implemented.
              </b>
              <b>
                <img src={img13} alt="" className="scrum-epic-icons" />
                Bug - A defect that needs to be fixed.
              </b>
              <b>
                <img src={img14} alt="" className="scrum-epic-icons" />
                Task - A general work item.
              </b>
              <b>
                <img src={img15} alt="" className="scrum-epic-icons" />
                Sub-task - A smaller unit that breaks down a parent issue.
              </b>
              <p>"Issue Type" represents different types of work items or tasks that need to be tracked and managed.</p>
            </div>
            <div className="scrum-representation-instruction">
              <img src={img9} alt="" className="scrum-icons" />
              <div className="priority-container">
                <p>The level of priority indicates the urgency and importance of tasks or projects within a workflow.</p>
                <div className="priority-levels">
                  <span className="priority low">
                    <span className="caret">
                      <span>∧</span>
                    </span>
                    Low
                  </span>
                  <span className="priority medium">
                    <span className="caret">
                      <span>∧</span>
                      <span>∧</span>
                    </span>
                    Medium
                  </span>
                  <span className="priority high">
                    <span className="caret">
                      <span>∧</span>
                      <span>∧</span>
                      <span>∧</span>
                    </span>
                    High
                  </span>
                </div>
              </div>
            </div>
            <div className="scrum-project-instruction">
              <img src={img10} alt="" className="scrum-icons" />
              <p>
                A scrum status column represents a specific stage in your workflow. It visually organizes tasks based on their status, helping teams see what’s being worked on, what’s completed, and
                what’s upcoming.
              </p>
            </div>
          </div>
          <button className="scrum-guidelines-done" onClick={closeGuidelines}>
            Done
          </button>
        </div>
      )}

      {/* Search Bar and Create Epic Button Container */}
      <div className="scrum-controls-container">
        <div className="scrum-search-container">
          <input type="text" placeholder="Search" className="scrum-search-input" value={searchQuery} onChange={handleSearchChange} />
          <img src={searchIcon} alt="search" className="scrum-search-icon" />
        </div>
        <button
          className="scrum-create-epic-btn"
          onClick={() => {
            setIsEditMode(false);
            setEditingProject(null);
            setShowEpicPopup(true);
          }}
        >
          Create Epic
        </button>
      </div>

      {/* Table Header */}
      <div className="scrum-table-header">
        <div></div>
        <div>Name</div>
        <div>Project Progress</div>
        <div>Key</div>
        <div>Scrum Master</div>
        <div>Members</div>
        <div></div>
      </div>

      {/* Active Projects List */}
      {activeProjects.map((project) => (
        <div
          key={project.id}
          ref={(el) => (taskRefs.current[project.id] = el)}
          className={`scrum-project-row ${selectedRow === project.id ? "selected-row" : ""}`}
          onMouseEnter={() => !showEpicPopup && !showMembersPopup && setHoveredRow(project.id)}
          onMouseLeave={() => !selectedRow && setHoveredRow(null)}
          onClick={() => handleProjectClick(project)}
          style={{ cursor: "pointer" }}
        >
          <div>
            <Bookmark
              className={`scrum-bookmark-icon ${Array.isArray(project.bookMark) && project.bookMark.includes(uid) ? "clicked" : ""}`}
              size={20}
              onClick={(e) => handleIconClick(e, project.id, Array.isArray(project.bookMark) && project.bookMark.includes(uid))}
              style={{
                fill: Array.isArray(project.bookMark) && project.bookMark.includes(uid) ? "#2665AC" : "none",
              }}
            />
          </div>

          <div className="scrum-project-name-cell">
  <img src={project.icon} alt="project icon" className="scrum-project-icon" />
  <span 
    className="scrum-project-name" 
    ref={el => titleRefs.current[project.id] = el}
    onMouseEnter={() => {
      if (tooltipStates[project.id]?.isOverflowing) {
        setTooltipStates(prev => ({
          ...prev,
          [project.id]: {
            ...prev[project.id],
            showTooltip: true
          }
        }));
      }
    }}
    onMouseLeave={() => {
      setTooltipStates(prev => ({
        ...prev,
        [project.id]: {
          ...prev[project.id],
          showTooltip: false
        }
      }));
    }}
  >
    {project.name}
    {tooltipStates[project.id]?.showTooltip && (
      <div className="scrum-title-tooltip">{project.name}</div>
    )}
  </span>

            {isProjectNearingDeadline(project.endDate) && (
              <div className="title-container">
                <h4 className="task-title">{project.title}</h4>

                {project.endDate && (
                  <div className="kanban-epic-tooltip-container">
                    <img src={getIconBasedOnDeadline(project.startDate, project.endDate, project.status, project.dateDone)} alt="Deadline Status" className="overdue-icon" />
                    <div className="kanban-epic-custom-tooltip">
                      <span className="kanban-epic-tooltip-content">{getDeadlineMessage(project.startDate, project.endDate, project.status, project.dateDone)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Add progress bar here */}
          <div className="scrum-progress-bar-container">
            <div className="scrum-progress-bar">
              <div className="scrum-progress" style={{ width: `${project.progress}%` }}>
                <div className="scrum-progress-percentage">{project.progress}%</div>
              </div>
            </div>
          </div>
          <div className="scrum-project-key">{project.key}</div>

          <div className="scrum-master-cell">
            <img src={project.masterIcon} alt="profile" className="scrum-avatar" />
            <span className="scrum-master-name">{project.scrumMaster}</span>
          </div>

          {/* Add the members section here */}
          <div className="scrum-member-icon-container" onClick={(e) => handleMembersClick(e, project.id)}>
            {project.members.slice(0, 3).map((member, index) => (
              <img
                key={index}
                src={member.img} // Use member's image URL dynamically
                alt={`Member ${index + 1}`}
                className="scrum-member-icon"
              />
            ))}
            {project.members.length > 3 && (
              <div className="scrum-member-count">
                +{project.members.length - 3} {/* Show the count of extra members */}
              </div>
            )}
          </div>

          <div className="scrum-more-options-container">
            {project.canEdit && (
              <button
                className="scrum-more-options-btn"
                style={{
                  opacity: hoveredRow === project.id && !showEpicPopup ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                }}
                onClick={(e) => handleMoreClick(e, project.id)}
              >
                <MoreHorizontal size={20} color="#2665AC" />
              </button>
            )}

            {project.canEdit && activeDropdown === project.id && (
              <div className="scrum-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                <button className="scrum-dropdown-item" onClick={() => handleEditProject(project.id)}>
                  Edit
                </button>
                <button className="scrum-dropdown-item" onClick={() => handleDeleteProject(project.id)}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Done Section */}
      <div className="scrum-done-section" onMouseEnter={() => setIsDoneSectionHovered(true)} onMouseLeave={() => setIsDoneSectionHovered(false)}>
        <span className="scrum-done-name">Done</span>
        <div className="scrum-done-menu-container">
          <button
            className="scrum-done-menu-button"
            onClick={handleDoneMenuClick}
            style={{
              opacity: isDoneSectionHovered ? 1 : 0,
              transition: "opacity 0.2s ease-in-out",
            }}
          >
            <MoreHorizontal size={20} color="#2665AC" />
          </button>

          {isDoneMenuOpen && (
            <div className="scrum-done-dropdown-menu">
              <div className="scrum-done-dropdown-header">How long does the completed project last here?</div>
              <div className="scrum-done-dropdown-options">
                <label className="scrum-done-dropdown-option">
                  <input
                    type="radio"
                    name="retentionPeriod"
                    value="1-minute"
                    checked={doneRetentionPeriod === "1-minute"}
                    onChange={() => handleRetentionPeriodChange("1-minute")}
                    className="scrum-done-radio"
                  />
                  <span className="scrum-done-radio-label">1 Minute</span>
                </label>
                <label className="scrum-done-dropdown-option">
                  <input
                    type="radio"
                    name="retentionPeriod"
                    value="2-weeks"
                    checked={doneRetentionPeriod === "2-weeks"}
                    onChange={() => handleRetentionPeriodChange("2-weeks")}
                    className="scrum-done-radio"
                  />
                  <span className="scrum-done-radio-label">2 Weeks</span>
                </label>
                <label className="scrum-done-dropdown-option">
                  <input
                    type="radio"
                    name="retentionPeriod"
                    value="3-weeks"
                    checked={doneRetentionPeriod === "3-weeks"}
                    onChange={() => handleRetentionPeriodChange("3-weeks")}
                    className="scrum-done-radio"
                  />
                  <span className="scrum-done-radio-label">3 Weeks</span>
                </label>
                <label className="scrum-done-dropdown-option">
                  <input
                    type="radio"
                    name="retentionPeriod"
                    value="no-limit"
                    checked={doneRetentionPeriod === "no-limit"}
                    onChange={() => handleRetentionPeriodChange("no-limit")}
                    className="scrum-done-radio"
                  />
                  <span className="scrum-done-radio-label">No Limit</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Done Projects List */}
      {doneProjects.map((project) => (
        <div
          key={project.id}
          className={`scrum-project-row scrum-done-project-row ${selectedRow === project.id ? "selected-row" : ""}`}
          onMouseEnter={() => !showEpicPopup && !showMembersPopup && setHoveredRow(project.id)}
          onMouseLeave={() => !selectedRow && setHoveredRow(null)}
          onClick={() => handleProjectClick(project)}
          style={{ cursor: "pointer" }}
        >
          <div>
            <Bookmark
              className={`scrum-bookmark-icon ${Array.isArray(project.bookMark) && project.bookMark.includes(uid) ? "clicked" : ""}`}
              size={20}
              onClick={(e) => handleIconClick(e, project.id, Array.isArray(project.bookMark) && project.bookMark.includes(uid))}
              style={{
                fill: Array.isArray(project.bookMark) && project.bookMark.includes(uid) ? "#2665AC" : "none",
              }}
            />
          </div>

          <div className="scrum-project-name-cell">
            <img src={project.icon} alt="project icon" className="scrum-project-icon" />
            <span className="scrum-done-project-name">{project.name}</span>
          </div>

          {/* Add progress bar here */}
          <div className="scrum-progress-bar-container">
            <div className="scrum-progress-bar">
              <div className="scrum-progress" style={{ width: `${project.progress}%` }}>
                <div className="scrum-progress-percentage">{project.progress}%</div>
              </div>
            </div>
          </div>

          <div className="scrum-done-project-key">{project.key}</div>

          <div className="scrum-master-cell">
            <img src={project.masterIcon} alt="profile" className="scrum-avatar" />
            <span className="scrum-master-name">{project.scrumMaster}</span>
          </div>

          {/* Add the members section here */}
          <div className="scrum-member-icon-container" onClick={(e) => handleMembersClick(e, project.id)}>
            {project.members.slice(0, 3).map((member, index) => (
              <img
                key={index}
                src={member.img} // Use member's image URL dynamically
                alt={`Member ${index + 1}`}
                className="scrum-member-icon"
              />
            ))}
            {project.members.length > 3 && (
              <div className="scrum-member-count">
                +{project.members.length - 3} {/* Show the count of extra members */}
              </div>
            )}
          </div>

          <div className="scrum-more-options-container">
            <button
              className="scrum-more-options-btn"
              style={{
                opacity: hoveredRow === project.id && !showEpicPopup ? 1 : 0,
                transition: "opacity 0.2s ease-in-out",
              }}
              onClick={(e) => handleMoreClick(e, project.id)}
            >
              <MoreHorizontal size={20} color="#2665AC" />
            </button>

            {activeDropdown === project.id && (
              <div className="scrum-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                <button className="scrum-dropdown-item" onClick={() => handleEditProject(project.id)}>
                  Edit
                </button>
                <button className="scrum-dropdown-item" onClick={() => handleDeleteProject(project.id)}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
      {showMembersPopup && (
        <div className="backlog-members-popup-overlay">
          <div className="backlog-members-popup-container">
            <div className="backlog-members-popup-header">
              <h3 className="backlog-members-popup-title">Members</h3>
              <button onClick={handleCloseMembersPopup} className="backlog-members-popup-close">
                <X size={20} />
              </button>
            </div>
            <div className="backlog-members-list">
              {projects
                .find((p) => p.id === selectedRow)
                ?.members.map((member, index) => (
                  <div
                    key={index}
                    className="backlog-member-item"
                    onClick={() =>
                      handleProfileNavigation({
                        memberId: member.id, // Explicitly pass memberId
                        name: member.name,
                        img: member.img,
                        role: member.role,
                      })
                    }
                  >
                    <img src={member.img} alt={member.name} className="backlog-member-avatar" />
                    <div className="backlog-member-text">
                      <span className="backlog-member-name">{member.name}</span>
                      <span className="backlog-member-role">{member.role}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirmation && (
        <div className="scrum-delete-modal" onClick={(e) => e.stopPropagation()}>
          <div className="scrum-delete-popup-container">
            <div className="scrum-delete-popup-divider" />
            <p className="scrum-delete-popup-message">Are you sure you want to delete {editingProject?.name}?</p>
            <div className="scrum-delete-popup-actions">
              <button className="scrum-yes-action-button" onClick={handleConfirmDelete}>
                Yes
              </button>
              <button className="scrum-no-action-button" onClick={handleClosePopup}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Epic Popup */}
      {showEpicPopup && (
        <CreateEpicPopup onClose={handleClosePopup} isEditMode={isEditMode} initialData={editingProject} onUpdate={handleUpdateProject} projects={projects} setProjects={setProjects} />
      )}
    </div>
  );
};

const formatTimeToAMPM = (time24) => {
  if (!time24) return "";
  const [hours24, minutes] = time24.split(":");
  const hours = parseInt(hours24);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
};

const DateTimePicker = ({ label, date, time, onDateChange, onTimeChange }) => {
  const [showTimePicker, setShowTimePicker] = useState(false);

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of ["00", "30"]) {
      const time24 = `${hour.toString().padStart(2, "0")}:${minute}`;
      timeOptions.push(time24);
    }
  }

  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  return (
    <div className="scrum-epic-date-group">
      <p className="scrum-epic-date-label">{label}</p>
      <div className="scrum-epic-date-row">
        <div className="scrum-epic-date-input-container">
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="scrum-epic-date-input"
            min={today} // Prevent selecting past dates
          />
          <Calendar className="scrum-epic-calendar-icon" size={16} />
        </div>
        <div style={{ position: "relative" }}>
          <button type="button" className="scrum-epic-time-button" onClick={() => setShowTimePicker(!showTimePicker)}>
            {time ? formatTimeToAMPM(time) : "Set Time"}
          </button>

          {showTimePicker && (
            <div className="scrum-epic-time-dropdown">
              {timeOptions.map((time24) => (
                <button
                  key={time24}
                  onClick={() => {
                    onTimeChange(time24);
                    setShowTimePicker(false);
                  }}
                  className="scrum-epic-time-dropdown-option"
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

const CreateEpicPopup = ({ onClose, isEditMode = false, initialData = null, onUpdate, projects, setProjects }) => {
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupProjectName, setPopupProjectName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const defaultMembers = [
    { img: img1, name: "Gain Bobis", role: "Developer" },
    { img: img2, name: "Anmark Benasalbas", role: "Designer" },
    { img: img3, name: "Anthony Prajes", role: "Developer" },
    { img: francoProfile, name: "Franco Bayani", role: "Product Owner" },
  ];

  const [epicFormData, setEpicFormData] = useState({
    id: initialData?.id || null,
    projectName: initialData?.name || "",
    key: initialData?.key || "",
    startDate: initialData?.startDate || "",
    startTime: initialData?.startTime || "",
    endDate: initialData?.endDate || "",
    endTime: initialData?.endTime || "",
    icon: initialData?.icon || null,
    members: initialData?.members || defaultMembers,
  });

  const validateForm = () => {
    // Existing validation logic
    if (!epicFormData.projectName.trim()) {
      setErrorMessage("Please enter a project name.");
      setShowErrorPopup(true);
      return false;
    }

    if (!epicFormData.startDate) {
      setErrorMessage("Please select a start date.");
      setShowErrorPopup(true);
      return false;
    }

    if (!epicFormData.startTime) {
      setErrorMessage("Please select a start time.");
      setShowErrorPopup(true);
      return false;
    }

    if (!epicFormData.endDate) {
      setErrorMessage("Please select an end date.");
      setShowErrorPopup(true);
      return false;
    }

    if (!epicFormData.endTime) {
      setErrorMessage("Please select an end time.");
      setShowErrorPopup(true);
      return false;
    }

    const startDateTime = new Date(`${epicFormData.startDate}T${epicFormData.startTime}`);
    const endDateTime = new Date(`${epicFormData.endDate}T${epicFormData.endTime}`);

    if (endDateTime <= startDateTime) {
      setErrorMessage("End date must be after start date.");
      setShowErrorPopup(true);
      return false;
    }

    return true;
  };

  const [isSubmitting, setIsSubmitting] = useState(false); // Track the form submission state

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent multiple submissions

    if (validateForm()) {
      setIsSubmitting(true); // Set the loading state to true while processing

      if (isEditMode && onUpdate) {
        // Update the project and handle success popup
        onUpdate(epicFormData)
          .then(() => {
            setPopupProjectName(epicFormData.projectName);
            setShowSuccessPopup(true);
          })
          .finally(() => {
            setIsSubmitting(false); // Reset the loading state
          });
      } else {
        // Create a new project
        handleCreateEpic()
          .then(() => {
            setPopupProjectName(epicFormData.projectName);
            setShowSuccessPopup(true);
          })
          .finally(() => {
            setIsSubmitting(false); // Reset the loading state
          });
      }
    }
  };

  const handleCreateEpic = async () => {
    const firestore = getFirestore();
    const storage = getStorage();
    const auth = getAuth();
    const uid = auth.currentUser.uid;
    const scrumId = doc(collection(firestore, "Scrum")).id;
    const timestamp = Date.now();

    try {
      let iconUrl = "";

      // Upload icon to Firebase Storage (if provided)
      if (epicFormData.icon) {
        const storagePath = `Scrum/${timestamp}/${epicFormData.projectName}/${epicFormData.icon.name}`;
        const storageRef = ref(storage, storagePath);

        await uploadBytes(storageRef, epicFormData.icon);
        iconUrl = await getDownloadURL(storageRef);
      } else {
        iconUrl =
          "https://firebasestorage.googleapis.com/v0/b/dyci-academix.appspot.com/o/wagdelete%2Facademixlogo.png?alt=media&token=8f83d11b-3604-41e5-9a46-d1df0d44aed5";
      }

      // Prepare new epic data
      const newEpicData = {
        id: scrumId,
        projectName: epicFormData.projectName,
        key: gen(epicFormData.projectName),
        scrumMaster: uid,
        icon: iconUrl,
        startDate: epicFormData.startDate,
        startTime: epicFormData.startTime,
        endDate: epicFormData.endDate,
        endTime: epicFormData.endTime,
        isDone: false,
        bookMark: false,
        startSprint: true,
        createdAt: serverTimestamp(),
      };

      // Save new epic data to Firestore
      await setDoc(doc(firestore, `Scrum/${scrumId}`), newEpicData);

      // Save scrum master data to Firestore
      const memberData = {
        memberUid: uid,
        role: "ScrumMaster",
        access: true,
      };
      await setDoc(doc(firestore, `Scrum/${scrumId}/member/${uid}`), memberData);

      // Add Scrum reference under user's document
      const userScrumPath = `users/${uid}/Scrum/${scrumId}`;
      const scrumNotifRef = doc(collection(firestore, `Scrum/${scrumId}/scrumNotif`));
      const notifId = scrumNotifRef.id;

      const userScrumData = {
        scrumId,
        createdAt: serverTimestamp(),
        notifId,
      };
      await setDoc(doc(firestore, userScrumPath), userScrumData);

      // Create Scrum notification
      const scrumNotifData = {
        context: scrumId,
        id: notifId,
        receiver: [uid],
        timeAgo: timestamp,
        type: "deadline",
        unread: true,
      };
      await setDoc(scrumNotifRef, scrumNotifData);

      // Update local state
      setProjects((prevProjects) => [...prevProjects, newEpicData]);

      // Show success popup
      setPopupProjectName(epicFormData.projectName);
      setShowSuccessPopup(true);

      // Reset form data
      setEpicFormData({
        id: null,
        projectName: "",
        key: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        icon: null,
        members: defaultMembers,
      });

      console.log("Epic created successfully!");
    } catch (error) {
      console.error("Error during epic creation process:", error);
      // Show error popup
      setErrorMessage("An error occurred. Unable to create the project. Please try again.");
      setShowErrorPopup(true);
    }
  };

  const handleInputChange = (e) => {
    e.stopPropagation();
    const newProjectName = e.target.value;
    setEpicFormData((prev) => ({
      ...prev,
      projectName: newProjectName,
      key: gen(newProjectName),
    }));
  };

  const [selectedImage, setSelectedImage] = useState(initialData?.icon || null);
  let iconUrl = selectedImage; // Default to the selected image if no new image is uploaded
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setEpicFormData((prev) => ({
        ...prev,
        icon: file,
      }));
    }
  };

  // Success Popup Component
  const SuccessPopup = () => (
    <div className="scrum-epic-popup-overlay">
      <div className="scrum-epic-popup-modal">
        <img src={successPopup} alt="Success" className="scrum-epic-popup-icon" />
        <p className="scrum-epic-popup-message">{isEditMode ? `${popupProjectName} has been successfully updated!` : `${popupProjectName} has been successfully created!`}</p>
        <button
          className="scrum-epic-popup-button"
          onClick={() => {
            setShowSuccessPopup(false);
            onClose();
            window.location.reload();
          }}
        >
          OK
        </button>
      </div>
    </div>
  );

  // Error Popup Component
  const ErrorPopup = () => (
    <div className="scrum-epic-popup-overlay">
      <div className="scrum-epic-popup-modal">
        <img src={errorPopup} alt="Error" className="scrum-epic-popup-icon" />
        <p className="scrum-epic-popup-error-message">{errorMessage}</p>
        <button className="scrum-epic-popup-error-button" onClick={() => setShowErrorPopup(false)}>
          OK
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    // Set start date to today if it's not already set
    if (!epicFormData.startDate) {
      setEpicFormData({
        ...epicFormData,
        startDate: new Date().toISOString().split("T")[0], // Set today's date (yyyy-mm-dd)
      });
    }
  }, [epicFormData]);
  return (
    <>
      <div className="scrum-epic-modal" onClick={(e) => e.stopPropagation()}>
        <div className="scrum-epic-popup-container">
          <h2 className="scrum-epic-popup-title">{isEditMode ? "Edit Epic" : "Create Epic"}</h2>
          <div className="scrum-epic-popup-divider" />
          <form onSubmit={handleFormSubmit} className="scrum-epic-popup-content">
            <div className="scrum-epic-upload-section">
              <div className="scrum-epic-upload-area">
                <div className="scrum-epic-image-container">
                  {selectedImage ? (
                    <img src={selectedImage} alt="project icon" className="scrum-epic-project-image" />
                  ) : initialData?.icon ? (
                    <img src={initialData.icon} alt="project icon" className="scrum-epic-project-image" />
                  ) : (
                    <div className="scrum-epic-project-image" style={{ background: "#F1F9FA" }} />
                  )}
                </div>
                <div className="scrum-epic-upload-content">
                  <p className="scrum-epic-upload-text">{selectedImage || initialData?.icon ? "Current Image" : "No File Selected"}</p>
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} id="file-upload" />
                  <label htmlFor="file-upload" className="scrum-epic-upload-button">
                    Upload File
                  </label>
                </div>
              </div>
            </div>
            <div className="scrum-epic-form-section">
              <input
                type="text"
                placeholder="Enter Project Name"
                className="scrum-epic-input"
                value={epicFormData.projectName}
                onChange={handleInputChange}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />

              <DateTimePicker
                label="Start Date"
                date={epicFormData.startDate}
                time={epicFormData.startTime}
                onDateChange={(date) => setEpicFormData({ ...epicFormData, startDate: date })}
                onTimeChange={(time) => setEpicFormData({ ...epicFormData, startTime: time })}
              />

              <DateTimePicker
                label="End Date"
                date={epicFormData.endDate}
                time={epicFormData.endTime}
                onDateChange={(date) => {
                  // Ensure the end date is not before the start date
                  if (new Date(date) >= new Date(epicFormData.startDate)) {
                    setEpicFormData({ ...epicFormData, endDate: date });
                  } else {
                    console.error("End Date cannot be before Start Date");
                  }
                }}
                onTimeChange={(time) => setEpicFormData({ ...epicFormData, endTime: time })}
              />
            </div>
          </form>
          <div className="scrum-epic-popup-actions">
            <button className="scrum-epic-action-button" onClick={handleFormSubmit}>
              {isEditMode ? "Save Changes" : "Create"}
            </button>
            <button className="scrum-epic-action-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
      {/* Success and Error Popups */}
      {showSuccessPopup && <SuccessPopup />}
      {showErrorPopup && <ErrorPopup />}
    </>
  );
};

export default ScrumProjects;
