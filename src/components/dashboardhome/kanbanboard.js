import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import guidelinesICON from "./iconshomepage/guidelinesICON.png";
import img8 from "./iconshomepage/kanbanInstruction.png";
import img9 from "./iconshomepage/priorityLevel.png";
import img10 from "./iconshomepage/kanbanColumn.png";
import img11 from "./iconshomepage/credentials.png";
import img12 from "./iconshomepage/researchicon.png";
import img13 from "./iconshomepage/bugfixicon.png";
import img14 from "./iconshomepage/ppticon.png";
import img15 from "./iconshomepage/versionupdate.png";
import img18 from "./iconshomepage/notifprofile4.png";
import overdueIcon from "./iconshomepage/overdue.png";
import cautionIcon from "./iconshomepage/exclamation.png";
import clockIcon from "./iconshomepage/clock.png";
import timeIcon from "./iconshomepage/time.png";
import successPopup from "./iconshomepage/successPopup.png";
import errorPopup from "./iconshomepage/errorPopup.png";
import calendarIcon from "./iconshomepage/calendar.png";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./kanbanboard.css";
import "./kanbanissue.css";

const KanbanBoard = () => {
  const navigate = useNavigate();
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Filter");
  const [editingColumnTitle, setEditingColumnTitle] = useState("");
  const [columns, setColumns] = useState(["To-do", "In Progress", "Complete"]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const filterDropdownRef = useRef(null);
  const cardMenuRef = useRef(null);
  const taskRefs = useRef({});
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);
  const [projectPicture, setProjectPicture] = useState("");
  const [selectedEpicId, setSelectedEpicId] = useState(null);
  const [epicName, setEpicName] = useState("");
  const [epicCode, setEpicCode] = useState("");
  const [uid, setUid] = useState(null);
  const [showEpicPopup, setShowEpicPopup] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activeColumnMenu, setActiveColumnMenu] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [comboBoxFilter, setComboBoxFilter] = useState("On Going");
  const location = useLocation();
  const [id, setId] = useState(location.state?.id || null);
  useEffect(() => {
    const targetTaskId = id; // Replace this with the ID you're looking for
    const taskDiv = taskRefs.current[targetTaskId];

    if (taskDiv) {
      // Simulate click event
      taskDiv.click();
    }
  }, [tasks]); // Only run when tasks update

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const db = getFirestore();
        const kanbanDocRef = doc(db, "KanbanColumn", "vKZL2oJ15MwGDJrZwpOW");
        const kanbanDoc = await getDoc(kanbanDocRef);

        if (kanbanDoc.exists()) {
          const data = kanbanDoc.data();

          switch (comboBoxFilter) {
            case "All Epics":
              setColumns(data.AllColumn || ["To-do", "In Progress", "Complete"]);
              break;
            case "Finished":
              setColumns(data.FColumn || ["Complete", "Finished"]);
              break;
            case "On Going":
              setColumns(data.KanbanStatus || ["To-do", "In Progress", "Complete"]);
              break;
            default:
              setColumns(["To-do", "In Progress", "Complete"]);
          }
        } else {
          console.log("KanbanColumn document does not exist!");
          // Set default columns if document doesn't exist
          setColumns(["To-do", "In Progress", "Complete"]);
        }
      } catch (error) {
        console.error("Error fetching columns: ", error);
        // Set default columns on error
        setColumns(["To-do", "In Progress", "Complete"]);
      }
    };

    fetchColumns();
  }, [comboBoxFilter]);

  useEffect(() => {
    const fetchKanbanData = async () => {
      try {
        const auth = getAuth();
        await setPersistence(auth, browserLocalPersistence);

        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error("No user logged in");
          setLoading(false);
          return;
        }

        // Store the current user's UID
        const uid = currentUser.uid;
        setUid(uid);

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
            // Set isAdmin if the current user is the admin of any epic
            if (epicData.admin === uid) {
              setIsAdmin(true);
            }
            const kanbanIssueRef = collection(db, `Kanban/${epicId}/kanbanIssue`);
            const kanbanIssueSnapshot = await getDocs(kanbanIssueRef);

            const issues = kanbanIssueSnapshot.docs.map((issueDoc) => ({
              effort: issueDoc.data().issueEffort || 0,
              status: issueDoc.data().issueStatus || "To-do",
            }));

            const totalEffort = issues.reduce((sum, issue) => sum + (issue.status !== "To-do" ? issue.effort : 0), 0);
            const completedEffort = issues.reduce((sum, issue) => sum + (issue.status === "Complete" ? issue.effort : 0), 0);
            const progress = totalEffort > 0 ? (completedEffort / totalEffort) * 100 : 0;

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
                    name: memberData.firstName,
                    userpicture: memberData.userPicture,
                  };
                }
                return null;
              }),
            );

            return {
              id: epicId,
              dateDone: epicData.dateDone,
              startDate: epicData.startDate,
              endDate: epicData.endDate,
              admin: epicData.admin,
              title: epicData.epicName,
              status: epicData.projectStatus || "To-do",
              progress: progress.toFixed(2),
              code: epicData.epicCode,
              assignees: assignees.filter((assignee) => assignee !== null),
              projectPicture: epicData.projectPicture,
            };
          }),
        );

        setTasks(tasksData.filter((task) => task !== null));
      } catch (error) {
        console.error("Error fetching Kanban data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKanbanData();
  }, []);

  const getIconBasedOnDeadline = (startDate, endDate, status, dateDone) => {
    if (status !== "Complete") {
      if (!startDate || !endDate) return calendarIcon;

      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        if (isNaN(start) || isNaN(end)) throw new Error("Invalid date format");

        const totalDuration = end - start;
        const elapsedTime = today - start;
        const percentageElapsed = (elapsedTime / totalDuration) * 100;

        if (percentageElapsed >= 75) return overdueIcon;
        else if (percentageElapsed >= 50) return cautionIcon;
        else return calendarIcon;
      } catch (error) {
        console.error("Error calculating deadline icon:", error);
        return calendarIcon;
      }
    }

    if (status === "Complete" && dateDone && endDate) {
      try {
        const end = new Date(endDate);
        const done = new Date(dateDone);

        if (isNaN(end) || isNaN(done)) {
          console.error("Invalid date format for comparison");
          return null;
        }

        return done <= end ? timeIcon : clockIcon;
      } catch (error) {
        console.error("Error calculating completion icon:", error);
        return null;
      }
    }

    return null;
  };

  const getDeadlineMessage = (startDate, endDate, status, dateDone) => {
    if (status !== "Complete") {
      if (!startDate || !endDate) return "";

      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        if (isNaN(start) || isNaN(end)) throw new Error("Invalid date format");

        const remainingTime = end - today;
        const daysRemaining = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

        if (daysRemaining === 0) {
          return "This project is due today!\nPlease make sure to complete\nall remaining tasks.";
        } else if (daysRemaining === 1) {
          return "This project is due tomorrow!\nPlease make sure to complete\nall remaining tasks.";
        } else {
          return `This project is due in ${daysRemaining} days.\nPlease make sure to complete\nall remaining tasks.`;
        }
      } catch (error) {
        console.error("Error generating deadline message:", error);
        return "Error calculating deadline.";
      }
    }

    if (status === "Complete" && dateDone && endDate) {
      try {
        const end = new Date(endDate);
        const done = new Date(dateDone);

        if (isNaN(end) || isNaN(done)) {
          console.error("Invalid date format for comparison");
          return "";
        }

        if (done <= end) {
          return "Project completed on time!\nExcellent work.";
        } else {
          const daysOverdue = Math.ceil((done - end) / (1000 * 60 * 60 * 24));
          return `Project completed ${daysOverdue} days after deadline.\nTry to improve time management.`;
        }
      } catch (error) {
        console.error("Error generating completion message:", error);
        return "";
      }
    }
    return null;
  };

  const handleToggleRemoveMenu = (id) => {
    setActiveCard(activeCard === id ? null : id);
  };

  const toggleGuidelines = () => {
    setShowGuidelines(!showGuidelines);
  };

  const closeGuidelines = () => {
    setShowGuidelines(false);
  };

  const toggleFilterDropdown = () => {
    setShowFilter(!showFilter);
  };

  const handleFilterSelect = (option) => {
    setSelectedFilter(option);
    setComboBoxFilter(option);
    setShowFilter(false);
  };

  const handleEditProject = (task) => {
    setIsEditMode(true);
    setActiveCard(task.id); // Set the active card ID
    setShowEpicPopup(true);
  };

  const handleDeleteClick = (task) => {
    setSelectedTask(task); // Set the task to be deleted
    setShowConfirmation(true); // Show the confirmation modal
    setActiveCard(null); // Close the remove menu
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle filter dropdown clicks
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilter(false);
      }

      // Only handle card menu clicks if the epic popup is not showing
      if (!showEpicPopup) {
        const isCardDotClick = event.target.closest(".remove-btn");
        const isOutsideCardMenu = !cardMenuRef.current?.contains(event.target);
        const isInsideEpicModal = event.target.closest(".epic-modal");

        // Only close the card menu if click is outside and not in epic modal
        if (isOutsideCardMenu && !isCardDotClick && !isInsideEpicModal) {
          setActiveCard(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEpicPopup]);

  const handleRemoveTask = async () => {
    if (selectedTask) {
      try {
        const db = getFirestore();
        const epicId = selectedTask.id;

        // Delete all member documents within the 'Member' subcollection of the selected Epic
        const membersRef = collection(db, `Kanban/${epicId}/Member`);
        const membersSnapshot = await getDocs(membersRef);

        // Log all member IDs before deletion
        const memberUids = membersSnapshot.docs.map((memberDoc) => memberDoc.data().MemberUid); // Extract MemberUid values

        // Loop through each member document and delete them
        const deleteMemberPromises = membersSnapshot.docs.map((memberDoc) => deleteDoc(doc(db, `Kanban/${epicId}/Member/${memberDoc.id}`)));

        // Wait for all member documents to be deleted
        await Promise.all(deleteMemberPromises);

        // Loop through all the collected MemberUids and delete the corresponding user Kanban document
        const deleteUserKanbanPromises = memberUids.map((MemberUid) => {
          const userKanbanRef = doc(db, `users/${MemberUid}/Kanban/${epicId}`);
          return deleteDoc(userKanbanRef);
        });

        // Wait for all user Kanban documents to be deleted
        await Promise.all(deleteUserKanbanPromises);

        // Delete the Epic document from the main 'Kanban' collection
        const epicRef = doc(db, `Kanban/${epicId}`);
        await deleteDoc(epicRef);

        // Remove the task from the local state
        setTasks(tasks.filter((task) => task.id !== selectedTask.id));

        // Clear the selected task and close the confirmation modal
        setSelectedTask(null);
        setShowConfirmation(false);
      } catch (error) {
        console.error("Error deleting Epic and its members from Firestore:", error);
      }
    }
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

    return (
      <div className="epic-date-group">
        <p className="epic-date-label">{label}</p>
        <div className="epic-date-row">
          <div className="epic-date-input-container">
            <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className="epic-date-input" />
            <Calendar className="epic-calendar-icon" size={16} />
          </div>
          <div style={{ position: "relative" }}>
            <button type="button" className="epic-time-button" onClick={() => setShowTimePicker(!showTimePicker)}>
              {time ? formatTimeToAMPM(time) : "Set Time"}
            </button>

            {showTimePicker && (
              <div className="time-dropdown">
                {timeOptions.map((time24) => (
                  <button
                    key={time24}
                    onClick={() => {
                      onTimeChange(time24);
                      setShowTimePicker(false);
                    }}
                    className="time-dropdown-option"
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

  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const CreateEpicPopup = ({ onClose, isEditMode, projectId }) => {
    const [epicFormData, setEpicFormData] = useState({
      projectName: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      projectPicture: null,
      favorite: false,
    });
    const [projectPictureUrl, setProjectPictureUrl] = useState("");
    const [projectPictureName, setProjectPictureName] = useState("");
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [popupProjectName, setPopupProjectName] = useState("");
    const auth = getAuth();
    const uid = auth.currentUser ? auth.currentUser.uid : "";

    const SuccessPopup = () => (
      <div className="kanban-invite-popup-overlay">
        <div className="kanban-invite-popup-modal">
          <img src={successPopup} alt="Success" className="kanban-invite-popup-icon" />
          <p className="kanban-invite-popup-message">{isEditMode ? `${popupProjectName} has been successfully updated!` : `${popupProjectName} has been successfully created!`}</p>
          <button
            className="kanban-invite-popup-button"
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

    const ErrorPopup = () => (
      <div className="kanban-invite-popup-overlay">
        <div className="kanban-invite-popup-modal">
          <img src={errorPopup} alt="Error" className="kanban-invite-popup-icon" />
          <p className="kanban-invite-popup-error-message">{errorMessage}</p>
          <button className="kanban-invite-popup-error-button" onClick={() => setShowErrorPopup(false)}>
            OK
          </button>
        </div>
      </div>
    );

    useEffect(() => {
      const fetchProjectData = async () => {
        if (isEditMode && projectId) {
          try {
            const db = getFirestore();
            const docRef = doc(db, `Kanban/${projectId}`);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const projectData = docSnap.data();
              setEpicFormData({
                projectName: projectData.epicName,
                startDate: projectData.startDate,
                startTime: projectData.startTime,
                endDate: projectData.endDate,
                endTime: projectData.endTime,
                favorite: projectData.favorite,
              });
              setProjectPictureUrl(projectData.projectPicture);
              setProjectPictureName(projectData.projectPictureName);
            }
          } catch (error) {
            console.error("Error fetching project data:", error);
          }
        }
      };

      fetchProjectData();
    }, [isEditMode, projectId]);

    const generateEpicCode = (projectName) => {
      return projectName
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
    };

    const [isSubmitting, setIsSubmitting] = useState(false); // State to track form submission

    const handleFormSubmit = async (e) => {
      e.preventDefault();

      if (!isFormValid()) {
        setShowErrorPopup(true);
        setErrorMessage("Please fill in all required fields.");
        return;
      }

      // Disable the button to prevent multiple submissions
      setIsSubmitting(true);

      let updatedProjectPictureUrl = projectPictureUrl;

      try {
        if (epicFormData.projectPicture) {
          const storage = getStorage();
          const timestamp = Date.now();
          const storageRef = ref(storage, `Kanban/${timestamp}/${epicFormData.projectName}/${epicFormData.projectPicture.name}`);
          await uploadBytes(storageRef, epicFormData.projectPicture);
          updatedProjectPictureUrl = await getDownloadURL(storageRef);
        }

        const db = getFirestore();
        let epicId = projectId;

        if (!isEditMode) {
          epicId = doc(collection(db, "Kanban")).id;
        }

        const epicCode = generateEpicCode(epicFormData.projectName);

        const notifRef = doc(collection(db, `Kanban/${epicId}/kanbanNotif`));
        const notification = {
          context: epicId,
          id: notifRef.id,
          receiver: [uid],
          timeAgo: new Date().toISOString(),
          type: "deadline",
          unread: true,
        };
        await setDoc(notifRef, notification);

        if (isEditMode) {
          await updateDoc(doc(db, `Kanban/${projectId}`), {
            epicName: epicFormData.projectName,
            startDate: epicFormData.startDate,
            endDate: epicFormData.endDate,
            startTime: epicFormData.startTime,
            endTime: epicFormData.endTime,
            favorite: epicFormData.favorite,
            projectPicture: updatedProjectPictureUrl,
            projectPictureName: projectPictureName,
          });
        } else {
          await setDoc(doc(db, `users/${uid}/Kanban/${epicId}`), {
            createdAt: new Date(),
            epicId: epicId,
            notifId: notifRef.id,
          });

          await setDoc(doc(db, `Kanban/${epicId}`), {
            projectId: epicId,
            epicName: epicFormData.projectName,
            startDate: epicFormData.startDate,
            endDate: epicFormData.endDate,
            startTime: epicFormData.startTime,
            endTime: epicFormData.endTime,
            dateDone: null,
            admin: uid,
            favorite: epicFormData.favorite,
            projectPicture: updatedProjectPictureUrl,
            projectPictureName: projectPictureName,
            projectStatus: "To-do",
            epicCode: epicCode,
          });

          await setDoc(doc(db, `Kanban/${epicId}/Member`, uid), {
            MemberUid: uid,
            Type: "Kanban Owner",
            Access: true,
          });

          await setDoc(doc(db, `Kanban/${epicId}/EpicColumn/p9Gdxwc3hs3tzZIdFDVi`), {
            createdAt: new Date(),
            issueColumn: ["To-do", "In Progress", "Complete"],
          });
        }

        setPopupProjectName(epicFormData.projectName);
        setShowSuccessPopup(true);

        console.log(`Project ${isEditMode ? "updated" : "saved"} successfully`);
      } catch (error) {
        console.error(`Error ${isEditMode ? "updating" : "saving"} project:`, error);
        setShowErrorPopup(true);
        setErrorMessage(`Failed to ${isEditMode ? "update" : "save"} project. Please try again.`);
      } finally {
        // Re-enable the button after the operation
        setIsSubmitting(false);
      }
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setEpicFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      setEpicFormData((prev) => ({
        ...prev,
        projectPicture: file,
      }));
      setProjectPictureName(file.name);
    };

    const isFormValid = () => {
      return epicFormData.projectName && epicFormData.startDate && epicFormData.endDate && epicFormData.startTime && epicFormData.endTime;
    };
    useEffect(() => {
      const today = new Date();
      const localDate = today.toLocaleDateString("en-CA"); // 'en-CA' format is YYYY-MM-DD
      if (!epicFormData.startDate) {
        setEpicFormData({
          ...epicFormData,
          startDate: localDate, // Set start date to today in local YYYY-MM-DD format
        });
      }
    }, [epicFormData]);
    return (
      <>
        <div className="epic-modal" onClick={(e) => e.stopPropagation()}>
          <div className="epic-container" onClick={(e) => e.stopPropagation()}>
            <h2 className="epic-title">{isEditMode ? "Edit Epic" : "Create Epic"}</h2>
            <div className="epic-divider" />
            <form onSubmit={handleFormSubmit} className="epic-content">
              <div className="epic-upload-section">
                <div className="epic-upload-area">
                  <div className="epic-image-container">
                    {epicFormData.projectPicture ? (
                      <img src={URL.createObjectURL(epicFormData.projectPicture)} alt="project icon" className="epic-project-image" />
                    ) : projectPictureUrl ? (
                      <img src={projectPictureUrl} alt="project icon" className="epic-project-image" />
                    ) : (
                      <div className="epic-project-image" style={{ background: "#F1F9FA" }} />
                    )}
                  </div>
                  <div className="epic-upload-content">
                    <p className="epic-upload-text">
                      {epicFormData.projectPicture ? "File Selected" : projectPictureName ? `${projectPictureName}` : isEditMode ? "No Image Found" : "No File Selected"}
                    </p>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} id="epic-file-upload" />
                    <label htmlFor="epic-file-upload" className="epic-upload-button">
                      Upload File
                    </label>
                  </div>
                </div>
              </div>
              <div className="epic-form-section">
                <input type="text" name="projectName" placeholder="Enter Project Name" className="epic-input" value={epicFormData.projectName} onChange={handleInputChange} autoFocus />
                <DateTimePicker
                  label="Start Date"
                  date={epicFormData.startDate}
                  time={epicFormData.startTime}
                  onDateChange={(date) => {
                    const today = new Date().setHours(0, 0, 0, 0); // Set time to 00:00 for today's date
                    const selectedDate = new Date(date).setHours(0, 0, 0, 0);
                    if (selectedDate >= today) {
                      setEpicFormData({ ...epicFormData, startDate: date });
                    } else {
                      // Optionally show an error message or log it
                      console.log("Cannot select a past date.");
                    }
                  }}
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
                      // Optionally show an error message or log it
                      console.log("End date cannot be before start date.");
                    }
                  }}
                  onTimeChange={(time) => setEpicFormData({ ...epicFormData, endTime: time })}
                />
              </div>
            </form>
            <div className="epic-actions">
              <button className="epic-action-button" type="button" disabled={isSubmitting} onClick={handleFormSubmit}>
                {isEditMode ? "Save Changes" : "Create"}
              </button>
              <button className="epic-action-button" type="button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
        {showSuccessPopup && <SuccessPopup />}
        {showErrorPopup && <ErrorPopup />}
      </>
    );
  };

  const handleDragStart = (e, task) => {
    // Simple check for admin status
    if (!isAdmin) {
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
      const cardContainer = column.querySelector(".column-cards") || column;
      cardContainer.appendChild(dropIndicator);
    }
  };

  const [showCompleteConfirmation, setShowCompleteConfirmation] = useState(false);
  const [pendingCompleteTask, setPendingCompleteTask] = useState(null);
  const [pendingDropEvent, setPendingDropEvent] = useState(null);

  const handleCompleteConfirmation = async (confirmed) => {
    if (confirmed && pendingCompleteTask && pendingDropEvent) {
      // Proceed with the original drop logic
      const { e, columnTitle } = pendingDropEvent;

      try {
        const db = getFirestore();
        const taskRef = doc(db, "Kanban", pendingCompleteTask.id);
        const now = new Date().toISOString().split("T")[0];

        // Update the task status
        await updateDoc(taskRef, {
          projectStatus: columnTitle,
          dateDone: now,
        });

        // Update local state
        const updatedTasks = tasks.map((task) => (task.id === pendingCompleteTask.id ? { ...task, status: columnTitle, dateDone: now } : task));
        setTasks(updatedTasks);

        console.log("Task successfully moved to Complete!");
      } catch (error) {
        console.error("Error updating task status:", error);
        setErrorMessage("Failed to move task to Complete. Please try again.");
        setShowErrorPopup(true);
      }
    }

    // Reset pending states
    setShowCompleteConfirmation(false);
    setPendingCompleteTask(null);
    setPendingDropEvent(null);
  };

  const handleDrop = async (e, columnTitle) => {
    e.preventDefault();
    if (!draggedTask) return;
    const db = getFirestore();

    console.log("Column Title:", columnTitle);
    console.log("Dragged Task ID:", draggedTask.id);

    // Check if trying to move from Finished to To-do or In Progress
    if (draggedTask.status === "Finished" && (columnTitle === "To-do" || columnTitle === "In Progress")) {
        setErrorMessage("Finished projects cannot be moved back to To-do or In Progress. They can only be moved to Complete.");
        setShowErrorPopup(true);
        return;
    }

    // Check if trying to move from Complete to To-do or In Progress
    if (draggedTask.status === "Complete" && (columnTitle === "To-do" || columnTitle === "In Progress")) {
        setErrorMessage("Completed projects cannot be moved back to To-do or In Progress. They can only be moved to Finished.");
        setShowErrorPopup(true);
        return;
    }

    const column = e.currentTarget;
    const afterElement = getDragAfterElement(column, e.clientY);

    const columnTasks = tasks.filter((task) => task.status === columnTitle);
    const remainingTasks = tasks.filter((task) => task.id !== draggedTask.id);

    let newIndex;
    if (afterElement) {
        const afterTask = columnTasks.find((task) => afterElement.getAttribute("data-task-id") === task.id.toString());
        newIndex = remainingTasks.findIndex((task) => task.id === afterTask.id);
    } else {
        newIndex = remainingTasks.length; // Append to the end if no afterElement
    }

    // Modified Complete column logic to skip confirmation if moving from Finished
    if (columnTitle === "Complete" && draggedTask.status !== "Finished") {
        try {
            const db = getFirestore();
            const taskSubCollectionRef = collection(db, `Kanban/${draggedTask.id}/kanbanIssue`);
            const taskQuerySnapshot = await getDocs(taskSubCollectionRef);

            if (taskQuerySnapshot.empty) {
                setErrorMessage("Cannot move to Complete because there are no issues associated with this task.");
                setShowErrorPopup(true);
                return;
            }

            let allComplete = true;
            taskQuerySnapshot.forEach((doc) => {
                const taskData = doc.data();
                if (taskData.issueStatus !== "Complete" && taskData.issueStatus !== "Finished") {
                    allComplete = false;
                }
            });

            if (!allComplete) {
                setErrorMessage('All issues must be completed before moving to the "Complete" status.');
                setShowErrorPopup(true);
                return;
            }

            // Show confirmation only if not moving from Finished
            setPendingCompleteTask(draggedTask);
            setPendingDropEvent({ e, columnTitle });
            setShowCompleteConfirmation(true);
            return;
        } catch (error) {
            console.error("Error checking issues status:", error);
            return;
        }
    }

    // Ensure the task is in "Complete" before moving to "Finished"
    if (columnTitle === "Finished") {
        if (draggedTask.status !== "Complete") {
            console.error('Task must be moved to "Complete" before "Finished".');
            setErrorMessage('You must move the task to "Complete" before moving it to "Finished".');
            setShowErrorPopup(true);
            return;
        }
    }

    // Check if all issues are complete before moving to "Complete" or "Finished"
    if ((columnTitle === "Complete" || columnTitle === "Finished") && draggedTask.status !== "Finished") {
        try {
            const taskSubCollectionRef = collection(db, `Kanban/${draggedTask.id}/kanbanIssue`);
            const taskQuerySnapshot = await getDocs(taskSubCollectionRef);

            if (taskQuerySnapshot.empty) {
                console.error("No issues exist for this task.");
                setErrorMessage("Cannot update status because there are no issues associated with this task.");
                setShowErrorPopup(true);
                return;
            }

            let allComplete = true;
            taskQuerySnapshot.forEach((doc) => {
                const taskData = doc.data();
                if (taskData.issueStatus !== "Complete" && taskData.issueStatus !== "Finished") {
                    allComplete = false;
                }
            });

            if (!allComplete) {
                console.error('Cannot update projectStatus. Not all tasks have issueStatus as "Complete" or "Finished".');
                setErrorMessage('All issues must be completed before moving to the "Complete" or "Finished" status.');
                setShowErrorPopup(true);
                return;
            }
        } catch (error) {
            console.error("Error checking tasks or retrieving issue statuses:", error);
            return;
        }
    }

    // Retrieve the task document to check for admin field
    const taskRef = doc(db, "Kanban", draggedTask.id);
    const taskDoc = await getDoc(taskRef);

    if (taskDoc.exists()) {
        const taskData = taskDoc.data();
        const adminUid = taskData.admin;

        const auth = getAuth();
        const currentUserUid = auth.currentUser?.uid;

        if (adminUid !== currentUserUid) {
            console.error("You do not have permission to edit this task.");
            setErrorMessage("You do not have permission to move this task.");
            setShowErrorPopup(true);
            return;
        }
    } else {
        console.error("Task document not found in Firestore:", draggedTask.id);
        return;
    }

    const now = new Date().toISOString().split("T")[0];

    const updatedDraggedTask = {
        ...draggedTask,
        status: columnTitle,
        projectStatus: columnTitle,
        ...(columnTitle === "Complete" && { dateDone: now }),
    };

    try {
        await updateDoc(taskRef, {
            projectStatus: columnTitle,
            ...(columnTitle === "Complete" && { dateDone: now }),
        });
        console.log("Firestore update successful!");
    } catch (error) {
        console.error("Error updating Firestore:", error);
    }

    const updatedTasks = [...remainingTasks.slice(0, newIndex), updatedDraggedTask, ...remainingTasks.slice(newIndex)];

    setTasks(updatedTasks);
    setDraggedTask(null);
    setDragOverColumn(null);

    document.querySelectorAll(".drop-indicator").forEach((el) => el.remove());
};

  const handleCardClick = (task) => {
    setProjectPicture(task.projectPicture);
    setSelectedEpicId(task.id);
    setEpicName(task.title);
    setEpicCode(task.code);

    // Navigate to KanbanIssue with state
    navigate("/kanbanissue", {
      state: {
        epicId: task.id,
        epicName: task.title,
        epicCode: task.code,
        projectPicture: task.projectPicture,
      },
    });
  };

  const titleRef = useRef(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const cardRefs = useRef({});
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    tasks.forEach((task) => {
      if (cardRefs.current[task.id]) {
        const element = cardRefs.current[task.id];
        const isOverflow = element.offsetWidth < element.scrollWidth;
        element.dataset.isOverflowing = isOverflow;
      }
    });
  }, [tasks]);

  return (
    <div className="kanban-board">
      <div className="kanban-header">
        <h2 className="kanban-board-title">Kanban Board</h2>
        <img src={guidelinesICON} alt="" className="guidelinesIcon" onClick={toggleGuidelines} />
        <div className="kanban-filter-dropdown" ref={filterDropdownRef}>
          <button className="kanban-filter-btn" onClick={toggleFilterDropdown}>
            {selectedFilter} <ChevronDown size={16} className={`kanban-chevron-icon ${showFilter ? "rotate" : ""}`} />
          </button>
          {showFilter && (
            <div className="filter-dropdown-content">
              <div className="filter-option" onClick={() => handleFilterSelect("All Epics")}>
                All Epics
              </div>
              <div className="filter-option" onClick={() => handleFilterSelect("On Going")}>
                On Going
              </div>
              <div className="filter-option" onClick={() => handleFilterSelect("Finished")}>
                Finished
              </div>
            </div>
          )}
        </div>

        <button className="create-epic-btn" onClick={() => setShowEpicPopup(true)}>
          Create Epic
        </button>
      </div>

      {showGuidelines && (
        <div className="kanban-guidelines">
          <h4>Kanban</h4>
          <div className="kanban-guidelines-scroll">
            <div className="kanban-instruction">
              <img src={img8} alt="" className="kanban-icons" />
              <p>Kanban board a visual tool that helps the team to visualized their project and workflow</p>
            </div>
            <div className="kanban-epic-instruction">
              <b>
                <img src={img11} alt="" className="kanban-epic-icons" />
                Epic - A large body of work that can be broken down into smaller tasks or stories.
              </b>
              <b>
                <img src={img12} alt="" className="kanban-epic-icons" />
                Story - A feature or requirement to be implemented.
              </b>
              <b>
                <img src={img13} alt="" className="kanban-epic-icons" />
                Bug - A defect that needs to be fixed.
              </b>
              <b>
                <img src={img14} alt="" className="kanban-epic-icons" />
                Task - A general work item.
              </b>
              <b>
                <img src={img15} alt="" className="kanban-epic-icons" />
                Sub-task - A smaller unit that breaks down a parent issue.
              </b>
              <p>"Issue Type" represents different types of work items or tasks that need to be tracked and managed.</p>
            </div>
            <div className="kanban-representation-instruction">
              <img src={img9} alt="" className="kanban-icons" />
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
            <div className="kanban-project-instruction">
              <img src={img10} alt="" className="kanban-icons" />
              <p>
                A kanban board column represents a specific stage in your workflow. It visually organizes tasks based on their status, helping teams see what's being worked on, what's completed, and
                what's upcoming.
              </p>
            </div>
          </div>
          <button className="kanban-guidelines-done" onClick={closeGuidelines}>
            Done
          </button>
        </div>
      )}

      <div className="kanban-columns">
        {columns.map((columnTitle, index) => (
          <React.Fragment key={columnTitle}>
            <div
              className={`kanban-column ${dragOverColumn === columnTitle ? "drag-over" : ""} ${activeColumnMenu === columnTitle ? "active" : ""}`}
              onDragOver={(e) => handleDragOver(e, columnTitle)}
              onDrop={(e) => handleDrop(e, columnTitle)}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setDragOverColumn(null);
                }
              }}
            >
              <div className="column-header">
                <h3 className="kanban-column-title">{columnTitle}</h3>
              </div>
              <div className="column-cards">
                {tasks
                  .filter((task) => task.status === columnTitle)
                  .map((task) => (
                    <div
                      key={task.id}
                      ref={(el) => (taskRefs.current[task.id] = el)}
                      data-task-id={task.id}
                      className={`kanban-card ${activeCard === task.id ? "active" : ""} ${!isAdmin ? "non-draggable" : ""} `}
                      onClick={() => handleCardClick(task)}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="card-header flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <img src={task.projectPicture || "https://firebasestorage.googleapis.com/v0/b/dyci-academix.appspot.com/o/wagdelete%2Facademixlogo.png?alt=media&token=8f83d11b-3604-41e5-9a46-d1df0d44aed5"} alt="notification icon" className="project-name-icon" />
                          <div className="title-container">
                            <h4
                              ref={(el) => (cardRefs.current[task.id] = el)}
                              className="task-title"
                              onMouseEnter={() => {
                                if (cardRefs.current[task.id]?.dataset.isOverflowing === "true") {
                                  setHoveredCardId(task.id);
                                  setShowTooltip(true);
                                }
                              }}
                              onMouseLeave={() => {
                                setHoveredCardId(null);
                                setShowTooltip(false);
                              }}
                            >
                              {task.title}
                              {hoveredCardId === task.id && showTooltip && <div className="title-tooltip">{task.title}</div>}
                            </h4>
                            {task.endDate && (
                              <div className="kanban-epic-tooltip-container">
                                <img src={getIconBasedOnDeadline(task.startDate, task.endDate, task.status, task.dateDone)} alt="Deadline Status" className="overdue-icon" />
                                <div className="kanban-epic-custom-tooltip">
                                  <span className="kanban-epic-tooltip-content">{getDeadlineMessage(task.startDate, task.endDate, task.status, task.dateDone)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {isAdmin && task.admin === uid && (
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
                        {activeCard === task.id && isAdmin && task.admin === uid && (
                          <div className="remove-menu" ref={cardMenuRef} onClick={(e) => e.stopPropagation()}>
                            <button className="edit-btn" onClick={() => handleEditProject(task)}>
                              Edit
                            </button>
                            <button
                              className="remove-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(task);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="card-content">
                        <div className="flex items-center gap-2 mb-2">
                          <img src={img11} alt="Task icon" className="epic-project-icon" />
                          <div className="task-code">{task.code} - 0</div>
                        </div>
                        <div className="progress-bar">
                          <div className="progress" style={{ width: `${task.progress}%` }} />
                        </div>
                        <div className="progress-percentage">{task.progress}%</div>
                        <div className="card-footer">
                          <div className="assignees">
                            {task.assignees.slice(0, 3).map((assignee, index) => (
                              <div key={index} className="assignee-user-image">
                                {assignee.userpicture ? (
                                  <img src={assignee.userpicture} alt={`${assignee.name}'s avatar`} />
                                ) : (
                                  <span className="assignee-avatar">{assignee.name.charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                            ))}
                            {task.assignees.length > 3 && <div className="extra-count">+{task.assignees.length - 3}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {showCompleteConfirmation && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3 className="confirmation-content-title">Are you sure you want to move {pendingCompleteTask?.title} to Complete state?</h3>
            <div className="confirmation-actions">
              <button className="confirm-btn" onClick={() => handleCompleteConfirmation(true)}>
                Yes
              </button>
              <button className="no-btn" onClick={() => handleCompleteConfirmation(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showErrorPopup && (
        <div className="kanban-invite-popup-overlay">
          <div className="kanban-invite-popup-modal">
            <img src={errorPopup} alt="Error" className="kanban-invite-popup-icon" />
            <p className="kanban-invite-popup-error-message">{errorMessage}</p>
            <button className="kanban-invite-popup-error-button" onClick={() => setShowErrorPopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3 className="confirmation-content-title">Are you sure you want to delete {selectedTask?.title}?</h3>
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

      {showEpicPopup && (
        <CreateEpicPopup
          onClose={() => {
            setShowEpicPopup(false);
            setIsEditMode(false);
          }}
          isEditMode={isEditMode}
          projectId={activeCard}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
