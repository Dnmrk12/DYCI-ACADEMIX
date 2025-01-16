import React, { useState, useRef, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { useLocation } from "react-router-dom";
import days from "./iconshomepage/daysRemaining.png";
import "./burndownchart.css";
import { db, auth } from './firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection,limit, addDoc,doc , getDocs,getDoc,increment,get, deleteDoc ,setDoc, query,orderBy, onSnapshot, where,updateDoc, arrayRemove ,arrayUnion, serverTimestamp} from 'firebase/firestore';

import { getStorage, ref, uploadBytes,  getDownloadURL ,uploadString} from 'firebase/storage';

import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BurndownChart = () => {
  const location = useLocation();
  const [timeRemaining, setTimeRemaining] = useState("");
  const [sprintIssues, setSprintIssues] = useState([]);
  const [projectProgress, setProjectProgress] = useState(0);
  const [sprintStartDate, setSprintStartDate] = useState("");
  const [completedSprintDate, setCompletedSprintDate] = useState("");
  const [sprintStatus, setSprintStatus] = useState({
    startSprint: false,
    isDone: false,
  });

  const storedProjectDetails = JSON.parse(localStorage.getItem("selectedProject")) || {};

  const scrumId = storedProjectDetails.id;

  useEffect(() => {
    const fetchSprintData = async () => {
      if (!scrumId) return;
  
      try {
        // Fetch Scrum document for sprint details
        const scrumDocRef = doc(db, `Scrum/${scrumId}`);
        const scrumDocSnap = await getDoc(scrumDocRef);
  
        let sprintStatus = { startSprint: false, isDone: false };
        let startsprintDate = null;
        let completedSprintDate = null;
  
        if (scrumDocSnap.exists()) {
          const data = scrumDocSnap.data();
  
          // Update sprint status
          sprintStatus = {
            startSprint: data.startSprint || false,
            isDone: data.isDone || false,
          };
  
          // Fetch start and completion dates
          startsprintDate = data.startsprintDate || null;
          completedSprintDate = data.completedSprintDate || null;
  
          // Set sprint dates and update localStorage
          if (startsprintDate) {
            setSprintStartDate(startsprintDate);
            localStorage.setItem("startsprintDate", startsprintDate);
          }
          if (completedSprintDate) {
            setCompletedSprintDate(completedSprintDate);
            localStorage.setItem("completedSprintDate", completedSprintDate);
          }
        }
  
        setSprintStatus(sprintStatus);
  
        // Fetch sprint issues
        const sprintIssuesRef = collection(db, `Scrum/${scrumId}/backlog`);
        const sprintIssuesQuery = query(sprintIssuesRef, where("status", "!=", "Backlog"));
  
        const querySnapshot = await getDocs(sprintIssuesQuery);
        const fetchedSprintIssues = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // Filter issues in "In Progress" or "Done"
        const activeSprintIssues = fetchedSprintIssues.filter(
          issue => issue.status === "In Progress" || issue.status === "Done"
        );
  
        setSprintIssues(activeSprintIssues);
        localStorage.setItem("sprintIssues", JSON.stringify(activeSprintIssues));
  
        // Calculate project progress
        const totalStoryPoints = activeSprintIssues.reduce((sum, issue) => sum + (issue.stats?.points || 0), 0);
        const completedStoryPoints = activeSprintIssues
          .filter(issue => issue.status === "Done")
          .reduce((sum, issue) => sum + (issue.stats?.points || 0), 0);
  
        const progress = totalStoryPoints > 0 ? Number(((completedStoryPoints / totalStoryPoints) * 100).toFixed(2)) : 0;
        setProjectProgress(progress);
  
        // Check localStorage for existing issues if none fetched
        if (activeSprintIssues.length === 0) {
          const storedSprintIssues = JSON.parse(localStorage.getItem("sprintIssues")) || [];
          if (storedSprintIssues.length > 0) {
            setSprintIssues(storedSprintIssues);
  
            const storedProgress = storedSprintIssues.reduce((sum, issue) => sum + (issue.stats?.points || 0), 0);
            setProjectProgress(storedProgress);
          }
        }
      } catch (error) {
        console.error("Error fetching sprint data:", error);
      }
    };
  
    // Initialize sprint start and completion dates from localStorage
    const initializeLocalStorageDates = () => {
      const storedStartSprintDate = localStorage.getItem("startsprintDate");
      if (storedStartSprintDate) {
        setSprintStartDate(storedStartSprintDate);
      }
  
      const storedCompletedSprintDate = localStorage.getItem("completedSprintDate");
      if (storedCompletedSprintDate) {
        setCompletedSprintDate(storedCompletedSprintDate);
      }
    };
  
    initializeLocalStorageDates();
    fetchSprintData();
  }, [scrumId]);
  
  const [issueName,setIssueName] = useState("")
  const [totalStoryPoints, setTotalStoryPoints] = useState(0);
  const [actualProgress, setActualProgress] = useState([]);
  const projectName = location.state?.projectName || storedProjectDetails.projectName || "No Project Selected";
  const members = location.state?.members || storedProjectDetails.members || [];
  const scrumMaster = location.state?.scrumMaster || storedProjectDetails.scrumMaster || "";
  const masterIcon = location.state?.masterIcon || storedProjectDetails.masterIcon || "";
  const key = location.state?.key || storedProjectDetails.key || "";
  const startDate = location.state?.startDate || storedProjectDetails.startDate || "";
  const startTime = location.state?.startTime || storedProjectDetails.startTime || "";
  const endDate = location.state?.endDate || storedProjectDetails.endDate || "";
  const endTime = location.state?.endTime || storedProjectDetails.endTime || "";
  const icon = location.state?.icon || storedProjectDetails.icon || "";

  // New function to determine actions based on issue status
  const getActionStatus = (issue) => {
    if (issue.status === "Done") {
      return "Burndown";
    } else {
      return "Active";
    }
  };

  // Calculate time remaining
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

  useEffect(() => {
    const updateTimeRemainingInterval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 60000);

    setTimeRemaining(calculateTimeRemaining());
    return () => clearInterval(updateTimeRemainingInterval);
  }, [endDate, endTime]);

  // Helper function to calculate remaining points

  

  const fetchBurnData = async (scrumId) => {
    const db = getFirestore();
    const backlogRef = collection(db, `Scrum/${scrumId}/backlog`);
  
    try {
      console.log("Fetching data from path:", `Scrum/${scrumId}/backlog`);
  
      const querySnapshot = await getDocs(backlogRef);
      console.log("Query Snapshot:", querySnapshot);
  
      if (querySnapshot.empty) {
        console.log("No documents found in the backlog collection.");
      } else {
        let totalPoints = 0;
        let progress = [];
        let title = ""; // Declare and initialize title here
  
        querySnapshot.forEach(doc => {
          const data = doc.data();
  
          // Log document ID and its data for debugging
          console.log(`Document ID: ${doc.id}`);
          console.log(`Document Data:`, data);
  
          // Get the title from the document
          title = data.title || "";  // Assuming 'title' is a field in the document
  
          // Filter documents where issueStatus is "sprint"
          if (data.issueStatus === "sprint") {
            // Check if stats or points are missing
            if (!data.stats) {
              console.log(`Document ID: ${doc.id} has no stats field.`);
            }
  
            const points = data.stats?.points || 0;
            totalPoints += points;
  
            // Check if status is "Done" and if dateDone exists
            if (data.status === "Done" && data.dateDone) {
              progress.push({ date: data.dateDone, burned: points, title: data.title });
            }
          }
        });
  
        // Set the issueName to the fetched title
        setIssueName(title);
        setTotalStoryPoints(totalPoints);
        setActualProgress(progress);
      }
    } catch (error) {
      console.error("Error fetching backlog data: ", error);
      console.log("Error details:", error);
    }
  };
  
  
  console.log(issueName);
  useEffect(() => {
    const scrumId = storedProjectDetails.id; // Ensure this is correct
    console.log("Fetching data for Scrum ID:", scrumId); // Debug the scrumId value
    fetchBurnData(scrumId);
  }, []);
  
  
  
  function generateBurndownData(startDate, endDate, totalStoryPoints, actualProgress = []) {
    const labels = [];
    const expectedProgress = [];
    const teamProgress = []; // For actual progress
    const pointRadius = []; // Store point radius for each day
    
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    // Calculate the total number of days
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
    // Calculate story points to burn per day
    const dailyBurn = totalStoryPoints / totalDays;
  
    let remainingPoints = totalStoryPoints;
    let actualBurned = 0;
  
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
  
      // Format the date for the label
      labels.push(
        currentDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      );
  
      // Update Expected Progress
      expectedProgress.push(Math.max(remainingPoints.toFixed(2), 0));
      remainingPoints -= dailyBurn;
  
      // Update Team Progress with actual data
      // If there's actual progress for the day, use that; otherwise, keep the previous total
      actualProgress.forEach((progress) => {
        if (new Date(progress.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) === labels[i]) {
          actualBurned += progress.burned;
          pointRadius[i] = 6;  // Set a larger radius when there is actual progress
        }
      });
  
      // If no actual progress, set the point radius to 0 (no dot)
      if (pointRadius[i] !== 6) {
        pointRadius[i] = 0;
      }
  
      teamProgress.push(Math.max(totalStoryPoints - actualBurned, 0));
    }
  
    // Return chart data
    return {
      labels,
      datasets: [
        {
          label: "Team Progress",
          data: teamProgress, // Actual progress
          borderColor: "#2665AC",
          backgroundColor: "rgba(38, 101, 172, 0.2)",
          borderWidth: 2,
          pointBackgroundColor: "#2665AC",
          pointBorderColor: "#2665AC",
          pointHoverBackgroundColor: "#2665AC",
          pointHoverBorderColor: "#2665AC",
          pointRadius: pointRadius, // Use the dynamic point radius
          pointHoverRadius: 6,
          tension: 0.4,
        },
        {
          label: "Expected Progress",
          data: expectedProgress,
          borderColor: "#7FB2EB",
          backgroundColor: "rgba(127, 178, 235, 0.2)",
          borderWidth: 2,
          pointBackgroundColor: "#7FB2EB",
          pointBorderColor: "#7FB2EB",
          pointHoverBackgroundColor: "#7FB2EB",
          pointHoverBorderColor: "#7FB2EB",
          pointRadius: 0, // No dots for expected progress
          pointHoverRadius: 6,
          tension: 0.4,
        },
      ],
    };
  }
  
  // Example Usage

  

  

  
  const chartData = generateBurndownData(startDate, endDate, totalStoryPoints, actualProgress);


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#3A74B4",
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: "Sprint Burndown Chart",
        color: "#3A74B4",
        font: {
          size: 16,
          weight: "bold",
        },
      },
 tooltip: {
  backgroundColor: "white",
  borderColor: "#3A74B4",
  borderWidth: 1,
  titleColor: "#3A74B4",
  bodyColor: "#769FCD",
  callbacks: {
    label: function (context) {
      const dateLabel = context.label; // The date label from the x-axis
      const actualPointsForDate = actualProgress.filter((progress) => {
        // Match all progress entries for the current date
        const progressDate = new Date(progress.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        return progressDate === dateLabel;
      });

      if (actualPointsForDate.length === 1) {
        // Single issue completed on this date
        const actualDataPoint = actualPointsForDate[0];
        return [
          `${actualDataPoint.title || "Issue"}`,
          "Issue Completed",
          `Burned: ${actualDataPoint.burned} points`,
          `Remaining: ${Math.round(context.raw)} points`,
        ];
      } else if (actualPointsForDate.length > 1) {
        // Multiple issues completed on this date
        const tooltipLines = actualPointsForDate.map((progress, index) => {
          return `#${index + 1}: ${progress.title || "Unnamed"} - Burned: ${progress.burned} points`;
        });

        // Add remaining points at the bottom of the tooltip
        tooltipLines.push(`Remaining: ${Math.round(context.raw)} points`);
        return tooltipLines;
      } else {
        // No issues completed on this date
        return `Expected Remaining: ${Math.round(context.raw)} points`;
      }
    },
  },
},

      
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Story Points Remaining",
          color: "#3A74B4",
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "#769FCD",
          font: {
            size: 10,
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Sprint Weeks",
          color: "#3A74B4",
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "#769FCD",
          font: {
            size: 10,
          },
        },
      },
    },
  };
  
  
  

  const tableData = sprintIssues.map((issue) => {
    // Find the progress for the issue based on the issue title
    const progressData = actualProgress.find(progress => progress.title === issue.title);
  
    // Get the date from progress if found, or fallback to an empty string
    const dateValue = progressData ? progressData.date : "";
  
    console.log(`Issue: ${issue.title}, Date: ${dateValue}`); // Log the value to the console
  
    return {
      issueName: issue.title,
      key: issue.code,
      date: dateValue,
      assignee: issue.assignee?.name || "Unassigned",
      assigneeImage: issue.assignee?.picture || "https://toppng.com/uploads/preview/user-account-management-logo-user-icon-11562867145a56rus2zwu.png",
      reporter: scrumMaster,
      reporterImage: masterIcon,
      actions: getActionStatus(issue),
      status: issue.status,
      inc: issue.status !== "Done" ? issue.stats?.points || 0 : 0,
      dec: issue.status === "Done" ? issue.stats?.points || 0 : 0,
    };
  });
  
  const titleRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (titleRef.current) {
      const isOverflow =
        titleRef.current.offsetWidth < titleRef.current.scrollWidth;
      setIsOverflowing(isOverflow);
    }

  }, [projectName]);

  return (
    <div className="burndown-container">
      <div className="burndown-header">
        <h1 ref={titleRef} className="burndown-name"
        onMouseEnter={() => isOverflowing && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        >
          {projectName}
          </h1>
          {showTooltip && (
              <div className="burndown-title-custom-tooltip">
                {projectName}
                </div>
          )}
      </div>

      <div className="burn-sprint-info-container">
        <div className="burn-sprint-header">
          <div className="burn-sprint-title">{key} - 0</div>
          <div className="burn-sprint-dates">
            <span>{`${startDate} - ${endDate}`}</span>
            <img src={days} alt="Days-Remaining-Icon" className="burn-clock-icon" />
            <span className="burn-time-remaining">{timeRemaining}</span>
          </div>
        </div>
      </div>

      <div className="burndown-chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* New wrapper container */}
      <div className="grid-sprint-wrapper">
        <div className="sprint-dates-container">
          {/* Conditional rendering based on sprint status */}
          {sprintStatus.startSprint && !sprintStatus.isDone && (
            <p className="sprint-date-text">
              <span className="sprint-date-label">Sprint Start:</span> {sprintStartDate || "09/30/2024, 8:30 PM"}
            </p>
          )}

          {sprintStatus.isDone && (
            <p className="sprint-date-text">
              <span className="sprint-date-label">Sprint Completed:</span> {completedSprintDate || "12/07/2024, 8:30 PM"}
            </p>
          )}
        </div>

        {/* Grid Table */}
        <div className="grid-table-container">
          <table className="grid-table">
            <thead>
              <tr>
                <th>Issue Name</th>
                <th>Key</th>
                <th>Date</th>
                <th>Assignee</th>
                <th>Reporter</th>
                <th>Actions</th>
                <th>Status</th>
                <th>Inc.</th>
                <th>Dec.</th>
                <th>Project Progress</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td>{row.issueName}</td>
                  <td>{row.key}</td>
                  <td>{row.date}</td>
                  <td>
                    <div className="user-info">
                      <img src={row.assigneeImage} alt="Assignee" className="user-icon" />
                      {row.assignee}
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <img src={row.reporterImage} alt="Reporter" className="user-icon" />
                      {row.reporter}
                    </div>
                  </td>
                  <td>{row.actions}</td>
                  <td>{row.status}</td>
                  <td>{row.inc}</td>
                  <td>{row.dec}</td>
                  {index === 0 && (
                    <td rowSpan={tableData.length} style={{ textAlign: "center", verticalAlign: "middle" }}>
                      {`${projectProgress}%`}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BurndownChart;