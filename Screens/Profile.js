import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { auth, database } from '../Firebase/firebaseSetup';
import { doc, onSnapshot } from 'firebase/firestore';
import PostsList from './PostsList';

const Tab = createMaterialTopTabNavigator();

export default function Profile() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userDocRef = doc(database, 'users', auth.currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (userDoc) => {
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    });

    return () => unsubscribe();
  }, []);

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
        <Image source={{ uri: userData.picture }} style={styles.profileImage} />
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
            {() => <PostsList dataSource="posted" />}
          </Tab.Screen>
          <Tab.Screen name="LikedPosts" options={{ title: 'Liked Posts' }}>
            {() => <PostsList dataSource="liked" />}
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