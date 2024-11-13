import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserData, updateArrayField } from './Firebase/firestoreHelper';
import { auth, database } from './Firebase/firebaseSetup';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const JoinedContext = createContext();

export function useJoined() {
  return useContext(JoinedContext);
}

export function JoinedProvider({ children }) {
  const [joinedActivities, setJoinedActivities] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Listen for changes in the user's authentication state
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);

        // Start listening to joined activities once the user is authenticated
        const unsubscribeFirestore = onSnapshot(
          doc(database, 'users', user.uid),
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const userData = docSnapshot.data();
              setJoinedActivities(userData.joined || []);
            }
          }
        );

        // Clean up the Firestore listener when the component unmounts or user logs out
        return () => unsubscribeFirestore();
      } else {
        // User is logged out, clear joined activities
        setJoinedActivities([]);
        setUserId(null);
      }
    });

    // Cleanup auth listener on component unmount
    return () => unsubscribeAuth();
  }, []);

  const updateJoinedStatus = async (activityId, isJoining) => {
    if (!userId) return; // Ensure there is a user before updating

    try {
      setJoinedActivities((prev) => {
        const updatedJoined = isJoining
          ? [...prev, activityId]
          : prev.filter((id) => id !== activityId);

        // Write changes to Firebase
        updateArrayField('users', userId, 'joined', updatedJoined);
        return updatedJoined;
      });
    } catch (error) {
      console.log('Error updating joined status:', error);
    }
  };

  return (
    <JoinedContext.Provider value={{ joinedActivities, updateJoinedStatus }}>
      {children}
    </JoinedContext.Provider>
  );
}