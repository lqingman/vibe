import { View, Text, Image, StyleSheet, FlatList, ScrollView, Pressable, TextInput } from 'react-native'
import React, { useEffect, useLayoutEffect } from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import CusPressable from '../Components/CusPressable';
import { addCommentToPost, deleteArrayField, fetchComments, getUserData, updateArrayField } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import { useState } from 'react';
import StaticDetail from '../Components/StaticDetail';
import JoinOptions from '../Components/JoinOptions';


export default function Details({route, navigation}) {
  const data = route.params.activity
  const [joined, setJoined] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [numAttendees, setNumAttendees] = useState(data.attendee.length);
  console.log("details", data)

  // Function to check if the user has joined the activity
  useEffect(() => {
    async function checkJoined() {
      try {
        const user = await getUserData(auth.currentUser.uid);
        if (user && user.joined && user.joined.includes(data.id)) {
          setJoined(true);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    }

    checkJoined();
  }, [data.id]);

  useEffect(() => {
    async function loadComments() {
      try {
        const commentsData = await fetchComments(data.id);
        setComments(commentsData);
      } catch (error) {
        console.error("Error loading comments: ", error);
    }
  }

    loadComments();
    console.log('Comments:', comments);
  }, [data.id]);
  
  useLayoutEffect(() => {
    if (auth.currentUser.uid === data.owner) {
      navigation.setOptions({
        headerRight: () => (
          <Pressable onPress={() => navigation.navigate('CreatePost', { post: data })}>
            <FontAwesome5 name="edit" size={24} color="white" style={{ marginRight: 15 }} />
          </Pressable>
        ),
      });
    }
  }, [navigation, data]);

  function handleJoinPress() {
    if (joined) {
      deleteArrayField('users', auth.currentUser.uid, 'joined', data.id);
      deleteArrayField('posts', data.id, 'attendee', auth.currentUser.uid);
      setNumAttendees(numAttendees - 1);
    } else {
      updateArrayField('users', auth.currentUser.uid, 'joined', data.id);
      updateArrayField('posts', data.id, 'attendee', auth.currentUser.uid);
      setNumAttendees(numAttendees + 1);
    }
    setJoined(!joined);
  }

  function updateComments(newComment) {
    setComments([...comments, newComment]);
  }

  return (
    // <View style={styles.container}>
    //   <ScrollView 
    //     style={styles.container}
    //     showsVerticalScrollIndicator={false} // Hides vertical scroll bar
    //     showsHorizontalScrollIndicator={false} // Hides horizontal scroll bar
    //   >
    //     <Image style={styles.image} source={{uri: data.image}} />
    //     <View style={styles.titleView}>
    //       <Text style={styles.titleText}>{data.title}</Text>
    //     </View>
    //     <View style={styles.dateView}>
    //       <FontAwesome name="calendar" size={24} color="purple" />
    //       <Text style={styles.dateText}>{data.date}</Text>
    //     </View>
    //     <View style={styles.timeView}>
    //       <FontAwesome5 name="clock" size={24} color="purple" />
    //       <Text style={styles.timeText}>{data.time}</Text>
    //     </View>
    //     <View style={styles.locationView}>
    //       <Entypo name="location-pin" size={24} color="purple" />
    //       <Text style={styles.locationText}>{data.location}</Text>
    //     </View>
    //     <View style={styles.descriptionView}>
    //     <MaterialIcons name="description" size={24} color="purple" />
    //       <Text style={styles.descriptionText}>{data.description}Ready to elevate your game and meet fellow tennis enthusiasts? Whether you're a beginner looking to practice your serve or an advanced player aiming for some friendly competition, our tennis meetup is the perfect opportunity to connect, play, and improve!</Text>
    //     </View>
    //     <View style={styles.mapView}>
    //       <Image style={styles.map} source={{uri: "https://external-preview.redd.it/map-of-downtown-vancouver-made-with-google-maps-v0-fLegPkDqPZKO5HoxStTdgxFlXaYuKRdeF5nef2KW-Vs.png?auto=webp&s=d33e7ede6777994dccc9c940d0a478b866e6cb72"}} />
    //     </View>
    //     <View style={styles.commentView}>
    //       <Text style={styles.commentText}>Comments</Text>
    //       <View style={styles.commentButtonContainer}>
    //       <TextInput 
    //         style={styles.commentInput} 
    //         placeholder="Add a comment..." 
    //         value={comment}
    //         onChangeText={setComment}
    //         />
    //       <CusPressable
    //         componentStyle={{
    //           width: '30%',
    //           alignSelf: 'center',
    //           justifyContent: 'center',
    //           marginLeft: 10,
    //         }}
    //         childrenStyle={{
    //           padding: 10,
    //           backgroundColor: 'purple',
    //           borderRadius: 10,
    //           alignItems: 'center',
    //         }}
    //         pressedHandler={handleAddComment}
    //       >
    //         <Text style={styles.joinButtonText}>Comment</Text>
    //       </CusPressable>
    //       </View>
    //       <FlatList
    //         data={data.comments}
    //         keyExtractor={(item) => item.id}
    //         renderItem={({ item }) => (
    //           <View style={styles.comment}>
    //             <Text style={styles.commentText}>{item.text}</Text>
    //           </View>
    //         )}
    //     />
    //     </View>
    //   </ScrollView>
    //   {joined ?
    //   <View style={styles.leaveView}>
    //     <CusPressable
    //       componentStyle={{
    //         width: '50%',
    //         alignSelf: 'center',
    //         justifyContent: 'center',
    //         marginLeft: 30,
    //       }}
    //       childrenStyle={{
    //         flexDirection: 'row',
    //         padding: 10,
    //         backgroundColor: 'purple',
    //         borderRadius: 10,
    //         alignItems: 'center',
    //         justifyContent: 'center',
    //       }}
    //       pressedHandler={handleJoinPress}
    //     >
    //       <Text style={styles.joinButtonText}>Leave Event!</Text>
    //     </CusPressable>
    //     <CusPressable
    //       componentStyle={{
    //         width: '20%',
    //         justifyContent: 'center',
    //         marginLeft: 10,
    //       }}
    //       childrenStyle={{
    //         padding: 10,
    //         //backgroundColor: 'purple',
    //         borderRadius: 10,
    //         alignItems: 'center',
    //       }}
    //       pressedHandler={() => console.log('Pressed')}
    //     >
    //       <Ionicons name="notifications" size={30} color="purple" />
    //     </CusPressable>
    //   </View>
    //   :
    //   <View style={styles.joinView}>
    //     <CusPressable
    //       componentStyle={{
    //         width: '50%',
    //         alignSelf: 'center',
    //         justifyContent: 'center',
    //       }}
    //       childrenStyle={{
    //         padding: 10,
    //         backgroundColor: 'purple',
    //         borderRadius: 10,
    //         alignItems: 'center',
    //       }}
    //       pressedHandler={handleJoinPress}
    //     >
    //       <Text style={styles.joinButtonText}>Join Event</Text>
    //     </CusPressable>
    //   </View>
    //   }
    // </View>
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Text style={styles.commentText}>User {item.owner}:</Text>
            <Text style={styles.commentText}>{item.text}</Text>
          </View>
        )}
        ListHeaderComponent={<StaticDetail data={data} updateComments={updateComments} numAttendees={numAttendees}/>}
        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
        extraData={comments}
      />
      {joined ?
      <View style={styles.leaveView}>
        <CusPressable
          componentStyle={{
            width: '50%',
            alignSelf: 'center',
            justifyContent: 'center',
            marginLeft: 30,
          }}
          childrenStyle={{
            flexDirection: 'row',
            padding: 10,
            backgroundColor: 'purple',
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          pressedHandler={handleJoinPress}
        >
          <Text style={styles.joinButtonText}>Leave Event!</Text>
        </CusPressable>
        <CusPressable
          componentStyle={{
            width: '20%',
            justifyContent: 'center',
            marginLeft: 10,
          }}
          childrenStyle={{
            padding: 10,
            //backgroundColor: 'purple',
            borderRadius: 10,
            alignItems: 'center',
          }}
          pressedHandler={() => console.log('Pressed')}
        >
          <Ionicons name="notifications" size={30} color="purple" />
        </CusPressable>
      </View>
      :
      <View style={styles.joinView}>
        <CusPressable
          componentStyle={{
            width: '50%',
            alignSelf: 'center',
            justifyContent: 'center',
          }}
          childrenStyle={{
            padding: 10,
            backgroundColor: 'purple',
            borderRadius: 10,
            alignItems: 'center',
          }}
          pressedHandler={handleJoinPress}
        >
          <Text style={styles.joinButtonText}>Join Event</Text>
        </CusPressable>
      </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginBottom: 10,
  },
  dateView: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
  },
  timeView: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 10,
    fontSize: 16,
  },
  locationView: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 10,
    fontSize: 16,
  },
  descriptionView: {
    marginVertical: 10,
    flexDirection: 'row',
    //alignItems: 'center',
  },
  descriptionText: {
    marginLeft: 10,
    fontSize: 16,
    width: '90%',
  },
  titleView: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mapView: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '90%',
    height: 200,
    borderRadius: 16,
    marginBottom: 30,
  },
  joinView: {
    position: 'absolute',
    bottom: 10,
    width: '110%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderTopColor: 'lightgrey',
    borderTopWidth: 1,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 18,
  },
  leaveView: {
    position: 'absolute',
    bottom: 10,
    width: '110%',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: 'white',
    borderTopColor: 'lightgrey',
    borderTopWidth: 1,
  },
  commentView: {
    marginVertical: 10,
    marginBottom: 100,
  },
  commentText: {
    marginLeft: 10,
    fontSize: 16,
  },
  commentInput: {
    width: '70%',
    height: 50,
    padding: 10,
    backgroundColor: 'lightgrey',
    borderRadius: 10,
    marginBottom: 10,
  },
  commentButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})