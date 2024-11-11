import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { auth, database } from '../Firebase/firebaseSetup';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import ActivityCard from '../Components/ActivityCard';
import { useNavigation } from '@react-navigation/native';


export default function PostsList({ dataSource }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      let q;
      if (dataSource === 'posted') {
        q = query(collection(database, 'posts'), where('owner', '==', auth.currentUser.uid));
      } else if (dataSource === 'liked') {
        const userDocRef = doc(database, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const favorites = userData.favorites || [];
          if (favorites.length > 0) {
            console.log('Favorites found:', favorites);
            q = query(collection(database, 'posts'), where('__name__', 'in', favorites));
            console.log('Query:', q);
          } else {
            console.log('No favorites found');
          }
        }
      }
      if (q) {
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(postsData);
      }
      setLoading(false);
    };

    fetchPosts();
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