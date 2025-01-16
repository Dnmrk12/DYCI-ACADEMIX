import React, { useState, useRef, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { useLocation } from "react-router-dom";
import { getFirestore, doc, getDoc, collection, query, where, getDocs  } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";
import days from "./iconshomepage/daysRemaining.png";
import "./sprintreport.css";

const SprintReport = () => {
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
    const fetchSprintDetails = async () => {
      if (!scrumId) return;
  
      try {
        // Fetch Scrum document for sprint details
        const scrumDocRef = doc(db, `Scrum/${scrumId}`);
        const scrumDocSnap = await getDoc(scrumDocRef);
  
        if (scrumDocSnap.exists()) {
          const data = scrumDocSnap.data();
  
          // Handle Sprint Status
          const sprintStatus = {
            startSprint: data.startSprint || false,
            isDone: data.isDone || false,
          };
          setSprintStatus(sprintStatus);
  
          // Handle startsprintDate
          const startsprintDate = data.startsprintDate;
          if (startsprintDate) {
            setSprintStartDate(startsprintDate);
            localStorage.setItem("startsprintDate", startsprintDate);
          }
  
          // Handle completedSprintDate
          const completedSprintDate = data.completedSprintDate;
          if (completedSprintDate) {
            setCompletedSprintDate(completedSprintDate);
            localStorage.setItem("completedSprintDate", completedSprintDate);
          }
        }
  
        // Fetch all issues from Firestore
        const sprintIssuesRef = collection(db, `Scrum/${scrumId}/backlog`);
        const querySnapshot = await getDocs(sprintIssuesRef);
        const fetchedSprintIssues = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // Calculate total story points for all issues
        const totalStoryPoints = fetchedSprintIssues.reduce(
          (total, issue) => total + (issue.stats?.points || 0),
          0
        );
  
        setSprintIssues(fetchedSprintIssues);
        localStorage.setItem("sprintIssues", JSON.stringify(fetchedSprintIssues));
  
        // Store the total story points in state
        setTotalStoryPoints(totalStoryPoints);
  
        // Check and set stored sprint issues if necessary
        const storedSprintIssues =
          JSON.parse(localStorage.getItem("sprintIssues")) || [];
        if (storedSprintIssues.length > 0 && fetchedSprintIssues.length === 0) {
          setSprintIssues(storedSprintIssues);
        }
      } catch (error) {
        console.error("Error fetching sprint details:", error);
      }
    };
  
    fetchSprintDetails();
  }, [scrumId]);
  
  // Total story points state
const [totalStoryPoints, setTotalStoryPoints] = useState(0);

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

  // Calculate total story points for done issues
  const doneIssues = sprintIssues.filter((issue) => issue.status === "Done");
  const totalDoneStoryPoints = doneIssues.reduce((total, issue) => total + (issue.stats?.points || 0), 0);

  const generateSprintDayLabels = () => {
    // Sort done issues by date
    const sortedDoneIssues = doneIssues.filter((issue) => issue.dateDone).sort((a, b) => new Date(a.dateDone) - new Date(b.dateDone));
  
    // If no issues, return default labels starting from Day 1
    if (sortedDoneIssues.length === 0 || !startDate) {
      return ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8"];
    }
  
    // Define the sprint start date
    const sprintStartDate = new Date(startDate);
  
    // Initialize the labels array with "Day 1" for the start date
    const labels = ["Day 1"];
  
    // Now, generate labels for the remaining days based on issue completion dates
    sortedDoneIssues.forEach((issue) => {
      const issueDate = new Date(issue.dateDone);
      const daysDifference = Math.ceil((issueDate - sprintStartDate) / (1000 * 60 * 60 * 24)); // Calculate days difference from start date
      
      // Add the corresponding "Day X" label based on dateDone
      labels.push(`Day ${daysDifference + 1}`);
    });
  
    return labels;
  };

  const chartData = {
    labels: generateSprintDayLabels(),
    datasets: [
      {
        label: "Sprint Progress Report",
        data: [
          totalStoryPoints, // Use the total story points for all issues
          ...generateSprintDayLabels().map((_, index) => {
            const sortedDoneIssues = doneIssues
              .filter((issue) => issue.dateDone)
              .sort((a, b) => new Date(a.dateDone) - new Date(b.dateDone));
  
            if (index < sortedDoneIssues.length) {
              const completedPoints = sortedDoneIssues
                .slice(0, index + 1)
                .reduce((total, issue) => total + (issue.stats?.points || 0), 0);
  
              return totalStoryPoints - completedPoints; // Remaining points
            }
  
            return totalStoryPoints; // Default to total points
          }),
        ],
        borderColor: "#2665AC",
        backgroundColor: "rgba(38, 101, 172, 0.2)",
        borderWidth: 2,
        pointBackgroundColor: "#2665AC",
        pointBorderColor: "#2665AC",
        pointRadius: (context) => {
          return context.dataIndex === 0 ? 0 : 4; // No dot for Day 1, default dot size for others
        },
        pointHoverRadius: 6,
        tension: 0,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
        text: "Sprint Report",
        color: "#3A74B4",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const sortedDoneIssues = doneIssues
              .filter((issue) => issue.dateDone)
              .sort((a, b) => new Date(a.dateDone) - new Date(b.dateDone));
  
            const index = context.dataIndex;
            const remainingPoints = context.raw;
  
            if (index === 0) {
              return `Total Story Points: ${totalDoneStoryPoints}`;
            }
  
            if (index <= sortedDoneIssues.length) {
              const issue = sortedDoneIssues[index - 1];
              return [
                `${issue.title} (Done)`,
                `Story Points: ${issue.stats?.points || 0}`,
                `Remaining Story Points: ${remainingPoints}`,
                `Date: ${issue.dateDone ? issue.dateDone.split(' ')[0] : 'N/A'}`
              ];
            }
  
            return [`Remaining Story Points: ${remainingPoints}`];
          },
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
          color: "#769FCD",
          font: {
            size: 10,
          },
        },
      },
    },
  };
  

  const tableData = doneIssues.map((issue, index) => ({
    issueName: issue.title,
    key: issue.code,
    date: issue.dateDone || "09/30/24 7:00 PM",
    assignee: issue.assignee?.name || "Unassigned",
    assigneeImage: issue.assignee?.picture || "path_to_default_image",
    reporter: scrumMaster,
    reporterImage: masterIcon,
    status: issue.status,
    storyPoints: issue.stats?.points,
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
    <div className="sprint-report-container">
      <div className="sprint-report-header">
      <h1 ref={titleRef} className="sprint-report-name"
        onMouseEnter={() => isOverflowing && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        >
          {projectName}
          </h1>
          {showTooltip && (
              <div className="sprint-report-title-custom-tooltip">
                {projectName}
                </div>
          )}
      </div>

      <div className="sprint-report-sprint-info-container">
        <div className="sprint-report-sprint-header">
          <div className="sprint-report-title">{key} - 0</div>
          <div className="sprint-report-dates">
            <span>{`${startDate} - ${endDate}`}</span>
            <img src={days} alt="Days Remaining Icon" className="sprint-report-clock-icon" />
            <span className="sprint-report-days-remaining">{timeRemaining}</span>
          </div>
        </div>
      </div>

      <div className="sprint-report-chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="sprint-report-grid-sprint-wrapper">
        <div className="sprint-report-sprint-dates-container">
          {/* Conditional rendering based on sprint status */}
          {sprintStatus.startSprint && !sprintStatus.isDone && (
            <p className="sprint-report-sprint-date-text">
              <span className="sprint-report-sprint-date-label">Sprint Start:</span> {sprintStartDate || "09/30/2024, 8:30 PM"}
            </p>
          )}

          {sprintStatus.isDone && (
            <p className="sprint-report-sprint-date-text">
              <span className="sprint-report-sprint-date-label">Sprint Completed:</span> {completedSprintDate || "12/07/2024, 8:30 PM"}
            </p>
          )}
        </div>

        {/* Grid Table */}
        <div className="sprint-report-grid-table-container">
          <table className="sprint-report-grid-table">
            <thead>
              <tr>
                <th>Issue Name</th>
                <th>Key</th>
                <th>Date</th>
                <th>Assignee</th>
                <th>Reporter</th>
                <th>Status</th>
                <th>Story Points</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td>{row.issueName}</td>
                  <td>{row.key}</td>
                  <td>{row.date}</td>
                  <td>
                    <div className="sprint-report-user-info">
                      <img src={row.assigneeImage} alt="Assignee" className="sprint-report-user-icon" />
                      {row.assignee}
                    </div>
                  </td>
                  <td>
                    <div className="sprint-report-user-info">
                      <img src={row.reporterImage} alt="Reporter" className="sprint-report-user-icon" />
                      {row.reporter}
                    </div>
                  </td>
                  <td>{row.status}</td>
                  <td>{row.storyPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SprintReport;
