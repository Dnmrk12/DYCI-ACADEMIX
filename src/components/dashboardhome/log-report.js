import React, { useState, useEffect } from 'react';
import './log-report.css';
import img1 from './iconshomepage/magnifyingglass.png';
import storyIcon from './iconshomepage/researchicon.png';
import taskIcon from './iconshomepage/softwaredataicon.png';
import bugIcon from './iconshomepage/bugfixicon.png';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const LogReport = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [logEntries, setLogEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSort, setSelectedSort] = useState('Newest');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [uid, setUid] = useState(null);
    const db = getFirestore();
    const auth = getAuth();

    // Listen for changes in authentication state and set UID
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUid(user.uid); // Set the authenticated user's UID
            } else {
                setUid(null); // Clear UID if the user logs out
                setLogEntries([]); // Clear log entries
            }
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [auth]);

    // Fetch log data whenever UID changes
    useEffect(() => {
        if (!uid) {
            setLoading(false); // Stop loading if no user is authenticated
            return;
        }
        fetchLogData();
    }, [uid]); // Fetch log data whenever `uid` changes

    const fetchLogData = async () => {
        try {
            setLoading(true); // Start loading before fetching
    
            // Fetch log data from Firestore
            const logReportRef = collection(db, `users/${uid}/logReport`);
            const logSnapshot = await getDocs(logReportRef);
            const logList = logSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
    
            // Sort log data by dateTime in descending order (latest first)
            logList.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    
            // Set the log data to state
            setLogEntries(logList);
    
            // Optionally, store the log data in localStorage for session caching
            localStorage.setItem('logEntries', JSON.stringify(logList)); // Save data to localStorage
            localStorage.setItem('lastFetchedTime', Date.now()); // Save fetch timestamp
        } catch (error) {
            console.error('Error fetching log data: ', error);
        } finally {
            setLoading(false); // Stop loading after the fetch is complete
        }
    };
    

    // Function to handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };


    const handleSortChange = (sortOrder) => {
        const sortedEntries = [...logEntries].sort((a, b) => {
            if (sortOrder === 'Newest') {
                return new Date(b.dateTime) - new Date(a.dateTime);
            } else {
                return new Date(a.dateTime) - new Date(b.dateTime);
            }
        });
        setLogEntries(sortedEntries);
        setSelectedSort(sortOrder);
        setIsSortDropdownOpen(false);
    };

    
    // Filter log entries based on search term
    const filteredEntries = logEntries.filter((entry) =>
        entry.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const getIconForType = (type) => {
        switch (type) {
            case 'story':
                return storyIcon;
            case 'task':
                return taskIcon;
            case 'bug':
                return bugIcon;
            default:
                return taskIcon; // Default icon
        }
    };

    return (
        <div className="log-record-container">
            <div className="log-record-header">
                <h1>Log Records</h1>
            </div>

            <div className="log-record-search-box-projectname">
                <input
                    type="text"
                    placeholder="Search Project Name"
                    className="log-record-searchprojectname"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <img src={img1} alt="Magnifying Glass" className="magnifyingglass-log-record" />
            </div>


            <div className="sortduedatelogrec">
                    Sort by:
                    <button
                        onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                        className="sort-dropdown-btn-logrec"
                    >
                        {selectedSort}
                    </button>
                    {isSortDropdownOpen && (
                        <div className="sort-dropdown-menu-logrec">
                            <button onClick={() => handleSortChange('Newest')}>Newest</button>
                            <button onClick={() => handleSortChange('Oldest')}>Oldest</button>
                        </div>
                    )}
                </div>


            <div className="log-record-entries">
                {loading ? (
                    <p>Loading...</p>
                ) : filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => (
                        <div key={entry.id} className="log-record-entry">
                            <div className="log-record-entry-left">
                                {entry.admin === uid ? (
                                    <p>
                                        You have moved the issue{' '}
                                        <span>
                                        <img
                                            src={getIconForType(entry.type)}
                                            alt={`${entry.type} icon`}
                                            className="taskIcon"
                                        />{' '}
                                        {entry.issue}
                                    </span>{' '}
                                        to the <b className="logrecordstatus">{entry.status}</b> status under{' '}
                                        <strong className="logrecordProjectName">{entry.projectName}</strong>.
                                    </p>
                                ) : (
                                    <p>
                                        Your assigned work{' '}
                                        <span>
                                        <img
                                            src={getIconForType(entry.type)}
                                            alt={`${entry.type} icon`}
                                            className="taskIcon"
                                        />{' '}
                                        {entry.issue}
                                    </span>{' '}
                                        is currently in <b className="logrecordstatus">{entry.status}</b> under{' '}
                                        <strong className="logrecordProjectName">{entry.projectName}</strong>.
                                    </p>
                                )}
                            </div>
                            <div className="log-record-entry-divider">|</div>
                            <div className="log-record-entry-right">{entry.dateTime}</div>
                        </div>
                    ))
                ) : (
                    <p>No log entries found.</p>
                )}
            </div>
        </div>
    );
};

export default LogReport;
