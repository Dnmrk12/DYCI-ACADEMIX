import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./dashboard.css";
import FinalLogo from "./iconshomepage/FinalLogo.png";
import img1 from "./iconshomepage/systemdashbaord.png";
import img2 from "./iconshomepage/personalroadmap.png";
import img3 from "./iconshomepage/kanbanboard.png";
import img4 from "./iconshomepage/scrum.png";
import img5 from "./iconshomepage/reports.png";
import img6 from "./iconshomepage/backlogs.png";
import img7 from "./iconshomepage/activeSprint.png";
import img8 from "./iconshomepage/burndownChart.png";
import img9 from "./iconshomepage/velocityChart.png";
import img10 from "./iconshomepage/sprintReport.png";
import img11 from "./iconshomepage/groupChat.png";
import PerfomRep from "./iconshomepage/performance report.png";
import LogRep from "./iconshomepage/logreport.png"; 
import {  getFirestore,  collection, limit, addDoc,doc,getDocs,getDoc, increment, deleteDoc, setDoc, query,orderBy,onSnapshot,where,updateDoc, arrayRemove,arrayUnion,serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { db } from "./firebase/firebaseConfig";
function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrumDropdownOpen, setIsScrumDropdownOpen] = useState(false);
  const activePage = location.pathname;
  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);
  const [reportactivePage, setreportActivePage] = useState(window.location.pathname);

  const toggleReportsDropdown = () => {
    setIsReportsDropdownOpen(!isReportsDropdownOpen);
  };
  useEffect(() => {
    setreportActivePage(location.pathname);
  }, [location]);

  useEffect(() => {
    // Check if we're in a backlogs page or any Scrum-related page and ensure dropdown is open
    if (
      activePage.startsWith("/backlogs") ||
      activePage.startsWith("/activesprint") ||
      activePage.startsWith("/burndownchart") ||
      activePage.startsWith("/velocitychart") ||
      activePage.startsWith("/sprintreport") ||
      activePage.startsWith("/groupchat")
    ) {
      setIsScrumDropdownOpen(true);
    }
  }, [activePage]);
  
  const toggleScrumDropdown = () => {
    setIsScrumDropdownOpen(!isScrumDropdownOpen);
  };
  
  const isActiveRoute = (path) => {
    // Handle specific routes with potential sub-routes
    const activeRoutes = {
      "/backlogs": activePage.startsWith("/backlogs"),
      "/activesprint": activePage.startsWith("/activesprint"),
      "/burndownchart": activePage.startsWith("/burndownchart"),
      "/velocitychart": activePage.startsWith("/velocitychart"),
      "/sprintreport": activePage.startsWith("/sprintreport"),
      "/groupchat": activePage.startsWith("/groupchat"),
    };
  
    return activeRoutes[path] || activePage === path;
  };
  
  // Function to determine if a route should be disabled based on startSprint
  const createDisabledLinkProps = (path) => {
    const disabledRoutes = ["/activesprint", "/burndownchart", "/velocitychart", "/sprintreport"];
    if (startSprint && disabledRoutes.includes(path)) {
      return { onClick: (e) => e.preventDefault(), style: { pointerEvents: "none", opacity: 0.5 } };
    }
    return {};
  };

  const gen = (name) => {
    if (!name) return ""; // Add safeguard to check for undefined or null name
    return name
      .split(" ") // Split the name into words
      .map((word) => word.charAt(0).toUpperCase()) // Take the first letter of each word and capitalize it
      .join("") // Join the letters together
      .substring(0, 3); // Take the first 3 characters
  };
const handleActiveSprint = () => {
  // Retrieve project details and issues from localStorage
  const storedProject = JSON.parse(localStorage.getItem('selectedProject'));
  const sprintIssues = JSON.parse(localStorage.getItem('sprintIssues')) || [];

  if (storedProject) {
    const scrumId = storedProject.id; // Extract scrumId from the stored project
    console.log("Scrum:", scrumId); // Log scrumId to the console

    navigate('/activesprint', {
      state: {
        projectName: storedProject.projectName,
        members: storedProject.members,
        scrumMaster: storedProject.scrumMaster,
        masterIcon: storedProject.masterIcon,
        key: storedProject.key,
        icon: storedProject.icon,
        startDate: storedProject.startDate,
        startTime: storedProject.startTime,
        endDate: storedProject.endDate,
        endTime: storedProject.endTime,
        scrumId: scrumId, // Pass scrumId to the state
        sprintIssues: sprintIssues.map(issue => ({
          id: issue.id,
          title: issue.title,
          type: issue.type,
          description: issue.description,
          icon: issue.icon,
          code: issue.code,
          priority: issue.priority,
          subtasks: issue.subtasks || [],
          stats: issue.stats || {
            comments: 0,
            subtasks: 0,
            points: 0,
            effort: 0,
          },
          assignee: issue.assignee || null,
          issueStatus: issue.issueStatus,
          status: issue.status,
        })),
      },
    });
  } else {
    console.log("No selected project found in localStorage.");
  }
};  
const storedProjectDetails = JSON.parse(localStorage.getItem('selectedProject')) || {};
const scrumId =  storedProjectDetails.id||"";
const fetchScrumData = async (scrumId) => {
  const db = getFirestore();
  const scrumDocRef = doc(db, `Scrum/${scrumId}`);
  const scrumDoc = await getDoc(scrumDocRef);

  if (scrumDoc.exists()) {
    // Retrieve the startSprint value from the document
    return scrumDoc.data().startSprint; // Return the startSprint status
  } else {
    console.log("No such document!");
    return false; // Default to false if no scrum data is found
  }
};

// State to hold the startSprint value
const [startSprint, setStartSprint] = useState(false);

// Fetch the scrum data when the component mounts
useEffect(() => {
  const storedProject = JSON.parse(localStorage.getItem('selectedProject'));

  if (storedProject && storedProject.id) {
    const getScrumStatus = async () => {
      const status = await fetchScrumData(storedProject.id);
      setStartSprint(status); // Update state with startSprint value
    };

    getScrumStatus(); // Call the function only if scrumId is valid
  }
}, []); // Run this effect only once when the component mounts

  return (
    <aside id="sidebar">
      <div className="sidebar-brand">
      <div className="Logocontainer">
        <img src={FinalLogo} alt="" className="dashboardbrand" />
        {/*<label className="dashboardbrandlabel">Academix</label>*/}
        </div>
      </div>

      <ul className="sidebar-list">
        <li className={`sidebar-list-item ${activePage === "/dashboard" ? "active" : ""}`}>
          <Link to="/dashboard">
            <img src={img1} alt="" className="dashboardicons" /> System Dashboard
          </Link>
        </li>

        <li className={`sidebar-list-item ${activePage === "/personalroadmap" ? "active" : ""}`}>
          <Link to="/personalroadmap">
            <img src={img2} alt="" className="dashboardicons" /> Personal Roadmap
          </Link>
        </li>

        <li className={`sidebar-list-item ${activePage === "/kanbanboard" ? "active" : ""}`}>
          <Link to="/kanbanboard">
            <img src={img3} alt="" className="dashboardicons" /> Kanban Board
          </Link>
        </li>

        <li className={`sidebar-list-item ${activePage === "/scrumprojects" ? "active" : ""}`}>
          <Link to="/scrumprojects" style={{ flexGrow: 1 }} onClick={() => setIsScrumDropdownOpen(false)}>
            <img src={img4} alt="" className="dashboardicons" />
            Scrum Projects
          </Link>
          {isScrumDropdownOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsScrumDropdownOpen(false);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                marginRight: "30px",
                color: "#2665AC",
              }}
            >
              <svg className={`chevron-icon ${isScrumDropdownOpen ? "rotate" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 9l8 8 8-8" />
              </svg>
            </button>
          )}
        </li>

        {isScrumDropdownOpen && (
  <div className="scrum-dropdown" onClick={(e) => e.stopPropagation()}>
    {/* Backlogs */}
    <li className={`sidebar-list-item ${isActiveRoute("/backlogs") ? "active" : ""}`}>
      <Link
        to="/backlogs"
        {...(startSprint ? {} : createDisabledLinkProps("/backlogs"))} // Enabled for both states
      >
        <img src={img6} alt="" className="dashboardicons" /> Backlogs
      </Link>
    </li>

    {/* Active Sprint */}
    <li
      className={`sidebar-list-item ${isActiveRoute("/activesprint") ? "active" : ""} ${
        startSprint ? "disabled" : ""
      }`}
    >
      <Link
        to="/activesprint"
        {...(startSprint ? createDisabledLinkProps("/activesprint") : {})} // Disabled if startSprint is true
        onClick={handleActiveSprint}
      >
        <img src={img7} alt="" className="dashboardicons" /> Active Sprint
      </Link>
    </li>

    {/* Burndown Chart */}
    <li
      className={`sidebar-list-item ${isActiveRoute("/burndownchart") ? "active" : ""} ${
        startSprint ? "disabled" : ""
      }`}
    >
      <Link
        to="/burndownchart"
        {...(startSprint ? createDisabledLinkProps("/burndownchart") : {})} // Disabled if startSprint is true
      >
        <img src={img8} alt="" className="dashboardicons" /> Burndown Chart
      </Link>
    </li>

    {/* Velocity Chart */}
    <li
      className={`sidebar-list-item ${isActiveRoute("/velocitychart") ? "active" : ""} ${
        startSprint ? "disabled" : ""
      }`}
    >
      <Link
        to="/velocitychart"
        {...(startSprint ? createDisabledLinkProps("/velocitychart") : {})} // Disabled if startSprint is true
      >
        <img src={img9} alt="" className="dashboardicons" /> Velocity Chart
      </Link>
    </li>

    {/* Sprint Report */}
    <li
      className={`sidebar-list-item ${isActiveRoute("/sprintreport") ? "active" : ""} ${
        startSprint ? "disabled" : ""
      }`}
    >
      <Link
        to="/sprintreport"
        {...(startSprint ? createDisabledLinkProps("/sprintreport") : {})} // Disabled if startSprint is true
      >
        <img src={img10} alt="" className="dashboardicons" /> Sprint Report
      </Link>
    </li>

    {/* Group Chat */}
    <li className={`sidebar-list-item ${isActiveRoute("/groupchat") ? "active" : ""}`}>
      <Link
        to="/groupchat"
        {...(startSprint ? {} : createDisabledLinkProps("/groupchat"))} // Enabled for both states
      >
        <img src={img11} alt="" className="dashboardicons" /> Group Chat
      </Link>
    </li>
  </div>
)}


<li
  className={`sidebar-list-item ${
    reportactivePage === "/reports" ? "active" : ""
  }`}
  onClick={toggleReportsDropdown}
  style={{
    cursor: "pointer",
    ...(reportactivePage.startsWith("/performance-report") ||
    reportactivePage.startsWith("/log-report")
      ? { backgroundColor: "transparent" } // No highlight
      : {}),
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      flexGrow: 1,
      padding: "5px",
    }}
  >
    <img src={img5} alt="" className="dashboardicons" />
    <span className="reportTab">Reports</span>
    <svg
      className={`chevron-icon-report ${isReportsDropdownOpen ? "rotate" : ""}`}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 9l8 8 8-8" />
    </svg>
  </div>
  {(isReportsDropdownOpen ||
    reportactivePage.startsWith("/performance-report") ||
    reportactivePage.startsWith("/log-report")) && (
    <ul className={`reports-dropdown active`}  style={{
      textDecoration: 'none'
    }}>
      <li
        className={`sidebar-list-item ${
          reportactivePage.startsWith("/performance-report") ? "active" : ""
        }`}
      >
        <Link
          to="/performance-report"
          onClick={() => {
            setreportActivePage("/performance-report");
            setIsReportsDropdownOpen(true); // Ensure dropdown remains open
          }}
        >
          <img src={PerfomRep} alt="" className="dashboardicons" />
          Performance Report
        </Link>
      </li>
      <li
        className={`sidebar-list-item ${
          reportactivePage.startsWith("/log-report") ? "active" : ""
        }`}
      >
        <Link
          to="/log-report"
          onClick={() => {
            setreportActivePage("/log-report");
            setIsReportsDropdownOpen(true); // Ensure dropdown remains open
          }}
        >
          <img src={LogRep} alt="" className="dashboardicons" />
          Log Report
        </Link>
      </li>
    </ul>
  )}
</li>

      </ul>
    </aside>
  );
}

export default Dashboard;
