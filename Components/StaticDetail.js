import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import CusPressable from '../Components/CusPressable';
import { addCommentToPost, fetchImageUrlFromDB, getUserData } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import { useState } from 'react';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import Map from './Map';
import { useNavigation } from '@react-navigation/native';
import Carousel from './Carousel';

export default function StaticDetail({data, updateComments, numAttendees}) {
  if (!data) return null;
  //console.log("1. Component render - received data:", data);

  const [comment, setComment] = useState('');
  const [ownerData, setOwnerData] = useState(null);
  const [ownerImageUrl, setOwnerImageUrl] = useState(null);  
  const [postImageUrls, setPostImageUrls] = useState([]);  
  const navigation = useNavigation();

  useEffect(() => {    
    try {
      const loadData = async () => {
        
        const userData = await getUserData(data.owner);
        //console.log("userData", userData)
        setOwnerData(userData);
        const ownerImageUrl = await fetchImageUrlFromDB(userData.picture[0]);
        //console.log("ownerImageUrl", ownerImageUrl)
        setOwnerImageUrl(ownerImageUrl);
                
        if (Array.isArray(data.image) && data.image.length > 0) {
          try {
            const urls = await Promise.all(data.image.map(async (image) => {
              const url = await fetchImageUrlFromDB(image);
              return url;
            }));
            setPostImageUrls(urls);
          } catch (error) {
            console.error("Error in image processing:", error);
          }
        } else {
          console.log("No valid images array to process");
        }
      };

      loadData()
    } catch (error) {
      console.error("Error in useEffect:", error);
    }
  }, [data]);

  // Handle the add comment button press
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
    setComment('');
  }

  return (
    <View style={styles.container}>
      {/* show owner's profile picture and name */}
      <TouchableOpacity 
        style={styles.ownerInfo}
        onPress={() => {
          if (data.owner === auth.currentUser?.uid) {
            // If it's the current user's profile, navigate to the Profile tab
            // navigation.navigate('Tab', { screen: 'Profile' });
            // Reset navigation stack and set Tab as the only screen
            navigation.reset({
              index: 0,
              routes: [{ 
                name: 'Tab',
                params: { screen: 'Profile' }
              }],
            });
          } else {
            // If it's another user's profile, navigate to UserProfile
            navigation.navigate('UserProfile', { userId: data.owner });
          }
        }}
      >
        <Image 
          style={styles.ownerImage} 
          source={ownerImageUrl ? {uri: ownerImageUrl} : null} 
        />
        <Text style={styles.ownerName}>{ownerData?.name}</Text>
      </TouchableOpacity>

      {/* show image */}
      <View style={styles.media}>
        <Carousel data={postImageUrls} />
      </View>

      {/* show title */}
      <View style={styles.titleView}>
        <Text style={styles.titleText}>{data.title}</Text>
      </View>

      {/* show date, time, location, attendees, description */}
      <View style={styles.dateView}>
        <FontAwesome name="calendar" size={24} color="purple" />
        <Text style={styles.dateText}>{data.date}</Text>
      </View>

      <View style={styles.timeView}>
        <FontAwesome5 name="clock" size={24} color="purple" />
        <Text style={styles.timeText}>{data.time}</Text>
      </View>

      <View style={styles.attendeesView}>
        <Ionicons name="people" size={24} color="purple" />
        <Text style={styles.attendeesText}>{numAttendees}/{data.limit}</Text>
      </View>

      <View style={styles.descriptionView}>
        <MaterialIcons name="description" size={24} color="purple" />
        <Text style={styles.descriptionText}>{data.description}</Text>
      </View>

      {/* show map */}
      <View style={styles.locationView}>
        <Entypo name="location-pin" size={24} color="purple" />
        <Text style={styles.locationText}>{data.address}</Text>
      </View>

      <View style={styles.mapView}>
        <Map latitude={data?.coordinates?.latitude} longitude={data?.coordinates?.longitude} />
      </View>

      {/* show comment input and button */}
      <View style={styles.commentView}>
        {/* show comments */}
        <View style={styles.commentsView}>
          <Text style={styles.commentText}>Comments</Text>
        </View>

        <View style={styles.commentButtonContainer}>
          <TextInput 
            style={styles.commentInput} 
            placeholder="Add a comment..." 
            value={comment}
            onChangeText={setComment}
            />
          <CusPressable
            componentStyle={{
              width: '20%',
              alignSelf: 'center',
              justifyContent: 'center',
              marginLeft: 10,
              marginBottom: 10,
              marginRight: 10,
            }}
            childrenStyle={{
              padding: 10,
              backgroundColor: '#363678',
              borderRadius: 10,
              alignItems: 'center',
            }}
            pressedHandler={handleAddComment}
          >
            <Text style={styles.commentButtonText}>Send</Text>
          </CusPressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    //padding: 10,
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
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
  },
  timeView: {
    marginVertical: 10,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 10,
    fontSize: 16,
  },
  locationView: {
    marginVertical: 10,
    marginLeft: 10,
    flexDirection: 'row',
    //alignItems: 'center',
  },
  locationText: {
    marginLeft: 10,
    fontSize: 16,
  },
  descriptionView: {
    marginTop: 10,
    marginLeft: 10,
    flexDirection: 'row',
    //alignItems: 'center',
  },
  descriptionText: {
    marginLeft: 10,
    fontSize: 16,
    width: '85%',
    textAlign: 'justify',
  },
  titleView: {
    marginVertical: 10,
    marginTop: 20,
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
    height: 200,
    width: '90%',
    //marginBottom: 20,
    alignSelf: 'center',
  },
  map: {
    width: '90%',
    height: 200,
    borderRadius: 16,
    //marginBottom: 30,
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
    //marginLeft: 10,
  },
  commentText: {
    fontSize: 16,
    marginBottom: 5,
    marginLeft: 25,
    marginTop: 10,
    fontWeight: 'bold',
  },
  commentInput: {
    width: '70%',
    height: 50,
    padding: 10,
    backgroundColor: 'lightgrey',
    borderRadius: 10,
    marginBottom: 10,
    marginLeft: 10,
  },
  commentButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    width: '100%',
    alignContent: 'flex-start',
  },
  commentsView: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
    width: '110%',
    marginLeft: -10,
    paddingBottom: 5,
  },
  commentButtonText: {
    color: 'white',
    fontSize: 15,
  },
  attendeesView: {
    marginVertical: 10,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeesText: {
    marginLeft: 10,
    fontSize: 16,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    width: '110%',
    marginLeft: -10,  
    paddingLeft: 10,
  },
  ownerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 10,
    marginLeft: 10,
    resizeMode: 'cover',
  },
  ownerName: {
    marginLeft: 10,
    fontSize: 20,
    color: 'black',
    marginBottom: 10,
  },
})