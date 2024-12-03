import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getPostData } from '../Firebase/firestoreHelper';
import { auth, database } from '../Firebase/firebaseSetup';
import { doc, onSnapshot } from 'firebase/firestore';
import LottieView from "lottie-react-native";
import TimeLine from '../Components/TimeLine';
import Style from '../Styles/Style';

// Display the activities that the user has joined
export default function Joined() {
  const [postData, setPostData] = useState([]);
  const [joinedActivities, setJoinedActivities] = useState([]);

  // Listen for changes to the joined activities in real-time
  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    const unsubscribe = onSnapshot(
      doc(database, 'users', auth.currentUser.uid),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setJoinedActivities(userData.joined || []);
        } else {
          setJoinedActivities([]);
        }
      },
      (error) => {
        console.error("Error Joined:", error);
      }
    );

    // Cleanup on unmount
    return () => unsubscribe();
  }, [auth.currentUser]);

  // Fetch post data for each joined activity
  useEffect(() => {
    if (joinedActivities.length > 0) {
      async function fetchPostData() {
        try {
          const posts = await Promise.all(
            joinedActivities.map(async (id) => {
              const post = await getPostData(id);
              return post;
            })
          );
          setPostData(posts.filter(post => post !== null));
        } catch (error) {
          console.error("Error fetching post data:", error);
        }
      }

      fetchPostData();
    }
  }, [joinedActivities]);

  // If the user is not logged in, show a message
  if (!auth.currentUser) {
    return (
      <View style={Style.container}>
        <Text>Please log in to view your joined activities.</Text>
      </View>
    );
  }

  return (
      <View style={Style.container}>
      {joinedActivities.length === 0 ? (
        <View style={{
          flex: 1,
          alignItems: 'center',
          paddingTop: 60,
        }}>
          <Text style={Style.noJoinedText}>No joined activities.</Text>
          <Text style={Style.noJoinedText}>Explore to find more!</Text>
          <LottieView 
            source={require('../assets/Animation - arrow.json')} 
            style={Style.arrowLottie}
            autoPlay 
            loop
          />
          <LottieView 
            source={require('../assets/Animation - no joined.json')} 
            style={Style.noJoinedLottie}
            autoPlay 
            loop={false}
          />
        </View>
      ) : (
        <TimeLine data={postData} />
      )
      }
    </View>
  );
}