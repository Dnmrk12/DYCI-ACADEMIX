import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import cameraIcon from './iconshomepage/cameraIcon.png';
import DefaultPicture from './iconshomepage/defaultpic.png';
import "./ProfileDetails.css";
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { setPersistence, browserLocalPersistence, getAuth } from 'firebase/auth';
import { db } from './firebase/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ProfileDetails = () => {
  const location = useLocation();
  const [profileImg, setProfileImg] = useState(DefaultPicture); // Default profile picture
  const [editableField, setEditableField] = useState(null);
  const storedProjectDetails = JSON.parse(localStorage.getItem('selectedProject')) || {};
  const navigationState = location.state || {};
const navigationMemberId = navigationState.memberId;
  const [edit, setEdit] = useState(location.state?.edit || null);
  console.log(edit);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    contact: "",
    userPicture: "", // This will store the profile image URL
  });
  const [uid, setUid] = useState(null); // Track UID state

  const auth = getAuth();
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      // Authentication state is now persisted across sessions
    })
    .catch((error) => {
      console.error("Error setting persistence:", error);
    });

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      localStorage.setItem('uid', user.uid);
      setUid(user.uid);
    } else {
      const storedUid = localStorage.getItem('uid');
      if (storedUid) {
        setUid(storedUid);
      }
    }
  }, []);

  // Modified useEffect to handle both direct navigation and group chat navigation
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // First, check navigation state
        const navigationState = location.state || {};
        const navigationMemberId = navigationState.memberId;
  
        let profileToFetch = navigationMemberId || uid;
  
        if (!profileToFetch) {
          console.error("No user ID available");
          return;
        }
  
        const userRef = doc(db, "users", profileToFetch);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile({
            firstName: data.firstName || navigationState.name || "",
            lastName: data.lastName || "",
            email: data.email || "",
            address: data.address || "",
            contact: data.contact || "",
            userPicture: data.userPicture || navigationState.profileImage || DefaultPicture,
          });
          setProfileImg(data.userPicture || navigationState.profileImage || DefaultPicture);
          setUid(profileToFetch);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
  
    fetchProfileData();
  }, [uid, location.state, db]);

  // Handle image upload preview
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Create a reference to Firebase Storage
        const storage = getStorage();
        const storageRef = ref(storage, `userPictures/${file.name}`); // Reference to the file location in storage
  
        // Upload the file to Firebase Storage
        const snapshot = await uploadBytes(storageRef, file);
  
        // Get the download URL after upload is complete
        const downloadURL = await getDownloadURL(snapshot.ref);
  
        // Update Firestore document with the new image URL
        if (uid) {
          const userRef = doc(db, "users", uid); // Get reference to user's Firestore document
          await updateDoc(userRef, {
            userPicture: downloadURL, // Save the image URL to Firestore
          });
  
          // Update localStorage with the new image URL
          localStorage.setItem("userPicture", downloadURL);
  
          // Update the profile picture locally with the new URL
          setProfileImg(downloadURL);
  
          console.log("Image uploaded and Firestore updated!");
        }
      } catch (error) {
        console.error("Error uploading image: ", error);
      }
    }
  };
  useEffect(() => {
    const storedPicture = localStorage.getItem("userPicture");
    const storedFirstName = localStorage.getItem("firstName");
    const storedLastName = localStorage.getItem("lastName");
  
    if (storedPicture) {
      setProfileImg(storedPicture);
    }
  
    if (storedFirstName) {
      setProfile({ ...profile, firstName: storedFirstName });
    }
  
    if (storedLastName) {
      setProfile({ ...profile, lastName: storedLastName });
    }
  }, []);
  
  // Handle saving changes to editable fields
  const handleSave = async (field, value) => {
    if (!uid) return; // Ensure UID is available
  
    const userRef = doc(db, "users", uid); // Get reference to the user's Firestore document
  
    try {
      // Update the relevant field (firstName, lastName, etc.) in Firestore
      await updateDoc(userRef, {
        [field]: value, // Update the correct field (either firstName or lastName)
      });
  
      // Update localStorage with the updated field value
      localStorage.setItem(field, value);
  
      // Update the profile state locally
      setProfile({ ...profile, [field]: value });
      setEditableField(null); // Close the editable field
      console.log(`${field} updated successfully in Firestore and localStorage!`);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };
  
  // Handle key press to save on Enter key
  const handleKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default action to stop form submission (if in form)
      handleSave(field, e.target.value);
    }
  };
  
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-img-container">
          <img src={profileImg} alt="Profile" className="profile-image" />
          {!edit && (
          <div className="hover-overlay">
            <label htmlFor="file-upload" className="upload-label">
              <img src={cameraIcon} className="camera-icon" alt="Upload Icon" />
              <span>Upload Picture</span>
            </label>
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              disabled ={edit}
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </div>
          )}
        </div>
      </div>

      {/* Profile Name Editing */}
      <h2
      disabled ={edit}
        onClick={() => setEditableField('name')}
        className='profile-user-name'
      >
        {editableField === 'name' && !edit ? (
          <div>
            <input
            disabled ={edit}
              type="text"
              className="edit-field-profile-name"
              defaultValue={profile.firstName}
              onKeyPress={(e) => handleKeyPress(e, 'firstName')}
              autoFocus
            />
            <input
              disabled ={edit}
              type="text"
              className="edit-field-profile-name"
              defaultValue={profile.lastName}
              onKeyPress={(e) => handleKeyPress(e, 'lastName')}
              autoFocus
            />
          </div>
        ) : (
          `${profile.firstName} ${profile.lastName}`
        )}
      </h2>

      {/* Profile details section */}
      {activeSection === 'profile' && (
        <div className="profile-details">
          <div className="content-container">
            <div className="profile-info">
              {Object.entries(profile).map(([field, value]) => {
                // Skip rendering name and userPicture here
                if (field === 'firstName' || field === 'lastName' || field === 'userPicture') return null;

                // If field is email, make it non-editable
                return (
                  <div key={field}>
                    <span className="info">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </span>
                    <span className="info-details">
                      {field === 'email' ? (
                        // Display email without edit button
                        value
                      ) : (
                        editableField === field ? (
                          <input
                            disabled ={edit}
                            type="text"
                            className="edit-field"
                            defaultValue={value}
                            onKeyPress={(e) => handleKeyPress(e, field)} // Only trigger on Enter key
                          />
                        ) : (
                          value
                        )
                      )}
                      {field !== 'email' && !edit && (
                        <a
                          href="#"
                          className="edit"
                          onClick={(e) => {
                            e.preventDefault();
                            setEditableField(field);
                          }}
                        >
                          Edit
                        </a>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDetails;
