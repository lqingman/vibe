import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserData } from './Firebase/firestoreHelper';
import { auth } from './Firebase/firebaseSetup';

const JoinedContext = createContext();

export function useJoined() {
  return useContext(JoinedContext);
}

export function JoinedProvider({ children }) {
  const [joinedActivities, setJoinedActivities] = useState([]);

  // Fetch user data and update the joined activities
  useEffect(() => {
    async function fetchJoinedActivities() {
      try {
        const user = await getUserData(auth.currentUser.uid);
        if (user && user.joined) {
          setJoinedActivities(user.joined);
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    }

    fetchJoinedActivities();
    console.log('Joined activities:', joinedActivities);
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
