import { View, Text, FlatList, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import ActivityCard from '../Components/ActivityCard';
import { getPostData } from '../Firebase/firestoreHelper';
import { auth, database } from '../Firebase/firebaseSetup';
import { doc, onSnapshot } from 'firebase/firestore';

// Display the activities that the user has joined
export default function Joined({navigation}) {
  const [postData, setPostData] = useState([]);
  const [joinedActivities, setJoinedActivities] = useState([]);

  // Listen for changes to the joined activities in real-time
  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    const unsubscribe = onSnapshot(
      doc(database, 'users', auth.currentUser.uid), // Reference to the user's document in the 'users' collection
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setJoinedActivities(userData.joined || []);
        } else {
          setJoinedActivities([]); // No data for this user
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
      <View style={styles.container}>
        <Text>Please log in to view your joined activities.</Text>
      </View>
    );
  }

  return (
    <View>
      {joinedActivities.length === 0 ? (
        <View style={styles.container}>
          <Text style={styles.text}>No joined activities!</Text>
          <Text style={styles.text}>Explore to find more!</Text>
        </View>
      ) : (
        <FlatList
          data={postData}
          renderItem={({ item }) => (
            <ActivityCard
              data={item}
              onPress={() => {
                //console.log('item', item);
                navigation.navigate('Details', { activity: item });
              }}
            />
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 20,
    color: 'black',
  },
})
