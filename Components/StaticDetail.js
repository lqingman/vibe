import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
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
import Map from './Map';
import { useNavigation } from '@react-navigation/native';
import Carousel from './Carousel';
import Style from '../Styles/Style';
import Color from '../Styles/Color';

// Component to display the details of a post except for the comments
export default function StaticDetail({data, updateComments, numAttendees}) {
  if (!data) return null;
  //console.log("1. Component render - received data:", data);

  // State for comment
  const [comment, setComment] = useState('');
  // State for owner data
  const [ownerData, setOwnerData] = useState(null);
  // State for owner image url
  const [ownerImageUrl, setOwnerImageUrl] = useState(null);  
  // State for post image urls
  const [postImageUrls, setPostImageUrls] = useState([]);  
  // Navigation
  const navigation = useNavigation();

  // Load user data and image urls
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
    <View style={Style.staticDetailContainer}>
      {/* show owner's profile picture and name */}
      <TouchableOpacity 
        style={Style.ownerInfo}
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
          style={Style.ownerImage} 
          source={ownerImageUrl ? {uri: ownerImageUrl} : null} 
        />
        <Text style={Style.ownerName}>{ownerData?.name}</Text>
      </TouchableOpacity>

      {/* show image */}
      <View style={{flex: 1}}>
        <Carousel data={postImageUrls} />
      </View>

      {/* show title */}
      <View style={Style.staticDetailTitleView}>
        <Text style={Style.staticDetailTitleText}>{data.title}</Text>
      </View>

      {/* show date, time, location, attendees, description */}
      <View style={Style.staticDetailFieldView}>
        <FontAwesome name="calendar" size={24} color={Color.navigatorBg} />
        <Text style={Style.staticDetailFieldText}>{data.date}</Text>
      </View>

      <View style={Style.staticDetailFieldView}>
        <FontAwesome5 name="clock" size={24} color={Color.navigatorBg} />
        <Text style={Style.staticDetailFieldText}>{data.time}</Text>
      </View>

      <View style={Style.staticDetailFieldView}>
        <Ionicons name="people" size={24} color={Color.navigatorBg} />
        <Text style={Style.staticDetailFieldText}>{numAttendees}/{data.limit}</Text>
      </View>

      <View style={Style.staticDetailDescriptionView}>
        <MaterialIcons name="description" size={24} color={Color.navigatorBg} />
        <Text style={Style.staticDetailDescriptionText}>{data.description}</Text>
      </View>

      {/* show map */}
      <View style={Style.staticDetailFieldView}>
        <Entypo name="location-pin" size={24} color={Color.navigatorBg} />
        <Text style={Style.staticDetailFieldText}>{data.address}</Text>
      </View>

      <View style={Style.staticDetailMapView}>
        <Map latitude={data?.coordinates?.latitude} longitude={data?.coordinates?.longitude} />
      </View>

      {/* show comment input and button */}
      <View style={{marginVertical: 10}}>
        {/* show comments */}
        <View style={Style.staticDetailCommentsView}>
          <Text style={Style.staticDetailCommentsText}>Comments</Text>
        </View>

        <View style={Style.commentButtonContainer}>
          <TextInput 
            style={Style.commentInput} 
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
            <Text style={Style.commentButtonText}>Send</Text>
          </CusPressable>
        </View>
      </View>
    </View>
  )
}