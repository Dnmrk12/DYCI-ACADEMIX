import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Users, Pencil, Calendar, MoreHorizontal, Clock, Plus, ChevronDown, Copy, X, Link, ArrowLeft, UserCircle2, Search, Trash2, Pin } from "lucide-react";
import searchIcon from "./iconshomepage/magnifyingglass.png";
import days from "./iconshomepage/daysRemaining.png";
import story from "./iconshomepage/researchicon.png";
import task from "./iconshomepage/ppticon.png";
import subtask from "./iconshomepage/subtaskIcon.png";
import bug from "./iconshomepage/bugfixicon.png";
import comment from "./iconshomepage/issueComment.png";
import effort from "./iconshomepage/backlogsEffort.png";
import points from "./iconshomepage/backlogsPoints.png";
import low from "./iconshomepage/backlogsLow.png";
import medium from "./iconshomepage/backlogsMedium.png";
import high from "./iconshomepage/backlogsHigh.png";
import inputSubtaskIcon from "./iconshomepage/versionupdate.png";
import lightBulb from "./iconshomepage/lightBulb.png";
import successPopup from "./iconshomepage/successPopup.png";
import errorPopup from "./iconshomepage/errorPopup.png";
import RemoveMemberIcon from './iconshomepage/RemoveMember.png'; 
import "./activesprint.css";
import {  getFirestore,  collection, limit, addDoc,doc,getDocs,getDoc, increment, deleteDoc, setDoc, query,orderBy,onSnapshot,where,updateDoc, arrayRemove,arrayUnion,serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { db } from "./firebase/firebaseConfig";

const ActiveSprint = () => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMemberInviteModal, setShowMemberInviteModal] = useState(false);
  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [onlyMyIssueChecked, setOnlyMyIssueChecked] = useState(false);
  const [typeDropdownVisible, setTypeDropdownVisible] = useState(false);
  const [openDropdownCardId, setOpenDropdownCardId] = useState(null);
  const [typeFilterLabel, setTypeFilterLabel] = useState("Type");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [pinnedCards, setPinnedCards] = useState({});
  const [selectedRole, setSelectedRole] = useState("Select Role");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSprintIssue, setIsSprintIssue] = useState(false); // Define the isSprintIssue state
  const [sprintIssues, setSprintIssues] = useState([]); // Define the sprint issues state
  const [backlogIssues, setBacklogIssues] = useState([]); // Define the backlog issues state
  const roles = ["Team Member"];

  const [selectedStatus, setSelectedStatus] = useState("To-do");
  const [popupIssueStatus, setPopupIssueStatus] = useState("To-do");
  const statusOptions = ["To-do", "Blocked", "In Progress", "In Review", "In Test", "Done"];
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
const [showErrorPopup, setShowErrorPopup] = useState(false);
const [popupMessage, setPopupMessage] = useState("");
  const [checkedTypes, setCheckedTypes] = useState({
    story: false,
    task: false,
    bug: false,
  });

  // New state for presentation popup
  
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [subtasksCount, setSubtasksCount] = useState("0");
  const [pointsCount, setPointsCount] = useState("0");
  const [effortCount, setEffortCount] = useState("0");
  const [commentCount, setCommentCount] = useState("0");
  const [priority, setPriority] = useState(selectedIssue?.priority || "low");
  const [showPopupPriorityDropdown, setPopupShowPriorityDropdown] = useState(false);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [assigneeSearchTerm, setAssigneeSearchTerm] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState({
    name: selectedIssue?.assignee?.name || "Unassigned",
    img: selectedIssue?.assignee?.picture || "",
  });

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortOptions = ["Newest First", "Oldest First"];
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [issueComments, setIssueComments] = useState({});
  const [showCommentDeleteConfirmation, setShowCommentDeleteConfirmation] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");
  const [subtaskToDelete, setSubtaskToDelete] = useState(null);
  const [showSubtaskDeleteConfirmation, setShowSubtaskDeleteConfirmation] = useState(false);

  const [isSprintCompletionPopupOpen, setIsSprintCompletionPopupOpen] = useState(false);
  const [remainingIssues, setRemainingIssues] = useState([]);

  const [columnTimestamps, setColumnTimestamps] = useState({});

  const [subtasks, setSubtasks] = useState([]);
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");

  // Create a ref for the filter dropdown
  const filterDropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);
  const cardDropdownsRef = useRef({});

  const storedProjectDetails = JSON.parse(localStorage.getItem('selectedProject')) || {};

  const projectName = location.state?.projectName || storedProjectDetails.projectName || "No Project Selected";
  const scrumMaster = location.state?.scrumMaster || storedProjectDetails.scrumMaster || "";
  const masterIcon = location.state?.masterIcon || storedProjectDetails.masterIcon || "";
  const key = location.state?.key || storedProjectDetails.key || "";
  const startDate = location.state?.startDate || storedProjectDetails.startDate || "";
  const startTime = location.state?.startTime || storedProjectDetails.startTime || "";
  const endDate = location.state?.endDate || storedProjectDetails.endDate || "";
  const endTime = location.state?.endTime || storedProjectDetails.endTime || "";
  const icon = location.state?.icon || storedProjectDetails.icon || "";
  const scrumId =  storedProjectDetails.id||"";
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(selectedIssue?.title || "");
  // Add useEffect to handle clicks outside the dropdown
  const [allow, setAllow] = useState(false);

  const [members, setMembers] = useState(() => {
    const storedProject = JSON.parse(localStorage.getItem('selectedProject')) || {};
    return storedProject.members || [];
  });
  const [users, setUsers] = useState(
    members.map((member) => ({
      id: member.memberId,
      name: member.name,
      avatar: member.img,
    }))
  );

  const handleProfileNavigation = (member) => {
    navigate("/ProfileDetails", { 
      state: {
        memberId: member.memberId,
        name: `${member.firstName} ${member.lastName}`,
        profileImage: member.userPicture,
        edit: uid === member.memberId ? false : true, // If uid matches memberId, set edit to false, otherwise true
      },
    });

  };


  const [showRemovalSuccessPopup, setShowRemovalSuccessPopup] = useState(false);
  const [showRemovalErrorPopup, setShowRemovalErrorPopup] = useState(false);
  const [removalErrorMessage, setRemovalErrorMessage] = useState("");
  const [removalSuccessMessage, setRemovalSuccessMessage] = useState("");
  
  
  
  
  const handleConfirmRemoveSprint = async () => {
      if (selectedActSprintMember) {
        try {
          const { memberId } = selectedActSprintMember;
          const uid = auth.currentUser.uid; // Get current user's UID
    
          // 1. Delete `users/${memberId}/Scrum/${scrumId}`
          const userScrumDocRef = doc(db, `users/${memberId}/Scrum/${scrumId}`);
          await deleteDoc(userScrumDocRef);
    
          // 2. Loop through `Scrum/${scrumId}/backlog` and remove `assignee.assignId` matching `uid`
          const backlogCollectionRef = collection(db, `Scrum/${scrumId}/backlog`);
          const backlogDocs = await getDocs(backlogCollectionRef);
    
          backlogDocs.forEach(async (docSnapshot) => {
            const backlogData = docSnapshot.data();
            // Check if assignee.assignId matches the memberId (or UID in this case)
            if (backlogData.assignee && backlogData.assignee.assignId === memberId) {
              const backlogDocRef = doc(db, `Scrum/${scrumId}/backlog/${docSnapshot.id}`);
              // Nullify all the values inside assignee
              await updateDoc(backlogDocRef, {
                assignee: null, // Set the entire assignee field to null
              });
            }
          });
    
          // 3. Delete `Scrum/${scrumId}/member/${memberId}`
          const scrumMemberDocRef = doc(db, `Scrum/${scrumId}/member/${memberId}`);
          await deleteDoc(scrumMemberDocRef);
    
          // Remove member locally from the state and update localStorage
          handleRemoveMember(selectedActSprintMember);
    
          setRemovalSuccessMessage(`${selectedActSprintMember?.name} successfully removed from the team.`);
          setShowRemovalSuccessPopup(true);
          console.log(`Member ${memberId} successfully removed.`);
          setShowRemoveActSprintPopup(false); // Hide the popup
        } catch (error) {
          setRemovalErrorMessage("Failed to remove member from the team. Please try again.");
          setShowRemovalErrorPopup(true);
          console.error("Error removing member:", error);
        }
      }
    };
  

  
  const [hoveredActSprintMember, setHoveredActSprintMember] = useState(null);
  const [showRemoveActSprintPopup, setShowRemoveActSprintPopup] = useState(false);
  const [selectedActSprintMember, setSelectedActSprintMember] = useState(null);
  
  const handleRemoveMemberClick = (member) => {
    setSelectedActSprintMember(member);
    setShowRemoveActSprintPopup(true); // Show confirmation popup
  };
  

  const handleRemoveMember = (memberToRemove) => {
    setMembers((prevMembers) => {
      const updatedMembers = prevMembers.filter((member) => member !== memberToRemove);
      // Update localStorage with the new list of members
      const storedProject = JSON.parse(localStorage.getItem('selectedProject')) || {};
      storedProject.members = updatedMembers;
      localStorage.setItem('selectedProject', JSON.stringify(storedProject));
      return updatedMembers;
    });
  };
  
  const handleConfirmRemove = async () => {
    if (selectedActSprintMember) {
      try {
        const { memberId } = selectedActSprintMember;
        const uid = auth.currentUser.uid; // Get current user's UID
  
        // 1. Delete `users/${memberId}/Scrum/${scrumId}`
        const userScrumDocRef = doc(db, `users/${memberId}/Scrum/${scrumId}`);
        await deleteDoc(userScrumDocRef);
  
        // 2. Loop through `Scrum/${scrumId}/backlog` and remove `assignee.assignId` matching `uid`
        const backlogCollectionRef = collection(db, `Scrum/${scrumId}/backlog`);
        const backlogDocs = await getDocs(backlogCollectionRef);
  
        backlogDocs.forEach(async (docSnapshot) => {
          const backlogData = docSnapshot.data();
          // Check if assignee.assignId matches the memberId (or UID in this case)
          if (backlogData.assignee && backlogData.assignee.assignId === memberId) {
            const backlogDocRef = doc(db, `Scrum/${scrumId}/backlog/${docSnapshot.id}`);
            // Nullify all the values inside assignee
            await updateDoc(backlogDocRef, {
              assignee: null, // Set the entire assignee field to null
            });
          }
        });
  
        // 3. Delete `Scrum/${scrumId}/member/${memberId}`
        const scrumMemberDocRef = doc(db, `Scrum/${scrumId}/member/${memberId}`);
        await deleteDoc(scrumMemberDocRef);
  
        // Remove member locally from the state and update localStorage
        handleRemoveMember(selectedActSprintMember);
  
        console.log(`Member ${memberId} successfully removed.`);
        setShowRemoveActSprintPopup(false); // Hide the popup
      } catch (error) {
        console.error("Error removing member:", error);
      }
    }
  };
  
  
  const handleCancelRemove = () => {
    setShowRemoveActSprintPopup(false); // Hide popup
  };
  


  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle filter dropdown
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setFilterDropdownVisible(false);
      }

      // Handle type dropdown
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setTypeDropdownVisible(false);
      }

      // Handle card dropdowns using the new logic
      const isOutsideAllCardDropdowns = Object.values(cardDropdownsRef.current).every((ref) => ref.current && !ref.current.contains(event.target));

      if (isOutsideAllCardDropdowns) {
        setOpenDropdownCardId(null);
      }

      // Close all dropdowns (generic fallback)
      if (!filterDropdownRef.current?.contains(event.target) && !typeDropdownRef.current?.contains(event.target) && isOutsideAllCardDropdowns) {
        setFilterDropdownVisible(false);
        setTypeDropdownVisible(false);
        setOpenDropdownCardId(null);
      }

      if (isTypeDropdownOpen) {
        const typeIconElement = event.target.closest('.active-sprint-presentation-popup__tag-group');
        if (!typeIconElement) {
          setIsTypeDropdownOpen(false);
        }
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterDropdownVisible, typeDropdownVisible, openDropdownCardId, isTypeDropdownOpen]);

  const [userPicture, setUserPicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (uid) {
      const fetchUserPicture = async () => {
        try {
          const userRef = doc(db, 'users', uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserPicture(data.userPicture); // Assuming the field is 'userPicture'
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user picture:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserPicture();
    }
  }, [uid, db]);
  // Fetch the issue content
  const [cards, setCards] = useState(() => {
    const sprintIssues = location.state?.sprintIssues || 
                         JSON.parse(localStorage.getItem('sprintIssues')) || 
                         [];
    
    return sprintIssues.map((issue) => ({
      issueStatus: issue.issueStatus,
      id: issue.id,
      title: issue.title,
      type: issue.type,
      description: issue.description,
      icon: issue.icon,
      code: issue.code,
      priority: issue.priority,
      status: issue.status,
      subtasks: issue.subtasks || [],
      stats: issue.stats || {
        comments: 0,
        subtasks: 0,
        points: 0,
        effort: 0,
      },
      assignee: issue.assignee || null,
      isPinned: false,
    }));
  });

  const handleStatusSelect = async (status) => {
    if (selectedIssue) {
      // Update the status of the specific card in the local state
      const updatedCards = cards.map((card) =>
        card.id === selectedIssue.id ? { ...card, status: status } : card
      );
    
      // Update the cards state
      setCards(updatedCards);
    
      // Update the popup issue status
      setPopupIssueStatus(status);
    
      // Update the selected issue status in local state
      setSelectedIssue((prevIssue) => ({
        ...prevIssue,
        status: status,
      }));
    
      // Update localStorage with the new sprintIssues data
      const updatedSprintIssues = updatedCards.map((issue) =>
        issue.id === selectedIssue.id ? { ...issue, status: status } : issue
      );
      localStorage.setItem('sprintIssues', JSON.stringify(updatedSprintIssues));
      
      try {
        // Get the Scrum document reference and the project details
        const scrumDocRef = doc(db, `Scrum/${scrumId}`);
        const scrumDoc = await getDoc(scrumDocRef);
        
        if (scrumDoc.exists()) {
          const scrumData = scrumDoc.data();
          const projectName = scrumData.projectName; // Get the project name
  
          // Firestore reference for the selected issue in the backlog
          const issueRef = doc(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}`);
          const issueDoc = await getDoc(issueRef);
  
          if (issueDoc.exists()) {
            const issueData = issueDoc.data();
            const title = issueData.title || 'Unnamed Issue'; // Get the issue title (fallback to 'Unnamed Issue')
            const type = issueData.type || 'Unknown'; // Get the issue type (fallback to 'Unknown')
  
            // Get Scrum Master and assignee details
            const scrumMasterId = scrumData.scrumMaster;
            const assigneeId =  issueData.assignee.assignId;
  
            // Format the current date and time as MM/DD/YYYY hh:mm AM/PM
            const currentDateTime = new Date();
            const dateDone = currentDateTime.toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }).replace(',', ''); // Removes the comma after the day
  
            // Prepare data to update in Firestore for the issue status and dateDone
            const updateData = {
              status: status,
              dateDone: dateDone,
            };
  
            // Update Firestore with the data for the issue
            await updateDoc(issueRef, updateData);
            console.log(`Issue ${selectedIssue.id} status updated to ${status} in Firestore.`);
  
            // Create log entries for the Scrum Master and assignee
            const logRefForScrumMaster = doc(db, 'users', scrumMasterId, 'logReport', Date.now().toString());
            await setDoc(logRefForScrumMaster, {
              status: status,
              dateTime: dateDone,  // Current date and time in the requested format
              projectName: projectName,  // Project name from Scrum document
              issue: title,  // Issue title
              type: type,  // Issue type (e.g., story, task, bug)
              admin: scrumMasterId,  // Scrum Master ID
            
            });
  
            console.log('Log report entry created for Scrum Master successfully');
  
            // Log entry for the assignee if available
            if (assigneeId) {
              const logRefForAssignee = doc(db, 'users', assigneeId, 'logReport', Date.now().toString());
              await setDoc(logRefForAssignee, {
                status: status,
                dateTime: dateDone,  // Current date and time in the requested format
                projectName: projectName,  // Project name from Scrum document
                issue: title,  // Issue title
                type: type,  // Issue type (e.g., story, task, bug)
                admin: scrumMasterId,  // Assignee ID
                
              });
  
              console.log('Log report entry created for assignee successfully');
            }
          } else {
            console.error('Issue document not found in Firestore:', selectedIssue.id);
          }
        } else {
          console.error('Scrum document not found in Firestore:', scrumId);
        }
      } catch (error) {
        console.error("Error updating issue status in Firestore:", error);
        setShowErrorPopup(true);
        setPopupMessage("Failed to update the issue status. Please try again.");
      }
    }
    
    // Close the status dropdown
    setIsStatusDropdownOpen(false);
  };
const [isPinned, setIsPinned] = useState(false);



useEffect(() => {
  const fetchPinStatus = async () => {
    if (!selectedIssue?.id) return;

    const issueRef = doc(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}`);
    const issueDoc = await getDoc(issueRef);

    if (issueDoc.exists()) {
      const pinnedUsers = issueDoc.data()?.isPinned || [];
      setIsPinned(pinnedUsers.includes(uid));
    }
  };

  fetchPinStatus();
}, [selectedIssue?.id, scrumId]);


const handlePinCard = async () => {
  if (!selectedIssue?.id) return;

  try {
    const issueRef = doc(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}`);
    const issueDoc = await getDoc(issueRef);

    if (issueDoc.exists()) {
      const pinnedUsers = issueDoc.data()?.isPinned || [];
      const isAlreadyPinned = pinnedUsers.includes(uid);

      // Update Firestore
      await updateDoc(issueRef, {
        isPinned: isAlreadyPinned
          ? arrayRemove(uid) // Remove UID
          : arrayUnion(uid), // Add UID
      });

      // Update local state
      setIsPinned(!isAlreadyPinned);
    }
  } catch (error) {
    console.error("Error updating pin status:", error);
  }
};


  // Modify the filteredCards to consider pinned status
  const filteredCards = cards.filter((card) => {
    // Ensure the issueStatus is 'sprint'
    const matchesIssueStatus = card.issueStatus === "sprint";
    
    // Previous filtering logic
    const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()); // Assuming search is based on card.id
    const matchesType =
      !Object.values(checkedTypes).some(Boolean) || // If no types selected, show all
      checkedTypes[card.type.toLowerCase()];
    
    // Check if the card is assigned to the current user
    const matchesMyIssue = !onlyMyIssueChecked || card.assignee?.assignId === uid; // Match if onlyMyIssueChecked is true and the user is the assignee
    
    return matchesIssueStatus && matchesSearch && matchesType && matchesMyIssue;
  });
  
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTypeCheckboxChange = (e) => {
    const { id, checked } = e.target;
    setCheckedTypes((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const toggleDropdown = (cardId, event) => {
    // Prevent event from propagating to parent elements
    event.stopPropagation();

    // Toggle the dropdown
    setOpenDropdownCardId((prevId) => (prevId === cardId ? null : cardId));
  };

  const handleDeleteCard = async (card, event) => {
    // Stop event propagation to prevent dropdown from closing
    event.stopPropagation();
  
    // Check the user's access before showing delete confirmation
    const memberRef = doc(db, `Scrum/${scrumId}/member/${uid}`);
    
    try {
      const docSnap = await getDoc(memberRef);
  
      if (docSnap.exists() && docSnap.data().access === true) {
        // User has access, proceed with showing the delete confirmation
        setItemToDelete(card);
        setShowDeleteConfirmation(true);
      } else {
        console.log('Access denied or member not found.');
        // Optionally, show a message to the user if access is denied
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
    }
  
    // Close the dropdown
    setOpenDropdownCardId(null);
  };
  

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
   
        if (!scrumId) {
          console.error("scrumId is missing");
          return;
        }

        // Reference the Firestore document to delete
        const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${itemToDelete.id}`);

        // Delete the document from Firestore
        await deleteDoc(issueDocRef);
        console.log("Document successfully deleted from Firestore");

        // Remove the card from the cards state
        const updatedCards = cards.filter((card) => card.id !== itemToDelete.id);
        setCards(updatedCards);

        // Close the delete confirmation popup
        setShowDeleteConfirmation(false);
        setItemToDelete(null);
      } catch (error) {
        console.error("Error deleting document from Firestore:", error);
      }
    }
  };

  const handleClosePopup = () => {
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  };

  const toggleFilterDropdown = () => {
    setFilterDropdownVisible(!filterDropdownVisible);
  };

  const handleCheckboxChange = (e) => {
    setOnlyMyIssueChecked(e.target.checked);
  };

  const toggleTypeDropdown = () => {
    setTypeDropdownVisible(!typeDropdownVisible);
  };

  // Function to calculate time remaining
  const calculateTimeRemaining = () => {
    if (!endDate || !endTime) return "";

    const endDateTime = new Date(`${endDate}T${endTime}`);
    const now = new Date();

    if (endDateTime <= now) {
      return "Sprint Ended";
    }

    const difference = endDateTime - now;
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    let remainingTime = "";
    if (days > 0) remainingTime += `${days} day${days > 1 ? "s" : ""} `;
    if (hours > 0) remainingTime += `${hours} hour${hours > 1 ? "s" : ""} `;
    remainingTime += `${minutes} minute${minutes !== 1 ? "s" : ""} remaining`;

    return remainingTime;
  };

  // Update time remaining every minute
  useEffect(() => {
    const updateTimeRemainingInterval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 60000); // Update every minute

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Cleanup interval on component unmount
    return () => clearInterval(updateTimeRemainingInterval);
  }, [endDate, endTime]);

  const handleCopy = () => {
    // Implement copy functionality
    navigator.clipboard.writeText("TEAM-123-456");
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  // Function to handle card click and open presentation popup
  const handleSprintItemClick = async (item) => {
    if (!item) {
      console.error("No item selected");
      return;
    }
  
    const uid = getAuth().currentUser?.uid;
    if (!uid) {
      console.error("User not authenticated");
      return;
    }
  
    try {
      // Fetch the user picture
      const fetchUserPicture = async () => {
        try {
          const userRef = doc(db, 'users', uid);
          const docSnap = await getDoc(userRef);
  
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserPicture(data.userPicture); // Assuming the field is 'userPicture'
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user picture:', error);
        } finally {
          setLoading(false);
        }
      };
  
      // Fetch user access data
      const accessDoc = await getDoc(doc(getFirestore(), `Scrum/${scrumId}/member/${uid}`));
      const hasAccess = accessDoc.exists() && accessDoc.data()?.access;
  
      if (hasAccess === false) {
        setIsButtonDisabled(true); // Disable the button if access is false
      } else {
        setIsButtonDisabled(false); // Enable the button if access is true
      }
  
      if (hasAccess === true) {
        // User has access, fetch the user picture and open the popup
        await fetchUserPicture();
        setIsPopupOpen(true);
        setPopupData(item);
        await fetchIssueComments();
      } else {
        // If no direct access, check if backlog item exists
        const backlogDoc = await getDoc(doc(getFirestore(), `Scrum/${scrumId}/backlog/${item.id}`));
        if (backlogDoc.exists()) {
          await fetchUserPicture();
          setIsPopupOpen(true);
          setPopupData(item);
          await fetchIssueComments();
        } else {
          console.warn("Backlog item does not exist.");
        }
      }
    } catch (error) {
      console.error("Error handling sprint item click:", error);
      setIsPopupOpen(false); // Ensure popup is closed on error
      setIsButtonDisabled(true); // Disable the button on error
    }
  };
  
  
  // Helper function to set popup data
  const setPopupData = (item) => {
    setSelectedIssue(item);
    setPopupIssueStatus(item.status);
    setSubtasksCount(item.stats.subtasks.toString());
    setPointsCount(item.stats.points.toString());
    setEffortCount(item.stats.effort.toString());
    setCommentCount(item.stats.comments.toString());
  
    setComments(item.comments || {});
    setSubtasks(item.subtasks || []);
    setPriority(item.priority || "low");
    setDescription(item.description || "No description provided");
  };
  
  
  useEffect(() => {
    let unsubscribe;
    if (selectedIssue) {
      const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}`);
      unsubscribe = onSnapshot(issueDocRef, (doc) => {
        if (doc.exists()) {
          const latestData = doc.data();
          setDescription(latestData.description);
          
          // Also update the issue in the sprint list
          setSprintIssues(prevIssues => 
            prevIssues.map(issue => 
              issue.id === selectedIssue.id 
                ? { ...issue, description: latestData.description } 
                : issue
            )
          );
        }
      });
    }

    // Cleanup subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedIssue, scrumId]);
  
  // In a shared utility or context
const updateIssueInFirestore = async (scrumId, issueId, updateData) => {
  try {
    const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`);
    await updateDoc(issueDocRef, updateData);
    console.log("Issue updated successfully in Firestore.");
  } catch (error) {
    console.error("Error updating issue in Firestore:", error);
  }
};

// In activesprint.js, add a real-time listener for issue updates
useEffect(() => {
  if (!scrumId) return;

  const sprintIssuesRef = collection(db, `Scrum/${scrumId}/backlog`);
  const q = query(sprintIssuesRef, where('status', 'in', ['To-do', 'Blocked', 'In Progress', 'In Review', 'In Test', 'Done']));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const updatedCards = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Update cards state with the latest Firestore data
    setCards(updatedCards);
    
    // Optionally update localStorage
    localStorage.setItem('sprintIssues', JSON.stringify(updatedCards));
  });

  return () => unsubscribe();
}, [scrumId]);
  
  
  const fetchIssueComments = async () => {
    if (!scrumId) {
      console.error("No scrumId found");
      return;
    }
  
    if (!selectedIssue) {
      console.error("No issue selected");
      return;
    }
  
    if (!selectedIssue.id) {
      console.error("Selected issue has no ID");
      return;
    }
  
    try {
      const commentsRef = collection(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}/comments`);
      
      // Use real-time listener for changes in comments
      const unsubscribe = onSnapshot(commentsRef, async (querySnapshot) => {
        const commentsPromises = querySnapshot.docs.map(async (docSnap) => {
          const commentData = docSnap.data();
  
          // Retrieve author details using authorId
          const authorRef = doc(db, `users/${commentData.authorId}`);
          const authorSnap = await getDoc(authorRef);
  
          const authorDetails = authorSnap.exists()
            ? {
                firstName: authorSnap.data().firstName || "",
                lastName: authorSnap.data().lastName || "",
                avatar: authorSnap.data().userPicture || "",
              }
            : { firstName: "", lastName: "", avatar: "" };
  
          // Fetch replies for this comment
          const repliesRef = collection(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}/comments/${docSnap.id}/replies`);
          const repliesSnapshot = await getDocs(repliesRef);
          const replies = repliesSnapshot.docs.map((replyDoc) => replyDoc.data());
  
          return {
            id: docSnap.id,
            ...commentData,
            author: `${authorDetails.firstName} ${authorDetails.lastName}`.trim(),
            avatar: authorDetails.avatar,
            timestamp: formatTimestamp(commentData.dateCreated?.toDate()),
            replies: replies || [],
          };
        });
  
        const comments = await Promise.all(commentsPromises);
  
        // Sort comments by commentCount in descending order
        const sortedComments = comments.sort((a, b) => b.commentCount - a.commentCount);
  
        // Update comments in local state
        setComments((prevComments) => ({
          ...prevComments,
          [selectedIssue.id]: sortedComments,
        }));
  
        // Fetch the issue's current stats
        const issueRef = doc(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}`);
        const issueSnap = await getDoc(issueRef);
  
        if (issueSnap.exists()) {
          const issueData = issueSnap.data();
          setCommentCount(issueData.stats.comments || 0);
        }
      });
  
      // Cleanup function to unsubscribe from the listener when component unmounts or issue changes
      return () => unsubscribe();
  
    } catch (error) {
      console.error("Error fetching issue comments:", error);
      setComments({});
      setCommentCount("0");
    }
  };
  

  // Description Funtion
  const handleDescriptionClick = () => {
    setIsEditingDescription(true);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleDescriptionKeyPress = async (e) => {
    if (e.key === "Enter") {
      // Ensure the description is not empty and trim whitespace
      const validDescription = description.trim() || "No description provided"; // Fallback to a default message

      // Update local state with the new description
      setDescription(validDescription);

      if (selectedIssue) {
        // Create updated issue with new description value
        const updatedIssue = {
          ...selectedIssue,
          description: validDescription, // Update the description field
        };

        // Update the local state with the new description
        setSelectedIssue(updatedIssue);

        // Update the corresponding list (sprint or backlog)
        if (isSprintIssue) {
          setSprintIssues((prevSprintIssues) => prevSprintIssues.map((issue) => (issue.id === selectedIssue.id ? updatedIssue : issue)));
        } else {
          setBacklogIssues((prevBacklogIssues) => prevBacklogIssues.map((issue) => (issue.id === selectedIssue.id ? updatedIssue : issue)));
        }

        // Get the scrumId and issueId for Firestore update
   
        const issueId = selectedIssue.id; // Get the selected issue's ID
        const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`); // Reference to the issue document in Firestore

        try {
          // Update the description in the Firestore document
          await updateDoc(issueDocRef, {
            description: validDescription,
          });
          console.log("Description updated successfully in Firestore!");
        } catch (error) {
          console.error("Error updating description in Firestore:", error);
        }
      }

      // Exit edit mode after saving the description
      setIsEditingDescription(false);
    }
  };
  const handleTitleClick = () => {
    if (!isButtonDisabled) {
      setEditedTitle(selectedIssue.title);
      setIsEditingTitle(true);
    }
  };
    
    const handleTitleChange = (e) => {
      setEditedTitle(e.target.value);
    };
    
    const handleTitleKeyPress = async (e) => {
      if (e.key === "Enter") {
        // Ensure the title is not empty and trim whitespace
        const validTitle = editedTitle.trim() || selectedIssue.title;
    
        // Update local state with the new title
        setEditedTitle(validTitle);
    
        if (selectedIssue) {
          // Create updated issue with new title value
          const updatedIssue = {
            ...selectedIssue,
            title: validTitle, // Update the title field
          };
    
          // Update the selected issue in local state
          setSelectedIssue(updatedIssue);
    
          // Update the cards state locally
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === selectedIssue.id ? { ...card, title: validTitle } : card
            )
          );
    
          // Get the sprintIssues from location state or local storage
          const updatedSprintIssues = location.state?.sprintIssues || 
                                       JSON.parse(localStorage.getItem('sprintIssues')) || 
                                       [];
    
          // Update the sprintIssues in the local state
          const newSprintIssues = updatedSprintIssues.map((issue) =>
            issue.id === selectedIssue.id ? updatedIssue : issue
          );
    
          // Save the updated sprintIssues to localStorage
          localStorage.setItem('sprintIssues', JSON.stringify(newSprintIssues));
    
          // Get the scrumId and issueId for Firestore update
          const issueId = selectedIssue.id; // Get the selected issue's ID
          const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`); // Reference to the issue document in Firestore
    
          try {
            // Update the title in the Firestore document
            await updateDoc(issueDocRef, {
              title: validTitle,
            });
            console.log("Title updated successfully in Firestore!");
          } catch (error) {
            console.error("Error updating title in Firestore:", error);
          }
        }
    
        // Exit edit mode after saving the title
        setIsEditingTitle(false);
      }
    };
    
    
  
  
    const handleTypeIconClick = (event) => {
      event.stopPropagation(); // Prevent event from propagating
      setIsTypeDropdownOpen(!isTypeDropdownOpen);
    };
    
    const handleTypeChange = async (newType) => {
      if (selectedIssue) {
        // Get the icon for the selected type
        const newIcon = getIconForType(newType);
    
        // Update local state with the new type and icon
        const updatedIssue = {
          ...selectedIssue,
          type: newType,
          icon: newIcon, // Set the icon based on the new type
        };
    
        // Update selected issue state
        setSelectedIssue(updatedIssue);
    
        // Update the cards state locally
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === selectedIssue.id 
              ? { ...card, type: newType, icon: newIcon } 
              : card
          )
        );
    
        // Optionally, persist updated issues to local storage (if necessary)
        const updatedSprintIssues = location.state?.sprintIssues || 
                                     JSON.parse(localStorage.getItem('sprintIssues')) || 
                                     [];
        
        const updatedBacklogIssues = location.state?.backlogIssues || 
                                     JSON.parse(localStorage.getItem('backlogIssues')) || 
                                     [];
    
        const updatedIssuesList = updatedSprintIssues.length > 0 
          ? updatedSprintIssues 
          : updatedBacklogIssues;
    
        const newUpdatedIssuesList = updatedIssuesList.map((issue) =>
          issue.id === selectedIssue.id ? updatedIssue : issue
        );
    
        // Save the updated issues to localStorage
        localStorage.setItem('sprintIssues', JSON.stringify(newUpdatedIssuesList));
        localStorage.setItem('backlogIssues', JSON.stringify(newUpdatedIssuesList));
    
        // Update Firestore with the new type and icon
        try {
          const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}`);
          await updateDoc(issueDocRef, {
            type: newType,
            icon: newIcon,
          });
    
          console.log("Issue type updated successfully");
        } catch (error) {
          console.error("Error updating issue type:", error);
        }
    
        // Close the dropdown after selecting the new type
        setIsTypeDropdownOpen(false);
      }
    };

    
    
    
    // Helper function to get icon based on type
    const getIconForType = (type) => {
      switch(type.toLowerCase()) {
        case 'story':
          return story;
        case 'task':
          return task;
        case 'bug':
          return bug;
        default:
          return story; // default icon
      }
    };
  
  
    const [isSubmittingSubtask, setIsSubmittingSubtask] = useState(false);
const [isDeletingSubtask, setIsDeletingSubtask] = useState(false);

const handleCreateSubtask = () => {
  if (!isSubmittingSubtask) {
    setIsCreatingSubtask(true);
  }
};

const handleSubmitSubtask = async () => {
  if (newSubtask.trim() && !isSubmittingSubtask) {
    setIsSubmittingSubtask(true);
    
    try {
      const newSubtaskItem = {
        id: Date.now(),
        title: newSubtask,
      };
    
      const updatedSubtasks = [...subtasks, newSubtaskItem];
      const updatedIssue = {
        ...selectedIssue,
        subtasks: updatedSubtasks,
        stats: {
          ...selectedIssue.stats,
          subtasks: selectedIssue.stats.subtasks + 1,
        },
      };
    
      // Update local state
      setSubtasks(updatedSubtasks);
      setSelectedIssue(updatedIssue);
      setCards((prevCards) => prevCards.map((card) => 
        card.id === selectedIssue.id ? updatedIssue : card
      ));
      setSubtasksCount((prevCount) => (parseInt(prevCount) + 1).toString());
    
      // Update localStorage
      const updatedSprintIssues = cards.map((issue) =>
        issue.id === selectedIssue.id 
          ? { ...issue, subtasks: updatedSubtasks, stats: updatedIssue.stats } 
          : issue
      );
      localStorage.setItem('sprintIssues', JSON.stringify(updatedSprintIssues));
      
      // Firestore update
      const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}`);
      await updateDoc(issueDocRef, {
        subtasks: updatedSubtasks,
        "stats.subtasks": selectedIssue.stats.subtasks + 1,
      });
    
      // Reset form
      setNewSubtask("");
      setIsCreatingSubtask(false);
    } catch (error) {
      console.error("Error adding subtask to Firestore:", error);
    } finally {
      setIsSubmittingSubtask(false);
    }
  }
};

  

  const handleCancelSubtask = () => {
    setNewSubtask("");
    setIsCreatingSubtask(false);
  };

  // New edit subtask functions
  const handleEditSubtask = (subtask) => {
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskTitle(subtask.title);
  };

  const handleUpdateSubtask = async () => {
    if (editingSubtaskTitle.trim()) {
      // Update the subtask in the subtasks array
      const updatedSubtasks = subtasks.map((subtask) => (subtask.id === editingSubtaskId ? { ...subtask, title: editingSubtaskTitle.trim() } : subtask));
      setSubtasks(updatedSubtasks);

      // Update the selectedIssue with the new subtasks
      const updatedIssue = {
        ...selectedIssue,
        subtasks: updatedSubtasks,
      };
      setSelectedIssue(updatedIssue);

      // Update the cards state
      setCards((prevCards) => prevCards.map((card) => (card.id === selectedIssue.id ? updatedIssue : card)));

      // Firestore operations

      const issueId = selectedIssue.id; // Get the selected issue ID

      try {
        // Reference to the issue document in Firestore
        const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`);

        // Update the issue document with the updated subtasks
        await updateDoc(issueDocRef, {
          subtasks: updatedSubtasks, // Save the updated subtasks array in Firestore
        });

        // Reset editing states
        setEditingSubtaskId(null);
        setEditingSubtaskTitle("");
      } catch (error) {
        console.error("Error updating subtask in Firestore:", error);
      }
    }
  };

  const handleCancelEditSubtask = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle("");
  };

  // Delete subtask functions
  const handleDeleteSubtask = (subtaskId) => {
    if (!isDeletingSubtask) {
    // Instead of directly deleting, set up for confirmation
    setSubtaskToDelete(subtaskId);
    setShowSubtaskDeleteConfirmation(true);
    }
  };

  const confirmDeleteSubtask = async () => {
    if (subtaskToDelete && selectedIssue && !isDeletingSubtask) {
      setIsDeletingSubtask(true);
      
      try {
        const subtaskToDeleteObj = subtasks.find((subtask) => subtask.id === subtaskToDelete);
        const updatedSubtasks = subtasks.filter((subtask) => subtask.id !== subtaskToDelete);
        
        // Update local state
        setSubtasks(updatedSubtasks);
        const updatedIssue = {
          ...selectedIssue,
          subtasks: updatedSubtasks,
          stats: {
            ...selectedIssue.stats,
            subtasks: selectedIssue.stats.subtasks - 1,
          },
        };
        setSelectedIssue(updatedIssue);
        
        // Update cards
        setCards((prevCards) => prevCards.map((card) => 
          card.id === selectedIssue.id ? updatedIssue : card
        ));
        
        // Update count
        setSubtasksCount((prevCount) => (parseInt(prevCount) - 1).toString());
  
        // Firestore operations
        const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}`);
        
        // Batch the Firestore updates
        await updateDoc(issueDocRef, {
          subtasks: arrayRemove(subtaskToDeleteObj),
          "stats.subtasks": increment(-1)
        });
  
        // Reset states
        setShowSubtaskDeleteConfirmation(false);
        setSubtaskToDelete(null);
      } catch (error) {
        console.error("Error deleting subtask from Firestore:", error);
      } finally {
        setIsDeletingSubtask(false);
      }
    }
  };

  const cancelDeleteSubtask = () => {
    setShowSubtaskDeleteConfirmation(false);
    setSubtaskToDelete(null);
  };

  const handlePointsBlur = async () => {
    const numValue = parseInt(pointsCount);
    const validPoints = isNaN(numValue) || numValue < 0 ? "0" : numValue.toString();
    setPointsCount(validPoints);
  
    if (selectedIssue) {
      // Update the selected issue's points locally
      const updatedIssue = {
        ...selectedIssue,
        stats: {
          ...selectedIssue.stats,
          points: parseInt(validPoints),
        },
      };
      setSelectedIssue(updatedIssue);
  
      // Update the card in the cards array locally
      setCards((prevCards) => prevCards.map((card) => (card.id === selectedIssue.id ? updatedIssue : card)));
  
      // Update localStorage with the new sprintIssues data
      const updatedSprintIssues = cards.map((issue) => 
        issue.id === selectedIssue.id ? updatedIssue : issue
      );
      localStorage.setItem('sprintIssues', JSON.stringify(updatedSprintIssues));
  
      // Update the points in Firestore
      try {
        if (!scrumId) {
          console.error("scrumId is not available.");
          return;
        }
  
        const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}`);
        await updateDoc(issueDocRef, {
          "stats.points": parseInt(validPoints),
        });
  
        console.log("Points updated successfully in Firestore.");
      } catch (error) {
        console.error("Error updating points in Firestore:", error);
      }
    }
  };
  

  useEffect(() => {
    const fetchUpdatedPoints = async () => {
      try {

        const issueId = selectedIssue?.id;

        // Ensure both scrumId and selectedIssue.id are available
        if (!scrumId || !issueId) {
          console.error("scrumId or issueId is missing.");
          return;
        }

        // Reference the Firestore document
        const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`);

        // Fetch the document
        const issueDoc = await getDoc(issueDocRef);

        if (issueDoc.exists()) {
          const issueData = issueDoc.data();
          const updatedPoints = issueData?.stats?.points;

          console.log("Retrieved points from Firestore:", updatedPoints);

          // Update only if the points have changed
          if (selectedIssue?.stats?.points !== updatedPoints) {
            setSelectedIssue((prev) => ({
              ...prev,
              stats: {
                ...prev.stats,
                points: updatedPoints,
              },
            }));
          }
        } else {
          console.error("Document does not exist in Firestore.");
        }
      } catch (error) {
        console.error("Error retrieving points from Firestore:", error);
      }
    };

    // Fetch updated points if selectedIssue exists
    if (selectedIssue) {
      fetchUpdatedPoints();
    }
  }, [db, selectedIssue, location.state?.scrumId]); // Trigger whenever selectedIssue changes

  const handleEffortBlur = async () => {
    const numValue = parseInt(effortCount);
    const validEffort = isNaN(numValue) || numValue < 0 ? "0" : numValue.toString();
    setEffortCount(validEffort);
  
    if (selectedIssue) {
      // Update the selected issue's effort locally
      const updatedIssue = {
        ...selectedIssue,
        stats: {
          ...selectedIssue.stats,
          effort: parseInt(validEffort),
        },
      };
      setSelectedIssue(updatedIssue);
  
      // Update the card in the cards array locally
      setCards((prevCards) => prevCards.map((card) => (card.id === selectedIssue.id ? updatedIssue : card)));
  
      // Update localStorage with the new sprintIssues data
      const updatedSprintIssues = cards.map((issue) => 
        issue.id === selectedIssue.id ? updatedIssue : issue
      );
      localStorage.setItem('sprintIssues', JSON.stringify(updatedSprintIssues));
  
      // Update the effort field in Firestore
      try {
        if (!scrumId) {
          console.error("scrumId is not available.");
          return;
        }
  
        const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}`);
        await updateDoc(issueDocRef, {
          "stats.effort": parseInt(validEffort),
        });
  
        console.log("Effort updated successfully in Firestore.");
      } catch (error) {
        console.error("Error updating effort in Firestore:", error);
      }
    }
  };
  

  useEffect(() => {
    const fetchUpdatedEffort = async () => {
      try {
  
        const issueId = selectedIssue?.id;

        // Ensure both scrumId and selectedIssue.id are available
        if (!scrumId || !issueId) {
          console.error("scrumId or issueId is missing.");
          return;
        }

        // Reference the Firestore document
        const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`);

        // Fetch the document
        const issueDoc = await getDoc(issueDocRef);

        if (issueDoc.exists()) {
          const issueData = issueDoc.data();
          const updatedEffort = issueData?.stats?.effort;

          console.log("Retrieved effort from Firestore:", updatedEffort);

          // Only update state if the effort value has changed
          if (selectedIssue?.stats?.effort !== updatedEffort) {
            setSelectedIssue((prev) => ({
              ...prev,
              stats: {
                ...prev.stats,
                effort: updatedEffort,
              },
            }));
          }
        } else {
          console.error("Document does not exist in Firestore.");
        }
      } catch (error) {
        console.error("Error retrieving effort from Firestore:", error);
      }
    };

    if (selectedIssue) {
      fetchUpdatedEffort();
    }
  }, [db, selectedIssue?.id, location.state?.scrumId]); // Reduced dependency array

  const priorityOptions = [
    { value: "low", label: "Low", icon: low },
    { value: "medium", label: "Medium", icon: medium },
    { value: "high", label: "High", icon: high },
  ];

  const handlePriorityChange = async (newPriority) => {
    setPriority(newPriority);
    setPopupShowPriorityDropdown(false);

    if (selectedIssue) {
      // Create updated issue with new priority value
      const updatedIssue = {
        ...selectedIssue,
        priority: newPriority,
      };
      setSelectedIssue(updatedIssue);

      // Update the cards state
      setCards((prevCards) => prevCards.map((card) => (card.id === selectedIssue.id ? updatedIssue : card)));

      // Update the priority field in Firestore
      try {
      
        if (!scrumId) {
          console.error("scrumId is not available.");
          return;
        }

        const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}`);
        await updateDoc(issueDocRef, {
          priority: newPriority,
        });

        console.log("Priority updated successfully in Firestore.");
      } catch (error) {
        console.error("Error updating priority in Firestore:", error);
      }
    }
  };
  // Helper function to get priority icon
  const getPriorityIcon = (priorityValue) => {
    const priorityObj = priorityOptions.find((option) => option.value === priorityValue);
    return priorityObj ? priorityObj.icon : low; // Default to low if not found
  };

  // Add this to your existing state declarations
  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(assigneeSearchTerm.toLowerCase()));

  const handleAssigneeSelect = async (user) => {
    // Find the matching member in the members array
    const selectedMember = members.find((member) => member.id === user.id);

  
   
    // Update the selected assignee state for UI purposes
    setSelectedAssignee({
      name: user.name,
      img: selectedMember?.img || user.avatar,
      id: user.id // Store the user id
    });
    setIsAssigneeDropdownOpen(false);

  
    if (selectedIssue) {
      const updatedIssue = {
        ...selectedIssue,
        assignee: {
          assignId: user.id, // Use user.id directly instead of memberId
          name: user.name,
          picture: selectedMember?.img || user.avatar,
        },
      };

  
      
      // Debug: Log the updated assignee object
      console.log("Updated assignee object:", updatedIssue.assignee);

  
     // Update the state with the new issue details
     setSelectedIssue(updatedIssue);

  
       // Update the cards state by replacing the updated issue
       setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === selectedIssue.id ? updatedIssue : card
        )
      );

  
        // Update the sprint issues in localStorage
        const updatedSprintIssues = JSON.parse(localStorage.getItem('sprintIssues')) || [];
        const updatedSprintIssuesWithNewAssignee = updatedSprintIssues.map((issue) =>
          issue.id === selectedIssue.id ? updatedIssue : issue
        );
        localStorage.setItem('sprintIssues', JSON.stringify(updatedSprintIssuesWithNewAssignee));
  
  
        // Firestore update
        try {
          const db = getFirestore();
  
  
         // Construct the Firestore document reference for the issue
        const issueRef = doc(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}`);

  
         // Update the assignee in Firestore
         await updateDoc(issueRef, {
          assignee: updatedIssue.assignee, // Use the updated assignee object
        });

  
        console.log("Issue successfully updated in Firestore");

  
        // Create and save notification in Firestore
        const currentUserUid = getAuth().currentUser.uid;
        const notifRef = doc(collection(db, `Scrum/${scrumId}/scrumNotif`));
        const notification = {
          id: notifRef.id,
          sender: currentUserUid,
          receiver: [user.id], // Use user.id here instead of selectedMember?.memberId
          context: scrumId,
          action: 'assigned you a task in',
          timeAgo: new Date().toISOString(),
          subType: 'workload',
          type: 'assigned',
          unread: true,
        };

  
        await setDoc(notifRef, notification); // Save notification to Firestore
        console.log("Notification successfully created in Firestore");
  
      } catch (error) {
        console.error("Error updating issue or saving notification in Firestore:", error);
      }
    }
  };
  
  
  // Function to generate a unique ID (you can place this outside the component)
  const generateUniqueId = () => {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  };

  // DateTimePicker component
  const DateTimePicker = ({ label, date, time, onDateChange, onTimeChange }) => {
    const [showTimePicker, setShowTimePicker] = useState(false);

    const timeOptions = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of ["00", "30"]) {
        const time24 = `${hour.toString().padStart(2, "0")}:${minute}`;
        timeOptions.push(time24);
      }
    }

    const formatTimeToAMPM = (time24) => {
      if (!time24) return "";
      const [hours24, minutes] = time24.split(":");
      const hours = parseInt(hours24);
      const period = hours >= 12 ? "PM" : "AM";
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes} ${period}`;
    };
  };

  // Ensure formatTimestamp handles various input types
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown time";
  
    // Check if timestamp is a Firestore Timestamp or a regular Date
    const commentDate = timestamp.seconds 
      ? new Date(timestamp.seconds * 1000) 
      : new Date(timestamp);
  
    const now = new Date();
    const timeDiff = now - commentDate;
  
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const years = Math.floor(days / 365);
  
    if (seconds < 60) return "Just now";
    if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  };

  const sortComments = (commentsToSort, sortType) => {
    return [...commentsToSort].sort((a, b) => {
      // Ensure dateCreated is always a Date object
      const dateA = a.dateCreated instanceof Date ? a.dateCreated : new Date(a.dateCreated);
      const dateB = b.dateCreated instanceof Date ? b.dateCreated : new Date(b.dateCreated);

      // Sort based on selected option
      return sortType === "Newest First"
        ? dateB.getTime() - dateA.getTime() // Newest first
        : dateA.getTime() - dateB.getTime(); // Oldest first
    });
  };

  // Modify handleSortSelect to properly sort existing comments
  const handleSortSelect = (sort) => {
    setSelectedSort(sort);

    if (selectedIssue) {
      setComments((prevComments) => {
        const currentIssueComments = prevComments[selectedIssue.id] || [];
        const sortedComments = sortComments(currentIssueComments, sort);

        return {
          ...prevComments,
          [selectedIssue.id]: sortedComments,
        };
      });
    }

    setIsSortDropdownOpen(false);
  };

  // Modify handleCommentSubmit to ensure proper sorting when adding new comments
  const fetchAuthorDetails = async (authorId) => {
    const authorRef = doc(db, "users", authorId); // Use authorId to fetch user details from Firestore
    try {
      const authorSnap = await getDoc(authorRef);
  
      if (authorSnap.exists()) {
        const authorData = authorSnap.data();
        return {
          firstName: authorData.firstName || "",
          lastName: authorData.lastName || "",
          avatar: authorData.userPicture || "", // Retrieve the avatar (userPicture)
          fullName: `${authorData.firstName || ""} ${authorData.lastName || ""}`.trim(),
        };
      } else {
        return {
          firstName: "",
          lastName: "",
          avatar: "",
          fullName: "",
        };
      }
    } catch (error) {
      console.error("Error fetching author details:", error);
      return {
        firstName: "",
        lastName: "",
        avatar: "",
        fullName: "",
      };
    }
  };
  
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
const [isDeletingComment, setIsDeletingComment] = useState(false);

  const handleCommentSubmit = async (e) => {
    // Prevent default form submission for Enter key
    if (e.type === "keypress" && e.key === "Enter") {
        e.preventDefault();
    }

    if (isSubmittingComment) {
      return;
  }

    const auth = getAuth();
    const uid = auth.currentUser?.uid;

    // Check if the event is a keypress (Enter key) or a click
    if ((e.type === "keypress" && e.key === "Enter") || e.type === "click") {
        if (newComment.trim() && selectedIssue) {
            try {
                setIsSubmittingComment(true); // Set loading state
                const commentId = generateUniqueId();
                const issueId = selectedIssue.id;

                // Store the comment text and clear input immediately
                const commentText = newComment.trim();
                setNewComment(""); // Clear input field immediately

                // Fetch current issue document
                const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`);
                const issueSnap = await getDoc(issueDocRef);
                const issueData = issueSnap.data();
                const currentCommentCount = issueData?.stats?.comments || 0;
  
          // Get the assignee info
          const assigneeId = issueData?.assignee?.assignId;
          const scrumMasterId = issueData?.scrumMaster;
  
          // Determine the receiver for the notification
          let receiverId = [];
          
          // Logic to determine the receiver based on uid
          if (uid === scrumMasterId) {
            receiverId = [assigneeId]; // If the user is the scrum master, send to the assignee
          } else if (uid === assigneeId) {
            receiverId = [scrumMasterId]; // If the user is the assignee, send to the scrum master
          } else {
            receiverId = [scrumMasterId, assigneeId]; // If neither, send to both
          }
  
          // Log the output to see the receiver(s)
          console.log("Receiver IDs:", receiverId);
          console.log("scrumMasterId:", scrumMasterId);
          console.log("assigneeId:", assigneeId);
          
          // Fetch the author's details (name and avatar) using the current user's UID
          const authorDetails = await fetchAuthorDetails(uid);
  
          const commentToAdd = {
            id: commentId,
            authorId: uid,
            content: commentText,
            dateCreated: new Date(),
            timestamp: formatTimestamp(new Date()),
            commentCount: currentCommentCount + 1,
        };

        // Add comment to Firestore
        const commentDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}/comments/${commentId}`);
        await setDoc(commentDocRef, commentToAdd);

        // Update comment count in Firestore
        await updateDoc(issueDocRef, {
            "stats.comments": currentCommentCount + 1,
        });
  
          // Create and send a notification
          const notificationObj = {
            type: 'social',
            action: 'commented on your work in',
            context: scrumId,
            timeAgo: new Date().toISOString(),
            subType: 'comment',
            unread: true,
            receiver: receiverId, // Send to the determined receiver(s)
            sender: uid, // The current user as sender
          };
  
          // Create a document for the notification
          const notifRef = doc(collection(db, `Scrum/${scrumId}/scrumNotif`));
          await setDoc(notifRef, notificationObj);
  
          // Update the notification object with the actual document ID
          notificationObj.id = notifRef.id;
  
          // Update local state immediately
          setCommentCount((prevCount) => (parseInt(prevCount) + 1).toString());
                
          // Update comments state
          setComments((prevComments) => {
              const currentIssueComments = prevComments[selectedIssue.id] || [];
              const updatedComments = [...currentIssueComments, commentToAdd];
              const sortedComments = sortComments(updatedComments, selectedSort);
              
              return {
                  ...prevComments,
                  [selectedIssue.id]: sortedComments,
              };
          });
  
          // Update the selected issue
          const updatedIssue = {
            ...selectedIssue,
            stats: {
              ...selectedIssue.stats,
              comments: currentCommentCount + 1,
            },
          };
          setSelectedIssue(updatedIssue);
  
          // Update cards state
          setCards((prevCards) => prevCards.map((card) => (card.id === selectedIssue.id ? updatedIssue : card)));
  
        } catch (error) {
          console.error("Error adding comment to Firestore:", error);
          // Reset new comment input
          setNewComment("");
      } finally {
          setIsSubmittingComment(false); // Reset loading state
      }
  }
}
};

  
  
  
  

  const handleDeleteComment = (commentId) => {
    if (!isDeletingComment) {
    // Instead of directly deleting, set up for confirmation
    setCommentToDelete(commentId);
    setShowCommentDeleteConfirmation(true);
    }
  };

  const confirmDeleteComment = async () => {
    if (selectedIssue && commentToDelete && !isDeletingComment) {
        try {
            setIsDeletingComment(true); // Set deleting state
            
            // Get current comments for the issue
            const currentComments = comments[selectedIssue.id] || [];
        
        // Calculate new comments array without the deleted comment
        const updatedComments = currentComments.filter(
          (comment) => comment.id !== commentToDelete
        );
  
        // Update local comments state first
        setComments((prevComments) => ({
          ...prevComments,
          [selectedIssue.id]: updatedComments
        }));
  
        // Calculate new comment count (using length of updated comments array)
        const newCommentCount = updatedComments.length;
  
        // Update local comment count state
        setCommentCount(newCommentCount.toString());
  
        // Update selected issue state
        setSelectedIssue(prevIssue => ({
          ...prevIssue,
          stats: {
            ...prevIssue.stats,
            comments: newCommentCount
          }
        }));
  
        // Update cards state
        setCards(prevCards => 
          prevCards.map(card => 
            card.id === selectedIssue.id 
              ? {
                  ...card,
                  stats: {
                    ...card.stats,
                    comments: newCommentCount
                  }
                }
              : card
          )
        );
  
        // Delete from Firestore
        const commentDocRef = doc(
          db, 
          `Scrum/${scrumId}/backlog/${selectedIssue.id}/comments`, 
          commentToDelete
        );
        await deleteDoc(commentDocRef);
  
        // Update issue document in Firestore
        const issueDocRef = doc(
          db, 
          `Scrum/${scrumId}/backlog/${selectedIssue.id}`
        );
        await updateDoc(issueDocRef, {
          "stats.comments": newCommentCount
        });
  
      } catch (error) {
        console.error("Error deleting comment:", error);
    } finally {
        setIsDeletingComment(false); // Reset deleting state
        setShowCommentDeleteConfirmation(false);
        setCommentToDelete(null);
    }
}
};

  const cancelDeleteComment = () => {
    setShowCommentDeleteConfirmation(false);
    setCommentToDelete(null);
  };

  // Update the periodic timestamp refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      setComments((prevComments) => {
        if (!prevComments) return prevComments;

        const updatedComments = { ...prevComments };
        Object.keys(updatedComments).forEach((issueId) => {
          updatedComments[issueId] = updatedComments[issueId].map((comment) => ({
            ...comment,
            timestamp: formatTimestamp(comment.dateCreated),
          }));
        });
        return updatedComments;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Add these functions to your component
  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  // track column timestamps
  useEffect(() => {
    const newTimestamps = {};
    cards.forEach((card) => {
      const key = `${card.id}_${card.status}`;
      if (!columnTimestamps[key]) {
        newTimestamps[key] = Date.now();
      }
    });

    setColumnTimestamps((prev) => ({
      ...prev,
      ...newTimestamps,
    }));
  }, [cards]);

  useEffect(() => {
    // Ensure that selectedIssue is defined and has valid scrumId and issueId before fetching comments
    if (selectedIssue && selectedIssue.id) {
      fetchIssueComments();
    }
  }, [selectedIssue]);
  // function to check if an issue has been in a column for more than 50 seconds
  const isIssueStuck = (card) => {
    const key = `${card.id}_${card.status}`;
    const timestamp = columnTimestamps[key];

    if (!timestamp) return false;

    const currentTime = Date.now();
    const timeDifference = (currentTime - timestamp) / 1000; // Convert to seconds

    return timeDifference >= 50;
  };



  const handleCompleteSprintButtonClick = async (issue) => {
    // Check if the user has access to the Scrum document before proceeding
    const db = getFirestore();
    const memberRef = doc(db, `Scrum/${scrumId}/member/${uid}`);
  
    try {
      const docSnap = await getDoc(memberRef);
  
      if (docSnap.exists() && docSnap.data().access === true) {
        // Proceed with the sprint completion logic if access is granted
  
        const incompleteIssues = cards.filter((card) => card.status !== "Done");
  
        // Get the current date and time
        const now = new Date();
  
        // Format the combined date and time as MM/DD/YYYY hh:mm AM/PM
        const completedSprintDate = now.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
        .replace(',', ''); // Removes the comma after the day
  
        // Store in localStorage
        localStorage.setItem('completedSprintDate', completedSprintDate);
  
        // Firestore reference (replace 'scrumId' with actual values)
        const backlogRef = doc(db, `Scrum/${scrumId}`);
  
        if (incompleteIssues.length > 0) {
          // If there are incomplete issues, show the existing popup
          setRemainingIssues(incompleteIssues);
          setIsSprintCompletionPopupOpen(true);
        } else {
          // If all issues are in "Done" column, show the final confirmation popup
          setIsSprintCompletionPopupOpen(true);
        }
  
        // Save the formatted date and time to Firestore
        await updateDoc(backlogRef, {
          completedSprintDate: completedSprintDate, // Combined field for date and time
        });
  
        console.log("Sprint completion data saved:", completedSprintDate);
      } else {
        // If no access, show an error or prevent the action
        console.log('Access denied: User does not have permission to complete the sprint.');
      }
    } catch (error) {
      console.error("Error fetching member data or completing sprint:", error);
    }
  };
  
  
  

  const handleFinalSprintCompletion = async () => {
    const {
      projectName,
      key,
      startDate,
      startTime,
      endDate,
      endTime,
      icon,
      scrumMaster,
      masterIcon,
      members,
    } = location.state || {};
  
    // Get the current user's UID
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
  
    if (!scrumId) {
      console.error("Scrum ID is missing!");
      return;
    }
  
    try {
      // Reference the Firestore document for the specific Scrum project
      const scrumDocRef = doc(db, `Scrum/${scrumId}`);
  
      // Update the document with `isDone: true`
      await updateDoc(scrumDocRef, { isDone: true });
  
      console.log("Scrum status updated to isDone: true in Firestore!");
  
      // Update each member's access in Firestore
      if (members && members.length > 0) {
        const memberUpdates = members.map(async (memberUid) => {
          const memberDocRef = doc(db, `Scrum/${scrumId}/member/${memberUid}`);
          await updateDoc(memberDocRef, { access: false });
          console.log(`Access set to false for member: ${memberUid}`);
        });
  
        // Wait for all member updates to complete
        await Promise.all(memberUpdates);
      }
  
      // Specifically update the current user's access if needed
      if (uid) {
        const currentUserDocRef = doc(db, `Scrum/${scrumId}/member/${uid}`);
        await updateDoc(currentUserDocRef, { access: false });
        console.log(`Access set to false for current user: ${uid}`);
      }
  
      // Navigate back to Scrum Projects and pass the project completion data
      navigate("/scrumprojects", {
        state: {
          completedProject: {
            name: projectName,
            key: key,
            startDate: startDate,
            startTime: startTime,
            endDate: endDate,
            endTime: endTime,
            icon: icon,
            scrumMaster: scrumMaster,
            masterIcon: masterIcon,
            members: members,
            progress: 100,
            isDone: true,
          },
        },
      });
  
      console.log("Sprint completed successfully!");
    } catch (error) {
      console.error("Error updating Scrum project in Firestore:", error);
    }
  };
  
  const handleCancelSprintCompletion = () => {
    setIsSprintCompletionPopupOpen(false);
    setRemainingIssues([]);
  };
  const inviteMember = async (email, scrumId, fetchedBacklogIssues, setMembers) => {
    try {
      const auth = getAuth();
      const uid = auth.currentUser.uid;
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const memberUid = userDoc.id;
  
        // Get the member's details
        const memberData = userDoc.data();
        const member = {
          id: memberUid,
          img: memberData.userPicture || "",
          name: `${memberData.firstName || ""} ${memberData.lastName || ""}`.trim(),
          role: "Team Member",
          access: false,
          memberId: memberUid  // Add memberId for future reference
        };
  
  
        // Get the document reference for the current scrum
        const scrumDocRef = doc(db, `Scrum/${scrumId}/member/${memberUid}`);
        const memberDoc = await getDoc(scrumDocRef);
  
        if (memberDoc.exists()) {
          console.log("This member has already been invited to the Scrum.");
          return;
        }
  
        // Add the Team Member to Firestore
        await setDoc(scrumDocRef, {
          memberUid,
          role: "Team Member",
          createdAt: serverTimestamp(),
          access: false,
        });
  
        // Retrieve the current project details from localStorage
        const storedProject = JSON.parse(localStorage.getItem('selectedProject')) || {};
        const updatedMembers = storedProject.members || [];
  
        setMembers((prevMembers) => {
          // Check if member already exists
          const memberExists = prevMembers.some(existingMember => existingMember.id === member.id);
          
          if (!memberExists) {
            // Update localStorage
            const storedProject = JSON.parse(localStorage.getItem('selectedProject')) || {};
            const updatedMembers = [...prevMembers, member];
            storedProject.members = updatedMembers;
            localStorage.setItem('selectedProject', JSON.stringify(storedProject));
  
            // Update users state for assignee dropdown
            setUsers((prevUsers) => [
              ...prevUsers,
              {
                id: member.id,
                name: member.name,
                avatar: member.img,
              }
            ]);
            return updatedMembers;
          }
          return prevMembers;
        });  
  
        // Add Scrum to the user's backlog
        const backlogRef = doc(db, `users/${memberUid}/Scrum/${scrumId}`);
        await setDoc(backlogRef, {
          scrumId,
          createdAt: serverTimestamp(),
        });
  
        // Retrieve current user's backlog document to get notifId
        const currentUserBacklogRef = doc(db, `users/${uid}/Scrum/${scrumId}`);
        const currentUserBacklogDoc = await getDoc(currentUserBacklogRef);
  
        if (!currentUserBacklogDoc.exists()) {
          console.error("No notifId found in the user's backlog.");
          return;
        }
  
        const notifId = currentUserBacklogDoc.data().notifId;
        const notifRef = doc(db, `Scrum/${scrumId}/scrumNotif/${notifId}`);
        await setDoc(
          notifRef,
          {
            receiver: arrayUnion(memberUid),
          },
          { merge: true }
        );
  
        // Create a new notification for the invited member
        const notifCollectionRef = collection(db, `Scrum/${scrumId}/scrumNotif`);
        const notifDocRef = await addDoc(notifCollectionRef, {
          sender: uid,
          receiver: [memberUid],
          context: scrumId,
          action: "has invited you to join the Scrum",
          timeAgo: new Date().toISOString(),
          subType: "workload",
          type: "assigned",
          unread: true,
        });
  
        const notifDocId = notifDocRef.id;
  
        // Update the notification document with its own ID
        await setDoc(
          doc(db, `Scrum/${scrumId}/scrumNotif/${notifDocId}`),
          {
            id: notifDocId,
          },
          { merge: true }
        );
  
        console.log("Member invited successfully!");
        setPopupMessage("Member has been successfully invited!");
        setShowSuccessPopup(true);
        return member;
  
      } else {
        console.error("No user found with the provided email.");
        throw new Error("No user found with the provided email.");
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      setPopupMessage(error.message || "Failed to invite member. Please try again.");
      setShowErrorPopup(true);
      throw error;
    }
  };
  
  
  const handleInviteClick = () => {
    const emailInput = document.querySelector(".backlog-member-email-input");
    const email = emailInput.value.trim();
    const role = selectedRole;
  
    if (!email) {
      setPopupMessage("Please enter a valid email.");
      setShowErrorPopup(true);
      return;
    }
    if (!role) {
      setPopupMessage("Please select a role.");
      setShowErrorPopup(true);
      return;
    }
    if (!scrumId) {
      setPopupMessage("Scrum ID is not available. Please refresh the page or try again.");
      setShowErrorPopup(true);
      return;
    }
  
    inviteMember(email, scrumId, null, setMembers)
      .then((invitedMember) => {
        console.log("Invitation sent successfully.", invitedMember);
        emailInput.value = ""; // Clear the input field
      })
      .catch((error) => {
        console.error("Error inviting member:", error);
      });
  };
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const fetchIsDone = async () => {
      try {
        const db = getFirestore();
        const docRef = doc(db, `Scrum/${scrumId}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsDone(data.isDone === true);
        }
      } catch (error) {
        console.error("Error fetching isDone status:", error);
      }
    };

    if (scrumId) {
      fetchIsDone();
    }
  }, [scrumId]);
   const [hasAccess, setHasAccess] = useState(false);
   
   useEffect(() => {
     const checkAccess = async () => {
       const db = getFirestore();
       const memberRef = doc(db, `Scrum/${scrumId}/member/${uid}`);
   
       try {
         const docSnap = await getDoc(memberRef);
   
         if (docSnap.exists() && docSnap.data().access === true) {
           setHasAccess(true);
         } else {
           setHasAccess(false);
         }
       } catch (error) {
         console.error('Error fetching member data:', error);
         setHasAccess(false);
       }
     };
   
     checkAccess();
   }, [scrumId, uid]);
   
   const handleDisable = () => {
     // Only called if the button is rendered
     setShowMemberInviteModal(true);
   };
   

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

   useEffect(() => {
    const checkAccess = async () => {
      if (!uid || !scrumId) return;

      try {
        const accessDocRef = doc(db, `Scrum/${scrumId}/member/${uid}`);
        const accessDoc = await getDoc(accessDocRef);

        if (accessDoc.exists() && accessDoc.data().access === true) {
          setAllow(true); // Grant access
        } else {
          setAllow(false); // Deny access
        }
      } catch (error) {
        console.error("Error checking access:", error);
        setAllow(false); // Deny access in case of error
      }
    };

    checkAccess();
  }, [uid, scrumId, db]);
  

   const showRemoveIcon = (member, index) => {
    return allow && hoveredActSprintMember === index && uid && member.memberId !== uid;
  };

    const statusChangeRef = useRef(null);
    const priorityChangeRef = useRef(null);
    const assigneeChangeRef = useRef(null);
    const sortChangeRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on the scrollbar of details list
      const detailsList = document.querySelector('.active-sprint-presentation-popup__details-list');
      if (detailsList) {
        const rect = detailsList.getBoundingClientRect();
        const isClickOnVerticalScrollbar = 
          event.clientX > rect.right - 16 && // 16px is typical scrollbar width
          event.clientX < rect.right &&
          event.clientY > rect.top &&
          event.clientY < rect.bottom;
        
        const isClickOnHorizontalScrollbar =
          event.clientY > rect.bottom - 16 && // 16px is typical scrollbar height
          event.clientY < rect.bottom &&
          event.clientX > rect.left &&
          event.clientX < rect.right;
  
        // If click is on scrollbar, don't close dropdowns
        if (isClickOnVerticalScrollbar || isClickOnHorizontalScrollbar) {
          return;
        }
      }

      // Handle Sort issue dropdown
      const isSortClick = event.target.closest(".active-sprint-presentation-popup__sort-dropdown");
      const isOutsideSortMenu = !sortChangeRef.current?.contains(event.target);
      if (isOutsideSortMenu && !isSortClick) {
        setIsSortDropdownOpen(false);
      }
  
      // Handle Status issue dropdown
      const isStatusClick = event.target.closest(".active-sprint-presentation-popup__status-dropdown");
      const isOutsideStatusMenu = !statusChangeRef.current?.contains(event.target);
      if (isOutsideStatusMenu && !isStatusClick) {
        setIsStatusDropdownOpen(false);
      }

      // Handle priority issue dropdown
      const isPriorityClick = event.target.closest(".active-sprint-priority-dropdown");
      const isOutsidePresentationMenu = !priorityChangeRef.current?.contains(event.target);
      if (isOutsidePresentationMenu && !isPriorityClick) {
        setPopupShowPriorityDropdown(false);
      }
  
      // Handle assignee issue dropdown
      const isAssigneeClick = event.target.closest(".active-sprint-assignee-dropdown");
      const isOutsideAssigneeMenu = !assigneeChangeRef.current?.contains(event.target);
      if (isOutsideAssigneeMenu && !isAssigneeClick) {
        setIsAssigneeDropdownOpen(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const titleRef = useRef(null);
const issueRefs = useRef({}); // Dynamic refs for issue titles
const issuePopupTitleRef = useRef(null);
const [isOverflowing, setIsOverflowing] = useState(false);
const [showTooltip, setShowTooltip] = useState(false);
const [overflowingIssues, setOverflowingIssues] = useState({}); // Track overflow for each issue
const [showIssueTooltip, setShowIssueTooltip] = useState(null); // Track which issue tooltip to show
const [isIssuePopupOverflowing, setIsIssuePopupOverflowing] = useState(false);
  const [showIssuePopupTooltip, setShowIssuePopupTooltip] = useState(false);
  const completionIssueRefs = useRef({}); // Add this with your other refs
const [overflowingCompletionIssues, setOverflowingCompletionIssues] = useState({}); // Add this with other states
const [showCompletionIssueTooltip, setShowCompletionIssueTooltip] = useState(null); // Add this with other states

useEffect(() => {
  // Check overflow for the project title
  if (titleRef.current) {
    const isOverflow = titleRef.current.offsetWidth < titleRef.current.scrollWidth;
    setIsOverflowing(isOverflow);
  }

  if (issuePopupTitleRef.current) {
    const isOverflow =
      issuePopupTitleRef.current.offsetWidth < issuePopupTitleRef.current.scrollWidth;
    setIsIssuePopupOverflowing(isOverflow);
  }

  // Check overflow for each issue title dynamically
  const newOverflowingIssues = {};
  Object.entries(issueRefs.current).forEach(([id, ref]) => {
    if (ref) {
      newOverflowingIssues[id] = ref.offsetWidth < ref.scrollWidth;
    }
  });
  setOverflowingIssues(newOverflowingIssues);
}, [projectName, filteredCards, selectedIssue]); // Recalculate on dependency changes

useEffect(() => {
  // Check overflow for each completion issue title dynamically
  const newOverflowingCompletionIssues = {};
  Object.entries(completionIssueRefs.current).forEach(([id, ref]) => {
    if (ref) {
      newOverflowingCompletionIssues[id] = ref.offsetWidth < ref.scrollWidth;
    }
  });
  setOverflowingCompletionIssues(newOverflowingCompletionIssues);
}, [remainingIssues]);

  return (
    <>
      <div className="active-sprint-container">
        <div className="active-sprint-header">
          <div className="active-sprint-info">
            <h1
    className="active-sprint-name"
    ref={titleRef}
    onMouseEnter={() => isOverflowing && setShowTooltip(true)}
    onMouseLeave={() => setShowTooltip(false)}
  >
    {projectName}
    {showTooltip && (
      <div className="sprint-title-tooltip">{projectName}</div>
    )}
  </h1>
            <div className="active-sprint-member-icons">
              <div className="active-sprint-member-icon-container" onClick={() => setShowMembersPopup(true)}>
                {members.slice(0, 3).map((member, index) =>
                  member.img ? (
                    <img key={index} src={member.img} alt={`Member ${member.name}`} className="active-sprint-member-icon" />
                  ) : (
                    <div
                      key={index}
                      style={{
                        backgroundColor: "rgb(38, 101, 172)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "9999px",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginRight: "-8px",
                      }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  ),
                )}
                {members.length > 3 && <div className="active-sprint-member-count">+{members.length - 3}</div>}
              </div>
            </div>
          </div>
          <div className="active-sprint-controls-container">
            <div className="active-sprint-search-container">
              <input type="text" placeholder="Search" className="active-sprint-search-input" value={searchQuery} onChange={handleSearch} />
              <img src={searchIcon} alt="search" className="active-sprint-search-icon" />
            </div>

            {/* Filter and Type Buttons */}
            <div className="active-sprint-filter-type-container">
              {/* Filter Button with Dropdown */}
              <div className="active-sprint-filter-dropdown" ref={filterDropdownRef}>
                <button className="active-sprint-filter-btn" onClick={toggleFilterDropdown}>
                  Filter <ChevronDown size={16} style={{
                              transform: filterDropdownVisible ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}/>
                </button>
                {filterDropdownVisible && (
                  <div className="active-sprint-filter-dropdown-menu">
                    <input type="checkbox" checked={onlyMyIssueChecked} onChange={handleCheckboxChange} />
                    <span>Only My Issue</span>
                  </div>
                )}
              </div>

              {/* Type Dropdown */}
              <div className="active-sprint-type-dropdown" ref={typeDropdownRef}>
                <button className="active-sprint-type-btn" onClick={toggleTypeDropdown}>
                  {typeFilterLabel} <ChevronDown size={16} style={{
                              transform: typeDropdownVisible ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}/>
                </button>
                {typeDropdownVisible && (
                  <div className="active-sprint-type-dropdown-menu">
                    <div className="active-sprint-type-dropdown-item">
                      <input type="checkbox" id="story" className="active-sprint-type-checkbox" checked={checkedTypes.story} onChange={handleTypeCheckboxChange} />
                      <label htmlFor="story" className="active-sprint-type-story">
                        <img src={story} alt="Story Icon" className="active-sprint-type-icon" /> Story
                      </label>
                    </div>
                    <div className="active-sprint-type-dropdown-item">
                      <input type="checkbox" id="task" className="active-sprint-type-checkbox" checked={checkedTypes.task} onChange={handleTypeCheckboxChange} />
                      <label htmlFor="task" className="active-sprint-type-task">
                        <img src={task} alt="Task Icon" className="active-sprint-type-icon" /> Task
                      </label>
                    </div>
                    <div className="active-sprint-type-dropdown-item">
                      <input type="checkbox" id="bug" className="active-sprint-type-checkbox" checked={checkedTypes.bug} onChange={handleTypeCheckboxChange} />
                      <label htmlFor="bug" className="active-sprint-type-bug">
                        <img src={bug} alt="Bug Icon" className="active-sprint-type-icon" /> Bug
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
              {hasAccess && (
                    <button
                      className="backlogs-invite-member-btn"
                      onClick={handleDisable}
                    >
                      <Users size={20} />
                      Invite Member
                    </button>
                  )}
                  {hasAccess && (
            <button className="active-sprint-complete-sprint-btn" onClick={handleCompleteSprintButtonClick}  >
              Complete Sprint
            </button>
               )}
          </div>
        </div>

        {/* Sprint Completion Popup */}
        {isSprintCompletionPopupOpen && (
          <div className="sprint-completion-modal">
            <div className="sprint-completion-popup-container">
              <div className="sprint-completion-popup-header">
                <h2 className="sprint-completion-popup-title">Complete Sprint</h2>
              </div>
              <div className="sprint-completion-popup-content">
                {remainingIssues.length > 0 ? (
                  <>
                    <p className="sprint-completion-message">Project cannot be completed as there are incomplete tasks or subtasks. Please complete the following:</p>
                    <ul className="sprint-completion-issues">
                      {remainingIssues.map((issue) => (
                        <li key={issue.id} className="sprint-completion-issue-item">
                          <div className="sprint-completion-issue-details">
                            <div className="sprint-completion-issue-header">
                            <span 
  className="sprint-completion-issue-title"
  ref={(el) => (completionIssueRefs.current[issue.id] = el)}
  onMouseEnter={() => {
    if (overflowingCompletionIssues[issue.id]) {
      setShowCompletionIssueTooltip(issue.id);
    }
  }}
  onMouseLeave={() => setShowCompletionIssueTooltip(null)}
>
  {issue.title}
  {showCompletionIssueTooltip === issue.id && (
    <div className="sprint-completion-title-tooltip">
      {issue.title}
    </div>
  )}
</span>
                              <span className="sprint-completion-issue-status">(Status: {issue.status})</span>
                            </div>
                            <div className="sprint-completion-issue-bottom">
                              <img src={issue.icon} alt={`${issue.type} icon`} className="sprint-completion-issue-type-icon" />
                              <span className="sprint-completion-issue-code">{issue.code}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="sprint-completion-popup-actions">
                      <button onClick={handleCancelSprintCompletion}>Close</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="sprint-completion-message">Are you sure you want to complete this project?</p>
                    <div className="sprint-final-completion-popup-actions">
                      <button onClick={handleFinalSprintCompletion}>Complete</button>
                      <button onClick={handleCancelSprintCompletion}>Cancel</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="active-sprint-info-container">
          <div className="active-sprint-days-header">
            <div className="active-sprint-title">{key} - 0</div>
            <div className="active-sprint-dates">
              <span>{`${startDate} - ${endDate}`}</span>
              <img src={days} alt="Days-Remaining-Icon" className="active-sprint-clock-icon" />
              <span className="active-sprint-time-remaining">{timeRemaining}</span>
            </div>
          </div>

          <div className="active-sprint-board">
            {["To-do", "Blocked", "In Progress", "In Review", "In Test", "Done"].map((status) => (
              <div key={status} className="active-sprint-column">
                <h3 className="active-sprint-column-title">{status}</h3>
                {filteredCards
                  .filter((card) => card.status === status)
                  .map((card) => (
                    <div key={card.id} className={`active-sprint-column-content ${card.isPinned ? "pinned" : ""}`} onClick={() => handleSprintItemClick(card)}>
                      <div className="active-sprint-card-header">
                        <div className="active-sprint-task-content">
                        <p
                  className="active-sprint-task-title"
                  ref={(el) => (issueRefs.current[card.id] = el)} // Assign dynamic ref
                  style={{
                    textDecoration: card.status === "Done" ? "line-through" : "none",
                    color: card.status === "Done" ? "#2665AC" : "#2665AC",
                  }}
                  onMouseEnter={() => {
                    if (overflowingIssues[card.id]) {
                      setShowIssueTooltip(card.id);
                    }
                  }}
                  onMouseLeave={() => setShowIssueTooltip(null)}
                >
                  {card.title}
                  {showIssueTooltip === card.id && (
                    <div className="sprint-issue-title-tooltip">{card.title}</div>
                  )}
                </p>
                          {isIssueStuck(card) && (
                            <div className="active-sprint-tooltip-container">
                              <img src={lightBulb} alt="LightBulb" className="lightBulb-icon" />
                              <div className="active-sprint-custom-tooltip">
                                <span className="active-sprint-tooltip-content">
                                  {`This issue has already been\nin this column for ${Math.floor((Date.now() - columnTimestamps[`${card.id}_${card.status}`]) / 1000)} seconds.`}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          className="active-sprint-remove-btn"
                          ref={(el) => (cardDropdownsRef.current[card.id] = { current: el })}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(card.id, e);
                          }}
                        >
                          <span className="active-sprint-dots">...</span>
                        </button>

                        {openDropdownCardId === card.id && (
                          <div className="active-sprint-remove-menu" ref={(el) => (cardDropdownsRef.current[card.id].dropdown = { current: el })} onClick={(e) => e.stopPropagation()}>
                            <button
                              className="active-sprint-delete-btn"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                console.log("Delete button clicked", card);
                                handleDeleteCard(card, e);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="active-sprint-task-type">
                        <img src={getIconSrc(card.type)} alt={card.type} className="active-sprint-task-type-icon" />
                        <div className="active-sprint-task-type-container">
                          {card.priority === "high" && <img src={high} alt="High Priority" className="active-sprint-priority-icon3" />}
                          {card.priority === "medium" && <img src={medium} alt="Medium Priority" className="active-sprint-priority-icon2" />}
                          {card.priority === "low" && <img src={low} alt="Low Priority" className="active-sprint-priority-icon" />}
                        </div>
                        <span
                          className="active-sprint-task-code"
                          style={{
                            textDecoration: card.status === "Done" ? "line-through" : "none",
                            color: card.status === "Done" ? "#2665AC" : "#2665AC",
                          }}
                        >
                          {card.code}
                        </span>

                        <div className="active-sprint-task-stat-item">
                          <img src={comment} alt="Comments" className="active-sprint-task-stat-icon" />
                          <span>{card.stats.comments}</span>
                        </div>

                        <div className="active-sprint-task-stat-item">
                          <img src={subtask} alt="Subtasks" className="active-sprint-task-stat-icon" />
                          <span>{card.stats.subtasks}</span>
                        </div>

                        <div className="active-sprint-task-stat-item" style={{ display: "flex", alignItems: "center", gap: "4px", position: "relative" }}>
                          <img src={points} alt="Points" className="active-sprint-task-stat-icon" />
                          <span
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              color: "#2665AC",
                              fontSize: "12px",
                            }}
                          >
                            {card.stats.points}
                          </span>
                        </div>

                        <div className="active-sprint-task-stat-item" style={{ display: "flex", alignItems: "center", gap: "4px", position: "relative" }}>
                          <img src={effort} alt="Effort" className="active-sprint-task-stat-icon" />
                          <span
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              color: "#2665AC",
                              fontSize: "12px",
                            }}
                          >
                            {card.stats.effort}
                          </span>
                        </div>

                        <div className="active-sprint-task-assignee">
                          {card.assignee ? (
                            card.assignee.picture ? (
                              <img
                                src={card.assignee.picture}
                                alt={card.assignee.name}
                                className="active-sprint-task-assignee-avatar"
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "9999px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div
                                className="active-sprint-task-assignee-placeholder"
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  backgroundColor: "#2665AC",
                                  color: "white",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                  borderRadius: "9999px",
                                }}
                              >
                                {card.assignee.name.charAt(0).toUpperCase()}
                              </div>
                            )
                          ) : (
                            <div className="active-sprint-unassigned-tooltip-container">
                              <div
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "9999px",
                                  backgroundColor: "#F3F4F6",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <UserCircle2
                                  style={{
                                    color: "#2665AC",
                                    width: "20px",
                                    height: "20px",
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  marginLeft: "4px",
                                  color: "#2665AC",
                                  fontSize: "12px",
                                }}
                              >
                                Unassigned
                              </span>
                              <div className="active-sprint-unassigned-tooltip-content">No team member assigned to this task</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeleteConfirmation && (
        <div className="active-sprint-delete-modal" onClick={(e) => e.stopPropagation()}>
          <div className="active-sprint-delete-popup-container">
            <p className="active-sprint-delete-popup-message">Are you sure you want to delete {itemToDelete?.title}?</p>
            <div className="active-sprint-delete-popup-actions">
              <button className="active-sprint-yes-action-button" onClick={handleConfirmDelete}>
                Yes
              </button>
              <button className="active-sprint-no-action-button" onClick={handleClosePopup}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Presentation Popup */}
      {isPopupOpen && selectedIssue && (
        <div className="active-sprint-presentation-popup__overlay">
          <div className="active-sprint-presentation-popup__container">
            <div className="active-sprint-presentation-popup__header">
              <div className="active-sprint-presentation-popup__title-group">
                <div className="active-sprint-presentation-popup__title-wrapper">
                  <img src={icon} alt="Presentation icon" className="active-sprint-presentation-popup__icon" />
                  <div className="active-sprint-presentation-popup__title-container" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  {isEditingTitle ? (
    <input
      type="text"
      className="active-sprint-presentation-popup__title-edit"
      value={editedTitle}
      onChange={handleTitleChange}
      onKeyPress={handleTitleKeyPress}
      onBlur={() => setIsEditingTitle(false)}
      autoFocus
      style={{
        width: "100%",
        border: "none",
        background: "transparent",
        color: "#2665AC",
        outline: "none",
        borderBottom: "1px solid #2665AC",
        fontSize: "inherit",
        fontWeight: "inherit",
      }}
    />
  ) : (
    <h2
      ref={issuePopupTitleRef}
      className="active-sprint-presentation-popup__title"
      onMouseEnter={() => isIssuePopupOverflowing && setShowIssuePopupTooltip(true)}
      onMouseLeave={() => setShowIssuePopupTooltip(false)}
      onClick={() => handleTitleClick()}
    >
      {selectedIssue.title}
      {showIssuePopupTooltip && (
        <div className="sprint-issue-popup-title-tooltip">{selectedIssue.title}</div>
      )}
    </h2>
  )}
</div>
                </div>

                <div className="active-sprint-presentation-popup__status-group">
                <span className="active-sprint-presentation-popup__tag-group">
  <img
    src={selectedIssue.icon}
    alt="Type"
    style={{ width: "16px", height: "16px", cursor: "pointer" }}
    onClick={handleTypeIconClick}
  />
  {selectedIssue.code}

  {/* Type Dropdown */}
  {isTypeDropdownOpen && hasAccess && (
    <div
      className="active-sprint-presentation-popup__type-dropdown"
      style={{
        position: 'absolute',
        zIndex: 10,
        backgroundColor: 'white',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
        border: '1px solid #ddd',
        marginTop: '130px',
      }}
    >
      <div
        onClick={() => handleTypeChange('Story')}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          cursor: 'pointer',
          backgroundColor: selectedIssue.type === 'Story' ? '#D6E6F2' : 'transparent'
        }}
        onMouseEnter={(e) =>
          (e.target.style.backgroundColor = '#D6E6F2')
        }
        onMouseLeave={(e) =>
          (e.target.style.backgroundColor = 'transparent')
        }
      >
        <img src={story} alt="Story" style={{ width: "16px", height: "16px", marginRight: "8px" }} />
        Story
      </div>
      <div
        onClick={() => handleTypeChange('Task')}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          backgroundColor: selectedIssue.type === 'Task' ? '#D6E6F2' : 'transparent'
        }}
        onMouseEnter={(e) =>
          (e.target.style.backgroundColor = '#D6E6F2')
        }
        onMouseLeave={(e) =>
          (e.target.style.backgroundColor = 'transparent')
        }
      >
        <img src={task} alt="Task" style={{ width: "16px", height: "16px", marginRight: "8px" }} />
        Task
      </div>
      <div
        onClick={() => handleTypeChange('Bug')}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          cursor: 'pointer',
          backgroundColor: selectedIssue.type === 'Bug' ? '#D6E6F2' : 'transparent'
        }}
        onMouseEnter={(e) =>
          (e.target.style.backgroundColor = '#D6E6F2')
        }
        onMouseLeave={(e) =>
          (e.target.style.backgroundColor = 'transparent')
        }
      >
        <img src={bug} alt="Bug" style={{ width: "16px", height: "16px", marginRight: "8px" }} />
        Bug
      </div>
    </div>
  )}

  <img
    src={subtask}
    alt="Subtask"
    className="active-sprint-presentation-popup__subtask-icon"
  />
  <span>{subtasksCount}</span>
</span>


                  <div hidden={isButtonDisabled} className="active-sprint-presentation-popup__status-dropdown">
                    <button className="active-sprint-presentation-popup__status-btn" onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}>
                      {popupIssueStatus}
                      <ChevronDown
                        className="active-sprint-presentation-popup__chevron"
                        size={14}
                        style={{
                          transform: isStatusDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </button>

                    {isStatusDropdownOpen && (
                      <div className="active-sprint-presentation-popup__dropdown-menu" ref={statusChangeRef}>
                        {statusOptions.map((status) => (
                          <button key={status} className="active-sprint-presentation-popup__dropdown-item" onClick={() => handleStatusSelect(status)}>
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pin and Close Button Section */}
              <div
  className="active-sprint-presentation-popup__actions"
  style={{ display: "flex", alignItems: "center", gap: "10px" }}
>
  <button
    className="presentation-popup__pin-btn"
    style={{
      position: "relative",
      top: "20px",
      padding: "4px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
    onClick={handlePinCard}
  >
    <Pin
      size={20}
      stroke="currentColor"
      style={{
        transform: "rotate(45deg)",
        transition: "all 0.2s",
        fill: isPinned ? "#ED8A19" : "none",
        color: isPinned ? "#ED8A19" : "#2563eb",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.fill = "#ED8A19";
        e.currentTarget.style.color = "#ED8A19";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.fill = isPinned ? "#ED8A19" : "none";
        e.currentTarget.style.color = isPinned ? "#ED8A19" : "#2563eb";
      }}
    />
  </button>
  <button
    onClick={() => setIsPopupOpen(false)}
    className="active-sprint-presentation-popup__close-btn"
  >
    <X size={20} />
  </button>
</div>

            </div>

            {/* Description Section */}
            <div className="active-sprint-presentation-popup__content">
              <div className="active-sprint-presentation-popup__section_description">
                <h3 className="active-sprint-presentation-popup__section-description">Description</h3>
                {isEditingDescription ? (
                  <input
                    type="text"
                    className="active-sprint-presentation-popup__description"
                    value={description}
                    onChange={handleDescriptionChange}
                    onKeyPress={handleDescriptionKeyPress}
                    onBlur={() => setIsEditingDescription(false)}
                    autoFocus
                    disabled={isButtonDisabled}
                    style={{
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      borderBottom: "1px solid #2665AC",
                    }}
                  />
                ) : (
                  <p className="active-sprint-presentation-popup__description" onClick={handleDescriptionClick}>
                    {description || "No description available"}
                  </p>
                )}
              </div>

              {/* Subtask Section */}
              <div className="active-sprint-presentation-popup__section_subtask">
                <div className="active-sprint-presentation-popup__subtask-header">
                  <h3 className="active-sprint-presentation-popup__section-subtask">Subtasks</h3>
                  <button className="active-sprint-presentation-popup__create-btn"  hidden={isButtonDisabled} onClick={handleCreateSubtask}>
                    + Create Subtask
                  </button>
                </div>

                <div className="active-sprint-presentation-popup__subtask-list">
                  {subtasks.map((subtask) => (
                    <div key={subtask.id} className="active-sprint-presentation-popup__subtask-item">
                      <img src={inputSubtaskIcon} alt="Task icon" className="active-sprint-presentation-popup__subtask-icon" />
                      <div className="active-sprint-presentation-popup__subtask-content">
                        {editingSubtaskId === subtask.id ? (
                          <>
                            <div className="active-sprint-presentation-popup__subtask-content">
                              <input
                                disabled ={isButtonDisabled}
                                type="text"
                                value={editingSubtaskTitle}
                                onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                className="active-sprint-presentation-popup__input"
                                autoFocus
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleUpdateSubtask();
                                  }
                                }}
                                style={{ width: "100%" }}
                              />
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginLeft: "auto",
                              }}
                            >
                              <button
                            
                              hidden ={isButtonDisabled}
                                onClick={handleUpdateSubtask}
                                className="active-sprint-presentation-popup__update-subtask-btn"
                                style={{
                                  padding: "4px 8px",
                                  backgroundColor: "#2665AC",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  transition: "background-color 0.3s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1976d2")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2665AC")}
                              >
                                Update
                              </button>
                              <button
                                hidden ={isButtonDisabled}
                                onClick={handleCancelEditSubtask}
                                className="active-sprint-presentation-popup__cancel-edit-subtask-btn"
                                style={{
                                  padding: "4px 8px",
                                  backgroundColor: "#2665AC",
                                  color: "white",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  transition: "background-color 0.3s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1976d2")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2665AC")}
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="active-sprint-presentation-popup__subtask-content">
                              <span className="active-sprint-presentation-popup__subtask-title" onDoubleClick={() => handleEditSubtask(subtask)}>
                                {subtask.title}
                              </span>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
  {!isButtonDisabled && (
    <>
      <Pencil
        size={16}
        color="#2665AC"
        style={{
          cursor: "pointer",
          opacity: 0.7,
          transition: "opacity 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
        onClick={() => handleEditSubtask(subtask)}
      />
      <Trash2
        size={16}
        color="#2665AC"
        style={{
          cursor: "pointer",
          opacity: 0.7,
          transition: "opacity 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
        onClick={() => handleDeleteSubtask(subtask.id)}
      />
    </>
  )}
</div>

                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {isCreatingSubtask && (
                    <div className="active-sprint-presentation-popup__subtask-input-container" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div className="active-sprint-presentation-popup__subtask-input" style={{ display: "flex", alignItems: "center" }}>
                        <img src={inputSubtaskIcon} alt="Subtask" className="active-sprint-presentation-popup__subtask-icon" />
                        <input
                          type="text"
                          placeholder="What needs to be addressed?"
                          className="active-sprint-presentation-popup__input"
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSubmitSubtask();
                            }
                          }}
                          autoFocus
                          style={{ width: "100%" }}
                        />
                      </div>
                      <div
                        className="active-sprint-presentation-popup__subtask-buttons"
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginLeft: "auto",
                        }}
                      >
                        <button 
  className="active-sprint-presentation-popup__create-subtask-btn"
  onClick={handleSubmitSubtask}
  disabled={isSubmittingSubtask}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#2665AC",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: isSubmittingSubtask ? "not-allowed" : "pointer",
                            opacity: isSubmittingSubtask ? 0.7 : 1,
                            fontSize: "12px",
                            transition: "background-color 0.3s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1976d2")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2665AC")}
                        >
                          {isSubmittingSubtask ? "Creating..." : "Create"}
                        </button>
                        <button
                          onClick={handleCancelSubtask}
                          className="active-sprint-presentation-popup__cancel-subtask-btn"
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#2665AC",
                            color: "white",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            transition: "background-color 0.3s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1976d2")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2665AC")}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="active-sprint-presentation-popup__section">
                <h3 className="active-sprint-presentation-popup__section-title">Details</h3>
                <div className="active-sprint-presentation-popup__details-list">
                  {/* Story Points Section */}
                  <div className="active-sprint-presentation-popup__detail-item">
                    <span className="active-sprint-presentation-popup__detail-label">Story Points</span>
                    <div className="active-sprint-presentation-popup__user">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                        disabled={isButtonDisabled}
                          type="text"
                          value={pointsCount}
                          onChange={(e) => setPointsCount(e.target.value)}
                          onBlur={handlePointsBlur}
                          placeholder="Enter points"
                          style={{
                            border: "none",
                            padding: "4px",
                            color: "#2665AC",
                            fontSize: "14px",
                            outline: "none",
                            background: "transparent",
                            width: "100px",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Effort Section */}
                  <div className="active-sprint-presentation-popup__detail-item">
                    <span className="active-sprint-presentation-popup__detail-label">Effort</span>
                    <div className="active-sprint-presentation-popup__user">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                        disabled={isButtonDisabled}
                          type="text"
                          value={effortCount}
                          onChange={(e) => setEffortCount(e.target.value)}
                          onBlur={handleEffortBlur}
                          placeholder="Enter effort"
                          style={{
                            border: "none",
                            padding: "4px",
                            color: "#2665AC",
                            fontSize: "14px",
                            outline: "none",
                            background: "transparent",
                            width: "100px",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Priority section */}
                  <div className="active-sprint-presentation-popup__detail-item">
  <span className="active-sprint-presentation-popup__detail-label">Priority</span>
  <div className="active-sprint-presentation-popup__user active-sprint-priority-dropdown" style={{ position: "relative" }}>
    <div
      onClick={() => !isButtonDisabled && setPopupShowPriorityDropdown(!showPopupPriorityDropdown)} // Disable onClick if isButtonDisabled
      style={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer", // No change to cursor
        gap: "8px",
        color: "#2665AC",
      }}
    >
      <img src={getPriorityIcon(priority)} alt={`${priority} priority`} />
      <span style={{ textTransform: "capitalize" }}>{priority}</span>
      <ChevronDown
                            size={14}
                            style={{
                              transform: showPopupPriorityDropdown ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}
                            />
                          </div>

    {showPopupPriorityDropdown && (
      <div
      ref={priorityChangeRef}
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          backgroundColor: "white",
          border: "1px solid #e1e1e1",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          zIndex: 1000,
          padding: "8px",
          width: "120px",
        }}
      >
        {priorityOptions.map((option) => (
          <div
            key={option.value}
            onClick={() => !isButtonDisabled && handlePriorityChange(option.value)} // Disable onClick if isButtonDisabled
            style={{
              padding: "8px",
              cursor: "pointer", // No change to cursor
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#2665AC",
              backgroundColor: priority === option.value ? "#D6E6F2" : "transparent",
              borderRadius: "4px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D6E6F2")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = priority === option.value ? "#D6E6F2" : "transparent")}
          >
            <img src={option.icon} alt={`${option.label} priority`} />
            {option.label}
          </div>
        ))}
      </div>
    )}
  </div>
</div>

{/* Assignee section */}
<div className="active-sprint-presentation-popup__detail-item">
  <span className="active-sprint-presentation-popup__detail-label">Assignee</span>
  <div className="active-sprint-presentation-popup__user active-sprint-assignee-dropdown" style={{ position: "relative" }}>
    <div
      className="active-sprint-presentation-popup__user-toggle"
      onClick={() => !isButtonDisabled && setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)} // Disable onClick if isButtonDisabled
      style={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer", // No change to cursor
        gap: "8px",
      }}
    >
      {selectedIssue.assignee?.picture ? (
        <img src={selectedIssue.assignee.picture} alt={selectedIssue.assignee.name} className="active-sprint-presentation-popup__user-avatar" />
      ) : (
        <div
          className="active-sprint-presentation-popup__user-avatar"
          style={{
            backgroundColor: "#2665AC",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            fontSize: "12px",
            fontWeight: "500",
          }}
        >
          {selectedIssue.assignee?.name ? selectedIssue.assignee.name.charAt(0).toUpperCase() : "UN"}
        </div>
      )}
      <span className="active-sprint-presentation-popup__user-name">{selectedIssue.assignee?.name || "Unassigned"}</span>
    </div>

    {isAssigneeDropdownOpen && (
      <div
      ref={assigneeChangeRef}
        className="active-sprint-presentation-popup__assignee-dropdown"
        style={{
          position: "absolute",
          top: "100%",
          left: "-28px",
          width: "250px",
          backgroundColor: "white",
          border: "1px solid #e1e1e1",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          zIndex: 1000,
          padding: "8px",
          maxHeight: "180px",
        }}
      >
        <div
          className="active-sprint-presentation-popup__search"
          style={{
            marginBottom: "8px",
            position: "relative",
          }}
        >
          <input
            type="text"
            value={assigneeSearchTerm}
            onChange={(e) => setAssigneeSearchTerm(e.target.value)}
            placeholder="Search"
            className="active-sprint-presentation-popup__search-input"
            style={{
              width: "100%",
              padding: "8px",
              paddingLeft: "15px",
              border: "1px solid #e1e1e1",
              borderRadius: "4px",
              marginBottom: "4px",
              color: "#2665AC",
              transition: "border-color 0.2s",
            }}
            disabled={isButtonDisabled} // Disable input when isButtonDisabled is true
          />
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "200px",
              top: "45%",
              transform: "translateY(-50%)",
              color: "#2665AC",
              pointerEvents: "none",
            }}
          />
        </div>
        <div
          className="active-sprint-presentation-popup__user-list"
          style={{
            maxHeight: "100px",
            overflowY: "auto",
          }}
        >
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => !isButtonDisabled && handleAssigneeSelect(user)} // Disable onClick if isButtonDisabled
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px",
                cursor: "pointer", // No change to cursor
                gap: "8px",
                borderRadius: "4px",
                color: "#2665AC",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D6E6F2")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <div
                  style={{
                    backgroundColor: "#2665AC",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span>{user.name}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
</div>


                  <div className="active-sprint-presentation-popup__detail-item">
                    <span className="active-sprint-presentation-popup__detail-label">Reporter</span>
                    <div className="active-sprint-presentation-popup__user">
                      <img src={masterIcon} alt={scrumMaster} className="active-sprint-presentation-popup__user-avatar" />
                      <span className="active-sprint-presentation-popup__user-name">{scrumMaster}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="active-sprint-presentation-popup__section_comment">
                <div className="active-sprint-presentation-popup__comment-header">
                  <h3 className="active-sprint-presentation-popup__section-comment">
                    {parseInt(commentCount)} {parseInt(commentCount) === 1 ? "Comment" : "Comments"}
                  </h3>
                  <div className="active-sprint-presentation-popup__sort-dropdown" style={{ position: "relative" }}>
                    <button
                      className="active-sprint-presentation-popup__sort-btn"
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      style={{
                        color: "#2665AC",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        marginBottom: "0.4rem",
                      }}
                    >
                      Sort by date: {selectedSort}
                      <ChevronDown
                        size={14}
                        style={{
                          transform: isSortDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </button>

                    {isSortDropdownOpen && (
                      <div
                      ref={sortChangeRef}
                        className="active-sprint-presentation-popup__dropdown-menu"
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "80%",
                          background: "white",
                          border: "1px solid #e1e1e1",
                          borderRadius: "4px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          zIndex: 10,
                        }}
                      >
                        {sortOptions.map((sort) => (
                          <button
                            key={sort}
                            className="active-sprint-presentation-popup__dropdown-item"
                            onClick={() => handleSortSelect(sort)}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "8px 16px",
                              textAlign: "left",
                              border: "none",
                              cursor: "pointer",
                              color: selectedSort === sort ? "#2665AC" : "#2665AC",
                              hover: {
                                backgroundColor: selectedSort === sort ? "#D6E6F2" : "white",
                              },
                            }}
                          >
                            {sort}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="active-sprint-presentation-popup__comment-section">
                {!isDone && (
        <div
          className="active-sprint-presentation-popup__comment-input"
          style={{
            marginBottom: "16px",
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          {masterIcon ? (
            <img
              src={userPicture}
              alt={scrumMaster}
              className="active-sprint-presentation-popup__user-avatar"
              style={{
                width: "32px",
                height: "32px",
                marginRight: "8px",
                borderRadius: "50%",
              }}
            />
          ) : (
            <div
              className="active-sprint-presentation-popup__user-avatar"
              style={{
                backgroundColor: "#2665AC",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                fontSize: "14px",
                fontWeight: "500",
                flexShrink: 0,
                marginRight: "8px",
              }}
            >
              {scrumMaster.charAt(0).toUpperCase()}
            </div>
          )}
          <input
            type="text"
            placeholder="Add a comment"
            className="active-sprint-presentation-popup__comment-field"
            value={newComment}
            onChange={handleCommentChange}
            onKeyPress={handleCommentSubmit}
          />
          {newComment.trim() && (
            <button
              onClick={handleCommentSubmit}
              disabled={isSubmittingComment}
              style={{
                padding: "8px 12px",
                backgroundColor: "#2665AC",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isSubmittingComment ? "not-allowed" : "pointer",
                opacity: isSubmittingComment ? 0.7 : 1,
                fontSize: "12px",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1976d2")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2665AC")}
            >
              {isSubmittingComment ? "Sending..." : "Send"}
            </button>
          )}
        </div>
      )}

                  <div
                    className="active-sprint-presentation-popup__comment-list"
                    style={{
                      overflowY: "auto",
                      maxHeight: "80px",
                      gap: "8px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {(comments[selectedIssue?.id] || []).map((comment) => (
                      <div
                        key={comment.id}
                        className="active-sprint-presentation-popup__comment"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          position: "relative",
                        }}
                      >
                        {masterIcon ? (
                          <img
                            src={comment.avatar}
                            alt={scrumMaster}
                            className="active-sprint-presentation-popup__user-avatar"
                            style={{
                              width: "32px",
                              height: "32px",
                              marginRight: "8px",
                              borderRadius: "50%",
                            }}
                          />
                        ) : (
                          <div
                            className="active-sprint-presentation-popup__user-avatar"
                            style={{
                              backgroundColor: "#2665AC",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              fontSize: "14px",
                              fontWeight: "500",
                              marginRight: "8px",
                            }}
                          >
                            {scrumMaster.charAt(0).toUpperCase()}
                          </div>
                        )}
                      <div className="active-sprint-presentation-popup__comment-content" style={{ flex: 1 }}>
  <div className="active-sprint-presentation-popup__comment-header">
    <span className="active-sprint-presentation-popup__comment-author"  onClick={() => handleProfileNavigation({
                        memberId: comment.authorId,
                        name: comment.author,
                        img: comment.avatar
                    })}>{comment.author}</span>
    <span className="active-sprint-presentation-popup__comment-time">{comment.timestamp}</span>
    {!isDone && comment.authorId === uid && ( // Check if the logged-in user is the author
      <Trash2
        size={16}
        color="#2665AC"
        style={{
          cursor: "pointer",
          opacity: 0.7,
          transition: "opacity 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
        onClick={() => handleDeleteComment(comment.id)}
      />
    )}
  </div>
  <p className="active-sprint-presentation-popup__comment-text">{comment.content}</p>
</div>

                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCommentDeleteConfirmation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <h3 style={{ color: "#2665AC", marginBottom: "10px" }}>Delete Comment</h3>
            <p style={{ color: "#3A74B4", marginBottom: "20px" }}>Are you sure you want to delete this comment?</p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={cancelDeleteComment}
                disabled={isDeletingComment}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#1976d2")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#2665AC")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#2665AC",
                  color: "white",
                  border: "none",
                  borderRadius: "9999px",
                  cursor: isDeletingComment ? "not-allowed" : "pointer",
                  opacity: isDeletingComment ? 0.7 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteComment}
                disabled={isDeletingComment}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#1976d2")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#2665AC")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#2665AC",
                  color: "white",
                  border: "none",
                  borderRadius: "9999px",
                  cursor: isDeletingComment ? "not-allowed" : "pointer",
                  opacity: isDeletingComment ? 0.7 : 1,
                }}
              >
                {isDeletingComment ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubtaskDeleteConfirmation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <h3 style={{ color: "#2665AC", marginBottom: "10px" }}>Delete Subtask</h3>
            <p style={{ color: "#3A74B4", marginBottom: "20px" }}>Are you sure you want to delete this subtask?</p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={cancelDeleteSubtask}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#1976d2")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#2665AC")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#2665AC",
                  color: "white",
                  border: "none",
                  borderRadius: "9999px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSubtask}
                disabled={isDeletingSubtask}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#1976d2")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#2665AC")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#2665AC",
                  color: "white",
                  border: "none",
                  borderRadius: "9999px",
                  cursor: isDeletingSubtask ? "not-allowed" : "pointer",
                  opacity: isDeletingSubtask ? 0.7 : 1
                }}
              >
                {isDeletingSubtask ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Popup */}
      {showMembersPopup && (
        <div className="active-sprint-members-popup-overlay">
          <div className="active-sprint-members-popup-container">
            <div className="active-sprint-members-popup-header">
              <h3 className="active-sprint-members-popup-title">Members</h3>
              <button onClick={() => setShowMembersPopup(false)} className="active-sprint-members-popup-close">
                <X size={20} />
              </button>
            </div>
            <div className="active-sprint-members-list">
              {members.map((member, index) => (
                <div key={index} className="active-sprint-member-item" 
                onMouseEnter={() => setHoveredActSprintMember(index)}
                onMouseLeave={() => setHoveredActSprintMember(null)}>
                  {member.img ? (
                    <img src={member.img} alt={member.name} className="active-sprint-member-avatar" />
                  ) : (
                    <div
                      style={{
                        backgroundColor: "rgb(38, 101, 172)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "9999px",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="active-sprint-member-text">
                    <span className="active-sprint-member-name" onClick={() => handleProfileNavigation(member)}>{member.name}</span>
                    <span className="active-sprint-member-role">{member.role}</span>
                  </div>

                  {showRemoveIcon(member, index) && (
              <img
                src={RemoveMemberIcon}
                alt="Remove Member"
                className="remove-member-icon-actsprint"
                onClick={() => handleRemoveMemberClick(member)}
                style={{
                  cursor: "pointer",
                  width: "17px",
                  height: "17px",
                  marginLeft: "auto",
                }}
              />
            )}
                </div>
              ))}
            </div>
          </div>


          {showRemoveActSprintPopup && (
      <div className="remove-popup-overlay-actsprint">
        <div className="remove-popup-container-actsprint">
          <div className="remove-popup-body-actsprint">
            <p>
              Are you sure you want to remove {selectedActSprintMember?.name} from the
              project?
            </p>
          </div>
          <div className="remove-popup-actions-actsprint">
            <button onClick={handleConfirmRemoveSprint}>Yes</button>
            <button onClick={handleCancelRemove}>No</button>
          </div>
        </div>
      </div>
    )}



{/* Removal Success Popup */}
{showRemovalSuccessPopup && (
    <div className="sprint-remove-popup-overlay">
      <div className="sprint-remove-popup-modal">
        <img src={successPopup} alt="Success" className="sprint-remove-popup-icon" />
        <p className="sprint-remove-popup-message">{removalSuccessMessage}</p>
        <button 
          className="sprint-remove-popup-button" 
          onClick={() => setShowRemovalSuccessPopup(false)}
        >
          OK
        </button>
      </div>
    </div>
  )}

  {/* Removal Error Popup */}
  {showRemovalErrorPopup && (
    <div className="sprint-remove-popup-overlay">
      <div className="sprint-remove-popup-modal">
        <img src={errorPopup} alt="Error" className="sprint-remove-popup-icon" />
        <p className="sprint-remove-popup-error-message">{removalErrorMessage}</p>
        <button 
          className="sprint-remove-popup-error-button" 
          onClick={() => setShowRemovalErrorPopup(false)}
        >
          OK
        </button>
      </div>
    </div>
  )}



        </div>
      )}

      {/* Member Invite Modal */}
      {showMemberInviteModal && (
            <div className="backlog-member-modal-overlay">
              <div className="backlog-member-modal-container">
                <h3 className="backlog-member-modal-title">Invite Member</h3>

                <div className="backlog-member-email-input-section">
                  <div className="backlog-member-email-input-container">
                    <div className="backlog-member-email-input-wrapper">
                      <input type="email" placeholder="Invite others by Email" className="backlog-member-email-input" />

                    </div>
                    <button className="backlog-member-invite-button" onClick={handleInviteClick}>
                      Invite
                    </button>
                  </div>
                </div>

                {showSuccessPopup && (
  <div className="sprint-invite-popup-overlay">
    <div className="sprint-invite-popup-modal">
      <img src={successPopup} alt="Success" className="sprint-invite-popup-icon" />
      <p className="sprint-invite-popup-message">
        {popupMessage}
      </p>
      <button 
        className="sprint-invite-popup-button" 
        onClick={() => setShowSuccessPopup(false)}
      >
        OK
      </button>
    </div>
  </div>
)}

{showErrorPopup && (
  <div className="sprint-invite-popup-overlay">
    <div className="sprint-invite-popup-modal">
      <img src={errorPopup} alt="Error" className="sprint-invite-popup-icon" />
      <p className="sprint-invite-popup-error-message">{popupMessage}</p>
      <button 
        className="sprint-invite-popup-error-button" 
        onClick={() => setShowErrorPopup(false)}
      >
        OK
      </button>
    </div>
  </div>
)}

                <div className="backlog-member-list">
                  <div className="backlog-member-list-item" onClick={() => setShowMemberDetails(true)}>
                    <div className="backlog-member-info">
                      <div className="backlog-member-images">
                        {members.slice(0, 2).map((member, index) =>
                          member.img ? (
                            <img
                              key={index}
                              src={member.img}
                              alt={member.name}
                              style={{
                                width: "2rem",
                                height: "2rem",
                                borderRadius: "9999px",
                                marginRight: "-8px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              key={index}
                              style={{
                                backgroundColor: "rgb(38, 101, 172)",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "2rem",
                                height: "2rem",
                                borderRadius: "9999px",
                                fontSize: "14px",
                                fontWeight: "500",
                                marginRight: "-8px",
                              }}
                            >
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          ),
                        )}
                        {members.length > 2 && (
                          <div className="backlog-member-image-count">
                            <span className="backlog-member-image-count-text">+{members.length - 2}</span>
                          </div>
                        )}
                      </div>
                      <span className="backlog-member-names">
                        {members
                          .slice(0, 2)
                          .map((member) => member.name)
                          .join(", ")}
                        {members.length > 2 && ` and ${members.length - 2} Others`}
                      </span>
                    </div>
                    <svg className="backlog-member-arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <button onClick={() => setShowMemberInviteModal(false)} className="backlog-member-close-button">
                  <span className="backlog-member-close-icon">×</span>
                </button>
              </div>
            </div>
          )}

      {/* Member Details Modal */}
      {showMemberDetails && (
        <div className="active-sprint-members-popup-overlay">
          <div className="active-sprint-member-modal-container">
            <div className="active-sprint-member-details-header">
              <div className="active-sprint-member-details-title-group">
                <button
                  onClick={() => {
                    setShowMemberDetails(false);
                    setShowMemberInviteModal(true);
                  }}
                  className="active-sprint-member-back-button"
                >
                  <ArrowLeft size={15} style={{ marginTop: "2px" }} />
                </button>
                <h3 className="active-sprint-member-details-title">Members</h3>
              </div>
              <button onClick={handleCopy} className="active-sprint-member-copy-link-button">
                <span>Copy Link</span>
                <Link size={16} />
                {showCopyTooltip && <span className="active-sprint-member-copy-tooltip">Copied!</span>}
              </button>
            </div>

            <div className="active-sprint-member-details-list">
              {members.map((member, index) => (
                <div key={index} className="active-sprint-member-details-item">
                  <div className="active-sprint-member-details-info">
                    {member.img ? (
                      <img
                        src={member.img}
                        alt={member.name}
                        className="active-sprint-member-details-image"
                        style={{
                          width: "2.5rem",
                          height: "2.5rem",
                          borderRadius: "9999px",
                        }}
                      />
                    ) : (
                      <div
                        className="active-sprint-member-placeholder"
                        style={{
                          backgroundColor: "rgb(38, 101, 172)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "2.5rem",
                          height: "2.5rem",
                          borderRadius: "9999px",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="active-sprint-member-details-text">
                      <span className="active-sprint-member-details-name">{member.name}</span>
                      <span className="active-sprint-member-details-role">{member.role || "Team Member"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActiveSprint;
