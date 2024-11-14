import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { auth, database } from '../Firebase/firebaseSetup';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import ActivityCard from '../Components/ActivityCard';
import { useNavigation } from '@react-navigation/native';
import { deleteArrayField } from '../Firebase/firestoreHelper';


export default function PostsList({ postIds }) {
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();
  useEffect(() => {
    if (!auth.currentUser || !postIds || postIds.length === 0) {
      setPosts([]);
      return;
    }

    const fetchPosts = async () => {
      try {
        const postsData = await Promise.all(
          postIds.map(async (postId) => {
            const postDocRef = doc(database, 'posts', postId);
            const postDoc = await getDoc(postDocRef);
            if (postDoc.exists()) {
              return { id: postDoc.id, ...postDoc.data() };
            } else {
              // If the post does not exist, remove it from the user's favorites or joined list
              await deleteArrayField('users', auth.currentUser.uid, 'favorites', postId);
              return null;
            }
          })
        );
        setPosts(postsData.filter(post => post !== null));
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [postIds]);
  if (!auth.currentUser) {
    return (
      <View style={styles.container}>
        <Text>Please log in to view your posts.</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ActivityCard data={item} onPress={() => navigation.navigate('Details', { activity: item })}/>
        )}
        ListEmptyComponent={<Text>No posts found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});