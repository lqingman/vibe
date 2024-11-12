import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserData } from './Firebase/firestoreHelper';
import { auth, database } from './Firebase/firebaseSetup';
import { doc, onSnapshot } from 'firebase/firestore';

const JoinedContext = createContext();

export function useJoined() {
  return useContext(JoinedContext);
}

export function JoinedProvider({ children }) {
  const [joinedActivities, setJoinedActivities] = useState([]);

  // Fetch user data and update the joined activities
  // useEffect(() => {
  //   async function fetchJoinedActivities() {
  //     try {
  //       const user = await getUserData(auth.currentUser.uid);
  //       if (user && user.joined) {
  //         setJoinedActivities(user.joined);
  //       }
  //     } catch (error) {
  //       console.log('Error fetching user data:', error);
  //     }
  //   }

  //   fetchJoinedActivities();
  //   console.log('Joined activities:', joinedActivities);
  // }, []);
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(database, 'users', auth.currentUser.uid),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setJoinedActivities(userData.joined || []);
        }
      }
    );
  
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const updateJoinedStatus = (activityId, isJoining) => {
    if (isJoining) {
      setJoinedActivities(prev => [...prev, activityId]);
    } else {
      setJoinedActivities(prev => prev.filter(id => id !== activityId));
    }
  };

  return (
    <JoinedContext.Provider value={{ joinedActivities, updateJoinedStatus }}>
      {children}
    </JoinedContext.Provider>
  );
}
