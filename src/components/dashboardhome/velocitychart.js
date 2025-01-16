import React, { useState, useRef, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { useLocation } from "react-router-dom";
import days from "./iconshomepage/daysRemaining.png";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";
import "./velocitychart.css";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const VelocityChart = () => {
  const location = useLocation();
  const [sprintIssues, setSprintIssues] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [sprintStartDate, setSprintStartDate] = useState("");
  const [completedSprintDate, setCompletedSprintDate] = useState("");
  const [sprintStatus, setSprintStatus] = useState({
    startSprint: false,
    isDone: false,
  });

  const storedProjectDetails = JSON.parse(localStorage.getItem("selectedProject")) || {};

  const scrumId = storedProjectDetails.id;

  useEffect(() => {
    const fetchSprintIssues = async () => {
      if (!scrumId) return;
      try {
        const scrumDocRef = doc(db, `Scrum/${scrumId}`);
        const scrumDocSnap = await getDoc(scrumDocRef);
        if (scrumDocSnap.exists()) {
          const data = scrumDocSnap.data();
  
          // Handle Sprint Status
          const sprintStatus = {
            startSprint: data.startSprint || false,
            isDone: data.isDone || false
          };
          setSprintStatus(sprintStatus);
  
          // Handle startsprintDate
          const startsprintDate = data.startsprintDate;
          if (startsprintDate) {
            setSprintStartDate(startsprintDate);
            localStorage.setItem('startsprintDate', startsprintDate);
          }
  
          // Handle completedSprintDate
          const completedSprintDate = data.completedSprintDate;
          if (completedSprintDate) {
            setCompletedSprintDate(completedSprintDate);
            localStorage.setItem('completedSprintDate', completedSprintDate);
          }
  
          // Existing sprint issues logic
          const storedSprintIssues = JSON.parse(localStorage.getItem("sprintIssues")) || [];
          // If there are stored sprint issues, set them
          if (storedSprintIssues.length > 0) {
            setSprintIssues(storedSprintIssues);
          }
        }
      } catch (error) {
        console.error("Error fetching sprint issues:", error);
      }
    };
    fetchSprintIssues();
  }, [scrumId, sprintIssues]);

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
  const members = location.state?.members || storedProjectDetails.members || [];

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

  const determineIssueStatus = (status) => {
    return status === "Done" ? "Done" : "Active";
  };

  // Calculate total commitment and completed points
  const totalCommitment = sprintIssues.reduce((sum, issue) => 
    sum + (issue.stats?.points || 0), 0);
  
  const totalCompleted = sprintIssues.reduce((sum, issue) => 
    sum + (issue.status === "Done" ? (issue.stats?.points || 0) : 0), 0);

  const remainingPoints = totalCommitment - totalCompleted;

  const chartData = {
    labels: [key || "GRP"],
    datasets: [
      {
        label: "Completed",
        data: [totalCompleted],
        backgroundColor: "#2665AC", 
        borderWidth: 0,
        pointBackgroundColor: "#2665AC",
        pointBorderColor: "#2665AC",
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        hoverBackgroundColor: "#2665AC",
        hoverBorderColor: "#2665AC",
        barThickness: 100,
      },
      {
        label: "Commitment",
        data: [totalCommitment],
        backgroundColor: "#B9D7EA",
        borderWidth: 0,
        pointBackgroundColor: "#B9D7EA",
        pointBorderColor: "#B9D7EA",
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        hoverBackgroundColor: "#B9D7EA",
        hoverBorderColor: "#B9D7EA",
        barThickness: 100,
      },
    ],
  };
      
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
        text: "Velocity Chart",
        color: "#3A74B4",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          title: () => key || "GRP",
          label: (context) => {
            const dataset = context.dataset;
            const value = context.parsed.y;
            
            if (dataset.label === "Commitment") {
              return [
                `Expected Commitment`,
                `${value} Story Points Commitment`
              ];
            } else if (dataset.label === "Completed") {
              return [
                `Total Completed Commitment`,
                `${value} Story Points Completed`,
                `${remainingPoints} Story Points Remaining`
              ];
            }
            
            return value;
          }
        },
        backgroundColor: "white",
        borderColor: "#3A74B4",
        borderWidth: 1,
        titleColor: "#3A74B4",
        bodyColor: "#769FCD",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#B9D7EA",
        },
        ticks: {
          color: "#769FCD",
          font: {
            size: 10,
          },
        },
      },
      x: {
        grid: {
          color: "#B9D7EA",
        },
        ticks: {
          color: "#3A74B4",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
    },
  };
      

  // Prepare table data
  const tableData = sprintIssues.map((issue, index) => ({
    issueName: issue.title,
    key: issue.code,
    date: determineIssueStatus(issue.status) === "Done" ? issue.dateDone || "09/30/24 7:00 PM" : "--",
    scrumMaster: scrumMaster,
    scrumMasterImage: masterIcon,
    status: determineIssueStatus(issue.status),
    commitment: issue.stats?.points,
    completed: determineIssueStatus(issue.status) === "Done" ? issue.stats?.points : "--",
  }));

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
    <div className="velocity-container">
      <div className="velocity-header">
      <h1 ref={titleRef} className="velocity-name"
        onMouseEnter={() => isOverflowing && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        >
          {projectName}
          </h1>
          {showTooltip && (
              <div className="velocity-title-custom-tooltip">
                {projectName}
                </div>
          )}
      </div>

      <div className="velocity-sprint-info-container">
        <div className="velocity-sprint-header">
          <div className="velocity-sprint-title">{key} - 0</div>
          <div className="velocity-sprint-dates">
            <span>{`${startDate} - ${endDate}`}</span>
            <img src={days} alt="Days-Remaining-Icon" className="velocity-clock-icon" />
            <span className="velocity-time-remaining">{timeRemaining}</span>
          </div>
        </div>
      </div>

      <div className="velocity-chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* New wrapper container */}
      <div className="velocity-grid-sprint-wrapper">
        <div className="velocity-sprint-dates-container">
          {/* Conditional rendering based on sprint status */}
          {sprintStatus.startSprint && !sprintStatus.isDone && (
            <p className="velocity-sprint-date-text">
              <span className="velocity-sprint-date-label">Sprint Start:</span> {sprintStartDate || "09/30/2024, 8:30 PM"}
            </p>
          )}

          {sprintStatus.isDone && (
            <p className="velocity-sprint-date-text">
              <span className="velocity-sprint-date-label">Sprint Completed:</span> {completedSprintDate || "12/07/2024, 8:30 PM"}
            </p>
          )}
        </div>

      {/* Grid Table */}
      <div className="velocity-grid-table-container">
        <table className="velocity-grid-table">
          <thead>
            <tr>
              <th>Issue Name</th>
              <th>Key</th>
              <th>Date</th>
              <th>Scrum Master</th>
              <th>Status</th>
              <th>Commitment</th>
              <th>Completed</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td>{row.issueName}</td>
                <td>{row.key}</td>
                <td>{row.date}</td>
                <td>
                  <div className="velocity-user-info">
                    <img src={row.scrumMasterImage} alt="Scrum Master" className="velocity-user-icon" />
                    {row.scrumMaster}
                  </div>
                </td>
                <td>{row.status}</td>
                <td>{row.commitment}</td>
                <td>{row.completed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default VelocityChart;
