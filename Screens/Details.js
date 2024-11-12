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
import { useJoined } from '../JoinedContext';


export default function Details({route, navigation}) {
  const data = route.params.activity
  // const [joined, setJoined] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [numAttendees, setNumAttendees] = useState(data.attendee.length);
  console.log("details", data)
  const { joinedActivities, updateJoinedStatus } = useJoined(); // Access context
  const [joined, setJoined] = useState(joinedActivities.includes(data.id));

  useEffect(() => {
    setJoined(joinedActivities.includes(data.id)); // Update local state when context changes
  }, [joinedActivities]);

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
    //console.log('Comments:', comments);
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
    const isJoining = !joined; // Toggle join/leave
    updateJoinedStatus(data.id, isJoining); // Update context state
    setJoined(isJoining); // Update local state for immediate UI change
    if (isJoining) {
      setNumAttendees(numAttendees + 1);
      updateArrayField('users', auth.currentUser.uid, 'joined', data.id);
      updateArrayField('posts', data.id, 'attendee', auth.currentUser.uid);
    } else {
      setNumAttendees(numAttendees - 1);
      deleteArrayField('users', auth.currentUser.uid, 'joined', data.id);
      deleteArrayField('posts', data.id, 'attendee', auth.currentUser.uid);
    }
  }

  function updateComments(newComment) {
    setComments([...comments, newComment]);
  }

  return (
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
          pressedHandler={() => console.log('Set notifications')} // TODO: Implement notifications
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