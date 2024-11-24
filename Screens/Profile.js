import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { auth, database } from '../Firebase/firebaseSetup';
import { doc, onSnapshot } from 'firebase/firestore';
import {fetchImageUrlFromDB} from '../Firebase/firestoreHelper';
import PostsList from './PostsList';

// Create tab navigator
const Tab = createMaterialTopTabNavigator();

// Profile screen
export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState('');

  // Effect to set up the snapshot listener
  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    const userDocRef = doc(database, 'users', auth.currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef,async (userDoc) => {
      if (userDoc.exists()) {
        const data = userDoc.data(); // Define data here
        setUserData(data);

        if (data.picture && data.picture.startsWith('images/')) {
          try {
            const url = await fetchImageUrlFromDB(data.picture);
            setProfilePicUrl(url);
          } catch (error) {
            console.error('Error fetching profile picture:', error);
          }
        }

        console.log("profile results:", userDoc.data());
      }
    },(err) => console.error("profile results:", err));

    return () => unsubscribe();
  }, [auth.currentUser]);

  // If the user is not logged in, show a message
  if (!auth.currentUser) {
    return (
      <View style={styles.container}>
        <Text>Please log in to view your profile.</Text>
      </View>
    );
  }
  // If the user data is not loaded, show a loading message
  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image source={{ uri: profilePicUrl ? profilePicUrl : 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541' }} style={styles.profileImage} />
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.bio}>{userData.bio}</Text>
        <Text style={styles.info}>Gender: {userData.gender}</Text>
        <Text style={styles.info}>Joined: {userData.joined.length}</Text>
        <Text style={styles.info}>Posted: {userData.posts.length}</Text>
        {/* <Text style={styles.info}>Liked: {userData.favorites.length}</Text> */}
      </View>
      <View style={styles.tabContainer}>
        <Tab.Navigator>
          <Tab.Screen name="PostedPosts" options={{ title: 'Posted Posts' }}>
            {() => <PostsList  postIds={userData.posts} />}
          </Tab.Screen>
          <Tab.Screen name="LikedPosts" options={{ title: 'Liked Posts' }}>
            {() => <PostsList postIds={userData.favorites} />}
          </Tab.Screen>
        </Tab.Navigator>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bio: {
    fontSize: 16,
    marginBottom: 5,
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
  },
  tabContainer: {
    flex: 1,
  },
});