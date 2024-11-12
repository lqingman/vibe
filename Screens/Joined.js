import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import ActivityCard from '../Components/ActivityCard';
import { getPostData, getUserData } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import { useJoined } from '../JoinedContext';

export default function Joined({navigation}) {
  // const [joinedActivities, setJoinedActivities] = useState([]);
  const [postData, setPostData] = useState([]);
  const { joinedActivities } = useJoined();
  console.log("Joined activities:", joinedActivities);

  // // get user data and joined activities
  // useEffect(() => {
  //   async function fetchJoined() {
  //     try {
  //       const user = await getUserData(auth.currentUser.uid);
  //       if (user && user.joined) {
  //         setJoinedActivities(user.joined);
  //       }
  //     } catch (error) {
  //       console.log("Error fetching user data:", error);
  //     }
  //   }

  //   fetchJoined();
  // }, []);

  //Fetch post data for each joined activity
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
      {joinedActivities.length === 0 ? (
        <Text>No joined activities</Text>
      ) : (
        <FlatList
          data={postData}
          renderItem={({ item }) => <ActivityCard data={item} 
          onPress={() => { console.log('item', item); navigation.navigate('Details', {activity: item}) }}
          />}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  )
}
