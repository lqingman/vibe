// import { View, Text, FlatList } from 'react-native'
// import React, { useEffect, useState } from 'react'
// import ActivityCard from '../Components/ActivityCard';
// import { getPostData } from '../Firebase/firestoreHelper';
// import { useJoined } from '../JoinedContext';

// export default function Joined({navigation}) {
//   // const [joinedActivities, setJoinedActivities] = useState([]);
//   const [postData, setPostData] = useState([]);
//   const { joinedActivities } = useJoined();
//   console.log("Joined activities:", joinedActivities);

//   //Fetch post data for each joined activity
//   useEffect(() => {
//     if (joinedActivities.length > 0) {
//       async function fetchPostData() {
//         try {
//           const posts = await Promise.all(
//             joinedActivities.map(async (id) => {
//               const post = await getPostData(id);
//               return post;
//             })
//           );
//           setPostData(posts);
//         } catch (error) {
//           console.error("Error fetching post data:", error);
//         }
//       }

//       fetchPostData();
//     }
//   }, [joinedActivities]); 

//   return (
//     <View>
//       {joinedActivities.length === 0 ? (
//         <Text>No joined activities</Text>
//       ) : (
//         <FlatList
//           data={postData}
//           renderItem={({ item }) => <ActivityCard data={item} 
//           onPress={() => { console.log('item', item); navigation.navigate('Details', {activity: item}) }}
//           />}
//           keyExtractor={(item) => item.id}
//         />
//       )}
//     </View>
//   )
// }
import { View, Text, FlatList, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import ActivityCard from '../Components/ActivityCard';
import { getPostData } from '../Firebase/firestoreHelper';
import { auth, database } from '../Firebase/firebaseSetup';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Joined({navigation}) {
  const [postData, setPostData] = useState([]);
  const [joinedActivities, setJoinedActivities] = useState([]);

  // Listen for changes to the joined activities in real-time
  useEffect(() => {
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
        console.error("Error fetching user data:", error);
      }
    );

    // Cleanup on unmount
    return () => unsubscribe();
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
                console.log('item', item);
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
