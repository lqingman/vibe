import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc } from "firebase/firestore";
import { database } from "./firebaseSetup";

export async function writeToDB(data, collectionName) {
    try {
        
        const docRef = await addDoc(collection(database, collectionName), data);
    }
    catch (err) {
       console.log('write to db ', err)
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