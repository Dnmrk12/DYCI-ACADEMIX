import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Paperclip, Send, X, ChevronLeft, ChevronRight, Maximize, Download, AtSign, Trash2, Users } from "lucide-react";
import days from "./iconshomepage/daysRemaining.png";
import attach from "./iconshomepage/attachFiles.png";
import photo from "./iconshomepage/photo.png";
import photo1 from "./iconshomepage/photo2.png";
import photo2 from "./iconshomepage/photo3.png";
import photo3 from "./iconshomepage/photo4.png";
import photo4 from "./iconshomepage/photo5.png";
import photo5 from "./iconshomepage/photo6.png";
import photo6 from "./iconshomepage/photo7.png";
import defaultPic from "./iconshomepage/defaultPicture.png";
import everyoneIcon from "./iconshomepage/everyoneIcon.png";
import pdf from "./iconshomepage/pdf.png";
import pptx from "./iconshomepage/pptx.png";
import ppt from "./iconshomepage/ppt.png";
import docx from "./iconshomepage/doc.png";
import xls from "./iconshomepage/xls.png";
import txt from "./iconshomepage/txt.png";
import png from "./iconshomepage/png.png";
import random from "./iconshomepage/icons_426538.svg";
import "./groupchat.css";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, getDoc, doc, deleteDoc, where, getDocs, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db } from "./firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

const GroupChat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [message, setMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(null);
  const [allPreviewableImages, setAllPreviewableImages] = useState([]);
  const [showMessageDeleteConfirmation, setShowMessageDeleteConfirmation] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [currentMemberPage, setCurrentMemberPage] = useState(0);
  const [showMentionList, setShowMentionList] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const mentionInputRef = useRef(null);
  // Get the current user's name from localStorage (assuming it was set during login)
  const currentUserName = localStorage.getItem("firstName") || "";

  const [isViewAllPhotos, setIsViewAllPhotos] = useState(false);

  // Array of photos
  const [photos, setPhotos] = useState([]);

  const displayedPhotos = isViewAllPhotos ? photos : photos.slice(0, 3);

  // Define file attachments
  const [attachments, setAttachments] = useState([]);

  const [isViewAllAttachments, setIsViewAllAttachments] = useState(false);
  const displayedAttachments = isViewAllAttachments ? attachments : attachments.slice(0, 3);

  const storedProjectDetails = JSON.parse(localStorage.getItem("selectedProject")) || {};

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
  const scrumId = storedProjectDetails.id || "";

  const isImageOrVideo = (fileName) => {
    const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const allowedVideoExtensions = [".mp4", ".mov", ".avi", ".webm", ".mkv"];
    const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();

    return {
      isImage: allowedImageExtensions.includes(extension),
      isVideo: allowedVideoExtensions.includes(extension),
    };
  };

  // Update the photos fetching useEffect
useEffect(() => {
  if (!scrumId) {
    console.error('Error: No scrumId provided for photos fetch');
    return;
  }

  const db = getFirestore();
  const groupChatRef = collection(db, `Scrum/${scrumId}/GroupChat`);
  
  const unsubscribe = onSnapshot(groupChatRef, 
    (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => doc.data());
        const mediaUrls = data.flatMap(doc =>
          (doc.files || [])
            .filter(file => {
              const fileType = isImageOrVideo(file.name);
              return fileType.isImage || fileType.isVideo;
            })
            .map((file, index) => ({
              id: `${doc.id}-${index}`,
              src: file.url,
              type: isImageOrVideo(file.name).isVideo ? "video" : "image",
            }))
        );
        setPhotos(mediaUrls);
      } catch (error) {
        console.error('Error processing photos data:', error);
      }
    },
    (error) => {
      console.error('Error fetching photos:', error);
    }
  );

  return () => unsubscribe();
}, [scrumId]);

// Update the files fetching useEffect
useEffect(() => {
  if (!scrumId) {
    console.error('Error: No scrumId provided for files fetch');
    return;
  }

  const db = getFirestore();
  const groupChatRef = collection(db, `Scrum/${scrumId}/GroupChat`);
  
  const unsubscribe = onSnapshot(groupChatRef, 
    (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => doc.data());
        const documentFiles = data.flatMap(doc =>
          (doc.files || [])
            .filter(file => {
              const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
              return [
                ".docx", ".pdf", ".txt", ".xlsx", ".pptx", ".ppt",
                ".odt", ".rtf", ".html", ".xml", ".js", ".ts",
                ".css", ".json", ".py", ".java", ".cpp", ".c",
                ".h", ".rb", ".php", ".sh", ".pl", ".go", ".swift",
                ".sql", ".yaml", ".md"
              ].includes(extension);
            })
            .map(file => ({
              id: `${doc.id}-${file.name}`,
              icon: getFileIcon(file.name),
              name: file.name,
              title: file.title || "Untitled Document",
              url: file.url,
            }))
        );
        setAttachments(documentFiles);
      } catch (error) {
        console.error('Error processing files data:', error);
      }
    },
    (error) => {
      console.error('Error fetching files:', error);
    }
  );

  return () => unsubscribe();
}, [scrumId]);

const getFileIcon = (fileName) => {
  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  switch (extension) {
    case ".pdf": return pdf;
    case ".ppt": return ppt;
    case ".pptx": return pptx;
    case ".docx": return docx;
    case ".xlsx": return xls;
    case ".txt": return txt;
    case ".png": return png;
    default: return random;
  }
};

  // Renamed function to trigger the download
  const triggerDownload = (url, fileName) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName; // Specify the filename for the download
        link.click(); // Trigger the download
        URL.revokeObjectURL(link.href); // Clean up the object URL
      })
      .catch((error) => console.error("Error downloading file:", error));
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

  // Dynamic Date Formatting Function
  const formatMessageTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Corrected time formatting
    const timeOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    if (messageDate.toDateString() === today.toDateString()) {
      return `Today, ${messageDate.toLocaleTimeString([], timeOptions)}`;
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${messageDate.toLocaleTimeString([], timeOptions)}`;
    } else if (messageDate.getFullYear() === today.getFullYear()) {
      return `${messageDate.toLocaleDateString("default", { month: "long" })} ${messageDate.getDate()}, ${messageDate.toLocaleTimeString([], timeOptions)}`;
    } else {
      return `${messageDate.toLocaleDateString("default", { month: "long" })} ${messageDate.getDate()}, ${messageDate.getFullYear()} at ${messageDate.toLocaleTimeString([], timeOptions)}`;
    }
  };

  // Comprehensive file type mapping
  const fileTypeIcons = {
    "application/pdf": { icon: pdf, type: "PDF" },
    "application/msword": { icon: docx, type: "Word Document" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { icon: docx, type: "Word Document" },
    "application/vnd.ms-excel": { icon: xls, type: "Excel Spreadsheet" },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { icon: xls, type: "Excel Spreadsheet" },
    "application/vnd.ms-powerpoint": { icon: ppt, type: "PowerPoint Presentation" },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": { icon: pptx, type: "PowerPoint Presentation" },
    "text/plain": { icon: txt, type: "Text File" },
  };  

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map((file) => {
      const fileInfo = fileTypeIcons[file.type] || {
        icon: attach,
        type: file.type || "Unknown File Type",
      };
  
      // Add support for video preview
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
  
      return {
        id: Date.now() + Math.random(),
        file, // The raw File object
        name: file.name || "Unnamed File",
        size: file.size ? formatFileSize(file.size) : "Unknown Size",
        type: fileInfo.type,
        icon: fileInfo.icon,
        preview: isImage ? URL.createObjectURL(file) : 
                isVideo ? URL.createObjectURL(file) : 
                null,
        isVideo: isVideo, // Add a flag to identify video files
        isUploaded: false,
      };
    });
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const saveGroupChatMessage = async (scrumId, messageData) => {
    try {
      const db = getFirestore();
      const storage = getStorage();

      const messageToSave = {
        sender: auth.currentUser.uid,
        dateTime: serverTimestamp(),
        text: messageData.text || "",
        files: [],
      };

      if (messageData.files && messageData.files.length > 0) {
        const fileUploadPromises = messageData.files.map(async (fileItem) => {
          const fileToUpload = fileItem.file || fileItem;
          const filename = `${Date.now()}_${fileItem.name || "Unnamed File"}`;
          const storageRef = ref(storage, `Scrum/${scrumId}/GroupChat/${filename}`);

          try {
            const snapshot = await uploadBytes(storageRef, fileToUpload);
            const downloadURL = await getDownloadURL(snapshot.ref);

            const fileTypeInfo = fileTypeIcons[fileToUpload.type] || {
              icon: attach,
              type: fileToUpload.type || "Unknown File Type",
            };

            return {
              name: fileItem.name || filename,
              url: downloadURL,
              type: fileTypeInfo.type,
              size: fileToUpload.size ? formatFileSize(fileToUpload.size) : "Unknown Size",
              icon: fileTypeInfo.icon,
              originalType: fileToUpload.type || "Unknown",
            };
          } catch (uploadError) {
            console.error("File upload error:", uploadError);
            return null;
          }
        });

        messageToSave.files = (await Promise.all(fileUploadPromises)).filter((file) => file !== null);
      }

      const groupChatRef = collection(db, "Scrum", scrumId, "GroupChat");
      const docRef = await addDoc(groupChatRef, messageToSave);

      return { success: true, messageId: docRef.id };
    } catch (error) {
      console.error("Error saving group chat message:", error);
      return { success: false, error: error.message };
    }
  };

  const saveMentionNotification = async (scrumId, mentionData) => {
    try {
      const db = getFirestore();

      // When @everyone is mentioned, get all member UIDs except the current user
      const receiverIds = mentionData.isEveryoneMentioned
        ? members
            .filter((member) => member.memberId !== auth.currentUser.uid)
            .map((member) => member.memberId)
            .filter((uid) => uid != null)
        : mentionData.receiverIds || [];

      // Sanitize and prepare the notification payload
      const notificationPayload = {
        context: scrumId || "", // Ensure string
        action: (mentionData.action || `Mentioned everyone in the GroupChat of `).toString(), // Convert to string
        receiver: receiverIds.filter((id) => id != null), // Remove any null/undefined IDs
        sender: mentionData.senderId || "", // Ensure string
        subType: "comment", // Hardcoded string
        type: "social", // Hardcoded string
        unread: true, // Boolean
        timeAgo: new Date().toISOString(), // ISO string timestamp
      };

      // Remove any keys with undefined values
      Object.keys(notificationPayload).forEach((key) => notificationPayload[key] === undefined && delete notificationPayload[key]);

      // Add the notification to the Scrum project's notification collection
      const scrumNotifRef = collection(db, "Scrum", scrumId, "scrumNotif");
      const docRef = await addDoc(scrumNotifRef, notificationPayload);

      // Update the document with its own ID
      await updateDoc(docRef, {
        id: docRef.id,
      });

      return {
        success: true,
        notificationId: docRef.id,
      };
    } catch (error) {
      console.error("Error saving mention notification:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    // Check if we're already sending or if there's no content to send
    if (isSending || (!message.trim() && uploadedFiles.length === 0)) {
      return;
    }

    try {
      setIsSending(true); // Set sending state to true
      const scrumId = storedProjectDetails.id;

      // Extract mentioned users, including "@everyone"
      const mentionedUsers = message.match(/@(\w+)/g)?.map((mention) => mention.slice(1)) || [];

      const result = await saveGroupChatMessage(scrumId, {
        text: message,
        files: uploadedFiles,
      });

      if (result.success) {
        // Process mentions
        if (mentionedUsers.length > 0) {
          // Check if "@everyone" is mentioned
          const isEveryoneMentioned = mentionedUsers.includes("everyone");

          if (isEveryoneMentioned) {
            // Save notification for @everyone mention
            await saveMentionNotification(scrumId, {
              isEveryoneMentioned: true,
              receiverIds: members
                .filter((member) => member.memberId !== auth.currentUser.uid)
                .map((member) => member.memberId)
                .filter((uid) => uid != null),
              senderId: auth.currentUser.uid,
              action: `Mentioned everyone in the GroupChat of `,
            });
          } else {
            // Find user IDs for specifically mentioned users
            const userQuery = query(collection(db, "users"), where("firstName", "in", mentionedUsers));
            const querySnapshot = await getDocs(userQuery);
            const mentionedUserDetails = querySnapshot.docs.map((doc) => doc.id).filter((uid) => uid != null && uid !== auth.currentUser.uid);

            // Create mention notifications for specific users
            if (mentionedUserDetails.length > 0) {
              await saveMentionNotification(scrumId, {
                receiverIds: mentionedUserDetails,
                senderId: auth.currentUser.uid,
                action: `Mentioned you in the GroupChat of `,
              });
            }
          }
        }

        // Clear input and uploaded files
        setMessage("");
        setUploadedFiles([]);
      } else {
        console.error("Failed to send message", result.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false); // Reset sending state regardless of success/failure
    }
  };

  const fetchGroupChatMessages = (scrumId, setMessages) => {
    const db = getFirestore();

    // Reference to the GroupChat subcollection
    const groupChatRef = collection(db, "Scrum", scrumId, "GroupChat");

    // Create a query ordered by timestamp
    const q = query(groupChatRef, orderBy("dateTime", "asc"));

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      // Fetch all unique sender UIDs
      const senderUids = [...new Set(querySnapshot.docs.map((doc) => doc.data().sender))];

      // Fetch user details for all unique senders
      const userDetailsMap = {};
      const userPromises = senderUids.map(async (uid) => {
        try {
          // Directly reference the user document using the UID
          const userRef = doc(db, "users", uid);
          const userSnapshot = await getDoc(userRef);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            userDetailsMap[uid] = {
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              userPicture: userData.userPicture || "",
            };
          }
        } catch (error) {
          console.error(`Error fetching user details for ${uid}:`, error);
        }
      });

      // Wait for all user details to be fetched
      await Promise.all(userPromises);

      const fetchedMessages = querySnapshot.docs.map((doc) => {
        const messageData = doc.data();
        const senderDetails = userDetailsMap[messageData.sender] || {};

        return {
          id: doc.id,
          ...messageData,
          sender: messageData.sender === auth.currentUser.uid ? "currentUser" : "otherUser",
          timestamp: messageData.dateTime?.toDate() || new Date(),
          senderName: messageData.sender === auth.currentUser.uid ? "" : `${senderDetails.firstName || ""} ${senderDetails.lastName || ""}`.trim(),
          senderImg: messageData.sender === auth.currentUser.uid ? "" : senderDetails.userPicture,
          files:
            messageData.files?.map((fileItem) => {
              const isImage = fileItem.type?.startsWith("image/");
              const fileTypeInfo = fileTypeIcons[fileItem.originalType] ||
                fileTypeIcons[fileItem.type] || {
                  icon: attach,
                  type: fileItem.type || "Unknown File Type",
                };

              return {
                id: fileItem.url || Date.now(), // Fallback to timestamp if no URL
                name: fileItem.name,
                preview: isImage ? fileItem.url : null, // Only assign preview for images
                url: fileItem.url,
                size: fileItem.size,
                type: fileItem.type,
                icon: isImage ? null : fileTypeInfo.icon, // Only assign icon for non-image files
                isUploaded: true,
              };
            }) || [],
        };
      });

      setMessages(fetchedMessages);
    });

    // Return unsubscribe function to stop listening when component unmounts
    return unsubscribe;
  };

  useEffect(() => {
    const scrumId = storedProjectDetails.id;

    // Set up the listener
    const unsubscribe = fetchGroupChatMessages(scrumId, setMessages);

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [storedProjectDetails.id]);

  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const deleteGroupChatMessage = async (scrumId, messageId) => {
    try {
      // Initialize Firestore and Storage instances
      const db = getFirestore();
      const storage = getStorage();

      // Reference to the specific message document in Firestore
      const messageRef = doc(db, "Scrum", scrumId, "GroupChat", messageId);

      // Fetch the message document to retrieve file details
      const messageSnapshot = await getDoc(messageRef);
      if (!messageSnapshot.exists()) {
        throw new Error("Message not found");
      }
      const messageData = messageSnapshot.data();

      // If the message contains files, delete them from Storage
      if (messageData.files && messageData.files.length > 0) {
        const fileDeletePromises = messageData.files.map(async (fileItem) => {
          try {
            // Extract the file path from the file's download URL
            const filePath = decodeURIComponent(new URL(fileItem.url).pathname.replace(/^\/v\d+\/b\/[^\/]+\/o\//, "").replace(/%2F/g, "/"));
            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);
          } catch (error) {
            console.error(`Error deleting file from storage (${fileItem.name}):`, error);
          }
        });

        // Wait for all file deletions to finish
        await Promise.all(fileDeletePromises);
      }

      // Delete the Firestore document
      await deleteDoc(messageRef);

      return {
        success: true,
        message: "Message and associated files deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting group chat message:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const scrumId = storedProjectDetails.id; // Get the Scrum project ID

    // Set UI state for confirmation
    setMessageToDelete(messageId);
    setShowMessageDeleteConfirmation(true);
  };

  const confirmDeleteMessage = async () => {
    if (messageToDelete) {
      const scrumId = storedProjectDetails.id;

      // Call the delete function
      const result = await deleteGroupChatMessage(scrumId, messageToDelete);

      if (result.success) {
        // Optionally, you can remove the message from local state
        setMessages(messages.filter((msg) => msg.id !== messageToDelete));

        // Reset UI states
        setSelectedMessageId(null);
        setShowMessageDeleteConfirmation(false);
        setMessageToDelete(null);
      } else {
        // Handle error (show notification to user)
        console.error("Failed to delete message", result.error);
        // Optionally, show an error toast or alert
      }
    }
  };

  const cancelDeleteMessage = () => {
    setShowMessageDeleteConfirmation(false);
    setMessageToDelete(null);
  };

  // Utility function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const downloadFile = async (fileItem) => {
    try {
      // Fetch the file as a Blob
      const response = await fetch(fileItem.url);
      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }
      const blob = await response.blob();

      // Create a temporary URL for the Blob
      const blobUrl = URL.createObjectURL(blob);

      // Create a temporary <a> element for downloading
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileItem.name || "downloaded-file"; // Suggest a filename
      document.body.appendChild(link);
      link.click();
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const removeUploadedFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== fileId));
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImagePreview = (mediaSrc, allMedia = [], currentIndex = 0, context = "gallery") => {
    let previewableMedia;
  
    if (context === "gallery") {
      previewableMedia = !isViewAllPhotos
        ? photos.slice(0, 3).map((media) => ({
            preview: media.src,
            type: media.type,
            isVideo: media.type === "video", // Explicitly set isVideo flag
            ...media,
          }))
        : photos.map((media) => ({
            preview: media.src,
            type: media.type,
            isVideo: media.type === "video", // Explicitly set isVideo flag
            ...media,
          }));  
    } else {
      // For file preview context
      previewableMedia = allMedia
        .filter((fileItem) => {
          // Ensure media items have either a preview, video type, or image type
          return fileItem.preview || 
                 fileItem.type === "video" || 
                 fileItem.type.startsWith('video/') || 
                 fileItem.type.startsWith('image/');
        })
        .map((fileItem) => ({
          preview: fileItem.preview || fileItem.src || fileItem.url,
          type: fileItem.type || "image", // Default to image if no type specified
          src: fileItem.src || fileItem.preview || fileItem.url,
          isVideo: fileItem.type?.startsWith('video/') || fileItem.type === "video",
          ...fileItem,
        }));
    }
  
    // Ensure the current media is in the previewable media list
    const matchingMediaIndex = previewableMedia.findIndex((media) => 
      media.src === mediaSrc || media.preview === mediaSrc
    );
  
    setPreviewImage(mediaSrc);
    setAllPreviewableImages(previewableMedia);
    setCurrentPreviewIndex(matchingMediaIndex !== -1 ? matchingMediaIndex : currentIndex);
  };

  const navigatePreview = (direction) => {
    if (allPreviewableImages.length === 0) return;
  
    let newIndex = currentPreviewIndex;
    if (direction === "next") {
      newIndex = (currentPreviewIndex + 1) % allPreviewableImages.length;
    } else {
      newIndex = (currentPreviewIndex - 1 + allPreviewableImages.length) % allPreviewableImages.length;
    }
  
    // Ensure we're setting the correct preview source
    const currentMedia = allPreviewableImages[newIndex];
    setPreviewImage(currentMedia.preview || currentMedia.src || currentMedia.url);
    setCurrentPreviewIndex(newIndex);
  };

  const renderFilePreview = (files, isInMessageContainer = false, messageId = null, showDeleteIcon = true) => {
    if (!files || files.length === 0) return null;
  
    return (
      <div className="groupchat-file-preview-outer-container">
        {/* Delete Icon for Images and Videos - Only show when it's an image/video-only message */}
        {isInMessageContainer && showDeleteIcon && files.length > 0 && (files[0].preview || files[0].type.startsWith('video/')) && (
          <div className={`groupchat-message-delete image-delete ${files[0].sender === "currentUser" ? "sent" : "received"}`} onClick={() => handleDeleteMessage(messageId)}>
            <Trash2 size={16} color="#2665AC" />
          </div>
        )}
  
        {/* Delete Icon for Documents */}
        {isInMessageContainer && showDeleteIcon && files.length > 0 && !files[0].preview && !files[0].type.startsWith('video/') && (
          <div className={`groupchat-message-delete document-delete ${files[0].sender === "currentUser" ? "sent" : "received"}`} onClick={() => handleDeleteMessage(messageId)}>
            <Trash2 size={16} color="#2665AC" />
          </div>
        )}
  
        <div className={`groupchat-file-preview-container ${isInMessageContainer ? "in-message" : "upload-preview"}`}>
          {files.map((fileItem, index) => (
            <div key={fileItem.id} className="groupchat-file-preview-wrapper">
              <div className={fileItem.preview || fileItem.type.startsWith('video/') ? "groupchat-image-upload-wrapper" : "groupchat-document-upload-wrapper"}>
                {fileItem.preview || fileItem.type.startsWith('video/') ? (
                  <>
                    {fileItem.type.startsWith('video/') ? (
                      <video
                        src={fileItem.preview || fileItem.url}
                        className="groupchat-image-preview"
                        onClick={() => handleImagePreview(fileItem.preview || fileItem.url, files, index, "file")}
                        controls
                      />
                    ) : (
                      <img
                        src={fileItem.preview || fileItem.url}
                        alt="Preview"
                        className="groupchat-image-preview"
                        onClick={() => handleImagePreview(fileItem.preview || fileItem.url, files, index, "file")}
                      />
                    )}
                    <div className="groupchat-image-actions">
                      {fileItem.type.startsWith('video/') ? null : fileItem.isUploaded && (
                        <button className="groupchat-image-download" onClick={() => downloadFile(fileItem)} title="Download">
                          <Download size={16} color="#2665AC" />
                        </button>
                      )}
                      {!isInMessageContainer && (
                        <div className="groupchat-remove-file" onClick={() => removeUploadedFile(fileItem.id)}>
                          <X size={16} color="#2665AC" />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="groupchat-document-item">
                      <img src={fileItem.icon} alt="File Icon" className="groupchat-document-icon" />
                      <div className="groupchat-document-details">
                        <span className="groupchat-document-name" onClick={() => downloadFile(fileItem)}>
                          {fileItem.name}
                        </span>
                        <span className="groupchat-document-size">{fileItem.size}</span>
                      </div>
                      {fileItem.isUploaded && (
                        <button className="groupchat-document-download" onClick={() => downloadFile(fileItem)} title="Download File">
                          <Download size={16} color="#2665AC" />
                        </button>
                      )}
                    </div>
                    {!isInMessageContainer && (
                      <div className="groupchat-remove-file" onClick={() => removeUploadedFile(fileItem.id)}>
                        <X size={16} color="#2665AC" />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
    setCurrentPreviewIndex(null);
    setAllPreviewableImages([]);
  };

  const membersPerPage = 3;
  const totalPages = Math.ceil(members.length / membersPerPage);

  const navigateMembers = (direction) => {
    if (direction === "next" && currentMemberPage < totalPages - 1) {
      setCurrentMemberPage(currentMemberPage + 1);
    } else if (direction === "prev" && currentMemberPage > 0) {
      setCurrentMemberPage(currentMemberPage - 1);
    }
  };

  const displayedMembers = members.slice(currentMemberPage * membersPerPage, (currentMemberPage + 1) * membersPerPage);

  // Add this method to toggle view all photos
  const toggleViewAllPhotos = () => {
    setIsViewAllPhotos(!isViewAllPhotos);
  };

  const toggleViewAllAttachments = () => {
    setIsViewAllAttachments(!isViewAllAttachments);
  };

  const renderPhotoGallery = () => {
    const displayedMedia = isViewAllPhotos ? photos : photos.slice(0, 3);
  
    return (
      <div className="groupchat-photo-gallery">
        <h4 className="groupchat-members-title">Photos & Multimedia</h4>
        <div className="groupchat-photo-container">
          {displayedMedia.map((media) => (
            <div key={media.id} className="groupchat-photo-item">
              {media.type === "image" ? (
                <div className="groupchat-image-wrapper">
                  <img
                    src={media.src}
                    alt={`Project Media ${media.id}`}
                    className="groupchat-photo"
                    onClick={() =>
                      handleImagePreview(
                        media.src,
                        photos,
                        photos.findIndex((p) => p.id === media.id),
                        "gallery"
                      )
                    }
                  />
                  <div className="groupchat-image-actions">
                    <button 
                      className="groupchat-image-download" 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening preview when downloading
                        downloadFile({
                          url: media.src,
                          name: `image_${media.id}.jpg`
                        });
                      }} 
                      title="Download"
                    >
                      <Download size={16} color="#2665AC" />
                    </button>
                  </div>
                </div>
              ) : (
                <video
                  src={media.src}
                  className="groupchat-video"
                  onClick={() =>
                    handleImagePreview(
                      media.src,
                      photos,
                      photos.findIndex((p) => p.id === media.id),
                      "gallery"
                    )
                  }
                  controls
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          ))}
        </div>
        {!isViewAllPhotos && photos.length > 3 && (
          <div className="groupchat-view-all-photos" onClick={toggleViewAllPhotos}>
            View All ({photos.length})
          </div>
        )}
        {isViewAllPhotos && (
          <div className="groupchat-view-less-photos" onClick={toggleViewAllPhotos}>
            View Less
          </div>
        )}

        {/* New Attachments Section */}
        <h4 className="groupchat-members-title" style={{ marginTop: "20px" }}>
  Attachments
</h4>
<div className="groupchat-attachments-container">
  {displayedAttachments.map((attachment) => (
    <div
      key={attachment.id}
      className="groupchat-attachment-item"
      onClick={() => triggerDownload(attachment.url, attachment.name)}
    >
      <img src={attachment.icon} alt={attachment.name} className="groupchat-attachment-icon" />
      <div 
        className="groupchat-attachment-details" 
        title={attachment.name}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <span 
          className="groupchat-attachment-name"
          style={{
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            maxWidth: '100%',
            display: '-webkit-box',
            WebkitLineClamp: 2, // Limit to 2 lines
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {attachment.name}
        </span>
      </div>
    </div>
  ))}
</div>
{!isViewAllAttachments && attachments.length > 3 && (
  <div className="groupchat-view-all-attachments" onClick={toggleViewAllAttachments}>
    View All ({attachments.length})
  </div>
)}
{isViewAllAttachments && (
  <div className="groupchat-view-less-attachments" onClick={toggleViewAllAttachments}>
    View Less
  </div>
)}
      </div>
    );
  };

  // New function to handle default image replacement
  const getProfileImage = (img, name) => {
    // If no image is provided or img is an empty string
    if (!img || img.trim() === "") {
      return defaultPic;
    }
    return img;
  };

  // Filter out the current user from the members list
  const mentionableMembers = members.filter((member) => member.name.toLowerCase() !== currentUserName.toLowerCase());

  const handleMentionSearch = (input) => {
    // Remove the "@" symbol and convert to lowercase for case-insensitive matching
    const mentionQuery = input.slice(1).toLowerCase();
    const uid = getAuth().currentUser.uid;
    // Create a list of filtered members plus the "@everyone" option
    let matched = [];

    // Check for "@everyone"
    if ("everyone".includes(mentionQuery)) {
      matched.push({
        name: "everyone",
        role: "All Project Members",
        img: "", // You can add a group icon if desired
      });
    }

    // Add filtered members, excluding the current user
    matched = [
      ...matched,
      ...mentionableMembers.filter(
        (member) => member.name.toLowerCase().includes(mentionQuery) && member.memberId !== uid, // Exclude current user
      ),
    ];

    console.log("Matched members:", matched);
    setFilteredMembers(matched);
    setShowMentionList(matched.length > 0);
  };

  const handleMentionSelect = (selectedMember) => {
    // Replace the partial mention with the full member name
    const inputElement = mentionInputRef.current;
    const currentValue = message;
    const lastAtIndex = currentValue.lastIndexOf("@");

    // Construct the new message with the selected member
    const newMessage = currentValue.slice(0, lastAtIndex) + `@${selectedMember.name} `;

    setMessage(newMessage);
    setShowMentionList(false);
  };

  const handleMessageChange = (e) => {
    const inputValue = e.target.value;
    setMessage(inputValue);

    // Check if the last character before the cursor is "@"
    if (inputValue.includes("@")) {
      handleMentionSearch(inputValue.split("@").pop());
    } else {
      setShowMentionList(false);
    }
  };

  const [messages, setMessages] = useState([]);

  const renderMessage = (msg) => {
    const isCurrentUser = msg.sender === "currentUser";
  
    const parseMessageWithMentions = (text) => {
      if (!text) return text;
    
      const memberMentionRegex = /(@\w+\s+\w+)/g;
      const everyoneMentionRegex = /(@everyone)/g;
      
      return text.split(/((?:@everyone)|(?:@\w+\s+\w+))/).map((part, index) => {
        // Check for "@everyone" mention first
        if (everyoneMentionRegex.test(part)) {
          return (
            <span 
              key={index} 
              className="everyone-mention"
            >
              {part}
            </span>
          );
        }
        
        // Then check for member mentions
        if (memberMentionRegex.test(part)) {
          const mentionedName = part.slice(1).trim(); // Remove @ and trim
          
          return (
            <span 
              key={index} 
              className="mention"
              onClick={() => {
                // Try multiple methods to find the member
                const memberToNavigate = 
                  // Method 1: Full name match
                  members.find(m => 
                    `${m.firstName} ${m.lastName}`.toLowerCase() === mentionedName.toLowerCase()
                  ) || 
                  // Method 2: Name match
                  members.find(m => 
                    m.name.toLowerCase() === mentionedName.toLowerCase()
                  );
                
                if (memberToNavigate) {
                  const memberId = memberToNavigate.memberId || memberToNavigate.id;
                  const memberName = memberToNavigate.name || `${memberToNavigate.firstName} ${memberToNavigate.lastName}`;
                  const profileImage = memberToNavigate.img || memberToNavigate.userPicture;
    
                  navigate("/ProfileDetails", { 
                    state: { 
                      edit: true,
                      memberId: memberId, 
                      name: memberName,
                      profileImage: profileImage
                    } 
                  });
                } else {
                  console.warn(`Could not find member: ${mentionedName}`);
                }
              }}
            >
              {part}
            </span>
          );
        }
        
        // Regular text remains unchanged
        return part;
      });
    };
  
    return (
      <div
        key={msg.id}
        className={`groupchat-message-wrapper ${isCurrentUser ? "sent" : "received"}`}
        onMouseEnter={() => setSelectedMessageId(msg.id)}
        onMouseLeave={() => setSelectedMessageId(null)}
      >
        {!isCurrentUser && (
          <div className="groupchat-receiver-profile">
            <img src={msg.senderImg || defaultPic} alt={msg.senderName} className="groupchat-receiver-avatar" />
          </div>
        )}

        <div className={`groupchat-message-container ${isCurrentUser ? "sent" : "received"}`}>
        {!isCurrentUser && (
  <div 
    className="groupchat-receiver-name" 
    onClick={() => {
      const memberToNavigate = members.find(m => m.name === msg.senderName);
      if (memberToNavigate) {
        handleProfileNavigation(memberToNavigate);
      }
    }}
  >
    {msg.senderName || "Unknown"}
  </div>
)}

          {/* Scenario 1: Message with text and files */}
          {msg.text && msg.files && msg.files.length > 0 && (
            <>
              <div className={`groupchat-message ${isCurrentUser ? "sent" : "received"}`}>
                {/* Hide trash for text message with images/files for sender */}
                {selectedMessageId === msg.id && isCurrentUser && (
                  <div className="groupchat-message-delete" onClick={() => handleDeleteMessage(msg.id)}>
                    <Trash2 size={16} color="#2665AC" />
                  </div>
                )}
                <div className="groupchat-message-content">
          {parseMessageWithMentions(msg.text)}
        </div>
        </div>
              <div className={`groupchat-message-files ${isCurrentUser ? "sent" : "received"}`}>
                {/* Hide trash for text message with images/files */}
                {renderFilePreview(msg.files, true, msg.id, false)}
                <div className="groupchat-message-timestamp">{formatMessageTime(msg.timestamp)}</div>
              </div>
            </>
          )}

          {/* Scenario 2: Message with only text */}
          {msg.text && (!msg.files || msg.files.length === 0) && (
            <div className={`groupchat-message ${isCurrentUser ? "sent" : "received"}`}>
        {selectedMessageId === msg.id && isCurrentUser && (
          <div className="groupchat-message-delete" onClick={() => handleDeleteMessage(msg.id)}>
            <Trash2 size={16} color="#2665AC" />
          </div>
        )}
        <div className="groupchat-message-content">
          {parseMessageWithMentions(msg.text)}
        </div>
        <div className="groupchat-message-timestamp">{formatMessageTime(msg.timestamp)}</div>
      </div>
          )}

          {/* Scenario 3: Message with only files */}
          {(!msg.text || msg.text.trim() === "") && msg.files && msg.files.length > 0 && (
            <div className={`groupchat-message-files ${isCurrentUser ? "sent" : "received"}`}>
              {/* Always show trash for sender-only file messages, hide for receiver */}
              {renderFilePreview(msg.files, true, msg.id, isCurrentUser)}
              <div className="groupchat-message-timestamp">{formatMessageTime(msg.timestamp)}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Function to scroll to the bottom of the messages container
    const scrollToBottom = () => {
      const messagesContainer = document.querySelector('.groupchat-messages-container');
      if (messagesContainer) {
        // Use scrollHeight to ensure it goes to the very bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    };
  
    // Scroll to bottom when component mounts
    scrollToBottom();
  
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]); // Dependency on messages ensures it updates when new messages are added

  // Assuming you're using React Router
const handleProfileNavigation = (member) => {
  const uid = auth.currentUser.uid; // Assuming you're using Firebase Authentication
  navigate("/ProfileDetails", { 
    state: {
      memberId: member.memberId,
      name: `${member.firstName} ${member.lastName}`,
      profileImage: member.userPicture,
      edit: uid === member.memberId ? false : true, // If uid matches memberId, set edit to false, otherwise true
    },
  });
};

const titleRef = useRef(null);
const titleProjectRef = useRef(null);
const [isOverflowing, setIsOverflowing] = useState(false);
const [showTooltip, setShowTooltip] = useState(false);
const [isProjectOverflowing, setIsProjectOverflowing] = useState(false);
const [showProjectTooltip, setShowProjectTooltip] = useState(false);

useEffect(() => {
  if (titleRef.current) {
    const isOverflow =
      titleRef.current.offsetWidth < titleRef.current.scrollWidth;
    setIsOverflowing(isOverflow);
  }

  if (titleProjectRef.current) {
    const isOverflow =
      titleProjectRef.current.offsetWidth < titleProjectRef.current.scrollWidth;
    setIsProjectOverflowing(isOverflow);
  }

}, [projectName]);

return (
  <div className="groupchat-container">
    <div className="groupchat-header">
    <h1 ref={titleRef} className="groupchat-name"
      onMouseEnter={() => isOverflowing && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      >
        {projectName}
        </h1>
        {showTooltip && (
            <div className="groupchat-title-custom-tooltip">
              {projectName}
              </div>
        )}
    </div>

    <div className="groupchat-sprint-info-container">
      <div className="groupchat-sprint-header">
        <div className="groupchat-sprint-title">{key} - 0</div>
        <div className="groupchat-sprint-dates">
          <span>{`${startDate} - ${endDate}`}</span>
          <img src={days} alt="Days-Remaining-Icon" className="groupchat-clock-icon" />
          <span className="groupchat-time-remaining">{timeRemaining}</span>
        </div>
      </div>

      <div className="groupchat-chat-main-container">
        <div className="groupchat-chat-wrapper">
          <div className="groupchat-chat-header">
            <img src={icon} alt="Project Icon" className="groupchat-project-icon" />
            <span ref={titleProjectRef} className="groupchat-project-name"
      onMouseEnter={() => isProjectOverflowing && setShowProjectTooltip(true)}
      onMouseLeave={() => setShowProjectTooltip(false)}
      >
        {projectName}
        </span>
        {showProjectTooltip && (
            <div className="groupchat-project-title-custom-tooltip">
              {projectName}
              </div>
        )}
    </div>

            {/* Image/Video Preview Modal */}
            {previewImage && (
              <div className="groupchat-image-preview-modal" onClick={closeImagePreview}>
                <div className="groupchat-image-preview-modal-content" onClick={(e) => e.stopPropagation()}>
                  {/* Back Navigation */}
                  {allPreviewableImages.length > 1 && (
                    <button className="groupchat-image-preview-nav-left" onClick={() => navigatePreview("prev")}>
                      <ChevronLeft size={24} color="#2665AC" />
                    </button>
                  )}

                  {/* Close Button */}
                  <button className="groupchat-image-preview-close" onClick={closeImagePreview}>
                    <X size={24} color="#2665AC" />
                  </button>

                  {/* Preview Content - Conditionally Render Image or Video */}
                  {allPreviewableImages[currentPreviewIndex]?.isVideo ? (
                    <video src={previewImage} controls autoPlay className="groupchat-video-preview-full">
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img src={previewImage} alt="Full Preview" className="groupchat-image-preview-full" />
                  )}

                  {/* Next Navigation */}
                  {allPreviewableImages.length > 1 && (
                    <button className="groupchat-image-preview-nav-right" onClick={() => navigatePreview("next")}>
                      <ChevronRight size={24} color="#2665AC" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="groupchat-messages-container">
              {/* Dynamic Today/Date Divider */}
              {messages.length > 0 && (
                <div className="groupchat-today-divider">
                  <span className="groupchat-today-text">{formatMessageTime(messages[messages.length - 1].timestamp)}</span>
                </div>
              )}

              {messages.map(renderMessage)}
            </div>

            {/* File Upload Preview */}
            {uploadedFiles.length > 0 && renderFilePreview(uploadedFiles)}

            <div className="groupchat-message-input-container">
              <div
                className="groupchat-file-upload"
                onClick={() => !isSending && fileInputRef.current.click()}
                title="Upload File" // Added title attribute for hover text
                style={{ opacity: isSending ? 0.5 : 1, cursor: isSending ? 'not-allowed' : 'pointer' }}
              >
                <img src={attach} alt="Attach Files" className="groupchat-upload-icon" style={{ width: "20px", height: "20px" }} />
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          multiple 
          onChange={handleFileUpload}
          disabled={isSending}
        />
      </div>

              {/* Mention List Overlay */}
              {showMentionList && (
                <div className="groupchat-mention-list">
                  {filteredMembers.map((member) => (
                    <div key={member.name} className="groupchat-mention-item" onClick={() => handleMentionSelect(member)}>
                      {member.name === "everyone" ? (
                        <>
                          <div className="groupchat-mention-avatar group-icon">
                            <img
                              src={everyoneIcon}
                              alt="Everyone Icon"
                              className="groupchat-mention-avatar" // Add a specific class for styling, if needed
                            />
                          </div>
                          <div className="groupchat-mention-details">
                            <span className="groupchat-mention-name">@everyone</span>
                            <span className="groupchat-mention-role">All Project Members</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <img src={getProfileImage(member.img, member.name)} alt={`${member.name} profile`} className="groupchat-mention-avatar" />
                          <div className="groupchat-mention-details">
                            <span className="groupchat-mention-name">{member.name}</span>
                            <span className="groupchat-mention-role">{member.role}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

<input
        ref={mentionInputRef}
        type="text"
        className="groupchat-message-input"
        placeholder="Type a message..."
        value={message}
        onChange={handleMessageChange}
        onKeyPress={(e) => e.key === "Enter" && !isSending && handleSendMessage()}
        disabled={isSending}
        style={{ opacity: isSending ? 0.7 : 1 }}
      />
              <div 
        className="groupchat-send-message" 
        onClick={!isSending ? handleSendMessage : undefined}
        style={{ opacity: isSending ? 0.5 : 1, cursor: isSending ? 'not-allowed' : 'pointer' }}
      >
        <Send 
          size={22} 
          className="groupchat-send-icon" 
          color="#2665AC" 
          strokeWidth={1.5} 
        />
      </div>
    </div>
          </div>

          <div className="groupchat-right-container">
            {/* Scrum Master Section - Modified to use getProfileImage */}
            <div className="groupchat-scrum-master-profile">
              <img src={getProfileImage(masterIcon, scrumMaster)} alt={`${scrumMaster} profile`} className="groupchat-scrum-master-image" />
              <div className="groupchat-scrum-master-details">
                <h3 className="groupchat-scrum-master-name">{scrumMaster}</h3>
                <p className="groupchat-scrum-master-role">Scrum Master</p>
              </div>
            </div>

            {/* Members List - Modified to use getProfileImage */}
            <div className="groupchat-members-container">
              <h4 className="groupchat-members-title">Members</h4>
              <div className="groupchat-members-list-horizontal">
              {displayedMembers.map((member, index) => {
  const lastName = member.name.split(" ").pop();
  return (
    <div 
      key={index} 
      className="groupchat-member-item-horizontal"
      onClick={() => handleProfileNavigation(member)}
    >
      <img src={getProfileImage(member.img, member.name)} alt={`${member.name} profile`} className="groupchat-member-image-horizontal" />
      <div className="groupchat-member-details-horizontal">
        <span className="groupchat-member-name">{lastName}</span>
        <span className="groupchat-member-role">{member.role}</span>
      </div>
    </div>
  );
})}
              </div>

              {/* Navigation */}
              <div className="groupchat-members-navigation">
                <button onClick={() => navigateMembers("prev")} disabled={currentMemberPage === 0} className="groupchat-nav-button">
                  <ChevronLeft size={24} color="#2665AC" />
                </button>
                <span className="groupchat-page-indicator">
                  {currentMemberPage + 1} / {totalPages}
                </span>
                <button onClick={() => navigateMembers("next")} disabled={currentMemberPage === totalPages - 1} className="groupchat-nav-button">
                  <ChevronRight size={24} color="#2665AC" />
                </button>
              </div>

              {/* Add Photo Gallery section */}
              {renderPhotoGallery()}
            </div>
          </div>

          {showMessageDeleteConfirmation && (
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
                <h3 style={{ color: "#2665AC", marginBottom: "10px" }}>Delete Message</h3>
                <p style={{ color: "#3A74B4", marginBottom: "20px" }}>Are you sure you want to delete this message?</p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    onClick={cancelDeleteMessage}
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
                    onClick={confirmDeleteMessage}
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
  );
};

export default GroupChat;
