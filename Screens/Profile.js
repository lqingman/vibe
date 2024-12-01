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
export default function Profile({ route }) {
  const [userData, setUserData] = useState(null);
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
        const data = userDoc.data(); // Define data here
        setUserData(data);

        if (data.picture && data.picture.length > 0 && data.picture[0].startsWith('images/')) {
          try {
            const url = await fetchImageUrlFromDB(data.picture[0]);
            setProfilePicUrl(url);
          } catch (error) {
            console.error('Error fetching profile picture:', error);
          }
        }

        console.log("profile results:", userDoc.data());
      }
    },(err) => console.error("profile results:", err));

    return () => unsubscribe();
  }, [userId]);

  // If the user is not logged in, show a message
  if (!userId) {
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
        <View style={{ flex: 1 }}>
        <Text style={styles.name}>{userData.name}</Text>
        {userData.gender && <Text style={styles.info}>{userData.gender}</Text>}
        <Text style={styles.info}>{userData.bio?userData.bio:'Bio coming soon...'}</Text>
        
        <Text style={styles.info}>Joined: {userData.joined.length}   Posted: {userData.posts.length}</Text>

        </View>
      </View>
      
      <View style={styles.tabContainer}>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: styles.tabBar,
            tabBarIndicatorStyle: styles.tabBarIndicator,
            tabBarLabelStyle: styles.tabBarLabel,
          }}
        >
          <Tab.Screen name="PostedPosts" options={{ title: 'Posted' }}>
            {() => <PostsList  postIds={userData.posts} />}
          </Tab.Screen>
          <Tab.Screen name="LikedPosts" options={{ title: 'Liked' }}>
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
    flexDirection: 'row',
    marginBottom: 10,
    gap: 20,
    padding: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
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
    color: 'gray',
  },
  tabContainer: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: 'white',
    borderRadius: 10,
  },
  tabBarIndicator: {
    backgroundColor: '#363678',
    height: 5,
    borderRadius: 3,
  },
  tabBarLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#363678',
  },
});