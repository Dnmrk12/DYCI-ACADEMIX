import React, { useState, useRef, useEffect, memo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getFirestore, orderBy, onSnapshot, limit, increment, addDoc, collection, getDocs, arrayUnion, doc, getDoc, deleteDoc, updateDoc, arrayRemove, setDoc, query, where, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ArrowLeft, Trash2, Pencil, X, Users, Check, Plus, ChevronDown, UserCircle2, Pin, Search } from "lucide-react";
import RemoveMemberIcon from "./iconshomepage/RemoveMember.png";
import successPopup from "./iconshomepage/successPopup.png";
import errorPopup from "./iconshomepage/errorPopup.png";
import img6 from "./iconshomepage/softwaredataicon.png";
import img7 from "./iconshomepage/versionupdate.png";
import img12 from "./iconshomepage/researchicon.png";
import img13 from "./iconshomepage/bugfixicon.png";
import img18 from "./iconshomepage/notifprofile4.png";
import img19 from "./iconshomepage/memberIcon1.png";
import img22 from "./iconshomepage/subtaskIcon.png";
import img23 from "./iconshomepage/issueComment.png";
import img24 from "./iconshomepage/effortIcon.png";
import low from "./iconshomepage/backlogsLow.png";
import medium from "./iconshomepage/backlogsMedium.png";
import high from "./iconshomepage/backlogsHigh.png";
import "./kanbanboard.css";
import "./kanbanissue.css";

const KanbanIssue = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const filterRef = useRef(null);
  const typeRef = useRef(null);
  const priorityRef = useRef(null);
  const typeIssueRef = useRef(null);
  const columnRef = useRef(null);
  const cardRef = useRef(null);
  const createIssueRef = useRef(null);
  const createIssueButtonRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const { epicId } = useParams();
  const [epicName, setEpicName] = useState("");
  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [members, setMembers] = useState([]);
  const [showInviteMemberPopup, setShowInviteMemberPopup] = useState(false);
  const [showInviteSuccessPopup, setShowInviteSuccessPopup] = useState(false);
  const [showInviteErrorPopup, setShowInviteErrorPopup] = useState(false);
  const [errorInviteMessage, setErrorInviteMessage] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [toDoColumnName, setToDoColumnName] = useState("To-do");
  const [columns, setColumns] = useState(["To-do", "In Progress", "Complete"]);
  const [tasks, setTasks] = useState([]);
  const [columnToDelete, setColumnToDelete] = useState(null);
  const [showColumnDeleteConfirmation, setShowColumnDeleteConfirmation] = useState(false);
  const [activeColumnMenu, setActiveColumnMenu] = useState(null);
  const [showColumnInput, setShowColumnInput] = useState(false);
  const [insertAfterColumn, setInsertAfterColumn] = useState(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [showAddColumnTooltip, setShowAddColumnTooltip] = useState(false);
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const [selectedEpicId, setSelectedEpicId] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [hoveredTask, setHoveredTask] = useState(null);
  const [subtaskCount, setSubtaskCount] = useState("");
  const [activeCard, setActiveCard] = useState(null);
  const [issueId, setIssueID] = useState("");
  const [issueName, setIssueName] = useState("");
  const [issueStatus, setIssueStatus] = useState("");
  const [issueType, setIssueType] = useState("");
  const [issueEpicCode, setIssueEpicCode] = useState("");
  const [issueCount, setIssueCount] = useState("");
  const [issuepriority, setIssuePriority] = useState("");
  const [projectPicture, setProjectPicture] = useState("");
  const [issueEffort, setissueEffort] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userPictureComment, setUserPictureComment] = useState("");
  const [commentCount, setCommentCount] = useState("");
  const [assignId, setAssignId] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [issueCode, setIssueCode] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [issuedescription, setIssueDescription] = useState("");
  const [draggedTask, setDraggedTask] = useState(null);
  const [showCreateIssueContainer, setShowCreateIssueContainer] = useState(false);
  const [newIssueDescription, setNewIssueDescription] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showPresentationPopup, setShowPresentationPopup] = useState(false);
  const [userPicture, setUserPicture] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("Story");
  const [showTypeFilterDropdown, setShowTypeFilterDropdown] = useState(false);
  const [projectStatus, setProjectStatus] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({ onlyMyIssue: false });
  const [selectedTypeFilters, setSelectedTypeFilters] = useState({ story: false, task: false, bug: false });
  const auth = getAuth();
  const db = getFirestore();

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showRemovalSuccessPopup, setShowRemovalSuccessPopup] = useState(false);
const [showRemovalErrorPopup, setShowRemovalErrorPopup] = useState(false);
const [removalErrorMessage, setRemovalErrorMessage] = useState("");
const [removalSuccessMessage, setRemovalSuccessMessage] = useState("");

  // Separate useEffect for epicName
  useEffect(() => {
    if (location.state?.epicName) {
      setEpicName(location.state.epicName);
    }
  }, [location.state]);

  // Separate useEffect for access check
  useEffect(() => {
    const currentEpicId = epicId || location.state?.epicId;
    if (currentEpicId) {
      checkUserAccess();
    }
  }, [epicId, location.state?.epicId, auth.currentUser]); // Add dependencies

  // Separate useEffect for fetching members
  useEffect(() => {
    const currentEpicId = epicId || location.state?.epicId;
    if (currentEpicId) {
      fetchMembers();
    }
  }, [epicId, location.state?.epicId]);

  const checkUserAccess = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const currentEpicId = epicId || location.state?.epicId;
      if (!currentEpicId) return;

      const memberRef = doc(db, `Kanban/${currentEpicId}/Member/${currentUser.uid}`);
      const memberDoc = await getDoc(memberRef);

      if (memberDoc.exists()) {
        const memberData = memberDoc.data();
        setHasAccess(memberData.Access === true);
        console.log("User access status:", memberData.Access); // Debug log
      } else {
        console.log("Member document doesn't exist"); // Debug log
      }
    } catch (error) {
      console.error("Error checking user access:", error);
    }
  };

  const checkIfUserIsAdmin = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No user logged in");
        setCheckingAdmin(false);
        return;
      }

      const uid = currentUser.uid;
      const currentEpicId = epicId || location.state?.epicId;

      const epicRef = doc(db, `Kanban/${currentEpicId}`);
      const epicSnapshot = await getDoc(epicRef);

      if (epicSnapshot.exists()) {
        const epicData = epicSnapshot.data();
        setIsAdmin(epicData.admin === uid);
      }
      setCheckingAdmin(false);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setCheckingAdmin(false);
    }
  };

  // Modify your existing auth useEffect or add this new one
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await checkIfUserIsAdmin();
      } else {
        setIsAdmin(false);
        setCheckingAdmin(false);
      }
    });

    return () => unsubscribe();
  }, [epicId, location.state?.epicId]);

  const fetchMembers = async () => {
    if (!epicId && !location.state?.epicId) return;

    const currentEpicId = epicId || location.state?.epicId;

    try {
      const membersRef = collection(db, `Kanban/${currentEpicId}/Member`);
      const membersSnapshot = await getDocs(membersRef);
      const membersData = [];

      for (const memberDoc of membersSnapshot.docs) {
        const memberUid = memberDoc.id;
        const memberRole = memberDoc.data().Type;

        const userDoc = await getDoc(doc(db, `users/${memberUid}`));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          membersData.push({
            memberId: memberUid,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            userPicture: userData.userPicture || "",
            role: memberRole,
          });
        }
      }

      setMembers(membersData);
      console.log("Fetched members:", membersData);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [epicId, location.state]);
  const [id, setId] = useState(null);

  const handleBack = () => {
    setId(null); // Set id to null
    navigate('/kanbanboard'); // Navigate to /kanbanboard
  };
  

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

  const handleRemoveMember = async (member) => {
    try {
      const currentEpicId = epicId || location.state?.epicId;
  
      const userKanbanDocRef = doc(db, `users/${member.memberId}/Kanban/${currentEpicId}`);
      await deleteDoc(userKanbanDocRef);
  
      const kanbanIssuesRef = collection(db, `Kanban/${currentEpicId}/kanbanIssue`);
      const kanbanIssuesSnapshot = await getDocs(kanbanIssuesRef);
  
      const updatePromises = kanbanIssuesSnapshot.docs.map(async (issueDoc) => {
        const issueData = issueDoc.data();
        if (issueData.assignId === member.memberId) {
          const issueDocRef = doc(db, `Kanban/${currentEpicId}/kanbanIssue/${issueDoc.id}`);
          return updateDoc(issueDocRef, { assignId: null });
        }
      });
  
      await Promise.all(updatePromises);
  
      const epicMemberDocRef = doc(db, `Kanban/${currentEpicId}/Member/${member.memberId}`);
      await deleteDoc(epicMemberDocRef);
  
      setMembers((prevMembers) => prevMembers.filter((m) => m.memberId !== member.memberId));
      setRemovalSuccessMessage(`${member.firstName} ${member.lastName} successfully removed from the team.`);
      setShowRemovalSuccessPopup(true);
      console.log("Member removed successfully");
    } catch (error) {
      console.error("Error removing member:", error);
      setRemovalErrorMessage("Failed to remove member from the team. Please try again.");
      setShowRemovalErrorPopup(true);
    }
  };

  const MembersPopup = ({ members, onClose }) => {
    const [hoveredMember, setHoveredMember] = useState(null);
    const [showRemovePopup, setShowRemovePopup] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const handleRemoveMemberClick = (member) => {
      setSelectedMember(member);
      setShowRemovePopup(true);
    };

    const handleConfirmRemove = async () => {
      if (selectedMember) {
        await handleRemoveMember(selectedMember);
        setShowRemovePopup(false);
      }
    };

    const showRemoveIcon = (member, index) => {
      return hasAccess && hoveredMember === index && currentUser && member.memberId !== currentUser.uid;
    };

    return (
      <div className="members-popup-overlay">
        <div className="members-popup-container">
          <div className="members-popup-header">
            <h3 className="members-popup-title">Members</h3>
            <button onClick={onClose} className="members-popup-close">
              <X size={20} />
            </button>
          </div>
          <div className="members-list">
            {members.map((member, index) => (
              <div key={member.memberId} className="member-item" onMouseEnter={() => setHoveredMember(index)} onMouseLeave={() => setHoveredMember(null)}>
                {member.userPicture ? (
                  <img src={member.userPicture} alt={member.firstName} className="member-avatar" />
                ) : (
                  <div className="member-initial">{member.firstName.charAt(0).toUpperCase()}</div>
                )}
                <div className="members-info">
                  <span className="member-name" onClick={() => handleProfileNavigation(member)}>
                    {`${member.firstName} ${member.lastName}`}
                  </span>
                  <span className="member-role">{member.role}</span>
                </div>

                {showRemoveIcon(member, index) && projectStatus !== "Complete" && (
                  <img
                    src={RemoveMemberIcon}
                    alt="Remove Member"
                    className="remove-member-icon"
                    onClick={() => handleRemoveMemberClick(member)}
                    style={{
                      cursor: "pointer",
                      width: "20px",
                      height: "20px",
                      marginLeft: "auto",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {showRemovePopup && (
            <div className="remove-popup-overlay">
              <div className="remove-popup-container">
                <div className="remove-popup-body">
                  <p>
                    Are you sure you want to remove {selectedMember?.firstName} {selectedMember?.lastName} from the project?
                  </p>
                </div>
                <div className="remove-popup-actions">
                  <button onClick={handleConfirmRemove}>Yes</button>
                  <button onClick={() => setShowRemovePopup(false)}>No</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };


  const InviteMemberPopup = ({ onClose }) => {
    const [showMemberDetails, setShowMemberDetails] = useState(false);
    const currentEpicId = epicId || location.state?.epicId;
    const displayedMembers = members.slice(0, 2);
    const memberCount = members.length;

    const handleInvite = async () => {
      const emailInput = document.querySelector(".member-email-input").value.trim();
      if (!emailInput) {
        setErrorInviteMessage("Please enter a valid email.");
        setShowInviteErrorPopup(true);
        return;
      }

      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setErrorInviteMessage("You must be signed in to perform this action.");
          setShowInviteErrorPopup(true);
          return;
        }
        const currentUserId = currentUser.uid;

        const userKanbanRef = doc(db, `users/${currentUserId}/Kanban/${currentEpicId}`);
        const userKanbanDoc = await getDoc(userKanbanRef);

        if (!userKanbanDoc.exists()) {
          setErrorInviteMessage("Notification ID not found. Please ensure your Kanban setup is complete.");
          setShowInviteErrorPopup(true);
          return;
        }

        const notifId = userKanbanDoc.data().notifId;
        if (!notifId) {
          setErrorInviteMessage("Notification ID is missing in the user's Kanban document.");
          setShowInviteErrorPopup(true);
          return;
        }

        const usersRef = collection(db, "users");
        const emailQuery = query(usersRef, where("email", "==", emailInput));
        const querySnapshot = await getDocs(emailQuery);

        if (querySnapshot.empty) {
          setErrorInviteMessage("No user found with this email.");
          setShowInviteErrorPopup(true);
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;

        const memberRef = doc(db, `Kanban/${currentEpicId}/Member/${userId}`);
        const memberSnapshot = await getDoc(memberRef);

        if (memberSnapshot.exists()) {
          setErrorInviteMessage("This user has already been invited to the epic.");
          setShowInviteErrorPopup(true);
          return;
        }

        await setDoc(memberRef, {
          MemberUid: userId,
          Access: false,
          createdAt: serverTimestamp(),
          Type: "Team Member",
        });

        await setDoc(doc(db, `users/${userId}/Kanban/${currentEpicId}`), {
          EpicId: currentEpicId,
          createdAt: serverTimestamp(),
        });

        const notifRef = doc(db, `Kanban/${currentEpicId}/kanbanNotif/${notifId}`);
        const notifDoc = await getDoc(notifRef);

        if (!notifDoc.exists()) {
          await setDoc(notifRef, {
            receiver: [userId],
          });
        } else {
          const notifData = notifDoc.data();
          if (!notifData.receiver.includes(userId)) {
            await updateDoc(notifRef, {
              receiver: [...notifData.receiver, userId],
            });
          }
        }

        setShowInviteSuccessPopup(true);
        onClose();
        fetchMembers();
      } catch (error) {
        console.error("Error inviting user:", error);
        setErrorInviteMessage("There was an error inviting the user.");
        setShowInviteErrorPopup(true);
      }
    };

    const MemberDetailsPopup = ({ onBack }) => {
      return (
        <div className="member-modal-overlay">
          <div className="member-modal-container">
            <div className="member-details-header">
              <div className="member-details-title-group">
                <button onClick={onBack} className="member-back-button">
                  <ArrowLeft size={15} style={{ marginTop: "2px" }} />
                </button>
                <h3 className="member-details-title">Members</h3>
              </div>
            </div>

            <div className="member-details-list">
              {members.map((member, index) => (
                <div key={index} className="member-details-item">
                  <div className="member-details-info">
                    {member.userPicture ? (
                      <img src={member.userPicture} alt={`${member.firstName} ${member.lastName}`} className="member-details-image" />
                    ) : (
                      <div
                        className="member-placeholder"
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
                        {member.firstName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="member-details-text">
                      <span className="member-details-name" onClick={() => handleProfileNavigation(member)}>
                        {`${member.firstName} ${member.lastName}`}
                      </span>
                      <span className="member-details-role">{member.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };

    if (showMemberDetails) {
      return <MemberDetailsPopup onBack={() => setShowMemberDetails(false)} />;
    }

    return (
      <div className="member-modal-overlay">
        <div className="member-modal-container">
          <h3 className="member-modal-title">Invite Member</h3>

          <div className="member-email-input-section">
            <div className="member-email-input-container">
              <input type="email" placeholder="Invite others by Email" className="member-email-input" />
              <button className="member-invite-button" onClick={handleInvite}>
                Invite
              </button>
            </div>
          </div>

          <div className="member-list">
            <div className="member-list-item" onClick={() => setShowMemberDetails(true)}>
              <div className="member-info">
                <div className="member-images">
                  {displayedMembers.map((member, index) =>
                    member.userPicture ? (
                      <img key={index} src={member.userPicture} alt={member.firstName} className="member-image" />
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
                        }}
                      >
                        {member.firstName.charAt(0).toUpperCase()}
                      </div>
                    ),
                  )}
                  {memberCount > 2 && (
                    <div className="member-image-count">
                      <span className="member-image-count-text">+{memberCount - 2}</span>
                    </div>
                  )}
                </div>
                <span className="member-names">
                  {displayedMembers.map((member, index) => (
                    <span key={index}>
                      {member.firstName}
                      {index < displayedMembers.length - 1 && ", "}
                    </span>
                  ))}
                  {memberCount > 2 && ` and ${memberCount - 2} Others`}
                </span>
              </div>
              <svg className="member-arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <button onClick={onClose} className="member-close-button">
            <span className="member-close-icon">×</span>
          </button>
        </div>
      </div>
    );
  };

  const [subtasks, setSubtasks] = useState([]);
  const uid = auth.currentUser ? auth.currentUser.uid : "";

  // Add this useEffect in the parent component
  useEffect(() => {
    const fetchSubtasks = async () => {
      if (!selectedEpicId || !issueId) return;

      try {
        const issueRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);
        const issueDoc = await getDoc(issueRef);

        if (issueDoc.exists()) {
          const data = issueDoc.data();
          const subtasksWithIds = (data.subtasks || []).map((subtask) => ({
            ...subtask,
            id: subtask.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
          }));
          setSubtasks(subtasksWithIds);
          setSubtaskCount(data.subtaskCount?.toString() || "0");
        }
      } catch (error) {
        console.error("Error fetching subtasks:", error);
      }
    };

    fetchSubtasks();
  }, [selectedEpicId, issueId]); // Only re-fetch when these values change

  const fetchProjectStatus = async () => {
    if (!selectedEpicId) return;
    
    try {
      const epicDoc = await getDoc(doc(db, `Kanban/${selectedEpicId}`));
      if (epicDoc.exists()) {
        setProjectStatus(epicDoc.data().projectStatus || "");
      }
    } catch (error) {
      console.error("Error fetching project status:", error);
    }
  };

  useEffect(() => {
    if (selectedEpicId) {
      fetchProjectStatus();
    }
  }, [selectedEpicId]);

  const PresentationSlidePopup = ({ onClose, subtasks: initialSubtasks, subtaskCount: initialSubtaskCount, onSubtasksUpdate }) => {
    const typeChangeRef = useRef(null);
    const statusChangeRef = useRef(null);
    const priorityChangeRef = useRef(null);
    const assigneeChangeRef = useRef(null);
    const sortChangeRef = useRef(null);
    const [localSubtasks, setLocalSubtasks] = useState(initialSubtasks);
    const [localSubtaskCount, setLocalSubtaskCount] = useState(initialSubtaskCount);
    const [editedTitle, setEditedTitle] = useState(issueName);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [description, setDescription] = useState(issuedescription);
    const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
    const [newSubtask, setNewSubtask] = useState("");
    const [editingSubtaskId, setEditingSubtaskId] = useState(null);
    const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");
    const [subtaskToDelete, setSubtaskToDelete] = useState(null);
    const [showSubtaskDeleteConfirmation, setShowSubtaskDeleteConfirmation] = useState(false);
    const [effort, setEffort] = useState(issueEffort);
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
    const [priority, setPriority] = useState(issuepriority || "low");
    const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
    const [assigneeSearchTerm, setAssigneeSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState("Newest First");
    const sortOptions = ["Newest First", "Oldest First"];
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState([]);
    const [usersCache, setUsersCache] = useState({});
    const [showCommentDeleteConfirmation, setShowCommentDeleteConfirmation] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    const [selectedAssignee, setSelectedAssignee] = useState(() => {
      // Get the current task data
      const currentTask = tasks.find((task) => task.id === issueId);

      if (currentTask?.assignee) {
        return {
          id: currentTask.assignId,
          name: currentTask.assignee.name,
          img: currentTask.assignee.picture || null,
        };
      }

      return { name: "Unassigned", avatar: "/api/placeholder/24/24" };
    });

    useEffect(() => {
      const currentTask = tasks.find((task) => task.id === issueId);
      if (currentTask?.assignee) {
        setSelectedAssignee({
          id: currentTask.assignId,
          name: currentTask.assignee.name,
          img: currentTask.assignee.picture || null,
        });
      }
    }, [tasks, issueId]);

    // Update this line to directly use the task's current status
    const [selectedStatus, setSelectedStatus] = useState(() => {
      const currentTask = tasks.find((task) => task.id === issueId);
      return currentTask ? currentTask.status : issueStatus;
    });

    // Update the useEffect to sync the selectedStatus when tasks change
    useEffect(() => {
      const currentTask = tasks.find((task) => task.id === issueId);
      if (currentTask) {
        setSelectedStatus(currentTask.status);
      }
    }, [tasks, issueId]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        // Check if click is on the scrollbar of details list
        const detailsList = document.querySelector('.presentation-popup__details-list');
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
    
        // Handle Type issue dropdown
        if (typeChangeRef.current && !typeChangeRef.current.contains(event.target)) {
          setIsTypeDropdownOpen(false);
        }

        // Handle Sort issue dropdown
        const isSortClick = event.target.closest(".presentation-popup__sort-dropdown");
        const isOutsideSortMenu = !sortChangeRef.current?.contains(event.target);
        if (isOutsideSortMenu && !isSortClick) {
          setIsSortDropdownOpen(false);
        }
    
        // Handle Status issue dropdown
        const isStatusClick = event.target.closest(".presentation-popup__status-dropdown");
        const isOutsideStatusMenu = !statusChangeRef.current?.contains(event.target);
        if (isOutsideStatusMenu && !isStatusClick) {
          setIsStatusDropdownOpen(false);
        }
    
        // Handle priority issue dropdown
        const isPriorityClick = event.target.closest(".priority-dropdown");
        const isOutsidePresentationMenu = !priorityChangeRef.current?.contains(event.target);
        if (isOutsidePresentationMenu && !isPriorityClick) {
          setShowPriorityDropdown(false);
        }
    
        // Handle assignee issue dropdown
        const isAssigneeClick = event.target.closest(".assignee-dropdown");
        const isOutsideAssigneeMenu = !priorityChangeRef.current?.contains(event.target);
        if (isOutsideAssigneeMenu && !isAssigneeClick) {
          setIsAssigneeDropdownOpen(false);
        }
      };
    
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const handleTitleClick = () => {
      setEditedTitle(issueName);
      setIsEditingTitle(true);
    };

    const handleTitleChange = (e) => {
      setEditedTitle(e.target.value);
    };

    const handleTitleKeyPress = async (e) => {
      if (e.key === "Enter") {
        const validTitle = editedTitle.trim() || issueName;

        if (validTitle !== issueName) {
          try {
            // Update Firestore
            const issueRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);
            await updateDoc(issueRef, {
              IssueName: validTitle,
            });

            // Update local state
            setIssueName(validTitle);

            // Update tasks array to reflect the change
            setTasks((prevTasks) => prevTasks.map((task) => (task.id === issueId ? { ...task, title: validTitle } : task)));

            console.log("Title updated successfully!");
          } catch (error) {
            console.error("Error updating title:", error);
          }
        }

        setIsEditingTitle(false);
      }
    };

    const handleTypeChange = async (selectedType) => {
      try {
        // Reference to the Kanban issue document
        const issueRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);

        // Update the issue type in Firestore
        await updateDoc(issueRef, {
          issueType: selectedType,
        });

        // Update local state for the issue type
        setIssueType(selectedType);

        // Update tasks array to reflect the change
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === issueId ? { ...task, type: selectedType } : task)));

        // Close the dropdown
        setIsTypeDropdownOpen(false);

        console.log("Type updated successfully!");
      } catch (error) {
        console.error("Error updating issue type:", error);
      }
    };

    const TypeIcon = ({ type, size, onClick }) => {
      const typeOption = typeOptions.find((option) => option.id === type);
      return typeOption ? (
        <span className={`${typeOption.color}`} style={{ fontSize: size, cursor: projectStatus !== "Complete" && isAdmin ? "pointer" : "default" }} onClick={onClick}>
          {typeOption.icon}
        </span>
      ) : null;
    };

    const [statusOptions, setStatusOptions] = useState([]); // Initial state for status options
    //retrieve ng issue column
    useEffect(() => {
      const fetchStatusOptions = async () => {
        try {
          // Use selectedEpicId to dynamically construct the path
          const path = `Kanban/${selectedEpicId}/EpicColumn/p9Gdxwc3hs3tzZIdFDVi`;

          // Log the path to the console
          console.log("Firestore Document Path:", path);

          // Reference to the Firestore document
          const kanbanDocRef = doc(
            db,
            "Kanban", // Collection name
            selectedEpicId, // Dynamic Epic ID
            "EpicColumn", // Subcollection name
            "p9Gdxwc3hs3tzZIdFDVi", // Document ID for issueColumn
          );

          // Get the document snapshot
          const kanbanDoc = await getDoc(kanbanDocRef);

          if (kanbanDoc.exists()) {
            const data = kanbanDoc.data(); // Get the data from Firestore
            setStatusOptions(data.issueColumn || []); // Set status options
          } else {
            console.log("Document does not exist!");
          }
        } catch (error) {
          console.error("Error fetching status options: ", error);
        }
      };

      fetchStatusOptions(); // Fetch status options when the component mounts
    }, [selectedEpicId]); // Add selectedEpicId to the dependency array to update when it changes

    //ito pag add ng issue column
    const handleStatusSelect = async (status) => {
      setSelectedStatus(status); // Update the selected status
      setIsStatusDropdownOpen(false); // Close the dropdown after selection

      try {
        // Get references to the documents for epic and issue
        const epicRef = doc(db, "Kanban", selectedEpicId); // Epic reference
        const issueRef = doc(db, "Kanban", selectedEpicId, "kanbanIssue", issueId); // Issue reference

        // Fetch the epic name, admin, and issue data (issueName, issueType)
        const epicDoc = await getDoc(epicRef);
        const issueDoc = await getDoc(issueRef);

        // Correctly log the epic and issue data
        console.log(epicDoc.data(), issueDoc.data());

        if (epicDoc.exists() && issueDoc.exists()) {
          const epicName = epicDoc.data().epicName; // Get the epic name
          const admin = epicDoc.data().admin; // Get the admin (creator/UID)
          const assignId = issueDoc.data().assignId; // Get the assign
          const issueType = issueDoc.data().issueType; // Get the issue type (e.g., story, task, bug)
          const issueName = issueDoc.data().IssueName; // Get the issue name

          if (!issueName) {
            console.error("Issue name is undefined!");
            return;
          }

          // Log the selected status and the paths being used to update Firestore
          console.log("Selected Status:", status); // Log the selected status
          console.log("Firestore Document Path:", `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`); // Log the Firestore path

          // Update the projectStatus field in Firestore for the issue
          await updateDoc(issueRef, {
            issueStatus: status, // Update the status field
          });

          console.log("Status updated successfully"); // Confirmation message after the update

          // Update the status in the local state to reflect changes instantly in the UI
          setTasks((prevTasks) => prevTasks.map((task) => (task.id === issueId ? { ...task, status: status } : task)));

          // Format current date and time to match the format: 12/14/2024 3:48 AM (without seconds)
          const currentDate = new Date()
            .toLocaleString("en-US", {
              timeZone: "Asia/Manila",
              hour12: true,
              hour: "numeric",
              minute: "numeric",
              day: "numeric",
              month: "numeric",
              year: "numeric",
            })
            .replace(/(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2}) (\w{2})/, "$1/$2/$3 $4:$5 $6"); // Remove the comma

          // Get the current user's UID (from Firebase Auth)
          const uid = getAuth().currentUser.uid; // Get the current user's UID

          // Create log entry for the current user (under users/${uid}/logReport)
          const logRefForUser = doc(db, "users", assignId, "logReport", Date.now().toString()); // Unique ID for the document
          await setDoc(logRefForUser, {
            status: status,
            dateTime: currentDate, // Current date and time in the requested format
            projectName: epicName, // Epic name
            issue: issueName, // Issue name
            type: issueType, // Issue type (e.g., story, task, bug)
            admin: admin, // Admin UID (creator of the epic)
          });

          console.log("Log report entry created for user successfully");

          // Create log entry for the admin (under users/${admin}/log)
          const logRefForAdmin = doc(db, "users", admin, "logReport", Date.now().toString()); // Unique ID for the document
          await setDoc(logRefForAdmin, {
            status: status,
            dateTime: currentDate, // Current date and time in the requested format
            projectName: epicName, // Epic name
            issue: issueName, // Issue name
            type: issueType, // Issue type (e.g., story, task, bug)
            admin: admin, // Admin UID (creator of the epic)
          });

          console.log("Log report entry created for admin successfully");
        } else {
          console.log("Epic or Issue document not found");
        }
      } catch (error) {
        console.error("Error updating status: ", error); // Log any errors
        setSelectedStatus(issueStatus);
      }
    };

    useEffect(() => {
      const fetchFavoriteStatus = async () => {
        try {
          const userUid = getAuth().currentUser.uid;  // Get the current user's UID
          const issueRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);
          const issueDoc = await getDoc(issueRef);
  
          if (issueDoc.exists()) {
            const currentFavorites = issueDoc.data()?.favorite || [];
            setIsFavorite(currentFavorites.includes(userUid));
          }
        } catch (error) {
          console.error("Error fetching favorite status:", error);
        }
      };
  
      fetchFavoriteStatus();
    }, [selectedEpicId, issueId]);
  
    const handlePinClick = async () => {
      try {
        const userUid = getAuth().currentUser.uid;  // Get the current user's UID
        const issueRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);
  
        // Get current favorite list from Firestore
        const issueDoc = await getDoc(issueRef);
        const currentFavorites = issueDoc.data()?.favorite || [];
  
        // Check if the userUid is in the favorite list
        const isFavorite = currentFavorites.includes(userUid);
  
        // Update local favorite state immediately (this changes the pin color instantly)
        const updatedFavorites = isFavorite
          ? currentFavorites.filter(uid => uid !== userUid) // Remove the userUid
          : [...currentFavorites, userUid]; // Add the userUid
  
        setIsFavorite(updatedFavorites.includes(userUid));
  
        // Update Firestore with the new favorite list
        await updateDoc(issueRef, { favorite: updatedFavorites });
  
        // Update local state
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === issueId) {
              return {
                ...task,
                favorite: updatedFavorites,  // Update the favorite field with the new array
              };
            }
            return task;
          }),
        );
      } catch (error) {
        console.error("Error updating favorite status:", error);
      }
    };
  
    

    // Function to handle description edit
    const handleDescriptionClick = () => {
      setIsEditingDescription(true);
    };

    // Function to handle description update
    const handleDescriptionKeyPress = async (e) => {
      if (e.key === "Enter") {
        try {
          // Update the description in Firestore
          const issueRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);

          if (description) {
            await updateDoc(issueRef, { description });
          } else {
            await setDoc(issueRef, { description }, { merge: true });
          }

          // Update tasks array with new description
          setTasks((prevTasks) =>
            prevTasks.map((task) => {
              if (task.id === issueId) {
                return {
                  ...task,
                  issuedescription: description,
                };
              }
              return task;
            }),
          );

          // Update the parent component's state
          setIssueDescription(description);

          setIsEditingDescription(false); // End editing mode
        } catch (error) {
          console.error("Error updating description:", error);
        }
      }
    };

    const handleDescriptionBlur = async () => {
      try {
        if (description !== issuedescription) {
          // Only update if changed
          const issueRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);

          if (description) {
            await updateDoc(issueRef, { description });
          } else {
            await setDoc(issueRef, { description }, { merge: true });
          }

          // Update tasks array with new description
          setTasks((prevTasks) =>
            prevTasks.map((task) => {
              if (task.id === issueId) {
                return {
                  ...task,
                  issuedescription: description,
                };
              }
              return task;
            }),
          );

          // Update the parent component's state
          setIssueDescription(description);
        }
        setIsEditingDescription(false);
      } catch (error) {
        console.error("Error updating description:", error);
      }
    };

    // Function to handle description change
    const handleDescriptionChange = (e) => {
      setDescription(e.target.value);
    };

    useEffect(() => {
      setLocalSubtasks(initialSubtasks);
      setLocalSubtaskCount(initialSubtaskCount);
    }, [initialSubtasks, initialSubtaskCount]);

    const [isSubmitting, setIsSubmitting] = useState(false);

const handleCreateSubtask = () => {
  if (!isSubmitting) {
    setIsCreatingSubtask(true);
  }
};

const handleSubmitSubtask = async () => {
  if (newSubtask.trim() && !isSubmitting) {
    setIsSubmitting(true);
    try {
      const issueRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);
      const issueDoc = await getDoc(issueRef);

      if (issueDoc.exists()) {
        const issueData = issueDoc.data();
        const currentSubtaskCount = issueData.subtaskCount || 0;
        const currentSubtasks = issueData.subtasks || [];

        if (currentSubtasks.some((subtask) => subtask.title === newSubtask.trim())) {
          console.log("Subtask already exists");
          setNewSubtask("");
          setIsSubmitting(false);
          return;
        }

        const newSubtaskObj = {
          id: Date.now().toString(),
          title: newSubtask.trim(),
        };

        await updateDoc(issueRef, {
          subtasks: arrayUnion(newSubtaskObj),
          subtaskCount: currentSubtaskCount + 1,
        });

        setSubtasks([...subtasks, newSubtaskObj]);
        setSubtaskCount((prevCount) => {
          const newCount = (parseInt(prevCount) || 0) + 1;
          return newCount.toString();
        });

        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === issueId) {
              return {
                ...task,
                subtaskCount: currentSubtaskCount + 1,
                hasSubtasks: true,
              };
            }
            return task;
          }),
        );

        setNewSubtask("");
        setIsCreatingSubtask(false);
        console.log("Subtask added successfully:", newSubtaskObj);
      }
    } catch (error) {
      console.error("Error adding subtask to Firestore:", error);
    } finally {
      setIsSubmitting(false);
    }
  }
};

    const handleCancelSubtask = () => {
      setNewSubtask("");
      setIsCreatingSubtask(false);
    };

    const handleEditSubtask = (subtask) => {
      setEditingSubtaskId(subtask.id);
      setEditingSubtaskTitle(subtask.title);
    };

    const handleUpdateSubtask = async () => {
      try {
        if (!editingSubtaskTitle.trim()) {
          console.log("Subtask title cannot be empty");
          return;
        }

        // Reference to the issue document
        const issueRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);

        // Get the current subtasks
        const issueDoc = await getDoc(issueRef);
        if (!issueDoc.exists()) {
          console.log("Issue document not found");
          return;
        }

        const currentSubtasks = issueDoc.data().subtasks || [];

        // Find and update the specific subtask
        const updatedSubtasks = currentSubtasks.map((subtask) => {
          if (subtask.id === editingSubtaskId) {
            return {
              ...subtask,
              title: editingSubtaskTitle.trim(),
            };
          }
          return subtask;
        });

        // Update Firestore
        await updateDoc(issueRef, {
          subtasks: updatedSubtasks,
        });

        // Update local state
        setSubtasks(updatedSubtasks);

        // Reset editing state
        setEditingSubtaskId(null);
        setEditingSubtaskTitle("");

        console.log("Subtask updated successfully");
      } catch (error) {
        console.error("Error updating subtask:", error);
      }
    };

    const handleCancelEditSubtask = () => {
      setEditingSubtaskId(null);
      setEditingSubtaskTitle("");
    };

    const handleDeleteSubtask = (subtaskId) => {
      setSubtaskToDelete(subtaskId);
      setShowSubtaskDeleteConfirmation(true);
    };

    const cancelDeleteSubtask = () => {
      setSubtaskToDelete(null);
      setShowSubtaskDeleteConfirmation(false);
    };

    const confirmDeleteSubtask = async () => {
      try {
        // Store the subtask and its index for potential rollback
        const subtaskIndex = subtasks.findIndex((subtask) => subtask.id === subtaskToDelete);
        const deletedSubtask = subtasks[subtaskIndex];

        // Optimistically update UI
        setSubtasks((currentSubtasks) => currentSubtasks.filter((subtask) => subtask.id !== subtaskToDelete));
        setSubtaskCount((prevCount) => {
          const newCount = (parseInt(prevCount) || 0) - 1;
          return newCount.toString();
        });

        // Clean up delete confirmation state
        setSubtaskToDelete(null);
        setShowSubtaskDeleteConfirmation(false);

        // Then update Firestore
        const issueRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);
        await updateDoc(issueRef, {
          subtasks: arrayRemove(deletedSubtask),
          subtaskCount: increment(-1),
        });

        // Update tasks array
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === issueId) {
              return {
                ...task,
                subtaskCount: parseInt(task.subtaskCount) - 1,
                hasSubtasks: parseInt(task.subtaskCount) - 1 > 0,
              };
            }
            return task;
          }),
        );
        console.log("Subtask deleted successfully");
      } catch (error) {
        console.error("Error deleting subtask:", error);
      } finally {
        // Clean up
        setSubtaskToDelete(null);
        setShowSubtaskDeleteConfirmation(false);
      }
    };

    const updateEffort = async () => {
      try {
        const effortValue = parseInt(effort, 10);

        if (isNaN(effortValue)) {
          console.error("Invalid effort input: not a number");
          return;
        }

        // Update Firestore
        const issueDocRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);
        await updateDoc(issueDocRef, { issueEffort: effortValue });

        // Update local tasks state for kanban card
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === issueId ? { ...task, issueEffort: effortValue } : task)));

        // Update parent component's state
        setissueEffort(effortValue);

        // Make sure popup's local effort state matches
        setEffort(effortValue.toString());

        console.log(`Effort updated to: ${effortValue}`);
        return true;
      } catch (error) {
        console.error("Error updating effort:", error);
        return false;
      }
    };

    const handleEffortChange = async () => {
      await updateEffort();
    };

    const handleEffortKeyPress = async (e) => {
      if (e.key === "Enter") {
        const success = await updateEffort();
        if (success) {
          e.target.blur();
        }
      }
    };

    // New handler for effort input
    const handleEffortInput = (e) => {
      const value = e.target.value;

      // Allow empty string for backspace/delete
      if (value === "") {
        setEffort("");
        return;
      }

      // Only update if input is a number
      if (/^\d+$/.test(value)) {
        setEffort(value);
      }
    };

    // Update the priority options to use the direct image sources
    const priorityOptions = [
      {
        id: "low",
        label: <span>Low</span>,
        icon: low, // Direct reference to the imported image
        src: low, // Add src property for easier access
      },
      {
        id: "medium",
        label: <span>Medium</span>,
        icon: medium,
        src: medium,
      },
      {
        id: "high",
        label: <span>High</span>,
        icon: high,
        src: high,
      },
    ];

    // Update the getPriorityIcon function to return the image source
    const getPriorityIcon = (priorityId) => {
      const priorityObj = priorityOptions.find((option) => option.id === priorityId);
      return priorityObj ? priorityObj.src : low; // Return the image source directly
    };

    const handlePriorityChange = async (value) => {
      try {
        // Update the priority in your local state
        setPriority(value);
        setShowPriorityDropdown(false);

        // Define the path to the document
        const issueDocRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);

        // Update the priority field in the database
        await updateDoc(issueDocRef, {
          priority: value,
        });

        // Update the tasks array to reflect the new priority
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === issueId) {
              return {
                ...task,
                priority: value,
                issuepriority: value, // Add this line to update issuepriority
              };
            }
            return task;
          }),
        );

        // Update the parent component's state if needed
        if (typeof setIssuePriority === "function") {
          setIssuePriority(value);
        }
      } catch (error) {
        console.error("Error updating priority:", error);
        // Revert local state if update fails
        setPriority(issuepriority);
      }
    };

    useEffect(() => {
      async function fetchAllUsers() {
        try {
          // Reference to the Member collection
          const memberRef = collection(db, `Kanban/${selectedEpicId}/Member`);

          // Get all members (no filter on Access field)
          const querySnapshot = await getDocs(memberRef);

          // Prepare an array to hold the user objects
          const fetchedUsers = [];

          // Loop through each document in the query snapshot
          for (const docSnap of querySnapshot.docs) {
            const memberUid = docSnap.id; // This is the Member UID

            // Check the Access field, even if it's true, false, or missing
            const accessField = docSnap.data().Access; // Could be true, false, or undefined

            // Reference to the user's document in the users collection
            const userDocRef = doc(db, `users/${memberUid}`);
            const userDocSnap = await getDoc(userDocRef);

            // Check if the user document exists and extract firstName and lastName
            if (userDocSnap.exists()) {
              const { firstName, lastName, userPicture } = userDocSnap.data();
              // Push the user data into the array
              fetchedUsers.push({
                id: memberUid,
                name: `${firstName} ${lastName}`,
                avatar: userPicture || null, // Assuming this is a placeholder avatar URL
              });
            } else {
              console.log(`No user found for Member UID: ${memberUid}`);
            }
          }

          // Set the state with the fetched user data
          setUsers(fetchedUsers);
        } catch (error) {
          console.error("Error retrieving member data:", error);
        }
      }

      fetchAllUsers();
    }, [selectedEpicId]); // Trigger when selectedEpicId changes

    // Filter users based on search term
    const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(assigneeSearchTerm.toLowerCase()));
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

        // Get the current user's UID and the MemberUid of the selected user
        const auth = getAuth();
        const uid = auth.currentUser.uid;
        const MemberUid = user.id;

        const issueRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);
        const notifRef = collection(db, `Kanban/${selectedEpicId}/kanbanNotif`);

        const issueDocSnapshot = await getDoc(issueRef);

        if (issueDocSnapshot.exists()) {
          const assignId = issueDocSnapshot.data().assignId;

          // Update the issue with the new assignId (MemberUid) and timestamp
          const updateData = {
            assignId: MemberUid,
            assignTimestamp: new Date(),
          };

          // Update Firestore
          await updateDoc(issueRef, updateData);

          // Update the tasks array to reflect the new assignee
          setTasks((prevTasks) =>
            prevTasks.map((task) => {
              if (task.id === issueId) {
                return {
                  ...task,
                  assignId: MemberUid,
                  assignee: {
                    id: user.id,
                    name: user.name,
                    picture: user.avatar || null,
                  },
                };
              }
              return task;
            }),
          );

          // Prepare and add notification
          const notificationData = {
            sender: uid,
            receiver: [MemberUid],
            context: selectedEpicId,
            action: "assigned you a task in",
            timeAgo: new Date().toISOString(),
            subType: `workload`,
            type: `assigned`,
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
        // Optionally revert the UI state if the update fails
        setSelectedAssignee((prevState) => prevState);
      }
    };

    const formatTimeAgo = (timestamp) => {
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
    
    // Fetch comments and their authors' details
    useEffect(() => {
      const fetchUserDetails = async (authorId) => {
        if (usersCache[authorId]) return usersCache[authorId];

        try {
          const userDoc = await getDoc(doc(db, `users/${authorId}`));
          if (userDoc.exists()) {
            const userData = {
              firstName: userDoc.data().firstName || "",
              lastName: userDoc.data().lastName || "",
              avatar: userDoc.data().userPicture || "",
            };
            setUsersCache((prev) => ({
              ...prev,
              [authorId]: userData,
            }));
            return userData;
          }
          return null;
        } catch (error) {
          return null;
        }
      };

      const commentsQuery = query(collection(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}/comments`), orderBy("dateCreated", "desc"));

      const unsubscribe = onSnapshot(commentsQuery, async (querySnapshot) => {
        const commentsPromises = querySnapshot.docs.map(async (doc) => {
          const commentData = doc.data();
          const userDetails = await fetchUserDetails(commentData.authorId);
          const timeAgo = formatTimeAgo(commentData.dateCreated);

          // Log assignId and uid to the console

          return {
            id: doc.id,
            ...commentData,
            author: userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : "Unknown User",
            avatar: userDetails?.avatar || "",
            timestamp: timeAgo,
          };
        });

        const resolvedComments = await Promise.all(commentsPromises);
        setComments(resolvedComments);
      });

      return () => unsubscribe();
    }, [selectedEpicId, issueId, db, usersCache]);
    // Function to handle comment input change
    const handleCommentChange = (e) => {
      setNewComment(e.target.value);
    };

    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
const [isDeletingComment, setIsDeletingComment] = useState(false);

// Updated comment submission handler
const handleCommentSubmit = async (e, user) => {
  if (e.key === "Enter" && newComment.trim() && !isSubmittingComment) {
    setIsSubmittingComment(true);
    try {
      const commentRef = doc(collection(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}/comments`));
      const issueRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);
      const epicRef = doc(db, `Kanban/${selectedEpicId}`);
      const auth = getAuth();
      const uid = auth.currentUser.uid;

      let userDetails = usersCache[uid];
      if (!userDetails) {
        const userDoc = await getDoc(doc(db, `users/${uid}`));
        if (userDoc.exists()) {
          userDetails = {
            firstName: userDoc.data().firstName || "",
            lastName: userDoc.data().lastName || "",
            avatar: userDoc.data().userPicture || "",
          };
          setUsersCache((prev) => ({
            ...prev,
            [uid]: userDetails,
          }));
        }
      }

      const newCommentObj = {
        content: newComment.trim(),
        timestamp: "Just now",
        dateCreated: serverTimestamp(),
        issueId: issueId,
        epicId: selectedEpicId,
        authorId: uid,
        author: `${userDetails.firstName} ${userDetails.lastName}`,
        avatar: userDetails.avatar,
        column: 1,
      };

      const issueDoc = await getDoc(issueRef);
      const currentCommentCount = issueDoc.exists() ? issueDoc.data().commentCount || 0 : 0;

      const commentsSnapshot = await getDocs(
        query(collection(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}/comments`), 
        orderBy("column", "desc"), 
        limit(1))
      );

      let nextColumn = 1;
      if (!commentsSnapshot.empty) {
        const lastComment = commentsSnapshot.docs[0].data();
        nextColumn = lastComment.column + 1;
      }

      newCommentObj.column = nextColumn;

      // Add comment to Firestore
      await Promise.all([
        setDoc(commentRef, newCommentObj),
        updateDoc(issueRef, { commentCount: currentCommentCount + 1 })
      ]);

      // Update local states
      setCommentCount((prevCount) => (parseInt(prevCount) + 1).toString());
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === issueId
            ? { ...task, commentCount: (parseInt(task.commentCount) + 1).toString() }
            : task
        )
      );

      // Handle notifications
      const issueDocSnap = await getDoc(issueRef);
      const assignId = issueDocSnap.exists() ? issueDocSnap.data().assignId : null;
      const epicDocSnap = await getDoc(epicRef);
      const adminId = epicDocSnap.exists() ? epicDocSnap.data().admin : null;

      let receiverIds = [];
      if (uid === adminId) {
        receiverIds.push(assignId);
      } else if (uid === assignId) {
        receiverIds.push(adminId);
      } else {
        receiverIds.push(assignId, adminId);
      }

      const notificationObj = {
        type: "social",
        action: "commented on your work in",
        context: selectedEpicId,
        timeAgo: new Date().toISOString(),
        subType: "comment",
        unread: true,
        receiver: receiverIds,
        sender: uid,
      };

      const notifRef = doc(collection(db, `Kanban/${selectedEpicId}/kanbanNotif`));
      await setDoc(notifRef, { ...notificationObj, id: notifRef.id });

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment or notification:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  }
};

    const sortComments = (commentsToSort, sortType) => {
      return [...commentsToSort].sort((a, b) => {
        if (sortType === "Newest First") {
          return b.dateCreated - a.dateCreated;
        } else {
          return a.dateCreated - b.dateCreated;
        }
      });
    };
    const handleDeleteClick = (id) => {
      if (!isDeletingComment) {
        setCommentToDelete(id);
        setShowCommentDeleteConfirmation(true);
      }
    };

    const cancelDeleteComment = () => {
      setCommentToDelete(null);
      setShowCommentDeleteConfirmation(false);
    };

    const confirmDeleteComment = async () => {
      if (!commentToDelete || !selectedEpicId || !issueId || isDeletingComment) return;
    
      setIsDeletingComment(true);
      try {
        const commentRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}/comments/${commentToDelete}`);
        await deleteDoc(commentRef);
    
        const issueRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);
        await updateDoc(issueRef, {
          commentCount: increment(-1),
        });
    
        setCommentCount((prevCount) => {
          const newCount = Math.max(0, parseInt(prevCount) - 1);
          return newCount.toString();
        });
    
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === issueId
              ? { ...task, commentCount: Math.max(0, parseInt(task.commentCount) - 1).toString() }
              : task
          )
        );
    
        setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentToDelete));
        setShowCommentDeleteConfirmation(false);
        setCommentToDelete(null);
      } catch (error) {
        console.error("Error deleting comment or updating commentCount:", error);
      } finally {
        setIsDeletingComment(false);
      }
    };
    // Function to handle sort selection
    const handleSortSelect = (sort) => {
      setSelectedSort(sort);
      setComments((prevComments) => sortComments(prevComments, sort));
      setIsSortDropdownOpen(false);
    };
    // Update timestamps periodically
    useEffect(() => {
      const interval = setInterval(() => {
        setComments((prevComments) =>
          prevComments.map((comment) => ({
            ...comment,
            timestamp: formatTimeAgo(comment.dateCreated),
          }))
        );
      }, 60000); // Update every minute
    
      return () => clearInterval(interval);
    }, []);

  const popupTitleRef = useRef(null);
const [isPopupTitleOverflowing, setIsPopupTitleOverflowing] = useState(false);
const [showPopupTitleTooltip, setShowPopupTitleTooltip] = useState(false);

  useEffect(() => {
    if (popupTitleRef.current) {
      const isOverflow = popupTitleRef.current.offsetWidth < popupTitleRef.current.scrollWidth;
      setIsPopupTitleOverflowing(isOverflow);
    }
  }, [issueName]);

    return (
      <div className="presentation-popup__overlay">
        <div className="presentation-popup__container">
          <div className="presentation-popup__header">
            <div className="presentation-popup__title-group">
              <div className="presentation-popup__title-wrapper">
                <img src={projectPicture || "https://firebasestorage.googleapis.com/v0/b/dyci-academix.appspot.com/o/wagdelete%2Facademixlogo.png?alt=media&token=8f83d11b-3604-41e5-9a46-d1df0d44aed5"} alt="Presentation icon" className="presentation-popup__icon" />
                <div className="presentation-popup__title-container" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {isEditingTitle && projectStatus !== "Complete" && isAdmin ? (
                    <input
                      type="text"
                      className="presentation-popup__title-edit"
                      value={editedTitle}
                      onChange={handleTitleChange}
                      onKeyPress={handleTitleKeyPress}
                      onBlur={() => {
                        setIsEditingTitle(false);
                        setEditedTitle(issueName); // Reset to original title if not submitted
                      }}
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
      ref={popupTitleRef}
      className="presentation-popup__title"
      onClick={() => handleTitleClick()}
      onMouseEnter={() => isPopupTitleOverflowing && setShowPopupTitleTooltip(true)}
      onMouseLeave={() => setShowPopupTitleTooltip(false)}
    >
      {issueName}
      {showPopupTitleTooltip && (
        <div className="issue-popup-title-tooltip">{issueName}</div>
      )}
    </h2>
                  )}
                </div>
              </div>
              <div className="presentation-popup__status-group">
                <span className="presentation-popup__tag-group">
                  <TypeIcon type={issueType} size={1} onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)} />
                  {issueEpicCode}
                  {issueCount}
                  <img src={img22} alt="Subtask" className="w-6 h-6 rounded-full" style={{ width: "14px" }} />
                  <span>{subtaskCount}</span>
                  {/* Type Dropdown */}
                  {isTypeDropdownOpen && isAdmin && projectStatus !== "Complete" && (
                    <div
                      ref={typeChangeRef}
                      style={{
                        position: "absolute",
                        zIndex: 10,
                        backgroundColor: "white",
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        marginTop: "130px",
                      }}
                    >
                      {typeOptions.map((option) => (
                        <button
                          key={option.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            padding: "8px 16px",
                            fontSize: "14px",
                            backgroundColor: "transparent",
                            color: "#2665AC",
                            border: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = "#D6E6F2")}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                          onClick={() => handleTypeChange(option.id)}
                        >
                          {option.icon}
                          <span style={{ marginLeft: "8px" }}>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </span>
                <div className="presentation-popup__status-dropdown">
                  {isAdmin && projectStatus !== "Complete" && (
                    <button className="presentation-popup__status-btn" onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}>
                      <span style={{ flexGrow: "1", textAlign: "center" }}>{selectedStatus}</span>
                      <ChevronDown
                        className="presentation-popup__chevron"
                        size={14}
                        style={{
                          transform: isStatusDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </button>
                  )}

                  {isStatusDropdownOpen && (
                    <div className="presentation-popup__dropdown-menu" ref={statusChangeRef}>
                      {statusOptions.map((status) => (
                        <button key={status} className="presentation-popup__dropdown-item" onClick={() => handleStatusSelect(status)}>
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pin and Close Button Section */}
            <div className="presentation-popup__actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                className="presentation-popup__pin-btn"
                style={{
                  position: "relative",
                  top: "20px",
                  padding: "4px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: projectStatus === "Complete" ? "default" : "pointer",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={handlePinClick}
                disabled={projectStatus === "Complete"}
              >
                <Pin
                  size={20}
                  stroke="currentColor"
                  style={{
                    transform: "rotate(45deg)",
                    transition: "all 0.2s",
                    fill: isFavorite ? "#ED8A19" : "none",
                    color: isFavorite ? "#ED8A19" : "#2563eb",
                  }}
                  onMouseEnter={(e) => {
                    if (projectStatus !== "Complete") {
                      e.currentTarget.style.fill = "#ED8A19";
                      e.currentTarget.style.color = "#ED8A19";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (projectStatus !== "Complete") {
                      e.currentTarget.style.fill = isFavorite ? "#ED8A19" : "none";
                      e.currentTarget.style.color = isFavorite ? "#ED8A19" : "#2563eb";
                    }
                  }}
                />
              </button>
              <button onClick={() => setShowPresentationPopup(false)} className="presentation-popup__close-btn">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Description Section */}
          <div className="presentation-popup__content">
            <div className="presentation-popup__section_description">
              <h3 className="presentation-popup__section-description">Description</h3>
              {isEditingDescription && projectStatus !== "Complete" && isAdmin ? (
                <input
                  type="text"
                  className="presentation-popup__description"
                  value={description}
                  onChange={handleDescriptionChange}
                  onKeyPress={handleDescriptionKeyPress}
                  onBlur={handleDescriptionBlur}
                  autoFocus
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    borderBottom: "1px solid #2665AC",
                  }}
                />
              ) : (
                <p className="presentation-popup__description" onClick={handleDescriptionClick}>
                  {description || "No description available"}
                </p>
              )}
            </div>

            {/* Subtask Section */}
            <div className="presentation-popup__section_subtask">
              <div className="presentation-popup__subtask-header">
                <h3 className="presentation-popup__section-subtask">Subtasks</h3>
                {isAdmin && projectStatus !== "Complete" && (
                  <button className="presentation-popup__create-btn" onClick={handleCreateSubtask}>
                    + Create Subtask
                  </button>
                )}
              </div>

              <div className="presentation-popup__subtask-list" style={{ maxHeight: "100px", overflowY: "auto" }}>
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="presentation-popup__subtask-item">
                    <img src={img7} alt="Task icon" className="presentation-popup__subtask-icon" />
                    <div className="presentation-popup__subtask-content">
                      {editingSubtaskId === subtask.id ? (
                        <>
                          <div className="presentation-popup__subtask-content">
                            <input
                              type="text"
                              value={editingSubtaskTitle}
                              onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                              className="presentation-popup__input"
                              autoFocus
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  handleUpdateSubtask();
                                }
                              }}
                              style={{ width: "100%" }}
                            />
                          </div>
                          <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
                            <button
                              onClick={handleUpdateSubtask}
                              className="presentation-popup__update-subtask-btn"
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
                              onClick={handleCancelEditSubtask}
                              className="presentation-popup__cancel-edit-subtask-btn"
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
                          <span className="presentation-popup__subtask-title" onDoubleClick={() => handleEditSubtask(subtask)}>
                            {subtask.title}
                          </span>
                          {isAdmin && projectStatus !== "Complete" && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {isCreatingSubtask && (
                  <div className="presentation-popup__subtask-input-container" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div className="presentation-popup__subtask-input" style={{ display: "flex", alignItems: "center" }}>
                      <img src={img7} alt="Subtask" className="presentation-popup__subtask-icon" />
                      <input
                        type="text"
                        placeholder="What needs to be addressed?"
                        className="presentation-popup__input"
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
                      className="presentation-popup__subtask-buttons"
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginLeft: "auto",
                      }}
                    >
                      <button
  onClick={handleSubmitSubtask}
  className="presentation-popup__create-subtask-btn"
  disabled={isSubmitting}
  style={{
    padding: "6px 12px",
    backgroundColor: "#2665AC",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: isSubmitting ? "not-allowed" : "pointer",
    fontSize: "12px",
    transition: "background-color 0.3s",
    opacity: isSubmitting ? 0.7 : 1,
  }}
  onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#1976d2")}
  onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#2665AC")}
>
  {isSubmitting ? "Creating..." : "Create"}
</button>

<button
  onClick={handleCancelSubtask}
  className="presentation-popup__cancel-subtask-btn"
  disabled={isSubmitting}
  style={{
    padding: "6px 12px",
    backgroundColor: "#2665AC",
    color: "white",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: isSubmitting ? "not-allowed" : "pointer",
    fontSize: "12px",
    transition: "background-color 0.3s",
    opacity: isSubmitting ? 0.7 : 1,
  }}
  onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#1976d2")}
  onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#2665AC")}
>
  Cancel
</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="presentation-popup__section">
              <h3 className="presentation-popup__section-title">Details</h3>
              <div className="presentation-popup__details-list">
                {/* Effort section */}
                <div className="presentation-popup__detail-item">
                  <span className="presentation-popup__detail-label">Effort</span>
                  <div className="presentation-popup__user">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {projectStatus !== "Complete" && isAdmin ? (
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="\d*"
                          value={effort}
                          onChange={handleEffortInput}
                          onBlur={handleEffortChange}
                          onKeyPress={handleEffortKeyPress}
                          placeholder="Enter effort"
                          className="effort-input"
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
                      ) : (
                        <span style={{ padding: "4px", color: "#2665AC", fontSize: "14px" }}>{effort || "0"}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Priority section */}
                <div className="presentation-popup__detail-item">
                  <span className="presentation-popup__detail-label">Priority</span>
                  <div className="presentation-popup__user priority-dropdown" style={{ position: "relative" }}>
                    <div
                      onClick={() => isAdmin && projectStatus !== "Complete" && setShowPriorityDropdown(!showPriorityDropdown)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: projectStatus !== "Complete" && isAdmin ? "pointer" : "default",
                        gap: "8px",
                        color: "#2665AC",
                      }}
                    >
                      <img src={getPriorityIcon(priority)} alt={`${priority} priority`} />
                      <span style={{ textTransform: "capitalize" }}>{priority}</span>
                      {isAdmin && projectStatus !== "Complete" && (
                        <ChevronDown
                          size={14}
                          style={{
                            transform: showPriorityDropdown ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      )}
                    </div>

                    {isAdmin && projectStatus !== "Complete" && showPriorityDropdown && (
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
                            key={option.id}
                            onClick={() => handlePriorityChange(option.id)}
                            style={{
                              padding: "8px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              color: "#2665AC",
                              backgroundColor: priority === option.id ? "#D6E6F2" : "transparent",
                              borderRadius: "4px",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D6E6F2")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = priority === option.id ? "#D6E6F2" : "transparent")}
                          >
                            <img src={option.src} alt={`${option.id} priority`} />
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignee section */}
                <div className="presentation-popup__detail-item">
                  <span className="presentation-popup__detail-label">Assignee</span>
                  <div className="presentation-popup__user assignee-dropdown" style={{ position: "relative" }}>
                    <div
                      className="presentation-popup__user-toggle"
                      onClick={() => isAdmin && projectStatus !== "Complete" && setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: projectStatus !== "Complete" && isAdmin ? "pointer" : "default",
                        gap: "8px",
                      }}
                    >
                      {selectedAssignee.img ? (
                        <img src={selectedAssignee.img} alt={selectedAssignee.name} className="presentation-popup__user-avatar" />
                      ) : (
                        <div
                          className="presentation-popup__user-avatar"
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
                      <span className="presentation-popup__user-name">{selectedAssignee.name}</span>
                    </div>

                    {isAssigneeDropdownOpen && isAdmin && projectStatus !== "Complete" && (
                      <div
                        ref={assigneeChangeRef}
                        className="presentation-popup__assignee-list"
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
                          className="presentation-popup__search"
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
                            className="presentation-popup__search-input"
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
                          className="presentation-popup__user-list"
                          style={{
                            maxHeight: "100px",
                            overflowY: "auto",
                          }}
                        >
                          {filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className="presentation-popup__user-item"
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
                                  className="presentation-popup__user-avatar-small"
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "50%",
                                  }}
                                />
                              ) : (
                                <div
                                  className="presentation-popup__user-avatar-small"
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
                              <span className="presentation-popup__user-name-small">{user.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="presentation-popup__detail-item">
                  <span className="presentation-popup__detail-label">Reporter</span>
                  <div className="presentation-popup__user">
                    <img src={userPicture} alt="Franco Bayani" className="presentation-popup__user-avatar" />
                    <span className="presentation-popup__user-name">
                      {firstName} {lastName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comment section */}
            <div className="presentation-popup__section_comment">
              <div className="presentation-popup__comment-header">
                <h3 className="presentation-popup__section-comment">
                  {parseInt(commentCount)} {parseInt(commentCount) === 1 ? "Comment" : "Comments"}
                </h3>
                <div className="presentation-popup__sort-dropdown" style={{ position: "relative" }}>
                  <button
                    className="presentation-popup__sort-btn"
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
                      className="presentation-popup__dropdown-menu"
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
                          className="presentation-popup__dropdown-item"
                          onClick={() => handleSortSelect(sort)}
                          style={{
                            display: "flex",
                            justifyContent: "center",
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

              <div className="presentation-popup__comment-section">
              {projectStatus !== "Complete" && (
                <div
                  className="presentation-popup__comment-input"
                  style={{
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  {userPictureComment ? (
                    <img
                      src={userPictureComment}
                      alt="Current user"
                      className="presentation-popup__user-avatar"
                      style={{
                        width: "32px",
                        height: "32px",
                        marginRight: "8px",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <div
                      className="presentation-popup__user-avatar"
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
                      {firstName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <input
  type="text"
  placeholder={isSubmittingComment ? "Submitting..." : "Add a comment"}
  className="presentation-popup__comment-field"
  value={newComment}
  onChange={handleCommentChange}
  onKeyPress={handleCommentSubmit}
  disabled={isSubmittingComment}
  style={{
    opacity: isSubmittingComment ? 0.7 : 1,
    cursor: isSubmittingComment ? "not-allowed" : "text"
  }}
/>
                </div>
              )}

                <div
                  className="presentation-popup__comment-list"
                  style={{
                    overflowY: "auto",
                    maxHeight: "80px",
                    gap: "8px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="presentation-popup__comment"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {comment.avatar ? (
                          <img
                            src={comment.avatar}
                            alt={comment.author}
                            className="presentation-popup__user-avatar"
                            style={{
                              width: "32px",
                              height: "32px",
                              marginRight: "8px",
                              borderRadius: "50%",
                            }}
                          />
                        ) : (
                          <div
                            className="presentation-popup__user-avatar"
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
                            {comment.author.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="presentation-popup__comment-content" style={{ flex: 1 }}>
                          <div className="presentation-popup__comment-header" style={{ display: "flex", justifyContent: "space-between" }}>
                            <span
                              className="presentation-popup__comment-author"
                              onClick={() =>
                                handleProfileNavigation({
                                  memberId: comment.authorId,
                                  name: comment.author,
                                  img: comment.avatar,
                                })
                              }
                            >
                              {comment.author}
                            </span>
                            <span className="presentation-popup__comment-time">{comment.timestamp}</span>
                            {comment.authorId === uid && isAdmin && projectStatus !== "Complete" && ( // Only show the trash icon if assignId matches uid
                              <Trash2 size={16} color="#2665AC" style={{ cursor: "pointer", marginLeft: "8px" }} onClick={() => handleDeleteClick(comment.id)} />
                            )}
                          </div>
                          <p className="presentation-popup__comment-text">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

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
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const epicIdFromParams = epicId || location.state?.epicId;
    if (epicIdFromParams) {
      setSelectedEpicId(epicIdFromParams);
      console.log("Epic ID set:", epicIdFromParams);
    } else {
      console.error("No Epic ID available from params or location state");
    }
  }, [epicId, location.state]);

  // Modified fetchTasks function with better error handling
  const fetchTasks = async () => {
    const currentEpicId = selectedEpicId || epicId || location.state?.epicId;

    if (!currentEpicId) {
      console.error("No Epic ID available for fetching tasks");
      return;
    }

    try {
      // Fetch projectPicture from the selected Epic document
      const epicDocRef = doc(db, `Kanban/${selectedEpicId}`);
      const epicDoc = await getDoc(epicDocRef);
      const projectPicture = epicDoc.exists() ? epicDoc.data().projectPicture : null;

      // Fetch user details from Kanban/uid path
      const auth = getAuth();
      const uid = auth.currentUser ? auth.currentUser.uid : "";
      const userDocRef = doc(db, `users/${uid}`);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      const userFirstName = userData.firstName || "";
      const userLastName = userData.lastName || "";
      const userPictureComment = userData.userPicture || "";

      // Log values to the console
      console.log("User First Name:", userFirstName);
      console.log("User Last Name:", userLastName);
      console.log("User Picture:", userPictureComment);

      const path = `Kanban/${selectedEpicId}/kanbanIssue`;
      const querySnapshot = await getDocs(collection(db, path));
      const issueIds = querySnapshot.docs.map((doc) => doc.id);

      const tasksData = await Promise.all(
        issueIds.map(async (issueId) => {
          const issuePath = `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`;
          const issueDoc = await getDoc(doc(db, issuePath));
          const data = issueDoc.data();

          let assigneeData = null;

          if (data?.assignId) {
            const userDocRef = doc(db, `users/${data.assignId}`);
            const userDocSnapshot = await getDoc(userDocRef);
            if (userDocSnapshot.exists()) {
              const userData = userDocSnapshot.data();
              assigneeData = {
                id: data.assignId,
                name: `${userData.firstName} ${userData.lastName}`,
                picture: userData.userPicture,
              };
            }
          }

          return {
            id: data?.IssueId || "Sample",
            title: data?.IssueName || "Untitled",
            type: data?.issueType || "task",
            code: `${data?.issueEpicCode?.toUpperCase() || "STR"}-${data?.issueCount || "4"}`,
            comments: 1,
            status: data?.issueStatus || "To-do",
            priority: data?.priority || "low",
            hasSubtasks: data?.subtaskCount > 0 || false,
            subtaskCount: data?.subtaskCount || 0,
            commentCount: data?.commentCount || 0,
            projectPicture: projectPicture,
            issueEffort: data?.issueEffort || 0,
            userFirstName: userFirstName,
            userLastName: userLastName,
            userPictureComment: userPictureComment,
            assignId: data?.assignId, // Add the assignee ID to the task data
            assignee: assigneeData, // Add the assignee data
            favorite: data?.favorite,
            originalData: data,
            issuedescription: data?.description,
          };
        }),
      );

      console.log("Fetched tasks:", tasksData);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error in fetchTasks:", error);
    }
  };

  // Modified useEffect for fetching tasks
  useEffect(() => {
    if (selectedEpicId) {
      fetchTasks();
    }
  }, [selectedEpicId]);

  const [isAddingColumn, setIsAddingColumn] = useState(false);

// Update handleAddColumn function
const handleAddColumn = (columnTitle) => {
  if (isAddingColumn) return; // Prevent multiple clicks
  setShowColumnInput(true);
  setShowAddColumnTooltip(false);
  setHoveredColumn(null);
  setInsertAfterColumn(columnTitle);
};


  const fetchColumns = async () => {
    if (!selectedEpicId) {
      console.log("No Epic ID available yet");
      return;
    }

    try {
      const kanbanDocRef = doc(db, "Kanban", selectedEpicId, "EpicColumn", "p9Gdxwc3hs3tzZIdFDVi");

      const kanbanDoc = await getDoc(kanbanDocRef);

      if (kanbanDoc.exists()) {
        const data = kanbanDoc.data();
        setColumns(data.issueColumn || []);
        setIssueCode(data.issueCode);
      } else {
        // If document doesn't exist, create it with default columns
        const defaultColumns = ["To-do", "In Progress", "Complete"];
        await setDoc(kanbanDocRef, {
          issueColumn: defaultColumns,
          issueCode: "DEFAULT",
          createdAt: serverTimestamp(),
        });
        setColumns(defaultColumns);
      }
    } catch (error) {
      console.error("Error fetching/creating columns: ", error);
    }
  };

  const handleColumnSubmit = async (e) => {
    e.preventDefault();
    if (isAddingColumn) return;
  
    if (!selectedEpicId) {
      console.error("No Epic ID available");
      return;
    }
  
    if (!newColumnName.trim()) {
      console.error("Column name cannot be empty");
      return;
    }
  
    setIsAddingColumn(true);
  
    try {
      const kanbanDocRef = doc(db, `Kanban/${selectedEpicId}/EpicColumn/p9Gdxwc3hs3tzZIdFDVi`);
      const kanbanDoc = await getDoc(kanbanDocRef);
  
      let currentColumns = [];
      if (kanbanDoc.exists()) {
        currentColumns = kanbanDoc.data().issueColumn || [];
      }
  
      const insertIndex = insertAfterColumn ? currentColumns.indexOf(insertAfterColumn) + 1 : currentColumns.length;
      const updatedColumns = [...currentColumns.slice(0, insertIndex), newColumnName.trim(), ...currentColumns.slice(insertIndex)];
  
      await updateDoc(kanbanDocRef, {
        issueColumn: updatedColumns,
        updatedAt: serverTimestamp(),
      });
  
      setColumns(updatedColumns);
      setNewColumnName("");
      setShowColumnInput(false);
      setInsertAfterColumn(null);
    } catch (error) {
      console.error("Error updating columns:", error);
    } finally {
      setIsAddingColumn(false);
    }
  };  

  // Call fetchColumns when selectedEpicId is available
  useEffect(() => {
    if (selectedEpicId) {
      fetchColumns();
    }
  }, [selectedEpicId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle Filter dropdown
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }

      // Handle Type dropdown
      if (typeRef.current && !typeRef.current.contains(event.target)) {
        setShowTypeFilterDropdown(false);
      }

      // Handle priority dropdown
      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setShowPriorityDropdown(false);
      }

      // Handle Type issue dropdown
      if (typeIssueRef.current && !typeIssueRef.current.contains(event.target)) {
        setShowTypeDropdown(false);
      }

      // Handle create issue dropdown
      if (createIssueRef.current && !createIssueRef.current.contains(event.target) && createIssueButtonRef.current && !createIssueButtonRef.current.contains(event.target)) {
        setShowCreateIssueContainer(false);
      }

      // Handle column dropdown
      const isColumnDotClick = event.target.closest(".column-menu-btn");
      const isOutsideColumnMenu = !columnRef.current?.contains(event.target);
      if (isOutsideColumnMenu && !isColumnDotClick) {
        setActiveColumnMenu(null);
      }

      // Handle card dropdown
      const isCardDotClick = event.target.closest(".remove-btn");
      const isOutsideCardMenu = !cardRef.current?.contains(event.target);
      if (isOutsideCardMenu && !isCardDotClick) {
        setActiveCard(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const FilterDropdown = () => (
    <div className="filter-above-dropdown-menu">
      <button className="dropdown-item">
        <input
          type="checkbox"
          checked={selectedFilters.onlyMyIssue}
          onChange={() =>
            setSelectedFilters((prev) => ({
              ...prev,
              onlyMyIssue: !prev.onlyMyIssue,
            }))
          }
          className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">Only My Issue</span>
      </button>
    </div>
  );

  const TypeFilterDropdown = () => (
    <div className="type-above-dropdown-menu">
      <button
        className="dropdown-item"
        onClick={() =>
          setSelectedTypeFilters((prev) => ({
            ...prev,
            story: !prev.story,
          }))
        }
      >
        <input type="checkbox" checked={selectedTypeFilters.story} className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300" />
        <span className="inline-flex items-center gap-2">
          <img src={img12} alt="Story" className="type-dropdown-icon" />
          <span className="text-sm text-gray-700">Story</span>
        </span>
      </button>
      <button
        className="dropdown-item"
        onClick={() =>
          setSelectedTypeFilters((prev) => ({
            ...prev,
            task: !prev.task,
          }))
        }
      >
        <input type="checkbox" checked={selectedTypeFilters.task} className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300" />
        <span className="inline-flex items-center gap-2">
          <img src={img6} alt="Task" className="type-dropdown-icon" />
          <span className="text-sm text-gray-700">Task</span>
        </span>
      </button>
      <button
        className="dropdown-item"
        onClick={() =>
          setSelectedTypeFilters((prev) => ({
            ...prev,
            bug: !prev.bug,
          }))
        }
      >
        <input type="checkbox" checked={selectedTypeFilters.bug} className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300" />
        <span className="inline-flex items-center gap-2">
          <img src={img13} alt="Bug" className="type-dropdown-icon" />
          <span className="text-sm text-gray-700">Bug</span>
        </span>
      </button>
    </div>
  );

  const getUserName = async () => {
    const auth = getAuth();
    const uid = auth.currentUser ? auth.currentUser.uid : null;

    if (!uid) {
      console.error("No user is logged in.");
      return null;
    }

    try {
      const db = getFirestore();
      const userRef = doc(db, `users/${uid}`);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const firstName = userData.firstName || "";
        const lastName = userData.lastName || "";

        // Combine first name and last name
        return `${firstName} ${lastName}`.trim();
      } else {
        console.error("User document does not exist.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user's name:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserName = async () => {
      const name = await getUserName();
      if (name) {
        setUserName(name);
      }
    };

    fetchUserName();
  }, []);

  const getUserId = () => {
    const auth = getAuth();
    return auth.currentUser ? auth.currentUser.uid : null;
  };
  
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      setUserId(userId);
    }
  }, []);
  
  const getPriorityArrows = (priority) => {
    let priorityImage;
    switch (priority) {
      case "low":
        priorityImage = low;
        break;
      case "medium":
        priorityImage = medium;
        break;
      case "high":
        priorityImage = high;
        break;
      default:
        priorityImage = low;
    }

    return (
      <div className={`arrow-container ${priority}-container`}>
        <img src={priorityImage} alt={`${priority} priority`} draggable="false" />
      </div>
    );
  };

  const handleCardHover = (task) => {
    if (!hoveredTask || hoveredTask.id !== task.id) {
      setHoveredTask(task);
      setIssueID(task.id);
      setIssueName(task.title);
      setIssueStatus(task.status);
      setIssueType(task.type);
      setIssueEpicCode(task.code);
      setSubtaskCount(task.subtaskCount);
      setIssueCount(task.count);
      setIssuePriority(task.priority);
      setProjectPicture(task.projectPicture);
      setissueEffort(task.issueEffort);
      setUserFirstName(task.userFirstName);
      setUserLastName(task.userLastName);
      setUserPictureComment(task.userPictureComment);
      setCommentCount(task.commentCount);
      setAssignId(task.assignId); // Set assignId on hover
      setIsFavorite(task.favorite); // Set isFavorite
      setIssueDescription(task.issuedescription || task.description); // Set description on hover
    }
  };

  const handleCardClick = async (task) => {
    const auth = getAuth();
    const uid = auth.currentUser ? auth.currentUser.uid : "";

    try {
      // Fetch the Member data
      const memberSnapshot = await getDocs(query(collection(db, `Kanban/${selectedEpicId}/Member`), where("MemberUid", "==", uid)));

      if (!memberSnapshot.empty) {
        const memberDoc = memberSnapshot.docs[0].data(); // Assuming each UID has only one document
        const hasAccess = memberDoc.Access === true;

        // Open the popup in all cases
        setShowPresentationPopup(true);
        fetchMembersWithAccess(); // Trigger fetchMembersWithAccess
      } else {
        console.warn("No member found with the provided UID.");
        setShowPresentationPopup(true); // Open the popup even if no member exists
      }
    } catch (error) {
      console.error("Error fetching member data:", error);
      setShowPresentationPopup(true); // Open the popup in case of an error
    }
  };

  const fetchMembersWithAccess = async () => {
    try {
      // Reference to the Member collection
      const memberRef = collection(db, `Kanban/${selectedEpicId}/Member`);
      // Query to find members with Access: true
      const q = query(memberRef, where("Access", "==", true));

      const querySnapshot = await getDocs(q);
      for (const docSnapshot of querySnapshot.docs) {
        const MemberUid = docSnapshot.id;

        // Reference to the user's document using MemberUid
        const userDocRef = doc(db, `users/${MemberUid}`);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          const { firstName, lastName, userPicture } = userData;

          // Set the member's firstName and lastName in the state
          setUserPicture(userPicture);
          setFirstName(firstName);
          setLastName(lastName);
        } else {
          console.log(`No user found for MemberUid: ${MemberUid}`);
        }
      }
    } catch (error) {
      console.error("Error retrieving member data:", error);
    } finally {
      setLoading(false); // Stop loading after fetching data
    }
  };

  const typeOptions = [
    { id: "story", label: "Story", icon: <img src={img12} alt="Story" style={{ width: 16, height: 16 }} draggable="false" />, color: "text-green-600" },
    { id: "task", label: "Task", icon: <img src={img6} alt="Task" style={{ width: 16, height: 16 }} draggable="false" />, color: "text-red-600" },
    { id: "bug", label: "Bug", icon: <img src={img13} alt="Bug" style={{ width: 16, height: 16 }} draggable="false" />, color: "text-blue-600" },
  ];

  const TypeIcon = ({ type, size }) => {
    const typeOption = typeOptions.find((option) => option.id === type);
    return typeOption ? (
      <span className={typeOption.color} style={{ fontSize: size }}>
        {typeOption.icon}
      </span>
    ) : null;
  };

  const handleDeleteColumn = (columnTitle) => {
    setColumnToDelete(columnTitle);
    setShowColumnDeleteConfirmation(true);
    setActiveColumnMenu(null);
  };

  // New function to handle column deletion confirmation
  const handleConfirmColumnDelete = async () => {
    if (columnToDelete) {
      // Log the name of the column you're deleting
      console.log("Deleting column:", columnToDelete);

      try {
        // Dynamically construct the Firestore document reference using selectedEpicId
        const docRef = doc(
          db,
          "Kanban", // Collection name
          selectedEpicId, // Dynamic Epic ID
          "EpicColumn", // Subcollection name
          "p9Gdxwc3hs3tzZIdFDVi",
        );

        // Remove the column from the KanbanStatus array in Firestore
        await updateDoc(docRef, {
          issueColumn: arrayRemove(columnToDelete), // Remove the column title from KanbanStatus array
        });

        // Filter out the column to be deleted from columns array
        const updatedColumns = columns.filter((col) => col !== columnToDelete);

        // Remove all tasks that were in the deleted column
        const updatedTasks = tasks.filter((task) => task.status !== columnToDelete);

        // Update state
        setColumns(updatedColumns);
        setTasks(updatedTasks);
        setShowColumnDeleteConfirmation(false);
        setColumnToDelete(null);
      } catch (error) {
        console.error("Error updating Firestore:", error);
      }
    }
  };

  const handleToggleRemoveMenu = (id) => {
    setActiveCard(activeCard === id ? null : id);
  };

  const handleDeleteClick = (task) => {
    setSelectedTask(task);
    setShowConfirmation(true);
    setActiveCard(null);
  };

  const handleRemoveTask = async () => {
    if (selectedTask) {
      try {
        // Remove task from Firestore
        const taskDocRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue/${issueId}`);
        await deleteDoc(taskDocRef);

        // Remove task locally
        setTasks(tasks.filter((task) => task.id !== selectedTask.id));
        setSelectedTask(null);

        // Hide confirmation
        setShowConfirmation(false);
      } catch (error) {
        console.error("Error removing task:", error);
      }
    }
  };

  const handleDragStart = (e, task) => {
    // Simple check for admin status
    if (!isAdmin || projectStatus === "Complete") {
      e.preventDefault();
      return;
    }

    setDraggedTask(task);
    e.currentTarget.classList.add("dragging");
    e.dataTransfer.setData("text/plain", ""); // Required for Firefox
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging");
    setDraggedTask(null);
    setDragOverColumn(null);

    // Remove all drop indicators
    document.querySelectorAll(".drop-indicator").forEach((el) => el.remove());
  };

  const getDragAfterElement = (container, y) => {
    const draggableElements = [...container.querySelectorAll(".kanban-card:not(.dragging)")];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY },
    ).element;
  };

  const handleDragOver = (e, columnTitle) => {
    e.preventDefault();
    setDragOverColumn(columnTitle);

    const column = e.currentTarget;
    const afterElement = getDragAfterElement(column, e.clientY);

    // Remove existing drop indicators
    document.querySelectorAll(".drop-indicator").forEach((el) => el.remove());

    // Create and insert new drop indicator
    const dropIndicator = document.createElement("div");
    dropIndicator.className = "drop-indicator";

    if (afterElement) {
      afterElement.parentNode.insertBefore(dropIndicator, afterElement);
    } else {
      // If no afterElement, append to the end of the column's card container
      const cardContainer = column.querySelector(".column-content") || column;
      cardContainer.appendChild(dropIndicator);
    }
  };

  const handleDrop = async (e, columnTitle) => {
    e.preventDefault();
    if (!draggedTask) return;

    const column = e.currentTarget;
    const afterElement = getDragAfterElement(column, e.clientY);

    // Get all tasks in the current column
    const columnTasks = tasks.filter((task) => task.status === columnTitle);

    // Remove dropped task from its original position
    const remainingTasks = tasks.filter((task) => task.id !== draggedTask.id);

    // Find the index where to insert the task
    let newIndex;
    if (afterElement) {
      const afterTask = columnTasks.find((task) => afterElement.getAttribute("data-task-id") === task.id.toString());
      newIndex = remainingTasks.findIndex((task) => task.id === afterTask.id);
    } else {
      // If no afterElement, append to the end
      newIndex = remainingTasks.length;
    }

    // Create the Kanban URL with the task ID
    const kanbanUrl = `Kanban/${selectedEpicId}/kanbanIssue/${draggedTask.id}`;
    console.log("Kanban URL:", kanbanUrl);

    // Update the task with the new issueStatus
    const updatedDraggedTask = { ...draggedTask, status: columnTitle, issueStatus: columnTitle };

    // Check if the Epic document exists and if the user is an admin
    try {
      const epicRef = doc(db, `Kanban/${selectedEpicId}`);
      const epicDoc = await getDoc(epicRef);

      if (epicDoc.exists()) {
        const epicData = epicDoc.data();

        const auth = getAuth();
        const currentUserUid = auth.currentUser.uid;
        if (epicData.admin !== currentUserUid) {
          console.error("User is not the admin of this Epic.");
          setShowErrorPopup(true);
          setErrorMessage("You do not have permission to move tasks in this Epic.");
          return;
        }

        if (epicData.projectStatus === "To-do") {
          console.error('Cannot update issueStatus because Epic projectStatus is "To-do".');
          setShowErrorPopup(true);
          setErrorMessage('Task cannot be moved because the Epic is in "To-do" status.');
          return;
        }

        const taskRef = doc(db, `Kanban/${selectedEpicId}/kanbanIssue`, draggedTask.id);
        const taskDoc = await getDoc(taskRef);

        if (taskDoc.exists()) {
          const issueType = taskDoc.data().issueType || "Unknown";
          let issueName = taskDoc.data().IssueName || "Unnamed Issue";

          console.log("Issue Type:", issueType);
          console.log("Issue Name:", issueName);

          if (issueName === "Unnamed Issue") {
            console.log('Special handling for "Unnamed Issue"');
            const querySnapshot = await getDocs(query(collection(db, `Kanban/${selectedEpicId}/kanbanIssue`), where("issueName", "==", "Unnamed Issue")));
            querySnapshot.forEach((doc) => {
              console.log(`Found Unnamed Issue: ${doc.id}`, doc.data());
            });
          }

          // Format the date and time as MM/DD/YYYY h:mm AM/PM
          const now = new Date();
          const formattedDateTime = now
            .toLocaleString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
            .replace(",", ""); // Remove the comma

          await updateDoc(taskRef, {
            issueStatus: columnTitle,
            IssueDoneTime: formattedDateTime,
          });
          console.log("Firestore update successful for issueStatus and IssueDoneTime!");
          const epicName = epicData.epicName;
          const admin = epicData.admin;
          const taskId = draggedTask.id;

          const assignId = draggedTask.assignId;
          const logRefForUser = doc(db, "users", assignId, "logReport", Date.now().toString());
          await setDoc(logRefForUser, {
            status: columnTitle,
            dateTime: formattedDateTime,
            projectName: epicName,
            issue: issueName,
            type: issueType,
            admin: admin,
            taskId: taskId,
          });

          console.log("Log report entry created for user successfully");

          const logRefForAdmin = doc(db, "users", admin, "logReport", Date.now().toString());
          await setDoc(logRefForAdmin, {
            status: columnTitle,
            dateTime: formattedDateTime,
            projectName: epicName,
            issue: issueName,
            type: issueType,
            admin: admin,
            taskId: taskId,
          });

          console.log("Log report entry created for admin successfully");
        } else {
          console.error("Task document not found in Firestore:", draggedTask.id);
        }
      } else {
        console.error("Epic document not found in Firestore:", selectedEpicId);
      }
    } catch (error) {
      console.error("Error updating Firestore:", error);
    }

    const updatedTasks = [...remainingTasks.slice(0, newIndex), updatedDraggedTask, ...remainingTasks.slice(newIndex)];

    setTasks(updatedTasks);
    setDraggedTask(null);
    setDragOverColumn(null);

    document.querySelectorAll(".drop-indicator").forEach((el) => el.remove());
  };

  const priorityOptions = [
    {
      id: "low",
      label: <span style={{ flexGrow: "1", textAlign: "left" }}>Low</span>,
      icon: <img src={low} alt="Low Priority" />,
    },
    {
      id: "medium",
      label: <span style={{ flexGrow: "1", textAlign: "left" }}>Medium</span>,
      icon: <img src={medium} alt="Medium Priority" />,
    },
    {
      id: "high",
      label: <span style={{ flexGrow: "1", textAlign: "left" }}>High</span>,
      icon: <img src={high} alt="High Priority" />,
    },
  ];

  const [selectedPriority, setSelectedPriority] = useState(priorityOptions[0]);

  const generateEpicCode = (projectName) => {
    return projectName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  // Get the epic code before using handleCreateIssue
  const epicCode = generateEpicCode(epicName);

  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  const handleCreateIssue = async () => {
    // Prevent multiple submissions
    if (isSubmittingIssue) return;
  
    if (!newIssueDescription.trim() || !selectedType || !selectedPriority.label) {
      setErrorMessage("All fields are required.");
      setShowErrorPopup(true);
      return;
    }
  
    if (!selectedEpicId) {
      setErrorMessage("Epic ID not found. Please select an epic.");
      setShowErrorPopup(true);
      return;
    }
  
    setIsSubmittingIssue(true); // Set submitting state to true
    const db = getFirestore();
  
    try {
      // Your existing Firebase operations...
      const counterRef = doc(db, `Kanban/${selectedEpicId}/IssueCounter`, epicName);
  
      const counterDoc = await getDoc(counterRef);
      if (!counterDoc.exists()) {
        await setDoc(counterRef, { count: 0 });
      }
  
      await updateDoc(counterRef, {
        count: increment(1),
      });
  
      const updatedCounterDoc = await getDoc(counterRef);
      const newCode = updatedCounterDoc.data().count;
  
      const issueRef = collection(db, `Kanban/${selectedEpicId}/kanbanIssue`);
      const docRef = await addDoc(issueRef, {
        IssueName: newIssueDescription,
        issueType: selectedType.toLowerCase(),
        priority: selectedPriority.label.props.children.toLowerCase(),
        createdAt: new Date(),
        issueStatus: "To-do",
        issueCount: newCode,
        subtaskCount: 0,
        issueEpicCode: epicCode,
        commentCount: 0,
        favorite: false,
      });
  
      const commentRef = collection(
        db,
        `Kanban/${selectedEpicId}/kanbanIssue/${docRef.id}/comments`
      );
      const commentDocRef = await addDoc(commentRef, {
        content: "",
        createdAt: new Date(),
      });
      const commentId = commentDocRef.id;
  
      await updateDoc(docRef, {
        IssueId: docRef.id,
        commentId: commentId,
      });
  
      const newIssueDoc = await getDoc(docRef);
      const newIssueData = newIssueDoc.data();
  
      setTasks((prevTasks) => [
        ...prevTasks,
        {
          id: newIssueData.IssueId,
          title: newIssueData.IssueName,
          type: newIssueData.issueType,
          code: `${epicCode}-${newIssueData.issueCount}`,
          commentCount: 0,
          status: newIssueData.issueStatus,
          priority: newIssueData.priority,
          subtaskCount: 0,
          issueEffort: 0,
          favorite: false,
          assignee: null,
          userPictureComment: userPictureComment,
          projectPicture: projectPicture,
        },
      ]);
  
      // Reset states
      setNewIssueDescription("");
      setSelectedType("Story");
      setSelectedPriority(priorityOptions[0]);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Error creating issue:", error);
      setErrorMessage("Failed to create issue. Please try again.");
      setShowErrorPopup(true);
    } finally {
      setIsSubmittingIssue(false); // Reset submitting state regardless of success or failure
    }
  };

  const titleRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showIssueTooltip, setShowIssueTooltip] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const cardRefs = useRef({});

  useEffect(() => {
    if (titleRef.current) {
      const isOverflow =
        titleRef.current.offsetWidth < titleRef.current.scrollWidth;
      setIsOverflowing(isOverflow);
    }

    tasks.forEach(task => {
      if (cardRefs.current[task.id]) {
        const element = cardRefs.current[task.id];
        const isOverflow = element.offsetWidth < element.scrollWidth;
        element.dataset.isOverflowing = isOverflow;
      }
    });

  }, [epicName, tasks]);

  return (
    <div className="kanban-board">
      <div className="kanban-header">
        <div className="flex items-center gap-4" style={{
            display: "flex",
            marginBottom: "30px",
          }}
        >
          {/* HandleBack Button */}
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-700"
            style={{
              zIndex: 2, // Ensure it's above other elements
            }}
          >
            <ArrowLeft size={15} style={{ marginTop: "2px" }} />
          </button>

          {/* Title with Tooltip */}
          <div style={{ position: "relative" }}>
            <h2
              ref={titleRef}
              className="kanban-issue-title"
              style={{
                marginLeft: "45px"
              }}
              onMouseEnter={() => isOverflowing && setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {epicName} Board
            </h2>
            {showTooltip && (
              <div className="kanban-title-custom-tooltip">
                {epicName} Board
              </div>
            )}
          </div>

          <div
            className="flex -space-x-2 cursor-pointer"
            onClick={() => setShowMembersPopup(true)}
            style={{
              display: "flex",
              marginLeft: "40px",
              marginTop: "30px",
              cursor: "pointer",
              position: "absolute",
            }}
          >
            {members.slice(0, 3).map((member, index) =>
              member.userPicture ? (
                <img key={member.memberId} src={member.userPicture} alt={member.firstName} className="w-8 h-8 rounded-full border-2 border-white" />
              ) : (
                <div key={member.memberId} className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm border-2 border-white">
                  {member.firstName?.charAt(0).toUpperCase()}
                </div>
              ),
            )}
            {members.length > 3 && <div className="members-img-count">+{members.length - 3}</div>}
          </div>
        </div>

        {showMembersPopup && <MembersPopup members={members} onClose={() => setShowMembersPopup(false)} />}

        <div
          className="flex items-center gap-4"
          style={{
            display: "flex",
            gap: "20px",
            marginLeft: "20px",
            marginBottom: "30px",
          }}
        >
          {hasAccess && isAdmin && projectStatus !== "Complete" && (
            <button className="invite-member-btn" onClick={() => setShowInviteMemberPopup(true)}>
              <Users size={20} />
              Invite Member
            </button>
          )}
          <div className="filter-type-controls relative">
            <div className="relative" ref={filterRef}>
              <button className="filter-btn" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
                Filter
                <ChevronDown size={16} className={`kanban-issue-chevron-icon ${showFilterDropdown ? "rotate" : ""}`} />
              </button>
              {showFilterDropdown && <FilterDropdown />}
            </div>
            <div className="relative" ref={typeRef}>
              <button className="type-btn" onClick={() => setShowTypeFilterDropdown(!showTypeFilterDropdown)}>
                Type
                <ChevronDown size={16} className={`kanban-issue-chevron-icon ${showTypeFilterDropdown ? "rotate" : ""}`} />
              </button>
              {showTypeFilterDropdown && <TypeFilterDropdown />}
            </div>
          </div>
        </div>
      </div>
      {showInviteMemberPopup && <InviteMemberPopup onClose={() => setShowInviteMemberPopup(false)} />}

      {showInviteSuccessPopup && (
        <div className="kanban-invite-popup-overlay">
          <div className="kanban-invite-popup-modal">
            <img src={successPopup} alt="Success" className="kanban-invite-popup-icon" />
            <p className="kanban-invite-popup-message">Member has been successfully invited!</p>
            <button className="kanban-invite-popup-button" onClick={() => setShowInviteSuccessPopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      {showInviteErrorPopup && (
        <div className="kanban-invite-popup-overlay">
          <div className="kanban-invite-popup-modal">
            <img src={errorPopup} alt="Error" className="kanban-invite-popup-icon" />
            <p className="kanban-invite-popup-error-message">{errorInviteMessage}</p>
            <button className="kanban-invite-popup-error-button" onClick={() => setShowInviteErrorPopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      <div className={`kanban-issue-columns ${isAdmin ? "is-admin" : ""}`}>
        {columns.map((columnTitle, index) => (
          <React.Fragment key={columnTitle}>
            <div
              className={`kanban-issue-column ${dragOverColumn === columnTitle ? "drag-over" : ""} ${activeColumnMenu === columnTitle ? "active" : ""}`}
              onDragOver={(e) => handleDragOver(e, columnTitle)}
              onDrop={(e) => handleDrop(e, columnTitle)}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setDragOverColumn(null);
                }
              }}
            >
              <div className="kanban-issue-header">
                <h3 className="kanban-issue-column-title">{columnTitle}</h3>

                {isAdmin && projectStatus !== "Complete" && (
                  <div className="flex items-center gap-2">
                    {columnTitle !== "Complete" && !showColumnInput && (
  <div
    className="add-button-container"
    onMouseEnter={() => {
      setShowAddColumnTooltip(true);
      setHoveredColumn(columnTitle);
    }}
    onMouseLeave={() => {
      setShowAddColumnTooltip(false);
      setHoveredColumn(null);
    }}
  >
    <button
      className="add-button flex items-center justify-center w-6 h-6 rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors duration-200"
      onClick={() => handleAddColumn(columnTitle)}
      disabled={isAddingColumn}
      style={{
        cursor: isAddingColumn ? 'not-allowed' : 'pointer',
        opacity: isAddingColumn ? 0.7 : 1,
      }}
    >
      <Plus className="plus-icon w-4 h-4 text-gray-600" />
    </button>
    {showAddColumnTooltip && hoveredColumn === columnTitle && (
      <span className="add-column-tooltip">
        {isAddingColumn ? 'Adding...' : 'Add Column'}
      </span>
    )}
  </div>
)}

                    <button
                      className="column-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveColumnMenu(activeColumnMenu === columnTitle ? null : columnTitle);
                      }}
                    >
                      {columnTitle !== "To-do" && columnTitle !== "Complete" && <span className="dots">...</span>}
                    </button>

                    {activeColumnMenu === columnTitle && (
                      <div className="kanban-issue-column-menu" ref={columnRef}>
                        <button className="delete-btn" onClick={() => handleDeleteColumn(columnTitle)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Moved the cards container here, outside of the menu */}
              <div className="column-content">
                {tasks
                  .filter((task) => {
                    const statusMatch = task.status === columnTitle;
                    const assigneeMatch = !selectedFilters.onlyMyIssue || (task.assignee && task.assignee.id === userId);
                    const typeFiltersSelected = Object.values(selectedTypeFilters).some((value) => value);
                    const typeMatch = !typeFiltersSelected || selectedTypeFilters[task.type.toLowerCase()] === true;

                    return statusMatch && assigneeMatch && typeMatch;
                  })
                  .sort((a, b) => {
                    if (a.favorite && !b.favorite) return -1;
                    if (!a.favorite && b.favorite) return 1;

                    const priorityOrder = { high: 1, medium: 2, low: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  })
                  .map((task) => (
                    <div
                      key={task.id}
                      data-task-id={task.id}
                      className={`kanban-card ${activeCard === task.id ? "active" : ""} ${task.favorite ? "favorite" : ""} ${(!isAdmin || projectStatus === "Complete") ? "non-draggable" : ""}`}
                      onMouseEnter={() => handleCardHover(task)}
                      onMouseLeave={() => setHoveredTask(null)}
                      onClick={() => handleCardClick(task)}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="card-header">
            <h4
            ref={(el) => (cardRefs.current[task.id] = el)}
            className={task.completed ? "card-issue-title" : ""}
            onMouseEnter={() => {
              if (cardRefs.current[task.id]?.dataset.isOverflowing === 'true') {
                setHoveredCardId(task.id);
                setShowIssueTooltip(true);
              }
            }}
            onMouseLeave={() => {
              setHoveredCardId(null);
              setShowIssueTooltip(false);
            }}
          >
            {task.title}
            {hoveredCardId === task.id && showIssueTooltip && (
              <div className="issue-title-tooltip">{task.title}</div>
            )}
          </h4>
                        {isAdmin && projectStatus !== "Complete" && (
                          <button
                            className="remove-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleRemoveMenu(task.id);
                            }}
                          >
                            <span className="dots">...</span>
                          </button>
                        )}
                        {activeCard === task.id && (
                          <div className="remove-menu" ref={cardRef} onClick={(e) => e.stopPropagation()}>
                            <button className="remove-btn" onClick={() => handleDeleteClick(task)}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="card-content">
                        <div
                          className="task-code"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            marginTop: "30px",
                            color: "#2665AC",
                          }}
                        >
                          <TypeIcon size={1} type={task.type} />
                          <span>{task.code}</span>
                          {getPriorityArrows(task.priority)}

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              position: "relative",
                            }}
                          >
                            <img src={img24} alt="effortIcon" className="w-6 h-6 rounded-full" style={{ width: "16px" }} draggable="false" />
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
                              {task.issueEffort || 0}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <img src={img23} alt="issueComment" className="w-6 h-6 rounded-full" style={{ width: "14px" }} draggable="false" />
                            <span>{task.commentCount}</span>
                          </div>

                          {task.hasSubtasks && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <img src={img22} alt="Subtask" className="w-6 h-6 rounded-full" style={{ width: "14px" }} />
                              <span>{task.subtaskCount}</span>
                            </div>
                          )}

                          <div className="assignee-avatar-issue">
                            {task.assignee ? (
                              task.assignee.picture ? (
                                <img
                                  src={task.assignee.picture}
                                  alt={task.assignee.name}
                                  className="w-6 h-6 rounded-full"
                                  style={{
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "9999px",
                                  }}
                                  draggable="false"
                                />
                              ) : (
                                <div
                                  className="w-6 h-6 rounded-full"
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
                                  {task.assignee.name.charAt(0).toUpperCase()}
                                </div>
                              )
                            ) : (
                              <div className="kanban-issue-tooltip-container">
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
                                    }}
                                  />
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
                                <div className="kanban-issue-custom-tooltip">No team member assigned to this task</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Create Issue button and form (only in To-do column) */}
                {columnTitle === toDoColumnName && (
                  <>
                    {showCreateIssueContainer && (
                      <div className="kanban-card" ref={createIssueRef}>
                        <div className="card-content">
                          <input type="text" placeholder="What needs to be addressed?" value={newIssueDescription} onChange={(e) => setNewIssueDescription(e.target.value)} className="issue-input" />

                          <div
                            className="flex gap-2"
                            style={{
                              display: "flex",
                              gap: "14px",
                              marginTop: "-12px",
                            }}
                          >
                            <div className="relative" ref={typeIssueRef}>
                              <button className="type-selector-btn" onClick={() => setShowTypeDropdown(!showTypeDropdown)}>
                                <TypeIcon type={selectedType.toLowerCase()} size={1} />
                                {selectedType}
                                <ChevronDown size={16} className={`kanban-issue-chevron-icon ${showTypeDropdown ? "rotate" : ""}`} />
                              </button>

                              {showTypeDropdown && (
                                <div className="type-dropdown-menu">
                                  {typeOptions.map((option) => (
                                    <button
                                      key={option.id}
                                      className="dropdown-item"
                                      onClick={() => {
                                        setSelectedType(option.label);
                                        setShowTypeDropdown(false);
                                      }}
                                    >
                                      <span className={option.color}>{option.icon}</span>
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="relative" ref={priorityRef}>
                              <button className="priority-selector-btn" onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}>
                                {selectedPriority.icon}
                                {selectedPriority.label}
                                <ChevronDown size={16} className={`kanban-issue-chevron-icon ${showPriorityDropdown ? "rotate" : ""}`} />
                              </button>

                              {showPriorityDropdown && (
                                <div className="priority-dropdown-menu">
                                  {priorityOptions.map((option) => (
                                    <button
                                      key={option.id}
                                      className="dropdown-item"
                                      onClick={() => {
                                        setSelectedPriority({
                                          label: option.label,
                                          icon: option.icon,
                                        });
                                        setShowPriorityDropdown(false);
                                      }}
                                    >
                                      {option.icon}
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <button
  className="create-issue-submit-btn"
  onClick={handleCreateIssue}
  disabled={!newIssueDescription || !selectedType || !selectedPriority || isSubmittingIssue}
  style={{
    cursor: isSubmittingIssue ? 'not-allowed' : 'pointer',
    opacity: isSubmittingIssue ? 0.7 : 1,
  }}
>
  {isSubmittingIssue ? 'Creating' : 'Create'}
</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {isAdmin && projectStatus !== "Complete" && (
                      <button
                        ref={createIssueButtonRef}
                        className="create-issue-btn"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 16px",
                          backgroundColor: "#f0f9ff",
                          color: "#3b82f6",
                          border: "1px solid #e3e8ef",
                          borderRadius: "6px",
                          width: "100%",
                          marginTop: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          fontSize: "14px",
                          fontWeight: "500",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#D6E6F2";
                          e.currentTarget.style.borderColor = "#2665AC";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "white";
                          e.currentTarget.style.borderColor = "#e3e8ef";
                        }}
                        onClick={() => setShowCreateIssueContainer(!showCreateIssueContainer)}
                      >
                        <Plus size={16} />
                        Create Issue
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {showSuccessPopup && (
              <div className="kanban-issue-popup-overlay">
                <div className="kanban-issue-popup-modal">
                  <img src={successPopup} alt="Success" className="kanban-issue-popup-icon" />
                  <p className="kanban-issue-popup-message">Issue has been successfully created!</p>
                  <button className="kanban-issue-popup-button" onClick={() => setShowSuccessPopup(false)}>
                    OK
                  </button>
                </div>
              </div>
            )}

            {showErrorPopup && (
              <div className="kanban-issue-popup-overlay">
                <div className="kanban-issue-popup-modal">
                  <img src={errorPopup} alt="Error" className="kanban-issue-popup-icon" />
                  <p className="kanban-issue-popup-error-message">{errorMessage}</p>
                  <button className="kanban-issue-popup-error-button" onClick={() => setShowErrorPopup(false)}>
                    OK
                  </button>
                </div>
              </div>
            )}

            {/* Removal Success Popup */}
  {showRemovalSuccessPopup && (
    <div className="kanban-remove-popup-overlay">
      <div className="kanban-remove-popup-modal">
        <img src={successPopup} alt="Success" className="kanban-remove-popup-icon" />
        <p className="kanban-remove-popup-message">{removalSuccessMessage}</p>
        <button 
          className="kanban-remove-popup-button" 
          onClick={() => setShowRemovalSuccessPopup(false)}
        >
          OK
        </button>
      </div>
    </div>
  )}

  {/* Removal Error Popup */}
  {showRemovalErrorPopup && (
    <div className="kanban-remove-popup-overlay">
      <div className="kanban-remove-popup-modal">
        <img src={errorPopup} alt="Error" className="kanban-remove-popup-icon" />
        <p className="kanban-remove-popup-error-message">{removalErrorMessage}</p>
        <button 
          className="kanban-remove-popup-error-button" 
          onClick={() => setShowRemovalErrorPopup(false)}
        >
          OK
        </button>
      </div>
    </div>
  )}

            {showColumnDeleteConfirmation && (
              <div className="confirmation-modal">
                <div className="confirmation-content">
                  <h3>Are you sure you want to delete {columnToDelete} column?</h3>
                  <div className="confirmation-actions">
                    <button className="confirm-btn" onClick={handleConfirmColumnDelete}>
                      Yes
                    </button>
                    <button
                      className="no-btn"
                      onClick={() => {
                        setShowColumnDeleteConfirmation(false);
                        setColumnToDelete(null);
                      }}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showConfirmation && (
              <div className="confirmation-modal">
                <div className="confirmation-content">
                  <h3>Are you sure you want to delete {selectedTask?.title}?</h3>
                  <div className="confirmation-actions">
                    <button className="confirm-btn" onClick={handleRemoveTask}>
                      Yes
                    </button>
                    <button className="no-btn" onClick={() => setShowConfirmation(false)}>
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showColumnInput && insertAfterColumn === columnTitle && (
              <div className="kanban-issue-column">
                <div className="kanban-issue-header">
                  <form onSubmit={handleColumnSubmit} className="add-column-form">
                    <input type="text" value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} placeholder="Enter Column Name" className="column-name-input" autoFocus />
                    <button type="submit" className="add-column-btn">
                      Create
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setShowColumnInput(false);
                        setNewColumnName("");
                        setInsertAfterColumn(null);
                      }}
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}

        {showPresentationPopup && <PresentationSlidePopup onClose={() => setShowPresentationPopup(false)} />}
      </div>
    </div>
  );
};

export default KanbanIssue;
