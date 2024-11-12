import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import ActivityCard from '../Components/ActivityCard';
import { getPostData, getUserData } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';

export default function Joined() {
  const [joinedActivities, setJoinedActivities] = useState([]);
  const [postData, setPostData] = useState([]);

  // get user data and joined activities
  useEffect(() => {
    async function fetchJoined() {
      try {
        const user = await getUserData(auth.currentUser.uid);
        if (user && user.joined) {
          setJoinedActivities(user.joined);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    }

    fetchJoined();
  }, []);

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
          setPostData(posts);
        } catch (error) {
          console.error("Error fetching post data:", error);
        }
      }

      fetchPostData();
    }
  }, [joinedActivities]); 

  return (
    <View>
      {joinedActivities.length === 0 ? <Text>No joined activities</Text> :
        <FlatList
          data={postData}
          renderItem={({ item }) => (
            <ActivityCard data={item} />
          )}
          keyExtractor={item => item.id}
        />
      }
    </View>
  )
}
