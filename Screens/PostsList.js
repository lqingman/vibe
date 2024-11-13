import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { auth, database } from '../Firebase/firebaseSetup';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import ActivityCard from '../Components/ActivityCard';
import { useNavigation } from '@react-navigation/native';
import { deleteArrayField } from '../Firebase/firestoreHelper';


export default function PostsList({ dataSource }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let postIds = [];
      const userDocRef = doc(database, 'users', auth.currentUser.uid);

      const unsubscribeUser = onSnapshot(userDocRef, async (userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (dataSource === 'posted') {
            postIds = userData.posts || [];
          } else if (dataSource === 'liked') {
            postIds = userData.favorites || [];
          }

          if (postIds.length > 0) {
            const q = query(collection(database, 'posts'), where('__name__', 'in', postIds));
            const unsubscribePosts = onSnapshot(q, async (querySnapshot) => {
              const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setPosts(postsData);

            //   // Cleanup invalid post IDs
            //   const validPostIds = new Set(postsData.map(post => post.id));
            //   const invalidPostIds = postIds.filter(postId => !validPostIds.has(postId));
            //   if (invalidPostIds.length > 0) {
            //     await Promise.all(invalidPostIds.map(postId => deleteArrayField(auth.currentUser.uid, 'favorites', postId)));
            //   }



              setLoading(false);
            });

            return () => unsubscribePosts();
          } else {
            setPosts([]);
            setLoading(false);
          }
        }
      });

      return () => unsubscribeUser();
    };

    fetchData();
  }, [dataSource]);


  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
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