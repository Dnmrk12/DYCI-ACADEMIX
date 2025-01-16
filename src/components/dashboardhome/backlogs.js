import React, { useState, useEffect ,useRef} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Users, MoreHorizontal, Clock, Plus, ChevronDown, Copy, Calendar, X, Link, Pencil, ArrowLeft, UserCircle2, Search, Trash2 } from "lucide-react";
import searchIcon from "./iconshomepage/magnifyingglass.png";
import img1 from "./iconshomepage/memberIcon1.png";
import img2 from "./iconshomepage/memberIcon2.png";
import img3 from "./iconshomepage/memberIcon3.png";
import img4 from "./iconshomepage/francoProfile.png";
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
import days from "./iconshomepage/daysRemaining.png";
import inputSubtaskIcon from "./iconshomepage/versionupdate.png";
import successPopup from "./iconshomepage/successPopup.png";
import RemoveMemberIcon from './iconshomepage/RemoveMember.png'; 
import errorPopup from "./iconshomepage/errorPopup.png";
import "./backlogs.css";
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
const Backlogs = () => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const navigate = useNavigate();
  const { memberId } = useParams(); // Get memberId from URL
  const { projectId } = useParams();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeMoreOptions, setActiveMoreOptions] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedSource, setDraggedSource] = useState(null);
  const [showMemberInviteModal, setShowMemberInviteModal] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [subtasksByIssue, setSubtasksByIssue] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [subtasksCount, setSubtasksCount] = useState("0");
  const [commentCount, setCommentCount] = useState("0");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [issueComments, setIssueComments] = useState({});
  const [showSubtaskDeleteConfirmation, setShowSubtaskDeleteConfirmation] = useState(false);
  const [subtaskToDelete, setSubtaskToDelete] = useState(null);
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");
  const [selectedRole, setSelectedRole] = useState("Select Role");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roles = ["Team Member"];
  const [effortCount, setEffortCount] = useState("0");
  const [pointsCount, setPointsCount] = useState("0");
  const [priority, setPriority] = useState("low");
  const [showPopupPriorityDropdown, setPopupShowPriorityDropdown] = useState(false);
  const [showNoIssuesPopup, setShowNoIssuesPopup] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  // Add new state for delete confirmation
  const auth = getAuth();
  const uid = auth.currentUser ? auth.currentUser.uid : null; // safely check for null if user is not logged in
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSprintIssue, setIsSprintIssue] = useState(false);
  // Get initial data from location state
  const gen = (name) => {
    if (!name) return ""; // Add safeguard to check for undefined or null name
    return name
      .split(" ") // Split the name into words
      .map((word) => word.charAt(0).toUpperCase()) // Take the first letter of each word and capitalize it
      .join("") // Join the letters together
      .substring(0, 3); // Take the first 3 characters
  };
  const storedProjectDetails = JSON.parse(localStorage.getItem('selectedProject')) || {};

  // Prioritize location state, then fall back to localStorage
  const projectName = location.state?.projectName || storedProjectDetails.projectName || "";
  const key = location.state?.key || storedProjectDetails.key || "";
  const startDate = location.state?.startDate || storedProjectDetails.startDate || "";
  const startTime = location.state?.startTime || storedProjectDetails.startTime || "";
  const endDate = location.state?.endDate || storedProjectDetails.endDate || "";
  const endTime = location.state?.endTime || storedProjectDetails.endTime || "";
  const icon = location.state?.icon || storedProjectDetails.icon || "";
  const scrumMaster = location.state?.scrumMaster || storedProjectDetails.scrumMaster || "";
  const masterIcon = location.state?.masterIcon || storedProjectDetails.masterIcon || "";

  const scrumId = location.state?.id || storedProjectDetails.id;
  const issueId = selectedIssue?.id; // Get the selected issue ID safely
  const dropdownRef = useRef(null);
  const iconRef = useRef(null);

  const [allow, setAllow] = useState(false);
// Add these state variables to your existing state declarations
const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [showCommentDeleteConfirmation, setShowCommentDeleteConfirmation] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const [showInviteSuccessPopup, setShowInviteSuccessPopup] = useState(false);
const [showInviteErrorPopup, setShowInviteErrorPopup] = useState(false);
const [errorInviteMessage, setErrorInviteMessage] = useState('');

  const [timeRemaining, setTimeRemaining] = useState("");


  const [userPicture, setUserPicture] = useState(null);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();

  const [members, setMembers] = useState(() => {
    const storedProject = JSON.parse(localStorage.getItem('selectedProject')) || {};
    return storedProject.members || [];
  });

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

const [users, setUsers] = useState(
    members.map((member) => ({
      id: member.memberId,
      name: member.name,
      avatar: member.img,
    }))
  );
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
  const sortOptions = ["Newest First", "Oldest First"];
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showStartSprintPopup, setShowStartSprintPopup] = useState(false);
  const [sprintFormData, setSprintFormData] = useState({
    projectName: projectName,
    startDate: startDate,
    startTime: startTime,
    endDate: endDate,
    endTime: endTime,
  });


  useEffect(() => {
    if (scrumId) {
      console.log("Received Scrum ID:", scrumId);
      // Use scrumId for API calls or state updates
    }
  }, [scrumId]);
  const DateTimePicker = ({ label, date, time, onDateChange, onTimeChange }) => {
    const [showTimePicker, setShowTimePicker] = useState(false);
    const timePickerRef = useRef(null);
    
    // Close time picker when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
          setShowTimePicker(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
  
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
  
    return (
      <div className="start-sprint-date-group">
        <p className="start-sprint-date-label">{label}</p>
        <div className="start-sprint-date-row">
          <div className="start-sprint-date-input-container">
            <input 
              type="date" 
              value={date} 
              onChange={(e) => onDateChange(e.target.value)} 
              className="start-sprint-date-input"
            />
            <Calendar className="start-sprint-calendar-icon" size={16} />
          </div>
          <div ref={timePickerRef} className="time-picker-container">
            <button 
              type="button" 
              className="start-sprint-time-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTimePicker(!showTimePicker);
              }}
            >
              {time ? formatTimeToAMPM(time) : "Set Time"}
            </button>
  
            {showTimePicker && (
              <div 
                className="start-sprint-time-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                {timeOptions.map((time24) => (
                  <button
                    key={time24}
                    type="button"
                    onClick={() => {
                      onTimeChange(time24);
                      setShowTimePicker(false);
                    }}
                    className="start-sprint-time-dropdown-option"
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

 const handleStartSprintClick = async () => {
  // Get the document reference for the current scrum
  const scrumDocRef = doc(getFirestore(), `Scrum/${scrumId}`);

  try {
    // Fetch the document data
    const scrumDocSnapshot = await getDoc(scrumDocRef);

    if (scrumDocSnapshot.exists()) {
      const scrumData = scrumDocSnapshot.data();
      
      // Check if startSprintDate is false
      if (scrumData.startSprint === false) {
        console.log("Start Sprint Date is false. Popup won't open.");
        return; // Prevent popup from opening
      }

      console.log("Filtered Sprint Issues Length:", filteredSprintIssues.length);

      if (filteredSprintIssues.length === 0) {
        // If no issues, show the no issues popup
        setShowNoIssuesPopup(true);
      } else {
        // If issues exist, open the start sprint popup
        setShowStartSprintPopup(true);
      }
    } else {
      console.log("Scrum document does not exist.");
    }
  } catch (error) {
    console.error("Error fetching scrum document:", error);
  }
};
  // Handle start sprint submission
  const handleStartSprintSubmit = async (e) => {
    e.preventDefault();
  
    const db = getFirestore();  // Make sure you're initializing Firestore
    const now = new Date();  // Define 'now' to get the current date and time
  
    try {
      // Loop over filteredSprintIssues to retrieve the issueStatus for each issue
      const updatedIssues = await Promise.all(
        filteredSprintIssues.map(async (issue) => {
          const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issue.code}`);
  
          // Fetch the document to get the issueStatus
          const issueDocSnapshot = await getDoc(issueDocRef);
  
          if (issueDocSnapshot.exists()) {
            const issueData = issueDocSnapshot.data();
            const issueStatus = issueData.issueStatus;
            const status = issueData.status;
  
            // Add issueStatus and status to the issue object
            return {
              ...issue,
              issueStatus,
              status,
            };
          } else {
            console.log(`Issue with code ${issue.code} not found.`);
            return issue; // Return the issue without modification if not found
          }
        })
      );
  
      // Firestore document reference for Scrum
      const scrumDocRef = doc(db, "Scrum", scrumId);
  
      // Format current date and time for startsprintDate
      const startSprintDate = now.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true, // For AM/PM format
      }).replace(',', ''); // Removes the comma after the day

      // Store in localStorage
    localStorage.setItem('startsprintDate', startSprintDate);
  
      // Update Firestore with the new sprint dates and times
      await updateDoc(scrumDocRef, {
        startDate: sprintFormData.startDate,
        startTime: sprintFormData.startTime,
        endDate: sprintFormData.endDate,
        endTime: sprintFormData.endTime,
        startSprint: false,
        startsprintDate: startSprintDate,
      });
  
      console.log("Sprint dates, times, and issue statuses updated successfully!");
  
      // Log the retrieved issueStatus (from the first issue, or any issue)
      console.log("Issue Status for first issue:", updatedIssues[0]?.issueStatus);
      console.log("Issue Status for second issue:", updatedIssues[0]?.status);
  
      // Navigate to ActiveSprint and pass the necessary details
      navigate("/activesprint", {
        state: {
          projectName: projectName,
          members: members,
          masterIcon: masterIcon,
          scrumMaster: scrumMaster,
          key: key,
          icon: icon,
          startDate: sprintFormData.startDate,
          startTime: sprintFormData.startTime,
          endDate: sprintFormData.endDate,
          issueStatus: sprintFormData.issueStatus,
          status: sprintFormData.status, // Pass the issueStatus value from the form (if needed)
          endTime: sprintFormData.endTime,
          scrumId: location.state?.id,
          sprintIssues: updatedIssues.map((issue) => ({
            id: issue.id,
            description: issue.description,
            title: issue.title,
            type: issue.type,
            icon: issue.icon,
            code: issue.code,
            priority: issue.priority,
            subtasks: issue.subtasks || [], // Include subtasks
            stats: issue.stats || {
              comments: 0,
              subtasks: 0,
              points: 0,
              effort: 0,
            },
            assignee: issue.assignee || null,
            issueStatus: issue.issueStatus || "Unknown", // Add issueStatus to the issue object
            status: issue.status,
          })),
        },
      });
  
      setShowStartSprintPopup(false); // Close the start sprint popup
  
    } catch (error) {
      console.error("Error updating sprint details in Firestore:", error);
      setShowErrorPopup(true);
      setErrorMessage("Failed to update sprint details. Please try again.");
    }
  };

 
  // Function to generate a unique ID
  const generateUniqueId = () => {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  };

  // Function to handle comment input change
  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  // Function to handle comment submission
  const fetchAuthorDetails = async (authorId) => {
    try {
      const authorRef = doc(db, "users", authorId);
      const authorSnap = await getDoc(authorRef);

      if (authorSnap.exists()) {
        const authorData = authorSnap.data();
        return {
          firstName: authorData.firstName || "",
          lastName: authorData.lastName || "",
          avatar: authorData.userPicture || "",
          fullName: `${authorData.firstName} ${authorData.lastName}`.trim(),
        };
      }
      return {
        firstName: "",
        lastName: "",
        avatar: "",
        fullName: "",
      };
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

// Updated handleCommentSubmit function with submission prevention
const handleCommentSubmit = async (e) => {
    const auth = getAuth();
    const uid = auth.currentUser?.uid;

    if ((e.type === "keypress" && e.key === "Enter") || e.type === "click") {
        if (newComment.trim() && selectedIssue && !isSubmittingComment) {
            setIsSubmittingComment(true);
            const commentId = generateUniqueId();
            const issueId = selectedIssue.id;

            try {
                const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`);
                const issueSnap = await getDoc(issueDocRef);
                const issueData = issueSnap.data();
                const currentCommentCount = issueData?.stats?.comments || 0;

                const assigneeId = issueData?.assignee?.assignId;
                const scrumMasterId = issueData?.scrumMaster;
                let receiverId = [];

                if (uid === scrumMasterId) {
                    receiverId = [assigneeId];
                } else if (uid === assigneeId) {
                    receiverId = [scrumMasterId];
                } else {
                    receiverId = [scrumMasterId, assigneeId];
                }

                const newCommentCount = currentCommentCount + 1;

                const commentToAdd = {
                    id: commentId,
                    authorId: uid,
                    content: newComment.trim(),
                    dateCreated: new Date(),
                    timestamp: formatTimestamp(new Date()),
                    commentCount: newCommentCount,
                };

                // Add comment to Firestore
                const commentDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}/comments/${commentId}`);
                await setDoc(commentDocRef, commentToAdd);

                // Update issue stats in Firestore
                await updateDoc(issueDocRef, {
                    "stats.comments": newCommentCount,
                });

                // Update local states
                setCommentCount(newCommentCount.toString());
                
                // Update backlogIssues and sprintIssues states
                const updateIssuesState = (prevIssues) =>
                    prevIssues.map((issue) =>
                        issue.id === issueId
                            ? {
                                ...issue,
                                stats: {
                                    ...issue.stats,
                                    comments: newCommentCount,
                                },
                            }
                            : issue
                    );

                setBacklogIssues((prev) => updateIssuesState(prev));
                setSprintIssues((prev) => updateIssuesState(prev));

                // Update issue comments
                setIssueComments((prevComments) => {
                    const updatedComments = {
                        ...prevComments,
                        [issueId]: [...(prevComments[issueId] || []), commentToAdd],
                    };
                    updatedComments[issueId] = updatedComments[issueId].sort(
                        (a, b) => b.commentCount - a.commentCount
                    );
                    return updatedComments;
                });

                // Update selected issue
                setSelectedIssue((prev) => ({
                    ...prev,
                    stats: {
                        ...prev.stats,
                        comments: newCommentCount,
                    },
                }));

                setNewComment("");

                // Create notification
                const notifRef = doc(collection(db, `Scrum/${scrumId}/scrumNotif`));
                const notificationObj = {
                    id: notifRef.id,
                    type: "social",
                    subType: "comment",
                    action: "commented on your work in",
                    context: scrumId,
                    timeAgo: new Date().toISOString(),
                    unread: true,
                    receiver: receiverId,
                    sender: uid,
                };

                await setDoc(notifRef, notificationObj);

            } catch (error) {
                console.error("Error adding comment to Firestore:", error);
            } finally {
                setIsSubmittingComment(false);
            }
        }
    }
};





  const fetchIssueComments = () => {
    if (!scrumId || !issueId) return;
  
    try {
      // Reference to comments subcollection
      const commentsRef = collection(db, `Scrum/${scrumId}/backlog/${issueId}/comments`);
  
      // Create a query to order comments if needed (e.g., by dateCreated)
      const commentsQuery = query(commentsRef, orderBy("dateCreated", "asc"));
  
      // Real-time listener for comments
      const unsubscribe = onSnapshot(commentsQuery, async (querySnapshot) => {
        const commentsPromises = querySnapshot.docs.map(async (docSnap) => {
          const commentData = docSnap.data();
  
          // Fetch author details from users collection
          const authorRef = doc(db, `users/${commentData.authorId}`);
          const authorSnap = await getDoc(authorRef);
  
          if (!authorSnap.exists()) {
            console.warn(`Author details not found for ID: ${commentData.authorId}`);
            return {
              id: docSnap.id,
              ...commentData,
              author: "Unknown Author",
              avatar: null,
              timestamp: formatTimestamp(commentData.dateCreated?.toDate()),
            };
          }
  
          const authorData = authorSnap.data();
  
          return {
            id: docSnap.id,
            ...commentData,
            author: `${authorData.firstName} ${authorData.lastName}`, // Combine first and last name
            avatar: authorData.userPicture, // Get user picture
            timestamp: formatTimestamp(commentData.dateCreated?.toDate()),
          };
        });
  
        const comments = await Promise.all(commentsPromises);
  
        // Sort comments by commentCount in descending order to show the highest comment count first
        const sortedComments = comments.sort((a, b) => b.commentCount - a.commentCount);
  
        // Log sorted comments to the console
        console.log(sortedComments);
  
        // Update comments in local state
        setIssueComments((prevComments) => ({
          ...prevComments,
          [issueId]: sortedComments,
        }));
      });
  
      // Return the unsubscribe function to clean up the listener when no longer needed
      return unsubscribe;
    } catch (error) {
      console.error("Error fetching issue comments in real-time:", error);
    }
  };
  





  // Handle comment deletion
const handleDeleteComment = (commentId) => {
  if (!isDeletingComment) {
  setCommentToDelete(commentId);
  setShowCommentDeleteConfirmation(true);
  }
};

// Confirm deletion of the comment
const confirmDeleteComment = async () => {
  if (selectedIssue && commentToDelete && !isDeletingComment) {
      setIsDeletingComment(true);
      try {
          // Delete the comment from Firestore
          const commentRef = doc(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}/comments`, commentToDelete);
          await deleteDoc(commentRef);

          // Update local state by filtering out the deleted comment
          setIssueComments((prevComments) => ({
              ...prevComments,
              [selectedIssue.id]: prevComments[selectedIssue.id].filter((comment) => comment.id !== commentToDelete),
          }));

          // Get the current comment count from Firestore
          const issueRef = doc(db, `Scrum/${scrumId}/backlog/${selectedIssue.id}`);
          const issueSnap = await getDoc(issueRef);
          const currentStats = issueSnap.data()?.stats || {};
          const updatedCount = Math.max(0, (currentStats.comments || 1) - 1);

          // Update comment count locally
          setCommentCount(updatedCount.toString());

          // Update the selected issue with the new comment count
          const updatedIssue = {
              ...selectedIssue,
              stats: {
                  ...selectedIssue.stats,
                  comments: updatedCount,
              },
          };
          setSelectedIssue(updatedIssue);

          // Update Firestore with the new comment count
          await updateDoc(issueRef, {
              "stats.comments": updatedCount,
          });

          // Update the issue list (sprint or backlog)
          const updateIssuesList = (prevIssues) =>
              prevIssues.map((issue) =>
                  issue.id === selectedIssue.id ? updatedIssue : issue
              );

          setSprintIssues((prev) => updateIssuesList(prev));
          setBacklogIssues((prev) => updateIssuesList(prev));

          // Reset states
          setShowCommentDeleteConfirmation(false);
          setCommentToDelete(null);
      } catch (error) {
          console.error("Error deleting comment:", error);
      } finally {
          setIsDeletingComment(false);
      }
  }
};

// Cancel deletion and close the confirmation popup
const cancelDeleteComment = () => {
  setShowCommentDeleteConfirmation(false);
  setCommentToDelete(null);
};

// Fetch comments when issue changes
useEffect(() => {
  if (selectedIssue) {
    fetchIssueComments();
  }
}, [scrumId, issueId, selectedIssue]);

  // Function to format the timestamp
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

  // Sorting comments function
  const sortComments = (commentsToSort, sortType) => {
    return [...commentsToSort].sort((a, b) => {
      if (sortType === "Newest First") {
        return b.dateCreated - a.dateCreated;
      } else {
        return a.dateCreated - b.dateCreated;
      }
    });
  };

  // Handle sort selection
  const handleSortSelect = (sort) => {
    setSelectedSort(sort);

    // Update the comments for the selected issue with sorted comments
    if (selectedIssue) {
      setIssueComments((prevComments) => {
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

  // Periodic timestamp update effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIssueComments((prevIssueComments) => {
        const updatedComments = { ...prevIssueComments };
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

  const handlePointsBlur = async () => {
    const numValue = parseInt(pointsCount);
    const validPoints = isNaN(numValue) || numValue < 0 ? "0" : numValue.toString();
    setPointsCount(validPoints);

    // Update the selected issue's points in Firestore
    if (selectedIssue) {
      const updatedIssue = {
        ...selectedIssue,
        stats: {
          ...selectedIssue.stats,
          points: parseInt(validPoints),
        },
      };

      setSelectedIssue(updatedIssue);

      // Update the corresponding list (sprint or backlog) with the updated points value
      if (isSprintIssue) {
        setSprintIssues((prevSprintIssues) => prevSprintIssues.map((issue) => (issue.id === selectedIssue.id ? updatedIssue : issue)));
      } else {
        setBacklogIssues((prevBacklogIssues) => prevBacklogIssues.map((issue) => (issue.id === selectedIssue.id ? updatedIssue : issue)));
      }

      // Update points in Firestore
     
      const issueId = selectedIssue.id; // Get the selected issue's ID
      const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`);

      try {
        // Update the points in the issue document
        await updateDoc(issueDocRef, {
          "stats.points": parseInt(validPoints),
        });
        console.log("Points updated successfully in Firestore!");
      } catch (error) {
        console.error("Error updating points in Firestore:", error);
      }
    }
  };
  const fetchIssuePoints = async (scrumId, issueId) => {
    try {
      const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`);
      const issueSnap = await getDoc(issueDocRef);

      if (issueSnap.exists()) {
        const issueData = issueSnap.data();
        const points = issueData?.stats?.points || 0; // Get points or default to 0
        setPointsCount(points.toString()); // Update local state with the fetched points
      } else {
        console.log("Issue not found!");
      }
    } catch (error) {
      console.error("Error fetching issue points from Firestore:", error);
    }
  };
  useEffect(() => {// Get the scrumId from location state
    const issueId = selectedIssue?.id; // Get the issueId from selected issue

    if (scrumId && issueId) {
      fetchIssuePoints(scrumId, issueId); // Fetch the points when the component mounts or issue changes
    }
  }, [selectedIssue]); // Runs every time the selectedIssue changes

  const handleEffortBlur = async () => {
    const numValue = parseInt(effortCount);
    const validEffort = isNaN(numValue) || numValue < 0 ? "0" : numValue.toString();
    setEffortCount(validEffort);

    if (selectedIssue) {
      // Create updated issue with new effort value
      const updatedIssue = {
        ...selectedIssue,
        stats: {
          ...selectedIssue.stats,
          effort: parseInt(validEffort),
        },
      };

      setSelectedIssue(updatedIssue); // Update the local state with the new effort

      // Update the corresponding list based on where the issue is located
      if (isSprintIssue) {
        setSprintIssues((prevSprintIssues) => prevSprintIssues.map((issue) => (issue.id === selectedIssue.id ? updatedIssue : issue)));
      } else {
        setBacklogIssues((prevBacklogIssues) => prevBacklogIssues.map((issue) => (issue.id === selectedIssue.id ? updatedIssue : issue)));
      }

      // Get the scrumId and issueId for Firestore update
     
      const issueId = selectedIssue.id; // Get the selected issue's ID
      const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`); // Reference to the issue document in Firestore

      try {
        // Update the effort in the Firestore document
        await updateDoc(issueDocRef, {
          "stats.effort": parseInt(validEffort),
        });
        console.log("Effort updated successfully in Firestore!");
      } catch (error) {
        console.error("Error updating effort in Firestore:", error);
      }
    }
  };
  const fetchIssueEffort = async (scrumId, issueId) => {
    try {
      const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`);
      const issueSnap = await getDoc(issueDocRef);

      if (issueSnap.exists()) {
        const issueData = issueSnap.data();
        const effort = issueData?.stats?.effort || 0; // Get effort or default to 0
        setEffortCount(effort.toString()); // Update local state with the fetched effort value
      } else {
        console.log("Issue not found!");
      }
    } catch (error) {
      console.error("Error fetching issue effort from Firestore:", error);
    }
  };
  useEffect(() => {
   
    const issueId = selectedIssue?.id; // Get the issueId from selected issue

    if (scrumId && issueId) {
      fetchIssueEffort(scrumId, issueId); // Fetch the effort value when the component mounts or issue changes
    }
  }, [selectedIssue]); // Runs every time the selectedIssue changes

  const handlePriorityChange = async (newPriority) => {
    setPriority(newPriority); // Update the local state with the new priority
    setPopupShowPriorityDropdown(false); // Close the dropdown

    if (selectedIssue) {
      // Create an updated issue with the new priority value
      const updatedIssue = {
        ...selectedIssue,
        priority: newPriority,
        stats: {
          ...selectedIssue.stats,
        },
      };

      setSelectedIssue(updatedIssue); // Update the selected issue in local state

      // Update the corresponding list (sprint or backlog) based on where the issue is located
      if (isSprintIssue) {
        setSprintIssues((prevSprintIssues) => prevSprintIssues.map((issue) => (issue.id === selectedIssue.id ? updatedIssue : issue)));
      } else {
        setBacklogIssues((prevBacklogIssues) => prevBacklogIssues.map((issue) => (issue.id === selectedIssue.id ? updatedIssue : issue)));
      }

      // Get the scrumId and issueId for Firestore update
  
      const issueId = selectedIssue.id; // Get the selected issue ID
      const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`); // Firestore reference to the issue document

      try {
        // Update the priority in the Firestore document
        await updateDoc(issueDocRef, {
          priority: newPriority, // Update priority in Firestore
        });
        console.log("Priority updated successfully in Firestore!");
      } catch (error) {
        console.error("Error updating priority in Firestore:", error);
      }
    }
  };

  const [selectedAssignee, setSelectedAssignee] = useState({ name: "Unassigned", img: "" });
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [assigneeSearchTerm, setAssigneeSearchTerm] = useState("");

  // Add this to your existing state declarations


  // Add this filter function
  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(assigneeSearchTerm.toLowerCase()));

  // Add this handler
  const handleAssigneeSelect = async (user) => {
    try {
      // Set the selected assignee state with the complete user object including the avatar
      setSelectedAssignee({
        id: user.id,
        name: user.name,
        img: user.avatar,
      });
      setIsAssigneeDropdownOpen(false);
      setAssigneeSearchTerm("");
  
      if (selectedIssue) {
        // Get the current user's UID
        const auth = getAuth();
        const currentUserUid = auth.currentUser.uid;
        const MemberUid = user.id;
  
        const issueRef = doc(getFirestore(), `Scrum/${scrumId}/backlog/${selectedIssue.id}`);
        
        // Create the updated issue object
        const updatedIssue = {
          ...selectedIssue,
          assignId: MemberUid,
          assignee: {
            assignId: user.id,
            name: user.name,
            picture: user.avatar || null,
          },
          assignTimestamp: new Date(),
        };
  
        // Update Firestore
        await updateDoc(issueRef, {
          assignId: MemberUid,
          assignee: {
            assignId: user.id,
            name: user.name,
            picture: user.avatar || null,
          },
          assignTimestamp: new Date(),
        });
  
        // Update the state based on whether it's a sprint issue or backlog issue
        if (isSprintIssue) {
          setSprintIssues((prevSprintIssues) =>
            prevSprintIssues.map((issue) =>
              issue.id === selectedIssue.id ? updatedIssue : issue
            )
          );
        } else {
          setBacklogIssues((prevBacklogIssues) =>
            prevBacklogIssues.map((issue) =>
              issue.id === selectedIssue.id ? updatedIssue : issue
            )
          );
        }
  
        // Save the notification to Firestore
        const notifRef = collection(getFirestore(), `Scrum/${scrumId}/scrumNotif`);
        
        const notificationData = {
          sender: currentUserUid,
          receiver: [MemberUid],
          context: scrumId,
          action: 'assigned you a task in',
          timeAgo: new Date().toISOString(),
          subType: 'workload',
          type: 'assigned',
          unread: true,
        };
  
        const notificationDocRef = await addDoc(notifRef, notificationData);
        await updateDoc(notificationDocRef, {
          id: notificationDocRef.id,
        });
  
        console.log(`Assignment and notification completed successfully`);
      }
    } catch (error) {
      console.error("Error assigning user to issue:", error);
      // Revert the UI state if the update fails
      setSelectedAssignee((prevState) => prevState);
    }
  };
  

  // Fetch assignee details from Firestore using the assignId (memberId)
  const fetchAssigneeDetails = async (memberId) => {
    const userRef = doc(getFirestore(), `users/${memberId}`);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        name: `${userData.firstName} ${userData.lastName}`,
        img: userData.userPicture,
      };
    } else {
      // Handle case where user data is not found
      return { name: "Unassigned", img: "" };
    }
  };

  const handleBacklogItemClick = async (item) => {
    setSelectedIssue(item); // Set the selected issue
  
    // Fetch issue details from Firestore (including description, assignee, etc.)
    const issueId = item.id; // Get the selected issue's ID
  
    try {
      const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`);
      const issueSnap = await getDoc(issueDocRef);
  
      if (issueSnap.exists()) {
        const issueData = issueSnap.data();
  
        // Set issue data (including description, stats, etc.) to the state
        setSubtasks(issueData.subtasks || []); // Load subtasks for this issue
        setSubtasksCount(issueData.stats?.subtasks?.toString() || "0");
        setPointsCount(issueData.stats?.points?.toString() || "0");
        setEffortCount(issueData.stats?.effort?.toString() || "0");
        setCommentCount(issueData.stats?.comments?.toString() || "0");
        setComments(issueData.comments || []);
        setPriority(issueData.priority);
  
        // Set description for editing or displaying
        setDescription(issueData.description || ""); // Load description to be editable
  
        // Fetch assignee details if assigned
        if (issueData.assignee?.assignId) {
          setSelectedAssignee({
            name: issueData.assignee.name,
            img: issueData.assignee.picture || "",
          });
        } else {
          setSelectedAssignee({
            name: "Unassigned",
            img: "",
          });
        }
      } else {
        console.log("Issue not found!");
      }
  
      // Check member access
      const memberDocRef = doc(db, `Scrum/${scrumId}/member/${uid}`);
      const memberSnap = await getDoc(memberDocRef);
  
      if (memberSnap.exists()) {
        const memberData = memberSnap.data();
        if (memberData.access === false) {
          setIsButtonDisabled(true); // Disable the button
        } else {
          setIsButtonDisabled(false); // Enable the button
        }
      } else {
        console.log("Member not found!");
      }
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
    }
  
    setIsSprintIssue(sprintIssues.some((issue) => issue.id === item.id)); // Check if it's a sprint issue
    setIsPopupOpen(true); // Open the popup
  };

  const handleCloseBacklogPopup = () => {
    setIsPopupOpen(false);
    setSelectedIssue(null);
    setDescription("");
    setIsEditingDescription(false);
    setIsCreatingSubtask(false);
    setNewSubtask("");
    setSubtasks([]);
    setSubtasksCount("0");
    setCommentCount("0");
    setPointsCount("0");
    setEffortCount("0");
    setComments([]);
    setPriority("");
    setSelectedAssignee({ name: "Unassigned", img: "" });
    setIsButtonDisabled(false);
    setIsSprintIssue(false);
  };  
  
  const fetchUserPicture = async () => {
    setLoading(true);
    const uid = getAuth().currentUser.uid; // Get the current user's uid
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
  

  // Handlers for presentation popup
  const handleDescriptionClick = () => {
    if (!isButtonDisabled) {
      setIsEditingDescription(true);
    }
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

  // Use this on the input field or textarea where the description is being edited
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value); // Update the local state as the user types
  };
  const handleTitleClick = () => {
    if (!isButtonDisabled) {
      setEditedTitle(selectedIssue.title);
      setIsEditingTitle(true);
    }
  };
  
  // Add this handler to save the title
  const handleTitleKeyPress = async (e) => {
    if (e.key === "Enter") {
      // Ensure the title is not empty and trim whitespace
      const validTitle = editedTitle.trim() || selectedIssue.title;
  
      // Update local state with the new title
      if (selectedIssue) {
        // Create updated issue with new title value
        const updatedIssue = {
          ...selectedIssue,
          title: validTitle,
        };
  
        // Update the local state with the new title
        setSelectedIssue(updatedIssue);
  
        // Update the corresponding list (sprint or backlog)
        if (isSprintIssue) {
          setSprintIssues((prevSprintIssues) =>
            prevSprintIssues.map((issue) =>
              issue.id === selectedIssue.id ? updatedIssue : issue
            )
          );
        } else {
          setBacklogIssues((prevBacklogIssues) =>
            prevBacklogIssues.map((issue) =>
              issue.id === selectedIssue.id ? updatedIssue : issue
            )
          );
        }
  
        // After updating the local state, now update Firestore
        const issueId = selectedIssue.id;
        const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`);
  
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
  
  
  // Add this handler to handle title input changes
  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value);
  };
  // Define issue types with their icons (you can customize this array)
const issueTypes = [
  { type: 'Task', icon: task },
  { type: 'Bug', icon: bug },
  { type: 'Story', icon: story }
];




// Add a handler to change the issue type
const handleIssueTypeChange = async (newType) => {
  if (selectedIssue) {
    // Create an updated issue with the new type
    const updatedIssue = {
      ...selectedIssue,
      type: newType,
      icon: issueTypes.find(item => item.type === newType)?.icon || selectedIssue.icon
    };

    // Update local state
    setSelectedIssue(updatedIssue);

    // Update the corresponding list (sprint or backlog)
    if (isSprintIssue) {
      setSprintIssues((prevSprintIssues) => 
        prevSprintIssues.map((issue) => 
          issue.id === selectedIssue.id ? updatedIssue : issue
        )
      );
    } else {
      setBacklogIssues((prevBacklogIssues) => 
        prevBacklogIssues.map((issue) => 
          issue.id === selectedIssue.id ? updatedIssue : issue
        )
      );
    }

    // Update Firestore
    const issueId = selectedIssue.id;
    const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`);

    try {
      await updateDoc(issueDocRef, {
        type: newType,
        icon: issueTypes.find(item => item.type === newType)?.icon || selectedIssue.icon
      });
      console.log("Issue type updated successfully in Firestore!");
    } catch (error) {
      console.error("Error updating issue type in Firestore:", error);
    }

    // Close the dropdown
    setIsTypeDropdownOpen(false);
  }
};


useEffect(() => {
  const handleClickOutside = (event) => {
    // Close dropdown if the click is outside both the icon and the dropdown
    if (
      isTypeDropdownOpen &&
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      iconRef.current &&
      !iconRef.current.contains(event.target)
    ) {
      setIsTypeDropdownOpen(false);
    }
  };

  // Add event listener for clicks
  document.addEventListener('mousedown', handleClickOutside);

  // Cleanup listener on unmount
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isTypeDropdownOpen]);


const [isSubmittingSubtask, setIsSubmittingSubtask] = useState(false);

const handleCreateSubtask = () => {
  if (!isSubmittingSubtask) {
    setIsCreatingSubtask(true);
  }
};

const handleSubmitSubtask = async () => {
  if (!scrumId || !issueId || isSubmittingSubtask) {
    return;
  }

  if (newSubtask.trim()) {
    setIsSubmittingSubtask(true);
    const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`);

    const newSubtaskObject = {
      id: Date.now().toString(),
      title: newSubtask,
    };

    try {
      await updateDoc(issueDocRef, {
        subtasks: arrayUnion(newSubtaskObject),
        "stats.subtasks": increment(1),
      });

      const updatedSubtasks = [...(subtasksByIssue[issueId] || []), newSubtaskObject];
      setSubtasksByIssue((prevState) => ({
        ...prevState,
        [issueId]: updatedSubtasks,
      }));

      setSubtasks(updatedSubtasks);

      const updatedIssue = {
        ...selectedIssue,
        stats: {
          ...selectedIssue.stats,
          subtasks: updatedSubtasks.length,
        },
        subtasks: updatedSubtasks,
      };
      setSelectedIssue(updatedIssue);

      if (isSprintIssue) {
        setSprintIssues((prevSprintIssues) => 
          prevSprintIssues.map((issue) => 
            issue.id === selectedIssue.id ? updatedIssue : issue
          )
        );
      } else {
        setBacklogIssues((prevBacklogIssues) => 
          prevBacklogIssues.map((issue) => 
            issue.id === selectedIssue.id ? updatedIssue : issue
          )
        );
      }

      setSubtasksCount(updatedSubtasks.length.toString());
      setNewSubtask("");
      setIsCreatingSubtask(false);
    } catch (error) {
      console.error("Error adding subtask to Firestore:", error);
    } finally {
      setIsSubmittingSubtask(false);
    }
  }
};

  // For fetching subtasks
  const fetchSubtasks = async () => {
    const issueDocRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`);
    try {
      const docSnapshot = await getDoc(issueDocRef);
      if (docSnapshot.exists()) {
        const issueData = docSnapshot.data();
        // Add unique ids to subtasks if they don't exist
        const fetchedSubtasks = (issueData.subtasks || []).map((subtask, index) => ({
          ...subtask,
          id: subtask.id || `subtask-${Date.now()}-${index}`, // Ensure each subtask has a unique id
        }));

        // Update subtasksByIssue state
        setSubtasksByIssue((prevState) => ({
          ...prevState,
          [issueId]: fetchedSubtasks,
        }));

        // Update local subtasks state
        setSubtasks(fetchedSubtasks);

        // Update subtasks count
        setSubtasksCount(fetchedSubtasks.length.toString());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching subtasks:", error);
    }
  };

  fetchSubtasks();
  const handleCancelSubtask = () => {
    setNewSubtask("");
    setIsCreatingSubtask(false);
  };
  const [isDeletingSubtask, setIsDeletingSubtask] = useState(false);

const handleDeleteSubtask = (subtaskId) => {
  if (!isDeletingSubtask) {
    setSubtaskToDelete(subtaskId);
    setShowSubtaskDeleteConfirmation(true);
  }
};

const confirmDeleteSubtask = async () => {
  if (subtaskToDelete && !isDeletingSubtask) {
    setIsDeletingSubtask(true);
    
    try {
      // Remove the subtask from the subtasks array
      const updatedSubtasks = subtasks.filter((subtask) => subtask.id !== subtaskToDelete);
      setSubtasks(updatedSubtasks);

      // Update the subtasks count in the selectedIssue
      const updatedIssue = {
        ...selectedIssue,
        subtasks: updatedSubtasks,
        stats: {
          ...selectedIssue.stats,
          subtasks: selectedIssue.stats.subtasks - 1,
        },
      };
      setSelectedIssue(updatedIssue);

      // Update the subtasks count in the corresponding list (sprint or backlog)
      if (isSprintIssue) {
        setSprintIssues((prevSprintIssues) => 
          prevSprintIssues.map((issue) => 
            issue.id === selectedIssue.id ? updatedIssue : issue
          )
        );
      } else {
        setBacklogIssues((prevBacklogIssues) => 
          prevBacklogIssues.map((issue) => 
            issue.id === selectedIssue.id ? updatedIssue : issue
          )
        );
      }

      // Update the subtasks count display
      setSubtasksCount((prevCount) => (parseInt(prevCount) - 1).toString());

      // Update Firestore document
      const issueDocRef = doc(db, "Scrum", scrumId, "backlog", selectedIssue.id);
      await updateDoc(issueDocRef, {
        subtasks: updatedSubtasks,
        "stats.subtasks": updatedIssue.stats.subtasks,
      });

      // Reset confirmation states
      setShowSubtaskDeleteConfirmation(false);
      setSubtaskToDelete(null);

      console.log("Subtask deleted successfully!");
    } catch (error) {
      console.error("Error deleting subtask in Firestore:", error);
      setShowErrorPopup(true);
      setErrorMessage("Failed to delete subtask. Please try again.");
    } finally {
      setIsDeletingSubtask(false);
    }
  }
};

  const cancelDeleteSubtask = () => {
    setShowSubtaskDeleteConfirmation(false);
    setSubtaskToDelete(null);
  };
  const handleCancelEditSubtask = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle("");
  };

  const handleUpdateSubtask = async () => {
    if (editingSubtaskTitle.trim()) {
      // Update the subtask in the subtasks array
      const updatedSubtasks = subtasks.map((subtask) => (subtask.id === editingSubtaskId ? { ...subtask, title: editingSubtaskTitle.trim() } : subtask));
      setSubtasks(updatedSubtasks);

      // Update the selected issue with the new subtasks
      const updatedIssue = {
        ...selectedIssue,
        subtasks: updatedSubtasks,
      };
      setSelectedIssue(updatedIssue);

      // Update Firestore document for the corresponding issue in Scrum/${scrumId}/backlog/${issueId}
      const issueDocRef = doc(db, "Scrum", scrumId, "backlog", selectedIssue.id); // Reference to the specific issue
      try {
        // Update the issue in Firestore
        await updateDoc(issueDocRef, {
          subtasks: updatedSubtasks,
        });

        // Update the list (sprint or backlog) in local state
        if (isSprintIssue) {
          setSprintIssues((prevSprintIssues) => prevSprintIssues.map((issue) => (issue.id === selectedIssue.id ? updatedIssue : issue)));
        } else {
          setBacklogIssues((prevBacklogIssues) => prevBacklogIssues.map((issue) => (issue.id === selectedIssue.id ? updatedIssue : issue)));
        }

        // Reset editing states
        setEditingSubtaskId(null);
        setEditingSubtaskTitle("");

        console.log("Subtask updated successfully!");
      } catch (error) {
        console.error("Error updating subtask in Firestore:", error);
        setShowErrorPopup(true);
        setErrorMessage("Failed to update subtask. Please try again.");
      }
    }
  };
  const handleEditSubtask = (subtask) => {
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskTitle(subtask.title);
  };
  // Function to calculate time remaining
  const calculateTimeRemaining = () => {
    if (!startDate || !endDate) return { timeRemaining: "" };

    // Combine start and end dates with their respective times
    const startDateTime = new Date(`${startDate}T${startTime || "00:00"}`);
    const endDateTime = new Date(`${endDate}T${endTime || "23:59"}`);
    const currentDateTime = new Date();

    // Ensure end date is in the future
    if (endDateTime <= currentDateTime) {
      return { timeRemaining: "Sprint Completed" };
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

    return { timeRemaining };
  };

  // Set an interval to update the time remaining every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining().timeRemaining);
    }, 1000); // Update every second

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures this only runs once when the component mounts

  // Define typeOptions and priorityOptions at the component level
  const typeOptions = [
    { value: "story", label: "Story", icon: story },
    { value: "bug", label: "Bug", icon: bug },
    { value: "task", label: "Task", icon: task },
  ];

  const priorityOptions = [
    { value: "low", label: "Low", icon: low },
    { value: "medium", label: "Medium", icon: medium },
    { value: "high", label: "High", icon: high },
  ];

  const [backlogIssues, setBacklogIssues] = useState([
    /*
    {
      id: 4,
      title: "Plagiarism Checking",
      type: "task",
      icon: task,
      code: `${key} - 4`,
      priority: "high",
      stats: {
        comments: 0,
        subtasks: 0,
        points: 7,
        effort: 3,
      },
      assignee: {
        name: members.find(member => member.name === "Anthony Prajes")?.name || "Anthony Prajes",
        picture: members.find(member => member.name === "Anthony Prajes")?.img
      },
    },*/
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [newIssue, setNewIssue] = useState({
    title: "",
    type: "story",
    priority: "low",
  });

  // Function to get the icon based on type
  const getTypeIcon = (type) => {
    const icons = {
      story: story,
      bug: bug,
      task: task,
    };
    return icons[type];
  };

  // Add handleCreateIssue function
  const handleCreateIssue = () => {
    setShowCreateForm((prevState) => !prevState);
    setShowTypeDropdown(false);
    setShowPriorityDropdown(false);
  };

  // Add handleTypeSelect function
  const handleTypeSelect = (type) => {
    setNewIssue({ ...newIssue, type });
    setShowTypeDropdown(false);
  };

  // Add handlePrioritySelect function
  const handlePrioritySelect = (priority) => {
    setNewIssue({ ...newIssue, priority });
    setShowPriorityDropdown(false);
  };

  // Function to handle form submission
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

  const handleSubmitIssue = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
  
    if (!newIssue.title.trim()) {
      setErrorMessage("Please enter an issue title");
      setShowErrorPopup(true);
      return;
    }
  
    try {
      setIsSubmitting(true); // Set the submission state to true
  
      // Logic for creating the issue...
      const backlogCollection = collection(db, `Scrum/${scrumId}/backlog`);
      const backlogSnapshot = await getDocs(backlogCollection);
      const documentCount = backlogSnapshot.size;
      const code = documentCount > 0 ? documentCount + 1 : 1;
      const example = Math.random().toString(36).substring(2, 15);
      const key = gen(projectName);
      const documentPath = `Scrum/${scrumId}/backlog/${example}`;
  
      const firestoreIssueObj = {
        id: example,
        title: newIssue.title,
        type: newIssue.type,
        scrumMaster: uid,
        icon: getTypeIcon(newIssue.type),
        code,
        priority: newIssue.priority,
        issueStatus: "backlog",
        status: "To-do",
        stats: {
          comments: 0,
          subtasks: 0,
          points: 0,
          effort: 0,
        },
      };
  
      const localIssueObj = {
        ...firestoreIssueObj,
        code: `${key}-${code}`,
      };
  
      await setDoc(doc(db, documentPath), firestoreIssueObj);
      setBacklogIssues((prevIssues) => [...prevIssues, localIssueObj]);
  
      const updatedSprintIssues =
        JSON.parse(localStorage.getItem("sprintIssues")) || [];
      updatedSprintIssues.push(localIssueObj);
      localStorage.setItem("sprintIssues", JSON.stringify(updatedSprintIssues));
  
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Error saving issue to Firestore:", error);
      setErrorMessage("An error occurred while saving the issue. Please try again.");
      setShowErrorPopup(true);
    } finally {
      setIsSubmitting(false); // Reset the submission state
    }
  };

  

const handleCloseSuccessPopup = () => {
  // Reset form
  setNewIssue({
    title: "",
    type: "story",
    priority: "low",
  });
  setShowCreateForm(false);
  
  // Close the success popup
  setShowSuccessPopup(false);
};


  const handleDelete = (issueId, isSprintIssue = false) => {
    // Find the issue object from either sprint or backlog issues
    const issueToDelete = isSprintIssue ? sprintIssues.find((issue) => issue.id === issueId) : backlogIssues.find((issue) => issue.id === issueId);

    setItemToDelete(issueToDelete);
    setIsSprintIssue(isSprintIssue);
    setShowDeleteConfirmation(true);
    setActiveMoreOptions(null);
  };

  // Confirmation handlers remain the same
  const handleConfirmDelete = async () => {
    try {
      const issueId = itemToDelete.id;
 

      if (scrumId && issueId) {
        // Firestore reference for the issue to delete
        const issueRef = doc(db, `Scrum/${scrumId}/backlog/${issueId}`);

        // Delete the issue from Firestore
        await deleteDoc(issueRef);

        // Update state to remove the issue locally
        if (isSprintIssue) {
          setSprintIssues((prev) => prev.filter((issue) => issue.id !== issueId));
        } else {
          setBacklogIssues((prev) => prev.filter((issue) => issue.id !== issueId));
        }

        // Close the popup after deletion
        handleClosePopup();
      }
    } catch (error) {
      console.error("Error deleting issue:", error);
    }
  };

  const handleClosePopup = () => {
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
    setIsSprintIssue(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".more-options-dropdown") && !event.target.closest(".more-options-icon")) {
        setActiveMoreOptions(null);
      }
      if (!event.target.closest(".backlogs-dropdown-container") && !event.target.closest(".backlogs-create-issue-form")) {
        setShowTypeDropdown(false);
        setShowPriorityDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update the renderCreateIssueForm function
  const renderCreateIssueForm = () => {
    if (!showCreateForm) return null;

    return (
      <div className="backlogs-create-issue-form">
        <div className="backlogs-form-header">
          <input
            type="text"
            placeholder="What needs to be addressed?"
            className="backlogs-what-needs-addressed"
            value={newIssue.title}
            onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
          />
        </div>
        <div className="backlogs-form-controls">
          <div className="backlogs-dropdown-container">
            <button
              className="backlogs-dropdown-button backlogs-type-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTypeDropdown(!showTypeDropdown);
                if (showPriorityDropdown) setShowPriorityDropdown(false);
              }}
            >
              <img src={typeOptions.find((t) => t.value === newIssue.type)?.icon} alt="type" className="backlogs-dropdown-icon backlogs-type-icon" />
              <span>{typeOptions.find((t) => t.value === newIssue.type)?.label}</span>
              <ChevronDown className={`backlogs-chevron-icon ${showTypeDropdown ? "rotate" : ""}`} />
            </button>
            {showTypeDropdown && (
              <div className="backlogs-dropdown-menu backlogs-type-menu">
                {typeOptions.map((type) => (
                  <div key={type.value} className="backlogs-dropdown-item backlogs-type-item" onClick={() => handleTypeSelect(type.value)}>
                    <img src={type.icon} alt={type.label} className="backlogs-item-icon backlogs-type-item-icon" />
                    <span>{type.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="backlogs-dropdown-container">
            <button
              className="backlogs-dropdown-button backlogs-priority-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPriorityDropdown(!showPriorityDropdown);
                if (showTypeDropdown) setShowTypeDropdown(false);
              }}
            >
              <img src={priorityOptions.find((p) => p.value === newIssue.priority)?.icon} alt="priority" className="backlogs-dropdown-icon backlogs-priority-icon" />
              <span>{priorityOptions.find((p) => p.value === newIssue.priority)?.label}</span>
              <ChevronDown className={`backlogs-chevron-icon ${showPriorityDropdown ? "rotate" : ""}`} />
            </button>
            {showPriorityDropdown && (
              <div className="backlogs-dropdown-menu backlogs-priority-menu">
                {priorityOptions.map((priority) => (
                  <div key={priority.value} className="backlogs-dropdown-item backlogs-priority-item" onClick={() => handlePrioritySelect(priority.value)}>
                    <img src={priority.icon} alt={priority.label} className="backlogs-item-icon backlogs-priority-item-icon" />
                    <span>{priority.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="backlogs-create-button" onClick={handleSubmitIssue}style={{
    cursor: isSubmitting ? 'not-allowed' : 'pointer',
    opacity: isSubmitting ? 0.7 : 1,
  }}
>
  {isSubmitting ? 'Creating' : 'Create'}
</button>
        </div>
      
        {showSuccessPopup && (
      <div className="backlog-issue-popup-overlay">
        <div className="backlog-issue-popup-modal">
          <img src={successPopup} alt="Success" className="backlog-issue-popup-icon" />
          <p className="backlog-issue-popup-message">
            Issue has been successfully created!
          </p>
          <button 
            className="backlog-issue-popup-button" 
            onClick={handleCloseSuccessPopup}
          >
            OK
          </button>
        </div>
      </div>
    )}
    
    {showErrorPopup && (
      <div className="backlog-issue-popup-overlay">
        <div className="backlog-issue-popup-modal">
          <img src={errorPopup} alt="Error" className="backlog-issue-popup-icon" />
          <p className="backlog-issue-popup-error-message">{errorMessage}</p>
          <button 
            className="backlog-issue-popup-error-button" 
            onClick={() => setShowErrorPopup(false)}
          >
            OK
          </button>
        </div>
      </div>
    )}
  </div>
);
    };

  const [sprintIssues, setSprintIssues] = useState([
    /* {
     id: 1,
      title: "Background Research",
      type: "story",
      icon: story,
      code: `${key} - 1`,
      priority: "medium",
      stats: {
        comments: 1,
        subtasks: 2,
        points: 10,
        effort: 5,
      },
      assignee: {
        name: members.find(member => member.name === "Gain Bobis")?.name || "Gain Bobis",
        picture: members.find(member => member.name === "Gain Bobis")?.img
      }
    },
    {
      id: 2,
      title: "Documentation",
      type: "story",
      icon: story,
      code: `${key} - 2`,
      priority: "low",
      stats: {
        comments: 0,
        subtasks: 0,
        points: 5,
        effort: 3,
      },
      assignee: {
        name: members.find(member => member.name === "Anmark Benasalbas")?.name || "Anmark Benasalbas",
        picture: members.find(member => member.name === "Anmark Benasalbas")?.img
      }
    },
    {
      id: 3,
      title: "RRL Checking",
      type: "task",
      icon: task,
      code: `${key} - 3`,
      priority: "high",
      stats: {
        comments: 0,
        subtasks: 0,
        points: 3,
        effort: 3,
      },
      assignee: {
        name: members.find(member => member.name === "Franco Bayani")?.name || "Franco Bayani",
        picture: members.find(member => member.name === "Franco Bayani")?.img
      }
    },*/
  ]);
  const fetchIssues = async (scrumId) => {
    try {
      const issuesRef = collection(db, `Scrum/${scrumId}/backlog`);
      const querySnapshot = await getDocs(issuesRef);
  
      // Categorize tasks into backlog and sprint issues
      const fetchedBacklogIssues = [];
      const fetchedSprintIssues = [];
  
      querySnapshot.forEach((doc) => {
        const data = {
          ...doc.data(),
          id: doc.id,
          icon: getTypeIcon(doc.data().type),  // Add icon based on issue type
          code: `${gen(projectName)}-${doc.data().code}`  // Combine project initials with existing code
        };
  
        if (data.issueStatus === "backlog") {
          fetchedBacklogIssues.push(data);
        } else if (data.issueStatus === "sprint") {
          fetchedSprintIssues.push(data);
        }
      });
  
      // Update state
      setBacklogIssues(fetchedBacklogIssues);
      setSprintIssues(fetchedSprintIssues);
  
      // Save to localStorage
      localStorage.setItem('backlogIssues', JSON.stringify(fetchedBacklogIssues));
      localStorage.setItem('sprintIssues', JSON.stringify(fetchedSprintIssues));
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };
  // Example usage
  useEffect(() => {
    const scrumId = location.state?.id || JSON.parse(localStorage.getItem('selectedProject'))?.id;
    if (scrumId) {
      fetchIssues(scrumId);
    }
  }, []);
  const getPriorityIcon = (priority) => {
    const priorityIcons = {
      low: low,
      medium: medium,
      high: high,
    };
    return priorityIcons[priority];
  };

  const renderStats = (stats, priority, assignee) => (
    <div className="item-stats">
      <div className="stat-item">
        <img src={comment} alt="comments" className="stat-icon" draggable="false" />
        <span className="backlogs-count">{stats?.comments ?? 0}</span>
      </div>

      <div className="stat-item">
        <img src={subtask} alt="subtasks" className="stat-icon" draggable="false" />
        <span className="backlogs-count">{stats?.subtasks ?? 0}</span>
      </div>

      <div className="stat-item stat-with-overlay">
        <img src={points} alt="points" className="stat-icon overlay-icon" draggable="false" />
        <span className="stat-overlay">{stats?.points ?? 0}</span>
      </div>

      <div className="stat-item stat-with-overlay">
        <img src={effort} alt="effort" className="stat-icon overlay-icon" draggable="false" />
        <span className="stat-overlay">{stats?.effort ?? 0}</span>
      </div>

      <div className="priority-arrow">
        <img src={getPriorityIcon(priority)} alt={`${priority} priority`} className="priority-icon" draggable="false" />
      </div>

      <div className="backlog-assignee-avatar-issue">
        {assignee?.name ? (
          assignee.picture ? (
            <img src={assignee.picture} alt={assignee.name} className="backlog-assignee-avatar-img" style={{ width: "20px", height: "20px", borderRadius: "9999px" }} draggable="false" />
          ) : (
            <div
              className="backlog-assignee-avatar-initial"
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
              {(assignee?.name?.charAt(0) || "").toUpperCase()}
            </div>
          )
        ) : (
          <div className="backlog-issue-tooltip-container">
            <div
              className="backlog-unassigned-avatar"
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "9999px",
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserCircle2 style={{ color: "#2665AC" }} />
            </div>
            <span
              style={{
                marginLeft: "4px",
                color: "#2665AC",
                fontSize: "14px",
              }}
            >
              Unassigned
            </span>
            <div className="backlog-issue-custom-tooltip">No team member assigned to this task</div>
          </div>
        )}
      </div>
    </div>
  );

  const handleDragStart = (e, item, source) => {
    setDraggedItem(item);
    setDraggedSource(source);
    e.target.classList.add("dragging");
    e.dataTransfer.setData("text/plain", JSON.stringify({ id: item.id, source }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // Remove any existing drop indicators
    document.querySelectorAll(".drop-above, .drop-below").forEach((el) => {
      el.classList.remove("drop-above", "drop-below");
    });

    const dropTarget = e.target.closest(".backlog-item");
    if (dropTarget) {
      const rect = dropTarget.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;

      if (e.clientY < midpoint) {
        dropTarget.classList.add("drop-above");
      } else {
        dropTarget.classList.add("drop-below");
      }
    }
  };

  const handleDragLeave = (e) => {
    // Only remove indicators if we're actually leaving the container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      document.querySelectorAll(".drop-above, .drop-below").forEach((el) => {
        el.classList.remove("drop-above", "drop-below");
      });
    }
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove("dragging");
    setDraggedItem(null);
    setDraggedSource(null);

    // Clean up any remaining drop indicators
    document.querySelectorAll(".drop-above, .drop-below").forEach((el) => {
      el.classList.remove("drop-above", "drop-below");
    });
  };

  const handleDrop = async (e, targetSection) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
  
    // Clean up drop indicators
    document.querySelectorAll(".drop-above, .drop-below").forEach((el) => {
      el.classList.remove("drop-above", "drop-below");
    });
  
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const sourceSection = data.source;
  
      // Check user access permission
      const checkUserAccess = async () => {
        const memberDocRef = doc(db, `Scrum/${scrumId}/member/${uid}`);
        try {
          const memberDoc = await getDoc(memberDocRef);
          if (memberDoc.exists() && memberDoc.data().access === true) {
            return true;
          } else {
            console.error("Access denied: User does not have the required permissions.");
            return false;
          }
        } catch (error) {
          console.error("Error checking user access:", error);
          return false;
        }
      };
  
      const hasAccess = await checkUserAccess();
      if (!hasAccess) {
        return; // Exit if the user does not have access
      }
  
      // Find the target item (if any)
      const dropTarget = e.target.closest(".backlog-item");
      const targetId = dropTarget ? parseInt(dropTarget.getAttribute("data-id")) : null;
  
      // Helper function to swap positions of two items in an array
      const swapPositions = (arr, sourceId, targetId) => {
        const newArr = [...arr];
        const sourceIndex = newArr.findIndex((item) => item.id === sourceId);
        const targetIndex = newArr.findIndex((item) => item.id === targetId);
  
        if (sourceIndex !== -1 && targetIndex !== -1) {
          [newArr[sourceIndex], newArr[targetIndex]] = [newArr[targetIndex], newArr[sourceIndex]];
        }
        return newArr;
      };
  
      // Helper function to find the correct insertion index
      const findDropIndex = (items, targetElement) => {
        const dropTarget = targetElement.closest(".backlog-item");
  
        if (!dropTarget) {
          return items.length;
        }
  
        const targetId = parseInt(dropTarget.getAttribute("data-id"));
        const targetIndex = items.findIndex((item) => item.id === targetId);
  
        const rect = dropTarget.getBoundingClientRect();
        const dropY = e.clientY;
        const midpoint = rect.top + rect.height / 2;
  
        return dropY < midpoint ? targetIndex : targetIndex + 1;
      };
  
      // Update Firestore status
      const updateTaskStatusInFirestore = async (taskId, newStatus) => {
        const taskDocRef = doc(db, `Scrum/${scrumId}/backlog`, taskId.toString());
  
        try {
          await updateDoc(taskDocRef, { issueStatus: newStatus });
          console.log(`Task ${taskId} status updated to ${newStatus}`);
        } catch (error) {
          console.error(`Failed to update task ${taskId} status:`, error);
        }
      };
  
      // Synchronize data to localStorage
      const syncToLocalStorage = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
      };
  
      // Handle swap within the same section
      if (sourceSection === targetSection && targetId) {
        if (targetSection === "sprint") {
          setSprintIssues((prevIssues) => {
            const updatedIssues = swapPositions(prevIssues, data.id, targetId);
            syncToLocalStorage("sprintIssues", updatedIssues);
            return updatedIssues;
          });
        } else if (targetSection === "backlog") {
          setBacklogIssues((prevIssues) => {
            const updatedIssues = swapPositions(prevIssues, data.id, targetId);
            syncToLocalStorage("backlogIssues", updatedIssues);
            return updatedIssues;
          });
        }
        return;
      }
  
      // Handle cross-section move
      let itemToMove = null;
      if (sourceSection !== targetSection || !targetId) {
        // Moving to sprint section
        if (targetSection === "sprint") {
          itemToMove = backlogIssues.find((item) => item.id === data.id);
          if (itemToMove) {
            const updatedBacklogIssues = backlogIssues.filter((item) => item.id !== data.id);
            const insertIndex = findDropIndex(sprintIssues, e.target);
  
            setSprintIssues((prev) => {
              const newIssues = [...prev];
              newIssues.splice(insertIndex, 0, { ...itemToMove, issueStatus: "sprint" });
              syncToLocalStorage("sprintIssues", newIssues);
              return newIssues;
            });
            setBacklogIssues(updatedBacklogIssues);
            syncToLocalStorage("backlogIssues", updatedBacklogIssues);
  
            // Update Firestore
            updateTaskStatusInFirestore(data.id, "sprint");
          }
        }
        // Moving to backlog section
        else if (targetSection === "backlog") {
          itemToMove = sprintIssues.find((item) => item.id === data.id);
          if (itemToMove) {
            const updatedSprintIssues = sprintIssues.filter((item) => item.id !== data.id);
            const insertIndex = findDropIndex(backlogIssues, e.target);
  
            setBacklogIssues((prev) => {
              const newIssues = [...prev];
              newIssues.splice(insertIndex, 0, { ...itemToMove, issueStatus: "backlog" });
              syncToLocalStorage("backlogIssues", newIssues);
              return newIssues;
            });
            setSprintIssues(updatedSprintIssues);
            syncToLocalStorage("sprintIssues", updatedSprintIssues);
  
            // Update Firestore
            updateTaskStatusInFirestore(data.id, "backlog");
          }
        }
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };
  

  const handleCopy = () => {
    navigator.clipboard.writeText("TEAM-123-456");
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSprintIssues, setFilteredSprintIssues] = useState(sprintIssues);
  const [filteredBacklogIssues, setFilteredBacklogIssues] = useState(backlogIssues);

  // Add a new state to track the highest ID
  const [nextId, setNextId] = useState(() => {
    try {
      const sprintIds = sprintIssues?.map((issue) => parseInt(issue.id) || 0) || [];
      const backlogIds = backlogIssues?.map((issue) => parseInt(issue.id) || 0) || [];
      const maxId = Math.max(...sprintIds, ...backlogIds, 0);
      return maxId + 1;
    } catch (error) {
      console.error("Error calculating next ID:", error);
      return 1; // Fallback to 1 if calculation fails
    }
  });

  // Update useEffect for filtering
  useEffect(() => {
    const filterIssues = (issues) => {
      return issues.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.priority.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    };

    // Update filtered issues whenever the source arrays or search query changes
    setFilteredSprintIssues(filterIssues(sprintIssues));
    setFilteredBacklogIssues(filterIssues(backlogIssues));
  }, [searchQuery, sprintIssues, backlogIssues]);

  // Update the handleSearch function
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  
  // Function to invite member and send notifications
// Function to invite member and send notifications
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
      setShowInviteSuccessPopup(true);
      return member;

    } else {
      console.error("No user found with the provided email.");
      throw new Error("No user found with the provided email.");
    }
  } catch (error) {
    console.error("Error inviting member:", error);
    setErrorInviteMessage(error.message || "Failed to invite member. Please try again.");
    setShowInviteErrorPopup(true); // Show error popup
    throw error;
  }
};


const handleInviteClick = () => {
  const emailInput = document.querySelector(".backlog-member-email-input");
  const email = emailInput.value.trim();
  const role = selectedRole;

  if (!email) {
    setErrorInviteMessage("Please enter a valid email.");
    setShowInviteErrorPopup(true);
    return;
  }
  if (!role) {
    setErrorInviteMessage("Please select a role.");
    setShowInviteErrorPopup(true);
    return;
  }
  if (!scrumId) {
    setErrorInviteMessage("Scrum ID is not available. Please refresh the page or try again.");
    setShowInviteErrorPopup(true);
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


{/*
  const handleMemberClick = (memberId) => {
    navigate(`/profile/${memberId}`);
  }; */}

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
  
  
  
  const handleConfirmRemovebacklog = async () => {
      if (selectedScrumMember) {
        try {
          const { memberId } = selectedScrumMember;
    
          // 1. Delete `users/${memberId}/Scrum/${scrumId}`
          const userScrumDocRef = doc(db, `users/${memberId}/Scrum/${scrumId}`);
          await deleteDoc(userScrumDocRef);
    
          // 2. Loop through `Scrum/${scrumId}/backlog` and remove `assignee.assignId` matching `memberId`
          const backlogCollectionRef = collection(db, `Scrum/${scrumId}/backlog`);
          const backlogDocs = await getDocs(backlogCollectionRef);
    
          backlogDocs.forEach(async (docSnapshot) => {
            const backlogData = docSnapshot.data();
            // Check if assignee.assignId matches the memberId
            if (backlogData.assignee && backlogData.assignee.assignId === memberId) {
              const backlogDocRef = doc(db, `Scrum/${scrumId}/backlog/${docSnapshot.id}`);
              // Nullify all the fields inside assignee
              await updateDoc(backlogDocRef, {
                assignee: null, // Set assignee field to null
              });
            }
          });
    
          // 3. Delete `Scrum/${scrumId}/member/${memberId}`
          const scrumMemberDocRef = doc(db, `Scrum/${scrumId}/member/${memberId}`);
          await deleteDoc(scrumMemberDocRef);
    
          // 4. Remove the member locally from the state and update localStorage
          handleRemoveMember(selectedScrumMember); // Remove member locally
          setShowRemoveScrumPopup(false); // Hide confirmation popup
    
          setRemovalSuccessMessage(`${selectedScrumMember?.name} successfully removed from the team.`);
          setShowRemovalSuccessPopup(true);
          console.log(`Member ${memberId} successfully removed.`);
        } catch (error) {
          setRemovalErrorMessage("Failed to remove member from the team. Please try again.");
          setShowRemovalErrorPopup(true);
          console.error("Error removing member:", error);
        }
      }
    };
  

  

  const [hoveredScrumMember, setHoveredScrumMember] = useState(null);
  const [showRemoveScrumPopup, setShowRemoveScrumPopup] = useState(false);
  const [selectedScrumMember, setSelectedScrumMember] = useState(null);
  
  const handleRemoveMemberClick = (member) => {
    setSelectedScrumMember(member);
    setShowRemoveScrumPopup(true); // Show confirmation popup
  };
  
  const handleRemoveMember = (memberToRemove) => {
    setMembers((prevMembers) => {
      // Remove the member from the local state
      const updatedMembers = prevMembers.filter((member) => member.memberId !== memberToRemove.memberId);
      // Update localStorage with the new list of members
      const storedProject = JSON.parse(localStorage.getItem('selectedProject')) || {};
      storedProject.members = updatedMembers;
      localStorage.setItem('selectedProject', JSON.stringify(storedProject));
      return updatedMembers;
    });
  };
  
  const handleConfirmRemove = async () => {
    if (selectedScrumMember) {
      try {
        const { memberId } = selectedScrumMember;
  
        // 1. Delete `users/${memberId}/Scrum/${scrumId}`
        const userScrumDocRef = doc(db, `users/${memberId}/Scrum/${scrumId}`);
        await deleteDoc(userScrumDocRef);
  
        // 2. Loop through `Scrum/${scrumId}/backlog` and remove `assignee.assignId` matching `memberId`
        const backlogCollectionRef = collection(db, `Scrum/${scrumId}/backlog`);
        const backlogDocs = await getDocs(backlogCollectionRef);
  
        backlogDocs.forEach(async (docSnapshot) => {
          const backlogData = docSnapshot.data();
          // Check if assignee.assignId matches the memberId
          if (backlogData.assignee && backlogData.assignee.assignId === memberId) {
            const backlogDocRef = doc(db, `Scrum/${scrumId}/backlog/${docSnapshot.id}`);
            // Nullify all the fields inside assignee
            await updateDoc(backlogDocRef, {
              assignee: null, // Set assignee field to null
            });
          }
        });
  
        // 3. Delete `Scrum/${scrumId}/member/${memberId}`
        const scrumMemberDocRef = doc(db, `Scrum/${scrumId}/member/${memberId}`);
        await deleteDoc(scrumMemberDocRef);
  
        // 4. Remove the member locally from the state and update localStorage
        handleRemoveMember(selectedScrumMember); // Remove member locally
        setShowRemoveScrumPopup(false); // Hide confirmation popup
  
        console.log(`Member ${memberId} successfully removed.`);
      } catch (error) {
        console.error("Error removing member:", error);
      }
    }
  };
  
  const handleCancelRemove = () => {
    setShowRemoveScrumPopup(false); // Hide popup
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


  const showRemoveIcon = (member, index) => {
    return allow && hoveredScrumMember === index && uid && member.memberId !== uid;
  };

    const priorityChangeRef = useRef(null);
    const assigneeChangeRef = useRef(null);
    const sortChangeRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on the scrollbar of details list
      const detailsList = document.querySelector('.backlog-popup__details-list');
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
      const isSortClick = event.target.closest(".backlog-presentation-popup__sort-dropdown");
      const isOutsideSortMenu = !sortChangeRef.current?.contains(event.target);
      if (isOutsideSortMenu && !isSortClick) {
        setIsSortDropdownOpen(false);
      }
  
      // Handle priority issue dropdown
      const isPriorityClick = event.target.closest(".backlog-priority-dropdown");
      const isOutsidePresentationMenu = !priorityChangeRef.current?.contains(event.target);
      if (isOutsidePresentationMenu && !isPriorityClick) {
        setPopupShowPriorityDropdown(false);
      }
  
      // Handle assignee issue dropdown
      const isAssigneeClick = event.target.closest(".backlog-assignee-dropdown");
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
  const issuePopupTitleRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isIssuePopupOverflowing, setIsIssuePopupOverflowing] = useState(false);
  const [showIssuePopupTooltip, setShowIssuePopupTooltip] = useState(false);

  useEffect(() => {
    if (titleRef.current) {
      const isOverflow = 
        titleRef.current.offsetWidth < titleRef.current.scrollWidth;
      setIsOverflowing(isOverflow);
    }

  }, [projectName]);

  useEffect(() => {
    // Check for title overflow when selected issue changes
    if (issuePopupTitleRef.current) {
      const element = issuePopupTitleRef.current;
      setIsIssuePopupOverflowing(element.scrollWidth > element.offsetWidth);
    }
  }, [selectedIssue?.title]); 

  return (
       <div className="backlogs-container">
      <div className="backlogs-header">
        <div className="project-info">
        <h1
    className="project-name"
    ref={titleRef}
    onMouseEnter={() => isOverflowing && setShowTooltip(true)}
    onMouseLeave={() => setShowTooltip(false)}
  >
    {projectName}
    {showTooltip && (
      <div className="backlogs-title-tooltip">{projectName}</div>
    )}
  </h1>
          <div className="member-icons">
            <div className="member-icon-container" onClick={() => setShowMembersPopup(true)}>
              {members.slice(0, 3).map((member, index) => (
                <img key={index} src={member.img} alt={`Member ${member.name}`} className="member-icon" />
              ))}
              {members.length > 3 && <div className="member-count">+{members.length - 3}</div>}
            </div>
          </div>
        </div>
        <div className="backlogs-controls-container">
          <div className="backlogs-search-container">
            <input type="text" placeholder="Search" className="backlogs-search-input" value={searchQuery} onChange={handleSearch} />
            <img src={searchIcon} alt="search" className="backlogs-search-icon" />
          </div>
          {hasAccess && (
      <button
        className="backlogs-invite-member-btn"
        onClick={handleDisable}
      >
        Invite Member
      </button>
    )}
        </div>
      </div>


      <div className="sprint-info-container">
        <div className="sprint-header">
          <div className="sprint-title">{key} - 0</div>
          <div className="sprint-dates">
            <span>{`${startDate} - ${endDate}`}</span>
            <img src={days} alt="Days-Remaining-Icon" className="clock-icon" />
            <span className="time-remaining">{timeRemaining}</span>
          </div>
        </div>
      </div>

      <div className="sprint-content-container">
        <div className="sprint-details">
          <div className="selected-development">
            <span className="development-label">Selected for development</span>
            <span className="issues-count">{filteredSprintIssues.length} issues</span>
          </div>
          {allow && (
  <button
    className="start-sprint-btn"
    onClick={handleStartSprintClick}
  >
    Start Sprint
  </button>
)}

        </div>


        {/* Sprint section with drag and drop */}
        <div
          className={`backlog-items-container ${filteredSprintIssues.length === 0 ? "empty" : ""} ${draggedItem ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "sprint")}
          onDragLeave={handleDragLeave}
        >
          {filteredSprintIssues.map((item) => (
            <div
              key={item.id}
              data-id={item.id}
              className="backlog-item"
              draggable="true"
              onDragStart={(e) => handleDragStart(e, item, "sprint")} // Explicitly pass "sprint"
              onDragEnd={handleDragEnd}
              onClick={() => handleBacklogItemClick(item)}
            >
              <div className="backlog-item-header">
                <div className="backlog-item-header-content">
                <img 
  src={getIconSrc(item.type)}  // Dynamically set the correct icon based on item.type
  alt={item.type}              // Alt text matches the item type
  className="item-type-icon"   // Apply styling through this class
  draggable="false"            // Prevent the icon from being dragged
/>

<span className="item-title">{item.title}</span>
                </div>
                <div hidden={!allow} className="more-options-container" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal
                    className="more-options-icon"
                    onClick={() => {
                      setActiveMoreOptions(activeMoreOptions === item.id ? null : item.id);
                    }}
                  />

{activeMoreOptions === item.id && (
                    <div className="more-options-dropdown" onClick={(e) => e.stopPropagation()}>
                      <div
                        className="issues-dropdown-item issues-delete-option"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id, true);
                        }}
                      >
                        Delete
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="backlog-item-footer">
                <div className="backlog-item-left">
                  <span className="item-code">{item.code}</span>
                  {renderStats(item.stats, item.priority, item.assignee)}
                </div>
              </div>
            </div>
          ))}
        </div>


        <div className="product-backlog-container">
          <div className="product-backlog-header">
            <div className="backlog-title-section">
              <span className="backlog-title">Backlog</span>
              <span className="issues-count">{filteredBacklogIssues.length} issues</span>
            </div>
          </div>


          {/* Backlog section with drag and drop */}
          <div
            className={`backlog-items-container ${filteredBacklogIssues.length === 0 ? "empty" : ""} ${draggedItem ? "drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "backlog")}
            onDragLeave={handleDragLeave}
          >
            {filteredBacklogIssues.map((item) => (
              <div
                key={item.id}
                data-id={item.id}
                className="backlog-item"
                style={{ cursor: "pointer" }}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, item, "backlog")}
                onDragEnd={handleDragEnd}
                onClick={() => handleBacklogItemClick(item)}
              >
                <div className="backlog-item-header">
                  <div className="backlog-item-header-content">
                  <img 
  src={getIconSrc(item.type)}  // Dynamically set the correct icon based on item.type
  alt={item.type}              // Alt text matches the item type
  className="item-type-icon"   // Apply styling through this class
  draggable="false"            // Prevent the icon from being dragged
/>

<span className="item-title">{item.title}</span>
                  </div>
                  <div className="more-options-container" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal
                      className="more-options-icon"
                      onClick={() => {
                        setActiveMoreOptions(activeMoreOptions === item.id ? null : item.id);
                      }}
                    />

{activeMoreOptions === item.id && (
                      <div className="more-options-dropdown" onClick={(e) => e.stopPropagation()}>
                        <div
                          className="issues-dropdown-item issues-delete-option"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id, false);
                          }}
                        >
                          Delete
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="backlog-item-footer">
                  <div className="backlog-item-left">
                    <span className="item-code">{item.code}</span>
                    {renderStats(item.stats, item.priority, item.assignee)}
                  </div>
                </div>
              </div>
            ))}
            {renderCreateIssueForm()}
          </div>


          {/* Delete Confirmation Popup */}
          {showDeleteConfirmation && (
            <div className="backlogs-delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="backlogs-delete-popup-container">
                <p className="backlogs-delete-popup-message">Are you sure you want to delete {itemToDelete?.title}?</p>
                <div className="backlogs-delete-popup-actions">
                  <button className="backlogs-yes-action-button" onClick={handleConfirmDelete}>
                    Yes
                  </button>
                  <button className="backlogs-no-action-button" onClick={handleClosePopup}>
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

{showStartSprintPopup && (
            <div className="start-sprint-modal" onClick={(e) => e.stopPropagation()}>
              <div className="start-sprint-popup-container">
                <h2 className="start-sprint-popup-title">Start Sprint</h2>
                <div className="start-sprint-popup-divider" />
                <form onSubmit={handleStartSprintSubmit} className="start-sprint-popup-content">
                  <div className="start-sprint-form-section">
                    <div className="start-sprint-issue-count">
                      <p>
                        {filteredSprintIssues.length}
                        {filteredSprintIssues.length === 1 ? " issue" : " issues"} will be included in this sprint
                      </p>
                    </div>

                    <div className="start-sprint-date-group">
                      <p className="start-sprint-date-label">Project Name</p>
                      <div className="start-sprint-input">{sprintFormData.projectName}</div>
                    </div>

                    <DateTimePicker
  label="Start Date"
  date={sprintFormData.startDate}
  time={sprintFormData.startTime}
  onDateChange={(date) => {
    const today = new Date().setHours(0, 0, 0, 0); // Get today's date at midnight
    const selectedDate = new Date(date).setHours(0, 0, 0, 0);

    if (selectedDate >= today) {
      setSprintFormData({ ...sprintFormData, startDate: date });
      console.log("Valid Start Date Selected:", date);
    } else {
      console.error("Start Date cannot be in the past.");
    }
  }}
  onTimeChange={(time) => setSprintFormData({ ...sprintFormData, startTime: time })}
  min={new Date().toISOString().split('T')[0]} // Set the minimum date to today
/>

<DateTimePicker
  label="End Date"
  date={sprintFormData.endDate}
  time={sprintFormData.endTime}
  onDateChange={(date) => {
    // Ensure the end date is not before the start date
    if (new Date(date) >= new Date(sprintFormData.startDate)) {
      setSprintFormData({ ...sprintFormData, endDate: date });
    } else {
      console.error("End Date cannot be before Start Date");
    }
  }}
  onTimeChange={(time) => setSprintFormData({ ...sprintFormData, endTime: time })}
/>


</div>
                </form>
                <div className="start-sprint-popup-actions">
                  <button className="start-sprint-action-button" onClick={handleStartSprintSubmit}>
                    Start Sprint
                  </button>
                  <button className="start-sprint-action-button" onClick={() => setShowStartSprintPopup(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

{showNoIssuesPopup && (
            <div className="no-issues-modal" onClick={(e) => e.stopPropagation()}>
              <div className="no-issues-popup-container">
                <h2 className="no-issues-popup-title">Start Sprint</h2>
                <div className="no-issues-popup-divider" />
                <div className="no-issues-popup-content">
                  <p>There are no issues in the selected section yet. Please add an issue to the selected section.</p>
                </div>
                <div className="no-issues-popup-actions">
                  <button className="no-issues-action-button" onClick={() => setShowNoIssuesPopup(false)}>
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

{showMemberInviteModal && (
            <div className="backlog-member-modal-overlay">
              <div className="backlog-member-modal-container">
                <h3 className="backlog-member-modal-title">Invite Member</h3>

                <div className="backlog-member-email-input-section">
                  <div className="backlog-member-email-input-container">
                    <div className="backlog-member-email-input-wrapper">
                      <input type="email" placeholder="Invite others by Email" className="backlog-member-email-input" />
                
                    </div>
                    <button className="backlog-member-invite-button"  onClick={handleInviteClick} hidden={isButtonDisabled}>
                      Invite
                    </button>
                  </div>
                </div>


                {showInviteSuccessPopup && (
  <div className="backlog-invite-popup-overlay">
    <div className="backlog-invite-popup-modal">
      <img src={successPopup} alt="Success" className="backlog-invite-popup-icon" />
      <p className="backlog-invite-popup-message">
        Member has been successfully invited!
      </p>
      <button 
        className="backlog-invite-popup-button" 
        onClick={() => setShowInviteSuccessPopup(false)}
      >
        OK
      </button>
    </div>
  </div>
)}


{showInviteErrorPopup && (
  <div className="backlog-invite-popup-overlay">
    <div className="backlog-invite-popup-modal">
      <img src={errorPopup} alt="Error" className="backlog-invite-popup-icon" />
      <p className="backlog-invite-popup-error-message">{errorInviteMessage}</p>
      <button 
        className="backlog-invite-popup-error-button" 
        onClick={() => setShowInviteErrorPopup(false)}
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


{showMemberDetails && (
            <div className="backlog-members-popup-overlay">
              <div className="backlog-member-modal-container">
                <div className="backlog-member-details-header">
                  <div className="backlog-member-details-title-group">
                    <button onClick={() => setShowMemberDetails(false)} className="backlog-member-back-button">
                      <ArrowLeft size={15} style={{ marginTop: "2px" }} />
                    </button>
                    <h3 className="backlog-member-details-title">Members</h3>
                  </div>
                </div>



                <div className="backlog-member-details-list">
                  {members.map((member, index) => (
                    <div key={index} className="backlog-member-details-item">
                      <div className="backlog-member-details-info">
                        {member.img ? (
                          <img
                            src={member.img}
                            alt={member.name}
                            className="backlog-member-details-image"
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "9999px",
                            }}
                          />
                        ) : (

                          <div
                            className="backlog-member-placeholder"
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
                        <div className="backlog-member-details-text">
                          <span className="backlog-member-details-name">{member.name}</span>
                          <span className="backlog-member-details-role">{member.role || "Team Member"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


{showMembersPopup && (
            <div className="backlog-members-popup-overlay">
              <div className="backlog-members-popup-container">
                <div className="backlog-members-popup-header">
                  <h3 className="backlog-members-popup-title">Members</h3>
                  <button onClick={() => setShowMembersPopup(false)} className="backlog-members-popup-close">
                    <X size={20} />
                  </button>
                </div>
                <div className="backlog-members-list">
                  {members.map((member, index) => (
                    <div key={index} className="backlog-member-item"  
                    onMouseEnter={() => setHoveredScrumMember(index)}
                    onMouseLeave={() => setHoveredScrumMember(null)}>
                      {member.img ? (
                        <img src={member.img} alt={member.name} className="backlog-member-avatar" />
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
                    <div className="backlog-member-text">
                      <span className="backlog-member-name" onClick={() => handleProfileNavigation(member)}>{member.name}</span>
                      <span className="backlog-member-role">{member.role}</span>
                    </div>
                    {showRemoveIcon(member, index) && (
<img
  src={RemoveMemberIcon}
  alt="Remove Member"
  className="remove-member-icon-scrum"
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




              
    {showRemoveScrumPopup && (
      <div className="remove-popup-overlay-scrum">
        <div className="remove-popup-container-scrum">
          <div className="remove-popup-body-scrum">
            <p>
              Are you sure you want to remove {selectedScrumMember?.name} from the
              project?
            </p>
          </div>
          <div className="remove-popup-actions-scrum">
            <button onClick={handleConfirmRemovebacklog}>Yes</button>
            <button onClick={handleCancelRemove}>No</button>
          </div>
        </div>
      </div>
    )}


{/* Removal Success Popup */}
{showRemovalSuccessPopup && (
    <div className="backlog-remove-popup-overlay">
      <div className="backlog-remove-popup-modal">
        <img src={successPopup} alt="Success" className="backlog-remove-popup-icon" />
        <p className="backlog-remove-popup-message">{removalSuccessMessage}</p>
        <button 
          className="backlog-remove-popup-button" 
          onClick={() => setShowRemovalSuccessPopup(false)}
        >
          OK
        </button>
      </div>
    </div>
  )}

  {/* Removal Error Popup */}
  {showRemovalErrorPopup && (
    <div className="backlog-remove-popup-overlay">
      <div className="backlog-remove-popup-modal">
        <img src={errorPopup} alt="Error" className="backlog-remove-popup-icon" />
        <p className="backlog-remove-popup-error-message">{removalErrorMessage}</p>
        <button 
          className="backlog-remove-popup-error-button" 
          onClick={() => setShowRemovalErrorPopup(false)}
        >
          OK
        </button>
      </div>
    </div>
  )}



            </div>
          )}

          {/* Add presentation popup */}
          {isPopupOpen && selectedIssue && (
            <div className="backlog-presentation-popup__overlay">
              <div className="backlog-presentation-popup__container">
                <div className="backlog-presentation-popup__header">
                  <div className="backlog-presentation-popup__title-group">
                  <div className="backlog-presentation-popup__title-wrapper">
  <img src={icon} alt="Presentation icon" className="backlog-presentation-popup__icon" />
  <div>
    {isEditingTitle ? (
      <input
        type="text"
        className="backlog-presentation-popup__title"
        value={editedTitle}
        onChange={handleTitleChange}
        onKeyPress={handleTitleKeyPress}
        onBlur={() => setIsEditingTitle(false)}
        autoFocus
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          outline: "none",
          borderBottom: "1px solid #2665AC",
          fontSize: "inherit",
          fontWeight: "inherit",
        }}
        disabled={isButtonDisabled}
      />
    ) : (
      <h2
  ref={issuePopupTitleRef}
  className="backlog-presentation-popup__title"
  onMouseEnter={() => {
    if (issuePopupTitleRef.current && 
        issuePopupTitleRef.current.scrollWidth > issuePopupTitleRef.current.offsetWidth) {
      setShowIssuePopupTooltip(true);
    }
  }}
  onMouseLeave={() => setShowIssuePopupTooltip(false)}
  onClick={() => !isButtonDisabled && handleTitleClick()}
>
  {selectedIssue.title}
  {showIssuePopupTooltip && (
        <div className="backlog-issue-popup-title-tooltip">{selectedIssue.title}</div>
      )}
    </h2>
    )}
  </div>
</div>

<div className="backlog-presentation-popup__status-group">
<span className="backlog-presentation-popup__tag-group">
  <div style={{ position: 'relative' }}>
    <img
      src={getIconSrc(selectedIssue.type)}
      alt="Type"
      ref={iconRef}
      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
      onClick={() => setIsTypeDropdownOpen((prev) => !prev)}
    />

    {/* Dropdown */}
    {isTypeDropdownOpen && hasAccess && (
      <div
        ref={dropdownRef}
        style={{
          position: 'absolute',
          zIndex: 10,
          backgroundColor: 'white',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: '4px',
          border: '1px solid #ddd',
          marginTop: '4px',
        }}
      >
        {issueTypes.map((issueType) => (
          <div
            key={issueType.type}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = '#D6E6F2')
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = 'transparent')
            }
            onClick={() => handleIssueTypeChange(issueType.type)}
          >
            <img
              src={issueType.icon}
              alt={issueType.type}
              style={{
                width: '16px',
                height: '16px',
                marginRight: '8px',
              }}
            />
            <span>{issueType.type}</span>
          </div>
        ))}
      </div>
    )}
  </div>
  {selectedIssue.code}
  <img
    src={subtask}
    alt="Subtask"
    className="backlog-presentation-popup__subtask-icon"
  />
  <span>{subtasksCount}</span>
</span>

</div>
</div>

                  <div className="backlog-presentation-popup__actions">
                  <button onClick={handleCloseBacklogPopup} className="backlog-presentation-popup__close-btn">
  <X size={20} />
</button>
                  </div>
                </div>

                <div className="backlog-presentation-popup__content">
                  <div className="backlog-presentation-popup__section_description">
                    <h3 className="backlog-presentation-popup__section-description">Description</h3>
                    {isEditingDescription ? (
                      <input
                        type="text"
                        className="backlog-presentation-popup__description"
                        value={description}
                        onChange={handleDescriptionChange}
                        onKeyPress={handleDescriptionKeyPress}
                        onBlur={() => setIsEditingDescription(false)}
                        autoFocus
                        style={{
                          width: "100%",
                          border: "none",
                          background: "transparent",
                          outline: "none",
                          borderBottom: "1px solid #2665AC",
                        }}
                        disabled={isButtonDisabled}
                      />
                    ) : (
                      <p className="backlog-presentation-popup__description" onClick={handleDescriptionClick}>
                        {description || "No description available"}
                      </p>
                    )}
                  </div>

                  <div className="backlog-presentation-popup__section_subtask">
                    <div className="backlog-presentation-popup__subtask-header">
                      <h3 className="backlog-presentation-popup__section-subtask">Subtasks</h3>
                      <button className="backlog-presentation-popup__create-btn" onClick={handleCreateSubtask} hidden={isButtonDisabled}>
                        + Create Subtask
                      </button>
                    </div>

                    <div className="backlog-presentation-popup__subtask-list">
                      {subtasks.map((subtask) => (
                        <div key={subtask.id} className="backlog-presentation-popup__subtask-item">
                          <img src={inputSubtaskIcon} alt="Task icon" className="backlog-presentation-popup__subtask-icon" />
                          <div className="backlog-presentation-popup__subtask-content">
                            {editingSubtaskId === subtask.id ? (
                              <>
                                <div className="backlog-presentation-popup__subtask-content">
                                  <input
                                    disabled ={isButtonDisabled}
                                    type="text"
                                    value={editingSubtaskTitle}
                                    onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                    className="backlog-presentation-popup__input"
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
                                    className="backlog-presentation-popup__update-subtask-btn"
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
                                    className="backlog-presentation-popup__cancel-edit-subtask-btn"
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
                                <div className="backlog-presentation-popup__subtask-content">
                                  <span className="backlog-presentation-popup__subtask-title" onDoubleClick={() => handleEditSubtask(subtask)}>
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
  <div className="backlog-presentation-popup__subtask-input-container" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    <div className="backlog-presentation-popup__subtask-input" style={{ display: "flex", alignItems: "center" }}>
      <img src={inputSubtaskIcon} alt="Subtask" className="backlog-presentation-popup__subtask-icon" />
      <input
        type="text"
        placeholder="What needs to be addressed?"
        className="backlog-presentation-popup__input"
        value={newSubtask}
        onChange={(e) => setNewSubtask(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter" && !isSubmittingSubtask) {
            handleSubmitSubtask();
          }
        }}
        disabled={isSubmittingSubtask}
        autoFocus
        style={{ width: "100%" }}
      />
    </div>
    <div
      className="backlog-presentation-popup__subtask-buttons"
      style={{
        display: "flex",
        gap: "8px",
        marginLeft: "330px",
      }}
    >
      <button
        onClick={handleSubmitSubtask}
        className="backlog-presentation-popup__create-subtask-btn"
        style={{
          padding: "6px 12px",
          backgroundColor: "#2665AC",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isSubmittingSubtask ? "not-allowed" : "pointer",
          fontSize: "12px",
          transition: "background-color 0.3s",
          opacity: isSubmittingSubtask ? 0.7 : 1,
        }}
        disabled={isSubmittingSubtask}
        onMouseEnter={(e) => !isSubmittingSubtask && (e.currentTarget.style.backgroundColor = "#1976d2")}
        onMouseLeave={(e) => !isSubmittingSubtask && (e.currentTarget.style.backgroundColor = "#2665AC")}
      >
        {isSubmittingSubtask ? "Creating..." : "Create"}
      </button>
      <button
        onClick={handleCancelSubtask}
        className="backlog-presentation-popup__cancel-subtask-btn"
        style={{
          padding: "6px 12px",
          backgroundColor: "#2665AC",
          color: "white",
          border: "1px solid #ddd",
          borderRadius: "4px",
          cursor: isSubmittingSubtask ? "not-allowed" : "pointer",
          fontSize: "12px",
          transition: "background-color 0.3s",
          opacity: isSubmittingSubtask ? 0.7 : 1,
        }}
        disabled={isSubmittingSubtask}
        onMouseEnter={(e) => !isSubmittingSubtask && (e.currentTarget.style.backgroundColor = "#1976d2")}
        onMouseLeave={(e) => !isSubmittingSubtask && (e.currentTarget.style.backgroundColor = "#2665AC")}
      >
        Cancel
      </button>
    </div>
  </div>
)}
                    </div>
                  </div>
                  <div className="backlog-popup__section">
                    <h3 className="backlog-popup__section-title">Details</h3>
                    <div className="backlog-popup__details-list">
                      {/* Points section */}
                      <div className="backlog-popup__detail-item">
                        <span className="backlog-popup__detail-label">Story Points</span>
                        <div className="backlog-popup__user">
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

                      {/* Effort section */}
                      <div className="backlog-popup__detail-item">
                        <span className="backlog-popup__detail-label">Effort</span>
                        <div className="backlog-popup__user">
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
                      <div className="backlog-popup__detail-item">
                        <span className="backlog-popup__detail-label">Priority</span>
                        <div className="backlog-popup__user backlog-priority-dropdown" style={{ position: "relative" }}>
                          <div
                            onClick={() => !isButtonDisabled && setPopupShowPriorityDropdown(!showPopupPriorityDropdown)} // Disable onClick if isButtonDisabled
                            style={{
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
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
                                  onClick={() => handlePriorityChange(option.value)}
                                  style={{
                                    padding: "8px",
                                    cursor: "pointer",
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
                      <div className="backlog-popup__detail-item">
                        <span className="backlog-popup__detail-label">Assignee</span>
                        <div className="backlog-popup__user backlog-assignee-dropdown" style={{ position: "relative" }}>
                          <div
                            className="backlog-popup__user-toggle"
                            onClick={() => !isButtonDisabled && setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)} // Disable onClick if isButtonDisabled
                            style={{
                              display: "flex",
                              alignItems: "center",
                              cursor: isButtonDisabled ? "not-allowed" : "pointer",
                              gap: "8px",
                              pointerEvents: isButtonDisabled ? "none" : "auto",
                            }}
                          >
                            {selectedAssignee.img ? (
                              <img src={selectedAssignee.img} alt={selectedAssignee.name} className="backlog-popup__user-avatar" />
                            ) : (
                              <div
                                className="backlog-popup__user-avatar"
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
                                {selectedAssignee.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="backlog-popup__user-name">{selectedAssignee.name}</span>
                          </div>

                          {isAssigneeDropdownOpen && (
                            <div
                            ref={assigneeChangeRef}
                              className="backlog-popup__assignee-list"
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
                                className="backlog-popup__search"
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
                                  className="backlog-popup__search-input"
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
                                className="backlog-popup__user-list"
                                style={{
                                  maxHeight: "100px",
                                  overflowY: "auto",
                                }}
                              >
                                {filteredUsers.map((user) => (
                                  <div
                                    key={user.id}
                                    className="backlog-popup__user-item"
                                    onClick={() => handleAssigneeSelect(user)}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      padding: "8px",
                                      cursor: "pointer",
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
                                        className="backlog-popup__user-avatar-small"
                                        style={{
                                          width: "24px",
                                          height: "24px",
                                          borderRadius: "50%",
                                        }}
                                      />
                                    ) : (
                                      <div
                                        className="backlog-popup__user-avatar-small"
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
                                    <span className="backlog-popup__user-name-small">{user.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="backlog-popup__detail-item">
                        <span className="backlog-popup__detail-label">Reporter</span>
                        <div className="backlog-popup__user">
                          <img src={masterIcon} alt="Franco Bayani" className="backlog-popup__user-avatar" />
                          <span className="backlog-popup__user-name">{scrumMaster}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="backlog--presentation-popup__section_comment">
                    <div className="backlog-presentation-popup__comment-header">
                      <h3 className="backlog-presentation-popup__section-comment">
                      {parseInt(commentCount)} {parseInt(commentCount) === 1 ? "Comment" : "Comments"}
                      </h3>
                      <div className="backlog-presentation-popup__sort-dropdown" style={{ position: "relative" }}>
                        <button
                          className="backlog-presentation-popup__sort-btn"
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
                            className="backlog-presentation-popup__dropdown-menu"
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
                                className="backlog-presentation-popup__dropdown-item"
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

                    <div className="backlog-presentation-popup__comment-section">
                    {!isDone && (
  <div
    className="backlog-presentation-popup__comment-input"
    style={{
      marginBottom: "16px",
      display: "flex",
      alignItems: "flex-start",
    }}
  >
    {masterIcon ? (
      <img
        src={userPicture}
        alt={""}
        className="backlog-presentation-popup__user-avatar"
        style={{
          width: "32px",
          height: "32px",
          marginRight: "8px",
          borderRadius: "50%",
        }}
      />
    ) : (
      <div
        className="backlog-presentation-popup__user-avatar"
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
    <input
      type="text"
      placeholder="Add a comment"
      className="backlog-presentation-popup__comment-field"
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
                        className="backlog-presentation-popup__comment-list"
                        style={{
                          overflowY: "auto",
                          maxHeight: "80px",
                          gap: "8px",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {(issueComments[selectedIssue?.id] || []).map((comment) => (
                          <div
                            key={comment.id}
                            className="backlog-presentation-popup__comment"
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
                                className="backlog-presentation-popup__user-avatar"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  marginRight: "8px",
                                  borderRadius: "50%",
                                }}
                              />
                            ) : (
                              <div
                                className="backlog-presentation-popup__user-avatar"
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
                            <div className="backlog-presentation-popup__comment-content" style={{ flex: 1 }}>
  <div className="backlog-presentation-popup__comment-header">
    <span className="backlog-presentation-popup__comment-author"  
                     onClick={() => handleProfileNavigation({
                        memberId: comment.authorId,
                        name: comment.author,
                        img: comment.avatar
                    })}>{comment.author}</span>
    <span className="backlog-presentation-popup__comment-time">{comment.timestamp}</span>
    {!isDone && comment.authorId === uid && (
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
  <p className="backlog-presentation-popup__comment-text">{comment.content}</p>
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

<div hidden={!allow} className="create-issue-container">
      <button className="create-issue-btn" onClick={handleCreateIssue}>
        <Plus size={16} />
        Create Issue
      </button>
    </div>
        </div>
      </div>
    </div>
  );
};

export default Backlogs;
