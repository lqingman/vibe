import React, { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { auth, database } from '../Firebase/firebaseSetup';
import { doc, onSnapshot } from 'firebase/firestore';
import {fetchImageUrlFromDB} from '../Firebase/firestoreHelper';
import PostsList from './PostsList';
import Style from '../Styles/Style';

// Create tab navigator
const Tab = createMaterialTopTabNavigator();

// Profile screen
export default function Profile({ route }) {
  // State for user data
  const [userData, setUserData] = useState(null);
  // State for profile picture URL
  const [profilePicUrl, setProfilePicUrl] = useState('');
  // Get userId from route params, fallback to current user's ID if not provided
  const userId = route.params?.userId || auth.currentUser?.uid;

  // Effect to set up the snapshot listener
  useEffect(() => {
    if (!userId) {
      return;
    }
    const userDocRef = doc(database, 'users', userId);
    const unsubscribe = onSnapshot(userDocRef,async (userDoc) => {
      if (userDoc.exists()) {
        const data = userDoc.data(); 
        setUserData(data);

        if (data.picture && data.picture.length > 0 && data.picture[0].startsWith('images/')) {
          try {
            const url = await fetchImageUrlFromDB(data.picture[0]);
            setProfilePicUrl(url);
          } catch (error) {
            console.error('Error fetching profile picture:', error);
          }
        } else {
          setProfilePicUrl('');
        }

        console.log("profile results:", userDoc.data());
      }
    },(err) => console.error("profile results:", err));

    return () => unsubscribe();
  }, [userId]);

  // If the user is not logged in, show a message
  if (!userId) {
    return (
      <View style={Style.container}>
        <Text>Please log in to view your profile.</Text>
      </View>
    );
  }
  // If the user data is not loaded, show a loading message
  if (!userData) {
    return (
      <View style={Style.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={Style.container}>
      <View style={Style.profileContainer}>
        <Image source={{ uri: profilePicUrl ? profilePicUrl : 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541' }} style={Style.profileImage} />
        <View style={{ flex: 1 }}>
        <Text style={Style.profileName}>{userData.name}</Text>
        {userData.gender && <Text style={Style.profileInfo}>{userData.gender}</Text>}
        <Text style={Style.profileInfo}>{userData.bio?userData.bio:'Bio coming soon...'}</Text>
        
        <Text style={Style.profileInfo}>Joined: {userData.joined.length}   Posted: {userData.posts.length}</Text>

        </View>
      </View>
      
      <View style={{flex:1}}>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: Style.profileTabBar,
            tabBarIndicatorStyle: Style.profileTabBarIndicator,
            tabBarLabelStyle: Style.profileTabBarLabel,
          }}
        >
          <Tab.Screen name="PostedPosts" options={{ title: 'Posted' }}>
            {() => <PostsList  postIds={userData.posts} title={'posted'}/>}
          </Tab.Screen>
          <Tab.Screen name="LikedPosts" options={{ title: 'Liked' }}>
            {() => <PostsList postIds={userData.favorites} title={'liked'} />}
          </Tab.Screen>
        </Tab.Navigator>
      </View>
    </View>
  );
}