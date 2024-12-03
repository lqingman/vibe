import { View, Button, Text, FlatList, Pressable, Modal, TouchableOpacity, Alert, Image } from 'react-native'
import React, { useEffect, useLayoutEffect, useRef } from 'react'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import CusPressable from '../Components/CusPressable';
import { addOrUpdateNotification, deleteArrayField, fetchComments, getUserData, updateArrayField, getUsernameById, fetchImageUrlFromDB, deleteComment, addCommentToPost } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import { useState } from 'react';
import StaticDetail from '../Components/StaticDetail';
import {Picker} from '@react-native-picker/picker';
import Color from '../Styles/Color';
import Style from '../Styles/Style';

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
  // State for selected language
  const [selectedLanguage, setSelectedLanguage] = useState();
  // Ref for FlatList
  const flatListRef = useRef(null); 
  // State for usernames
  const [usernames, setUsernames] = useState({});
  // State for comment edit modal visibility
  const [commentEditModalVisible, setCommentEditModalVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  // State for reply input
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const inputRef = useRef(null);

  const [contentHeight, setContentHeight] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);

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
  
  //function to check if the event is in the past
  function isEventInPast(dateStr, timeStr) {

    const timeRegex = /(\d+):(\d+):00\s(AM|PM)/; 
    const matches = timeStr.match(timeRegex);
    
    if (matches) {
        const [_, hours, minutes, period] = matches;
        let hour24 = parseInt(hours);
                  
        // Convert PM times to 24-hour format
        if (period === 'PM') {
            hour24 = hour24 === 12 ? 12 : hour24 + 12;
        } else if (period === 'AM' && hour24 === 12) {
            hour24 = 0;
        }
        // Create date in local timezone with correct date
        const [year, month, day] = (dateStr || '').split('-');
        const activityDate = new Date(year, month - 1, day);
        activityDate.setHours(hour24, parseInt(minutes), 0);
        
        const now = new Date();
    
        return activityDate < now;
    }
  }

  // function to check if event is full
  function isEventFull(numAttendees, limit) {
    return numAttendees >= limit;
  }

  // function to check if the user is the owner
  function isUserOwner(owner) {
    //console.log(owner===auth.currentUser.uid)
    return auth.currentUser && owner === auth.currentUser.uid;
  }

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
      
      // Scroll after a short delay to ensure layout is complete
      setTimeout(() => {
        if (flatListRef.current && contentHeight > layoutHeight) {
          flatListRef.current.scrollToOffset({
            offset: contentHeight - layoutHeight,
            animated: true
          });
        }
      }, 100);
  
      return newComments;
    });
  }

  // Handle comment long press
  function handleCommentLongPress(comment) {
    //console.log("comment long press", comment)
    if (comment.owner === auth.currentUser.uid) {
      setSelectedComment(comment);
      setCommentEditModalVisible(true);
    }
  }


// // reply to a comment
// function handleReplyComment() {
//   console.log("Reply button pressed");
//   setCommentEditModalVisible(false);
//   setReplyModalVisible(true);
// }

// // submit the reply
// function handleSubmitReply() {
//   if (replyText.trim()) {
//     addCommentToPost(data.id, selectedComment.id, replyText);
//     setReplyText('');
//   }
//   setReplyModalVisible(false);
// }

// delete a comment
async function handleDeleteComment() {
  try {
    setCommentEditModalVisible(false);
    
    Alert.alert(
      "Delete comment", 
      "Are you sure you want to delete this comment?", 
      [
        {text: "Cancel", style: "cancel"},
        {
          text: "Delete", 
          onPress: async () => {
            if (selectedComment) {
              await deleteComment(data.id, selectedComment.id);
              // Update local state after successful deletion
              setComments(prevComments => 
                prevComments.filter(comment => comment.id !== selectedComment.id)
              );
            }
          }
        }
      ]
    );
  } catch (error) {
    console.error("Error in handleDeleteComment:", error);
    Alert.alert("Error", "Failed to delete comment. Please try again.");
  }
}

  // function to load usernames when comments change
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
      <View style={{
        flex: 1,
        backgroundColor: Color.white,
      }}>
        <Text>Please log in to view the details.</Text>
      </View>
    );
  }
  return (
    <View style={{
      flex: 1,
      backgroundColor: Color.white,
    }}>
      {/* Show all details */}
      <FlatList
        ref={flatListRef}
        data={comments}
        contentContainerStyle={{
          paddingBottom: 70  // Height of join/leave button view
        }}
        keyExtractor={(item) => {return(item.id)}}
        renderItem={async ({ item }) => {
          const isCurrentUser = item.owner === auth.currentUser.uid;
          const username = usernames[item.owner] || 'Loading...';
          //fetch the photoURL from the user
          const ownerData = await getUserData(item.owner);
          const photoURL = await fetchImageUrlFromDB(ownerData.picture[0]);
          
          return (
            <TouchableOpacity onLongPress={() => handleCommentLongPress(item)}>
            <View style={[
              {marginTop: 5},
              isCurrentUser && Style.userComment
            ]}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => {navigation.navigate('UserProfile', { userId: item.owner })}}>
                  <Image source={{uri: photoURL}} style={Style.commentOwnerPicture}/>
                </TouchableOpacity>
                  <View style={{flexDirection: 'column'}}>
                    <Text style={Style.commentUsername}>
                      {username}:
                    </Text>
                    <Text style={Style.commentText}>{item.text}</Text>
                  </View>
              </View>
            </View>
            </TouchableOpacity>
          );
        }}
        ListHeaderComponent={
        <StaticDetail 
          data={data} 
          updateComments={updateComments} 
          numAttendees={numAttendees}
          // navigation={navigation}  
          />}
        ItemSeparatorComponent={() => <View style={{ height: 20, borderBottomWidth: 1, borderBottomColor: Color.lightgrey }} />}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        onLayout={(event) => {
          setLayoutHeight(event.nativeEvent.layout.height);
        }}
        onContentSizeChange={(width, height) => {
          setContentHeight(height);
        }}
      />
      {/* Join/Leave button */}
      {joined ?
      <View style={Style.leaveView}>
        <CusPressable
          componentStyle={{
            width: '40%',
            height: 60,
            alignSelf: 'center',
            justifyContent: 'center',
            marginLeft: 30,
          }}
          childrenStyle={{
            flexDirection: 'row',
            padding: 10,
            backgroundColor: Color.navigatorBg,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          pressedHandler={handleJoinPress}
          disabled={isEventInPast(data.date, data.time)}
        >
          <Text style={Style.joinButtonText}>
            {isEventInPast(data.date, data.time) 
              ? 'Event Ended' 
              : joined ? 'Leave' : 'Join'}
          </Text>
        </CusPressable>
        <CusPressable
          componentStyle={{
            width: '20%',
            height: 60,
            justifyContent: 'center',
            marginLeft: 10,
          }}
          childrenStyle={{
            padding: 10,
            borderRadius: 10,
            alignItems: 'center',
          }}
          pressedHandler={handleNotificationPress} 
        >
          <Ionicons name="notifications" size={30} color={Color.navigatorBg} />
        </CusPressable>
      </View>
      :
      <View style={Style.leaveView}>
        <CusPressable
          componentStyle={{
            width: '40%',
            height: 50,
            maxWidth: '50%',
            alignSelf: 'center',
          }}
          childrenStyle={{
            padding: 10,
            backgroundColor: isEventInPast(data.date, data.time) || 
                    isEventFull(numAttendees, data.limit) || 
                    isUserOwner(data.owner) ? Color.gray : Color.navigatorBg,
            borderRadius: 10,
            alignItems: 'center',
          }}
          pressedHandler={handleJoinPress}
          disabled={isEventInPast(data.date, data.time) || 
            isEventFull(numAttendees, data.limit) || 
            isUserOwner(data.owner)}
        >
          <Text style={Style.joinButtonText}>
          {isEventInPast(data.date, data.time) 
            ? 'Event Ended' 
            : isEventFull(numAttendees, data.limit)
              ? 'Event Full'
              : isUserOwner(data.owner)
                ? 'Your Event'
                : joined ? 'Leave' : 'Join'}
          </Text>
        </CusPressable>
      </View>
      }
      
      {/* Notification Modal */}
      <View style={Style.notifModalContainer}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={Style.notifModalContainer}>
            <View style={Style.pickerContainer}>
              <TouchableOpacity
                style={Style.doneButton} 
                onPress={() => {
                  if (selectedTime) {
                    handleTimeSelect(selectedTime);
                  }
                  setModalVisible(false);
                  Alert.alert('Notification set successfully!');
                }}
              >
                <Text style={Style.modalButtonText}>Done</Text>
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
      {/* Comment edit modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentEditModalVisible}
        onRequestClose={() => setCommentEditModalVisible(false)}
      >
        <TouchableOpacity 
          style={Style.notifModalContainer}
          activeOpacity={1}
          onPress={() => setCommentEditModalVisible(false)}
        >
          <View style={Style.commentEditModalContainer}>
            <View style={Style.commentEditModalContent}>
              {/* <Button
                title="Reply"
                onPress={handleReplyComment}
              /> */}
              <Button
                title="Delete"
                color="red"
                onPress={handleDeleteComment}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}