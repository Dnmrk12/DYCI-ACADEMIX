import React, { useState, useEffect } from 'react';
import img0 from './iconshomepage/magnifyingglass.png';
import img1 from './iconshomepage/popupaddwidget.png';
import img2 from './iconshomepage/proOViconpopup.png';
import img3 from './iconshomepage/recentMpopup.png';
import img4 from './iconshomepage/performanceOpopup.png';
import img5 from './iconshomepage/calendarpopup.png';
import img6 from './iconshomepage/proOViconpopup.png';
import img7 from './iconshomepage/totaltaskspopup.png';
import img8 from './iconshomepage/completedtaskspopup.png';
import img9 from './iconshomepage/ongoingprojpopup.png';
import img10 from './iconshomepage/tasksongoing.png';
import img11 from './iconshomepage/acttaskspopup.png';
import img12 from './iconshomepage/notificationspopup.png';
import img13 from './iconshomepage/projcompletepopup.png';
import './addwidgetpopup.css';

const AddWidgetPopup = ({ show, onClose, onAddWidget }) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationType, setConfirmationType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
const [selectedCategory, setSelectedCategory] = useState('All');

const filteredWidgets = () => {
  const widgets = Array.from(document.querySelectorAll('.widget-item'));
  const searchLower = searchQuery.trim().toLowerCase();

  widgets.forEach((widget) => {
    const headerElement = widget.querySelector('.widgetlistheader');
    if (!headerElement) return; // Skip if no header

    const header = headerElement.textContent.toLowerCase();

    // Check search query match
    const isSearchMatch = !searchLower || header.includes(searchLower);

    // Check category match
    const isCategoryMatch =
      selectedCategory === 'All' ||
      (selectedCategory === 'Workload Tracker' &&
        [
          'performance overview',
          'project overview',
          'ongoing tasks',
          'ongoing projects',
          'total tasks',
          'total projects',
          'completed tasks',
          'completed projects',
        ].includes(header)) ||
      (selectedCategory === 'Calendar' && header === 'calendar') ||
      (selectedCategory === 'Notifications' &&
        ['active tasks', 'recent messages', 'notifications'].includes(header));

    // Apply visibility based on matches
    if (isSearchMatch && isCategoryMatch) {
      widget.classList.remove('hidden');
    } else {
      widget.classList.add('hidden');
    }
  });

  // Bring visible widgets to the top
  widgets
    .filter((widget) => !widget.classList.contains('hidden'))
    .forEach((widget) => widget.parentNode.appendChild(widget));
};

useEffect(() => {
  filteredWidgets();
}, [searchQuery, selectedCategory]);



const handleSearchChange = (event) => {
  setSearchQuery(event.target.value); // React will trigger the effect to filter
};

const handleCategoryClick = (category) => {
  setSelectedCategory(category); // React will trigger the effect to filter
  setSearchQuery(''); // Clear search query when category changes
};
  

  // Initialize activeWidgets from localStorage or empty Set
  const [activeWidgets, setActiveWidgets] = useState(() => {
    const savedWidgets = localStorage.getItem('activeWidgets');
    return savedWidgets ? new Set(JSON.parse(savedWidgets)) : new Set();
  });

  // Save activeWidgets to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeWidgets', JSON.stringify([...activeWidgets]));
  }, [activeWidgets]);

  if (!show) {
    return null;
  }

  const handleAddWidget = (widgetName) => {
    const isCalendarNotificationConflict = 
      (widgetName === 'Notifications' && activeWidgets.has('Calendar')) ||
      (widgetName === 'Calendar' && activeWidgets.has('Notifications'));

    const isTasksMessagesConflict = 
      (widgetName === 'Active Tasks' && activeWidgets.has('Recent Messages')) ||
      (widgetName === 'Recent Messages' && activeWidgets.has('Active Tasks'));

    if (isCalendarNotificationConflict) {
      setConfirmationType(widgetName.toLowerCase());
      setShowConfirmDialog(true);
    } else if (isTasksMessagesConflict) {
      setConfirmationType(widgetName === 'Active Tasks' ? 'activeTasks' : 'recentMessages');
      setShowConfirmDialog(true);
    } else {
      const newActiveWidgets = new Set(activeWidgets);
      newActiveWidgets.add(widgetName);
      setActiveWidgets(newActiveWidgets);
      onAddWidget(widgetName);
      onClose();
    }
  };

  const handleConfirm = () => {
    const newActiveWidgets = new Set(activeWidgets);
    
    switch (confirmationType) {
      case 'notifications':
        newActiveWidgets.delete('Calendar');
        newActiveWidgets.add('Notifications');
        onAddWidget('Notifications');
        break;
      case 'calendar':
        newActiveWidgets.delete('Notifications');
        newActiveWidgets.add('Calendar');
        onAddWidget('Calendar');
        break;
      case 'activeTasks':
        newActiveWidgets.delete('Recent Messages');
        newActiveWidgets.add('Active Tasks');
        onAddWidget('Active Tasks');
        break;
      case 'recentMessages':
        newActiveWidgets.delete('Active Tasks');
        newActiveWidgets.add('Recent Messages');
        onAddWidget('Recent Messages');
        break;
    }
    
    setActiveWidgets(newActiveWidgets);
    setShowConfirmDialog(false);
    onClose();
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setConfirmationType(null);
  };

  const getConfirmationContent = () => {
    switch (confirmationType) {
      case 'notifications':
        return {
          title: 'Add Notifications Widget',
          message: 'To add the Notifications widget you need to remove the follow if there is any:',
          widgetName: 'Calendar',
          description: 'This widget displays a calendar that highlights upcoming deadlines, with dates becoming emphasized as the due date approaches.'
        };
      case 'calendar':
        return {
          title: 'Add Calendar Widget',
          message: 'To add the Calendar widget you need to remove the follow if there is any:',
          widgetName: 'Notifications',
          description: 'This widget displays notifications such as due dates and assigned works.'
        };
      case 'activeTasks':
        return {
          title: 'Add Active Tasks Widget',
          message: 'To add the Active Tasks widget you need to remove the follow if there is any:',
          widgetName: 'Recent Messages',
          description: 'This widget displays group messages and personal messages youve interacted with.'
        };
      case 'recentMessages':
        return {
          title: 'Add Recent Messages Widget',
          message: 'To add the Recent Message widget you need to remove the following if there is any:',
          widgetName: 'Active Tasks',
          description: 'This widget displays the active tasks that the user is assigned to.'
        };
      default:
        return {};
    }
  };

  const getWidgetIcon = (widgetName) => {
    switch (widgetName) {
      case 'Calendar':
        return img5;
      case 'Notifications':
        return img12;
      case 'Active Tasks':
        return img11;
      case 'Recent Messages':
        return img3;
      default:
        return null;
    }
  };


  return (
    <div className="popup-overlay">
      {showConfirmDialog && (
        <div className="confirmation-dialog">
          <div className="confirmation-content">
            <h3>{getConfirmationContent().title}</h3>
            <p>{getConfirmationContent().message}</p>
            <div className="widget-to-remove">
              <div className="widget-remove-header">
                <div className="widget-icon-container">
                  <img 
                    src={getWidgetIcon(getConfirmationContent().widgetName)} 
                    alt="" 
                    className="widget-icon-preview"
                  />
                </div>
                <h4>{getConfirmationContent().widgetName}</h4>
              </div>
              <p>{getConfirmationContent().description}</p>
            </div>
            <div className="confirmation-buttons">
              <button className="confirm-button" onClick={handleConfirm}>
                Confirm
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="popup-content">
        <div className="widgetcontainer">
          <div className="widget-list">
          <div className="widget-item">
              <div className="widget-icon">
                <img src={img2} alt="" className="projoverviewiconpopup" />
              </div>
              <div className="widget-info">
                <h3 className="widgetlistheader">Project Overview</h3>
                <p>This widget displays the active projects you belong to.</p>
              </div>
              <button className="add-widget" onClick={() => handleAddWidget('Project Overview')}>
                <img src={img1} alt="" className="plusaddwidgetProOv" />Add Widget
              </button>
            </div>
          <div className="widget-item">
            <div className="widget-icon">
            <img src={img3} alt="" className="recentMiconpopup" />
            </div>
            <div className="widget-info">
              <h3 className="widgetlistheader">Recent Messages</h3>
              <p>This widget displays group messages and personal messages you've interacted with.</p>
            </div>
            <button className="add-widget" onClick={() => handleAddWidget('Recent Messages')}>
                <img src={img1} alt="" className="plusaddwidgetrecent" />Add Widget
              </button>
          </div>
          <div className="widget-item">
            <div className="widget-icon">
            <img src={img4} alt="" className="perOviconpopup" />
            </div>
            <div className="widget-info">
              <h3 className="widgetlistheader">Performance Overview</h3>
              <p>This widget displays a visual representation of the user's performance throughout a selected timespan.</p>
            </div>
            <button className="add-widget" onClick={() => handleAddWidget('Performance Overview')}>
                <img src={img1} alt="" className="plusaddwidgetProOv" />Add Widget
              </button>
          </div>
          <div className="widget-item">
              <div className="widget-icon">
                <img src={img5} alt="" className="Calendariconpopup" />
              </div>
              <div className="widget-info">
                <h3 className="widgetlistheader">Calendar</h3>
                <p>This widget displays a calendar that highlights upcoming deadlines, with dates becoming emphasized as the due date approaches.</p>
              </div>
              <button className="add-widget" onClick={() => handleAddWidget('Calendar')}>
                <img src={img1} alt="" className="plusaddwidgetCalendar" />Add Widget
              </button>
            </div>
        
           <div className="widget-item">
           <div className="widget-icon"> 
           <img src={img6} alt="" className="totprojiconpopup" />
           </div>
        <div className="widget-info">
              <h3 className="widgetlistheader">Total Projects</h3>
              <p>This widget displays the total projects of the user.</p>
            </div>
            <button className="add-widget" onClick={() => handleAddWidget('Total Projects')}>
                <img src={img1} alt="" className="plusaddwidgetTotalPro" />Add Widget
              </button>
          </div>


          <div className="widget-item">
           <div className="widget-icon"> 
           <img src={img7} alt="" className="tottasksiconpopup" />
           </div>
        <div className="widget-info">
              <h3 className="widgetlistheader">Total Tasks</h3>
              <p>This widget displays the total tasks of the user.</p>
            </div>
            <button className="add-widget" onClick={() => handleAddWidget('Total Tasks')}>
                <img src={img1} alt="" className="plusaddwidgetTotalPro" />Add Widget
              </button>
          </div>


          <div className="widget-item">
           <div className="widget-icon"> 
           <img src={img8} alt="" className="compltasksiconpopup" />
           </div>
        <div className="widget-info">
              <h3 className="widgetlistheader">Completed Tasks</h3>
              <p>This widget displays the completed tasks of the user.</p>
            </div>
            <button className="add-widget" onClick={() => handleAddWidget('Completed Tasks')}>
                <img src={img1} alt="" className="plusaddwidgetTotalPro" />Add Widget
              </button>
          </div>

          <div className="widget-item">
           <div className="widget-icon"> 
           <img src={img13} alt="" className="complprojiconpopup" />
           </div>
        <div className="widget-info">
              <h3 className="widgetlistheader">Completed Projects</h3>
              <p>This widget displays the completed projects of the user.</p>
            </div>
            <button className="add-widget" onClick={() => handleAddWidget('Completed Projects')}>
                <img src={img1} alt="" className="plusaddwidgetTotalPro" />Add Widget
              </button>
          </div>


          <div className="widget-item">
           <div className="widget-icon"> 
           <img src={img9} alt="" className="onProiconpopup" />
           </div>
        <div className="widget-info">
              <h3 className="widgetlistheader">Ongoing Projects</h3>
              <p>This widget displays the ongoing projects of the user.</p>
            </div>
            <button className="add-widget" onClick={() => handleAddWidget('Ongoing Projects')}>
                <img src={img1} alt="" className="plusaddwidgetTotalPro" />Add Widget
              </button>
          </div>


          <div className="widget-item">
           <div className="widget-icon"> 
           <img src={img10} alt="" className="onTasksiconpopup" />
           </div>
        <div className="widget-info">
              <h3 className="widgetlistheader">Ongoing Tasks</h3>
              <p>This widget displays the ongoing tasks of the user.</p>
            </div>
            <button className="add-widget" onClick={() => handleAddWidget('Ongoing Tasks')}>
                <img src={img1} alt="" className="plusaddwidgetTotalPro" />Add Widget
              </button>
          </div>


          <div className="widget-item">
           <div className="widget-icon"> 
           <img src={img11} alt="" className="actTasksiconpopup" />
           </div>
        <div className="widget-info">
              <h3 className="widgetlistheader">Active Tasks</h3>
              <p>This widget displays the active tasks that the user is assigned to.</p>
            </div>
            <button className="add-widget" onClick={() => handleAddWidget('Active Tasks')}>
                <img src={img1} alt="" className="plusaddwidgetTotalPro" />Add Widget
              </button>
          </div>


          
          </div>
        </div>

        <div className="sidebar">
          <input type="text" placeholder="Search" className="popupsearch"  
          value={searchQuery}
  onChange={handleSearchChange}/>
          <img src={img0} alt="" className="popupmagnifyingglass" />
          <h2 className="sidebartitle">Add New Widget</h2>
          <h3 className="sidebarsubtitle">Categories</h3>
          <ul>
  <li 
    onClick={() => handleCategoryClick('All')} 
    className={selectedCategory === 'All' ? 'active-category' : ''}
  >
    All
  </li>
  <li 
    onClick={() => handleCategoryClick('Workload Tracker')} 
    className={selectedCategory === 'Workload Tracker' ? 'active-category' : ''}
  >
    Workload Tracker
  </li>
  <li 
    onClick={() => handleCategoryClick('Calendar')} 
    className={selectedCategory === 'Calendar' ? 'active-category' : ''}
  >
    Calendar
  </li>

  <li 
    onClick={() => handleCategoryClick('Notifications')} 
    className={selectedCategory === 'Notifications' ? 'active-category' : ''}
  >
    Notifications
  </li>
 
</ul>

        </div>
        <button onClick={onClose} className="popupclose">X</button>
      </div>
    </div>
  );
};


export default AddWidgetPopup;