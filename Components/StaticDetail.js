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


export default function StaticDetail({data, updateComments, numAttendees}) {
  //console.log("received data:",data)
  if (!data) return null; // Only render if data exists
  const [comment, setComment] = useState('');

  function handleAddComment() {
    // Add comment to the activity
    let newComment = {
      text: comment,
      owner: auth.currentUser.uid,
    };
    addCommentToPost(data.id, newComment)
      .then(commentDoc => console.log('Comment added:', commentDoc))
      .catch(error => console.error(error));
    updateComments(newComment);
  }

  return (
    <View style={styles.container}>
      <View style={styles.media}>
        <Image style={styles.image} source={{uri: data.image}} />
      </View>

      <View style={styles.titleView}>
        <Text style={styles.titleText}>{data.title}</Text>
      </View>

      <View style={styles.dateView}>
        <FontAwesome name="calendar" size={24} color="purple" />
        <Text style={styles.dateText}>{data.date}</Text>
      </View>

      <View style={styles.timeView}>
        <FontAwesome5 name="clock" size={24} color="purple" />
        <Text style={styles.timeText}>{data.time}</Text>
      </View>

      <View style={styles.locationView}>
        <Entypo name="location-pin" size={24} color="purple" />
        <Text style={styles.locationText}>{data.location}</Text>
      </View>

      <View style={styles.attendeesView}>
        <Ionicons name="people" size={24} color="purple" />
        <Text style={styles.attendeesText}>{numAttendees}/{data.limit}</Text>
      </View>

      <View style={styles.descriptionView}>
      <MaterialIcons name="description" size={24} color="purple" />
        <Text style={styles.descriptionText}>{data.description}</Text>
      </View>

      <View style={styles.mapView}>
        <Image style={styles.map} source={{uri: "https://external-preview.redd.it/map-of-downtown-vancouver-made-with-google-maps-v0-fLegPkDqPZKO5HoxStTdgxFlXaYuKRdeF5nef2KW-Vs.png?auto=webp&s=d33e7ede6777994dccc9c940d0a478b866e6cb72"}} />
      </View>

      <View style={styles.commentView}>
        <View style={styles.commentButtonContainer}>
          <TextInput 
            style={styles.commentInput} 
            placeholder="Add a comment..." 
            value={comment}
            onChangeText={setComment}
            />
          <CusPressable
            componentStyle={{
              width: '30%',
              alignSelf: 'center',
              justifyContent: 'center',
              marginLeft: 10,
            }}
            childrenStyle={{
              padding: 10,
              backgroundColor: 'purple',
              borderRadius: 10,
              alignItems: 'center',
            }}
            pressedHandler={handleAddComment}
          >
            <Text style={styles.joinButtonText}>Comment</Text>
          </CusPressable>
        </View>
        <View style={styles.commentsView}>
          <Text style={styles.commentText}>Comments</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
  },
  media: {
    flex: 1,
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
    marginBottom: 10,
  },
  commentText: {
    fontSize: 16,
    marginBottom: 10,
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
  commentsView: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    width: '110%',
  },
  attendeesView: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeesText: {
    marginLeft: 10,
    fontSize: 16,
  },
})