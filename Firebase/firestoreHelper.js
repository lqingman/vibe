import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc, arrayUnion, setDoc, getDoc, query, where, arrayRemove } from "firebase/firestore";
import { database } from "./firebaseSetup";


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

export async function updateArrayField(collectionName, documentId, field, value) {
    try {
        const userDocRef = doc(database, collectionName, documentId);
        await updateDoc(userDocRef, {
            [field]: arrayUnion(value)
        });
    } catch (err) {
        console.error(`Error updating ${field} for document ${documentId}:`, err);
        throw err;
    }
}

export async function deleteArrayField(collectionName, documentId, field, value) {
    try {
        const userDocRef = doc(database, collectionName, documentId);
        await updateDoc(userDocRef, {
            [field]: arrayRemove(value)
        });
    } catch (err) {
        console.error(`Error deleting ${field} for document ${documentId}:`, err);
        throw err;
    }
}

export async function updateUserProfile(userId, updatedData) {
    try {
        const userDocRef = doc(database, 'users', userId);
        await updateDoc(userDocRef, updatedData);
    } catch (err) {
        console.error(`Error updating profile for user ${userId}:`, err);
        throw err;
    }
}

export async function updatePost(postId, updatedData) {
    try {
        const postDocRef = doc(database, 'posts', postId);
        await updateDoc(postDocRef, updatedData);
    } catch (err) {
        console.error(`Error updating post ${postId}:`, err);
        throw err;
    }
}

export async function deletePost(postId, userId) {
    try {
        const postDocRef = doc(database, 'posts', postId);
        await deleteDoc(postDocRef);
        await deleteArrayField(userId, 'posts', postId);
    } catch (err) {
        console.error(`Error deleting post ${postId}:`, err);
        throw err;
    }
}

export async function deleteFromDB(id, collectionName) {
    try { 
        await deleteAllFromDB('goals/' + id + '/users');
        await deleteDoc(doc(database, collectionName, id));
      
    }
    catch (err) {
      console.log(err)
    }
  }

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
                data.push(docSnapshot.data());
            });
        }
        return data;
    } catch (err) {
        console.log(err);
    }
}

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

export async function addCommentToPost(postId, commentData) {
    try {
      // Reference the specific post document
      const postRef = doc(database, 'posts', postId);
      
      // Reference the 'comments' sub-collection within the post document
      const commentsRef = collection(postRef, 'comments');
      
      // Add the comment to the 'comments' sub-collection
      const commentDoc = await addDoc(commentsRef, {
        ...commentData,
        timestamp: new Date(), // Add timestamp for when comment was added
      });
      
      // Add the Firebase-generated document ID to the comment data
      const commentWithId = {
        ...commentData,
        id: commentDoc.id, // Set the 'id' field to the generated doc ID
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
  