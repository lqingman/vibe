import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc, arrayUnion, setDoc, getDoc, query, where, arrayRemove } from "firebase/firestore";
import { auth, database } from "./firebaseSetup";

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

// Delete a post from the database
export async function deletePost(postId, userId) {
    try {
        const postDocRef = doc(database, 'posts', postId);
        await deleteDoc(postDocRef);
        // await deleteArrayField('users', userId, 'posts', postId);
        const userDocRef = doc(database, 'users', userId);

        await updateDoc(userDocRef, {
            posts: arrayRemove(postId)
        });

    } catch (err) {
        console.error(`Error deleting post ${postId}:`, err);
        throw err;
    }
}

// Delete a goal from the database
export async function deleteFromDB(id, collectionName) {
    try { 
        await deleteAllFromDB('goals/' + id + '/users');
        await deleteDoc(doc(database, collectionName, id));
      
    }
    catch (err) {
      console.log(err)
    }
  }

  // Delete all documents from a collection
export async function deleteAllFromDB(collectionName) {
    try {
        // get all the docs from the collection
        const quereySnapshot = await getDocs(collection(database, collectionName));
        // delete each doc
        quereySnapshot.forEach((docSnapshot) => {
            deleteDoc(doc(database, collectionName, docSnapshot.id));
            
        });
    } catch (err) {
        console.log(err);
    }
}

export async function updateGoalWarning(id, collectionName) {
    try {
        const goalDoc = doc(database, collectionName, id);
        await updateDoc(goalDoc, { warning: true });
    } catch (err) {
        console.log('Error updating goal warning: ', err);
    }
}

export async function getAllDocuments(collectionName) {
    try {
        const quereySnapshot = await getDocs(collection(database, collectionName));
        const data = [];
        if (!quereySnapshot.empty) {
            quereySnapshot.forEach((docSnapshot) => {
              data.push({
                id: docSnapshot.id, // Add the document ID
                ...docSnapshot.data(), // Add the document data
              });
            });
        }
        return data;
    } catch (err) {
        console.log(err);
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
            console.log("No such document!");
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
            console.log("No such document!");
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
      console.log('Fetching comments for post ID:', postId);
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
  export async function addOrUpdateNotification(postId, time) {
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
                await updateDoc(userDocRef, {
                    notifications: arrayRemove(existingNotification)
                });

                const updatedNotification = { ...existingNotification, time };
                await updateDoc(userDocRef, {
                    notifications: arrayUnion(updatedNotification)
                });
                console.log("Notification time updated for post:", postId);
            } else {
                // If no existing notification, add a new one
                const newNotification = { postId, time };
                await updateDoc(userDocRef, {
                    notifications: arrayUnion(newNotification)
                });
                console.log("New notification added for post:", postId);
            }
        } else {
            console.log("User document does not exist.");
        }
    } catch (error) {
        console.error("Error adding or updating notification:", error);
    }
  }
  