import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc, arrayUnion, setDoc, getDoc, query, where, arrayRemove } from "firebase/firestore";
import { auth, database, storage } from "./firebaseSetup";
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { scheduleNotificationHandler, cancelNotification, getAllScheduledNotifications } from '../Components/NotificationManager';


// Write to the database
export async function writeToDB(data, collectionName, docId=null) {
    try {
        if (docId) {
            const docRef = doc(collection(database, collectionName), docId);
            await setDoc(docRef, data);
            return docRef;
        } else {
            const docRef = await addDoc(collection(database, collectionName), data);
            return docRef;
        }
    }
    catch (err) {
       console.log('write to db ', err)
    }
}

// Update an array field in a document
export async function updateArrayField(collectionName, documentId, field, value) {
    try {
        //console.log('update array field, ', collectionName, documentId, field, value)
        const userDocRef = doc(database, collectionName, documentId);
        await updateDoc(userDocRef, {
            [field]: arrayUnion(value)
        });
    } catch (err) {
        console.error(`Error updating collection ${collectionName} field ${field} for document ${documentId} with value ${value}:`, err);
        throw err;
    }
}

// delete an array field in a document
export async function deleteArrayField(collectionName, documentId, field, value) {
    try {
        //console.log('update array field, ', collectionName, documentId, field, value)
        const userDocRef = doc(database, collectionName, documentId);
        await updateDoc(userDocRef, {
            [field]: arrayRemove(value)
        });
    } catch (err) {
        console.error(`Error deleting ${field} for document ${documentId}:`, err);
        throw err;
    }
}

// Update user profile
export async function updateUserProfile(userId, updatedData) {
    try {
        const userDocRef = doc(database, 'users', userId);
        await updateDoc(userDocRef, updatedData);
    } catch (err) {
        console.error(`Error updating profile for user ${userId}:`, err);
        throw err;
    }
}

// Update a post in the database
export async function updatePost(postId, updatedData) {
    try {
        const postDocRef = doc(database, 'posts', postId);
        await updateDoc(postDocRef, updatedData);
    } catch (err) {
        console.error(`Error updating post ${postId}:`, err);
        throw err;
    }
}

export async function updateDB(id, data, collectionName) {
  try {
    await setDoc(doc(database, collectionName, id), data, { merge: true });
    //console.log("update DB ", data);
  } catch (err) {
    console.log("update DB ", err);
  }
}

// Delete all documents from a sub-collection
async function deleteSubCollection(parentDocRef, subCollectionName) {
    const subCollectionRef = collection(parentDocRef, subCollectionName);
    const subCollectionSnapshot = await getDocs(subCollectionRef);
    if (!subCollectionSnapshot.empty) {
        const deletePromises = subCollectionSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
    }
}
// Delete a post from the database
export async function deletePost(postId, userId) {
    try {
        const postDocRef = doc(database, 'posts', postId);

        // Check if the comments sub-collection exists and delete it if it does
        const commentsRef = collection(postDocRef, 'comments');
        const commentsSnapshot = await getDocs(commentsRef);
        if (!commentsSnapshot.empty) {
            await deleteSubCollection(postDocRef, 'comments');
        }

        await deleteDoc(postDocRef);

        // Get user data to find the notification
        const userDocRef = doc(database, 'users', userId);
        const userSnapshot = await getDoc(userDocRef);
        
        if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            const notifications = userData.notifications || [];
            
            // Find notification for this post
            const notificationToDelete = notifications.find(notif => notif.postId === postId);
            
            if (notificationToDelete) {
                // Remove the notification
                await updateDoc(userDocRef, {
                    notifications: arrayRemove(notificationToDelete)
                });
            }
        }

        await updateDoc(userDocRef, {
            posts: arrayRemove(postId)
        });

    } catch (err) {
        console.error(`Error deleting post ${postId}:`, err);
        throw err;
    }
}

//get all posts from the database
export async function getAllPosts() {
    try {
        const postsRef = collection(database, 'posts');
        const postsSnapshot = await getDocs(postsRef);
        const postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return postsData;
    } catch (error) {
        console.log("Error getting posts:", error);
    }
}

//get user data from the database
export async function getUserData(userId) {
    try {
        const userDocRef = doc(database, 'users', userId);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            //console.log("User Data:", userData);
            return userData;
        } else {
            console.log("get user data, No such document!");
            return null;
        }
    } catch (error) {
        console.log("Error getting user data:", error);
    }
}

//get post data from the database
export async function getPostData(postId) {
    try {
        const postDocRef = doc(database, 'posts', postId);
        const postSnapshot = await getDoc(postDocRef);

        if (postSnapshot.exists()) {
            const postData = postSnapshot.data();
            postData.id = postSnapshot.id;
            return postData;
        } else {
            console.log("get post data, No such document!");
            return null;
        }
    } catch (error) {
        console.log("Error getting post data:", error);
    }
}

//get data from the database by title keyword
export async function searchByTitleKeyword(keyword) {
    try{
        const activitiesRef = collection(database, 'posts');
        const q = query(activitiesRef, where('keywords', 'array-contains', keyword));
        const querySnapshot = await getDocs(q);

        const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return results;
    }
    catch (error) {
        console.log('search by title keyword', error);
    }
}

// Add a comment to a post
export async function addCommentToPost(postId, commentData) {
    try {
      // Reference the specific post document
      const postRef = doc(database, 'posts', postId);
      
      // Reference the 'comments' sub-collection within the post document
      const commentsRef = collection(postRef, 'comments');
      
      // Add the comment to the 'comments' sub-collection
      const commentDoc = await addDoc(commentsRef, {
        ...commentData,
        timestamp: new Date(), 
      });
      
      // Add the Firebase-generated document ID to the comment data
      const commentWithId = {
        ...commentData,
        id: commentDoc.id, 
        timestamp: new Date(),
      };
  
      console.log('Comment added with ID: ', commentDoc.id);
      return commentWithId;
    } catch (error) {
      console.error('Error adding comment: ', error);
    }
  }  

// Fetch comments from the "comments" sub-collection for a specific post
export async function fetchComments(postId) {
    try {
      //console.log('Fetching comments for post ID:', postId);
      const commentsRef = collection(doc(database, 'posts', postId), 'comments');
      const snapshot = await getDocs(commentsRef);
  
      // Map through each document to get its data
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return commentsData;
    } catch (error) {
      console.error("Error fetching comments: ", error);
    }
  }

  // Add or update a notification for a post
  export async function addOrUpdateNotification(postId, time, postData) {
    try {
        const userDocRef = doc(database, 'users', auth.currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            const notifications = userData.notifications || [];

            // Check if a notification for this postId already exists
            const existingNotification = notifications.find(notif => notif.postId === postId);

            if (existingNotification) {
                // If a notification exists, update the time
                await cancelNotification(existingNotification.notificationId);
                await updateDoc(userDocRef, {
                    notifications: arrayRemove(existingNotification)
                });

                // Schedule new notification
                const notificationId = await scheduleNotificationHandler(
                    postData.title,
                    postData.date,
                    postData.time,
                    time
                );

                if (notificationId) {
                    // Check scheduled notifications
                    const scheduledNotifications = await getAllScheduledNotifications();
                    console.log('Currently scheduled notifications:', scheduledNotifications);

                    const notificationData = {
                        postId,
                        time,
                        notificationId
                    };

                    await updateDoc(userDocRef, {
                        notifications: arrayUnion(notificationData)
                    });
                }  
                console.log("Notification time updated for post:", postId);
            } else {
                // If no existing notification, add a new one
                const notificationId = await scheduleNotificationHandler(
                    postData.title,
                    postData.date,
                    postData.time,
                    time
                );

                if (notificationId) {
                    // Check scheduled notifications
                    const scheduledNotifications = await getAllScheduledNotifications();
                    console.log('Currently scheduled notifications:', scheduledNotifications);

                    const notificationData = {
                        postId,
                        time,
                        notificationId
                    };

                    await updateDoc(userDocRef, {
                        notifications: arrayUnion(notificationData)
                    });
                }  
                console.log("New notification added for post:", postId);
            }
        } else {
            console.log("User document does not exist.");
        }
    } catch (error) {
        console.error("Error adding or updating notification:", error);
    }
  }

  // Delete a comment from the database
  export async function deleteComment(postId, commentId) {
    try {
      // Get reference to the comment in the subcollection
      const commentRef = doc(collection(database, 'posts', postId, 'comments'), commentId);
      
      // Delete the comment document
      await deleteDoc(commentRef);
      
      console.log(`Comment ${commentId} deleted successfully from post ${postId}`);
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }

  export function isFirebaseStorageUri (uri) {
    return uri && (uri.startsWith('images/'));
  };
  
  export async function fetchAndUploadImage(uri) {
    const response = await fetch(uri);
    try {
      
      if (!response.ok) {
        throw new Error('HTTP Error! Status: ' + response.status);
      }
      const blob = await response.blob();
      // let's upload blob to firebase storage
      const imageName = uri.substring(uri.lastIndexOf('/') + 1);
      const imageRef = ref(storage, `images/${imageName}`)
      const uploadResult = await uploadBytesResumable(imageRef, blob);
      console.log('upload result' + uploadResult);

      return uploadResult.ref.fullPath;
    } catch (err) {
      console.log(err);
    }
  }
  
  export async function fetchImageUrlFromDB(picturePath) {
    if (!picturePath) return null;
    try {
      const imageRef = ref(storage, picturePath);
      const url = await getDownloadURL(imageRef);
      return url;
    } catch (error) {
      console.error('Error fetching picture:', error);
      return null;
    }
  };

  // get username by userId
  export async function getUsernameById(userId) {
    try {
      const userData = await getUserData(userId);
      console.log("user data", userData)
      console.log("user name", userData?.name)
      return userData?.name
    } catch (error) {
      console.error("Error getting username:", error);
      return `User ${userId.slice(0, 4)}`;
    }
  }