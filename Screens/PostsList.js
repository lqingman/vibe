import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { auth, database } from '../Firebase/firebaseSetup';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { deleteArrayField } from '../Firebase/firestoreHelper';
import ExploreList from '../Components/ExploreList';
import Style from '../Styles/Style';
import LottieView from "lottie-react-native";

// My posts screen
export default function PostsList({ postIds, title }) {
  // State for posts
  const [posts, setPosts] = useState([]);
  // Navigation
  const navigation = useNavigation();
  // Get the animation source
  const getAnimationSource = (title) => {
    switch (title) {
      case 'posted':
        return require('../assets/posted.json');
      case 'liked':
        return require('../assets/liked.json');
    }
  };

  // Fetch the posts
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

  // If the user is not logged in, return a message
  if (!auth.currentUser) {
    return (
      <View style={Style.container}>
        <Text>Please log in to view your posts.</Text>
      </View>
    );
  }

  return (
    <View style={[Style.container, {paddingTop: 3}]}>
      {/* <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ActivityCard data={item} onPress={() => navigation.navigate('Details', { activity: item })}/>
          

        )}
        ListEmptyComponent={<Text>No posts found</Text>}
      /> */}
      {posts.length === 0 && 
      <>
      <LottieView 
      source={getAnimationSource(title)} 
      style={{ width: 200,
        height: 200,
        alignSelf: 'center',}}
      autoPlay 
      loop
    />
    <Text style={[Style.slogan, {color:'lightgray', padding: 20, marginTop: 10}]}>You haven't {title} any posts yet.</Text>
    </>}
      <ExploreList list={posts} />

    </View>
  );
}