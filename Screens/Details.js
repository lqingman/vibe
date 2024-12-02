import { View, Text, StyleSheet, FlatList, Pressable, Modal, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useLayoutEffect, useRef } from 'react'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import CusPressable from '../Components/CusPressable';
import { addOrUpdateNotification, deleteArrayField, fetchComments, getUserData, updateArrayField, getUsernameById } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import { useState } from 'react';
import StaticDetail from '../Components/StaticDetail';
import DropDown from '../Components/FilterMenu';
import {Picker} from '@react-native-picker/picker';
import Color from '../Styles/Color';

// Details screen
export default function Details({route, navigation}) {
  // Get the activity data from the route params
  let data = route.params.activity
  // State for joined
  const [joined, setJoined] = useState(false);
  // State for comments
  const [comments, setComments] = useState([]);
  // State for number of attendees
  const [numAttendees, setNumAttendees] = useState(data.attendee.length);
  //console.log("details", data)
  // State for modal visibility
  const [modalVisible, setModalVisible] = useState(false);
  // State for selected time
  const [selectedTime, setSelectedTime] = useState(null);
  // State for dropdown visibility
  const [dropdownVisible, setDropdownVisible] = useState(false);
  // State for selected language
  const [selectedLanguage, setSelectedLanguage] = useState();
  // Ref for FlatList
  const flatListRef = useRef(null); 
  // State for usernames
  const [usernames, setUsernames] = useState({});

  // Check if the user has joined the activity
  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    // Update local state only if necessary
    async function checkJoinedStatus() {
      try{
        let userData = await getUserData(auth.currentUser.uid);
        let joinedActivities = userData.joined || [];
        const isJoined = joinedActivities.includes(data.id);
        if (isJoined !== joined) {
          setJoined(isJoined);
        }
      }
      catch (error) {
        console.error('Error checking joined status:', error);
      }
    }
    checkJoinedStatus();
  }, [auth.currentUser, joined, data.id]); 
  
  // Load comments when the component mounts
  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    async function loadComments() {
      try {
        const commentsData = await fetchComments(data.id);
        //console.log("load comments ",commentsData)
        setComments(commentsData);
      } catch (error) {
        console.error("Error loading comments: ", error);
      }
    }
  
    loadComments();
  }, [auth.currentUser, data.id]); 
  
  // Set the header button to edit the post if the user is the owner
  useLayoutEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    if (auth.currentUser.uid === data.owner) {
      navigation.setOptions({
        headerRight: () => (
          <Pressable onPress={() => navigation.navigate('CreatePost', { post: data })}>
            <FontAwesome5 name="edit" size={24} color={Color.navigatorBg} />
          </Pressable>
        ),
      });
    }
  }, [auth.currentUser, navigation, data.owner, data, auth.currentUser.uid]); 
  
  // Add a comment to the activity
  async function handleJoinPress() {
    const isJoining = !joined; 

    if (isJoining) {
      try{
        setNumAttendees(numAttendees + 1);
        //console.log('Join pressed', data.id);
        await updateArrayField('users', auth.currentUser.uid, 'joined', data.id);
        await updateArrayField('posts', data.id, 'attendee', auth.currentUser.uid);
      } catch (error) {
        console.error('Error updating joined status:', error);
      }
    }
    else {
      try {
        setNumAttendees(numAttendees - 1);
        //console.log('Leave pressed', data.id);
        await deleteArrayField('users', auth.currentUser.uid, 'joined', data.id);
        await deleteArrayField('posts', data.id, 'attendee', auth.currentUser.uid);
    }
    catch (error) {
      console.error('Error updating joined status:', error);
    }
  }
    setJoined(isJoining); 
  }

  // Set a notification for the activity
  function handleNotificationPress() {
    // setModalVisible(true);
    setModalVisible((prev) => !prev)
  }

  // Set the notification time and add it to the user's notifications
  function handleTimeSelect(time) {
    //console.log('time', time);
    setSelectedTime(time);
    setModalVisible(false);
    //console.log(`Notification set for ${time}`);
    addOrUpdateNotification(data.id, time, data);
  }

  // Add a comment to the activity
  function updateComments(newComment) {
    setComments(prevComments => {
      const newComments = [...prevComments, newComment];
      
      // Wait for state to update before scrolling
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: newComments.length - 1,  // Scroll to last comment
          animated: true,
          viewPosition: 0.5  // Center the comment in view
        });
      }, 100);

      return newComments;
    });
  }

  // Add this to handle scroll fail
  const handleScrollToIndexFailed = (info) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
        viewPosition: 0.5
      });
    });
  };

  // Add this useEffect to load usernames when comments change
  useEffect(() => {
    const loadUsernames = async () => {
      const usernamesMap = {};
      for (const comment of comments) {
        //console.log("loading username", comment.owner)
        if (!usernames[comment.owner]) {
          const username = await getUsernameById(comment.owner);
          usernamesMap[comment.owner] = username;
        }
      }
      setUsernames(prev => ({ ...prev, ...usernamesMap }));
    };

    loadUsernames();
  }, [comments]);

  // If the user is not logged in, show a message
  if (!auth.currentUser) {
    return (
      <View style={styles.container}>
        <Text>Please log in to view the details.</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {/* Show all details */}
      <FlatList
        ref={flatListRef}
        data={comments}
        contentContainerStyle={{
          paddingBottom: 70  // Height of join/leave button view
        }}
        keyExtractor={(item) => {return(item.id)}}
        renderItem={({ item }) => {
          const isCurrentUser = item.owner === auth.currentUser.uid;
          const username = usernames[item.owner] || 'Loading...';
          
          return (
            <View style={[
              styles.comment,
              isCurrentUser && styles.userComment
            ]}>
              <Text style={styles.commentUsername}>
                {username}:
              </Text>
              <Text style={styles.commentText}>{item.text}</Text>
            </View>
          );
        }}
        ListHeaderComponent={
        <StaticDetail 
          data={data} 
          updateComments={updateComments} 
          numAttendees={numAttendees}
          // navigation={navigation}  
          />}
        ItemSeparatorComponent={() => <View style={{ height: 20, borderBottomWidth: 1, borderBottomColor: 'lightgrey' }} />}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 1
        }}
      />
      {/* Join/Leave button */}
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
            backgroundColor: '#363678',
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
          pressedHandler={handleNotificationPress} 
          //pressedHandler={()=> <DropDown/>}
        >
          <Ionicons name="notifications" size={30} color="#363678" />
        </CusPressable>
      </View>
      :
      <View style={styles.joinView}>
        <CusPressable
          componentStyle={{
            width: '30%',
            alignSelf: 'center',
            justifyContent: 'center',
          }}
          childrenStyle={{
            padding: 10,
            backgroundColor: '#363678',
            borderRadius: 10,
            alignItems: 'center',
          }}
          pressedHandler={handleJoinPress}
        >
          <Text style={styles.joinButtonText}>Join!</Text>
        </CusPressable>
      </View>
      }
      
      {/* Notification Modal */}
      <View style={styles.modalContainer}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
        <View style={styles.pickerContainer}>
          <TouchableOpacity
            style={styles.doneButton} 
            onPress={() => {
              if (selectedTime) {
                handleTimeSelect(selectedTime);
              }
              setModalVisible(false);
              Alert.alert('Notification set successfully!');
            }}
          >
            <Text>Done</Text>
          </TouchableOpacity>
          <Picker
            selectedValue={selectedLanguage}
            onValueChange={(itemValue, itemIndex) =>
              {
                setSelectedLanguage(itemValue),
                setSelectedTime(itemValue)
              }
            }>
            <Picker.Item label="None" value="None" />
            <Picker.Item label="At time of event" value="At time of event" />
            <Picker.Item label="30 minutes before" value="30 minutes before" />
            <Picker.Item label="1 hour before" value="1 hour before" />
            <Picker.Item label="2 hours before" value="2 hours before" />
            <Picker.Item label="1 day before" value="1 day before" />
            <Picker.Item label="2 days before" value="2 days before" />
            <Picker.Item label="1 week before" value="1 week before" />
          </Picker>
          </View>
        </View>
        </Modal>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    //paddingBottom: 100,
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
    marginTop: 2,   
  },
  commentInput: {
    width: '70%',
    height: 50,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10,
  },
  commentButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOption: {
    fontSize: 18,
    paddingVertical: 10,
    color: '#363678',
  },
  closeButton: {
    marginTop: 20,
  },
  closeButtonText: {
    color: 'red',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    width: '100%',
    paddingBottom: 20, // Add padding for iOS home indicator
  },
  picker: {
    height: 216, // Standard iOS picker height
    backgroundColor: 'white',
  },
  doneButton: {
    alignSelf: 'flex-end',
    padding: 12,
    backgroundColor: 'white',
  },
  userComment: {
    borderLeftWidth: 3,
    borderLeftColor: 'lightgrey',
  },
  commentUsername: {
    marginLeft: 10,
    marginTop: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#363678',
  },
  comment: {
    marginTop: 5,
  },
})