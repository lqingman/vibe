import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput,Pressable, Button, Image, TouchableOpacity, Alert, StyleSheet, Keyboard,ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, database } from '../Firebase/firebaseSetup';
import { writeToDB, updateArrayField, updatePost, deletePost, deleteArrayField } from '../Firebase/firestoreHelper';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import ImageManager from '../Components/ImageManager';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../Firebase/firebaseSetup';
import { isFirebaseStorageUri, fetchAndUploadImage } from '../Firebase/firestoreHelper';
import { GoogleGenerativeAI } from '@google/generative-ai';
import CusPressable from '../Components/CusPressable';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import * as Location from 'expo-location';


// Create post screen
export default function CreatePost({ route, navigation }) {

  // States for the post
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [inputDate, setInputDate] = useState('');
  const [inputTime, setInputTime] = useState('');

  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null); 
  const [city, setCity] = useState('');

  const [image, setImage] = useState('');
  const [limit, setLimit] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [postId, setPostId] = useState('');

  // Function to generate description
const generateAIDescription = async () => {
  try {
    
    // Get user requirements via Alert prompt
    Alert.prompt(
      "Generate Description",
      "provide basic information about the event",
      async (userInput) => {
        if (!userInput) return;
        
        const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Generate an engaging description for an event. the event description 
                        based on the following information: ${userInput}.
                       Include what people might expect and why they should join.
                       Keep it concise but informative.`;
        
        const result = await model.generateContent(prompt);
        const generatedText = result.response.text();
        setDescription(generatedText);
      }
    );
  } catch (error) {
    console.error('Error generating description:', error);
    Alert.alert('Error', 'Failed to generate description');
  } 
};

  // Effect to set the post data if editing
  useEffect(() => {
    if (route.params?.post) {
      const post = route.params.post;
      setTitle(post.title);
      setDescription(post.description);
      setDate(new Date(post.date));
      setInputDate(post.date);
      setInputTime(post.time);
      setAddress(post.address);
      setImage(post.image);
      setLimit(post.limit.toString());
      setIsEditing(true);
      setPostId(post.id);
      
    }
  }, [route.params?.post]);

  // Effect to set the header right button if editing
  useLayoutEffect(() => {
    if (isEditing) {
      navigation.setOptions({
        headerRight: () => (
          <Pressable onPress={confirmDelete}>
            <FontAwesome5 name="trash" size={24} color="white" style={{ marginRight: 15 }} />
          </Pressable>
        ),
      });
    }
  }, [navigation, isEditing]);

  // Function to confirm delete
  const confirmDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDelete,
        },
      ],
      { cancelable: true }
    );
  };

  // Function to handle delete
  const handleDelete = async () => {
    try {
      await deletePost(postId, auth.currentUser.uid);
      await deleteArrayField('users', auth.currentUser.uid, 'joined', postId);
      Alert.alert('Post deleted successfully');
      navigation.goBack();
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('Error deleting post', error.message);
    }
  };


  // Function to handle date change
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShowDatePicker(false); // Hide the date picker on both platforms
    setDate(currentDate);
    setInputDate(currentDate.toLocaleDateString());
  };

  // Function to handle time change
  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime;
    setShowTimePicker(false); 
    setDate(currentTime);
    setInputTime(currentTime.toLocaleTimeString());
  };

  // Function to handle date and time change
  const onChangeDateTime = (event, selectedDateTime) => {
    const currentDateTime = selectedDateTime;
    // setShowDatePicker(false); // Hide the date picker on both platforms
    setDate(currentDateTime);
    setInputDate(currentDateTime.toLocaleDateString());
    setInputTime(currentDateTime.toLocaleTimeString());
  }

  // Function to toggle date picker
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);

  };

  // Function to toggle time picker
  const toggleTimePicker = () => {
    setShowTimePicker(!showTimePicker);
  };

  // Function to validate inputs
  const validateInputs = () => {
    if (!title) {
      Alert.alert('Title is required');
      return false;
    }
    if (!description) {
      Alert.alert('Description is required');
      return false;
    }
    if (!inputDate) {
      Alert.alert('Date is required');
      return false;
    }
    if (!address) {
      Alert.alert('Location is required');
      return false;
    }
    if (!image) {
      Alert.alert('Image is required');
      return false;
    }
    if (!limit || isNaN(limit) || parseInt(limit) <= 1) {
      Alert.alert('Limit must be a number greater than 1');
      return false;
    }
    return true;
  };

  // Function to generate keywords
  function generateKeywords(title) {
    // Convert title to lowercase
    const lowerTitle = title.toLowerCase();

    // Remove punctuation and split by spaces
    const keywords = lowerTitle.match(/\b(\w+)\b/g); // Matches all word characters (ignoring punctuation)

    return keywords || [];
  }

  // Function to handle cancel
  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setDate(new Date());
    setInputDate('');
    setInputTime('');
    setAddress('');
    setCoordinates(null);
    setCity('');
    setImage('');
    setIsEditing(false);
    setPostId('');
    setLimit(0);
    setShowDatePicker(false);
    setShowTimePicker(false);
    navigation.goBack();
  }

  // Function to handle submit
  const handleSubmit = async () => {
    if (!validateInputs()) return;
    // confirm before submitting
    
    const keywords = generateKeywords(title);
    
    let finalImageUri = image;
    if (!isFirebaseStorageUri(image)) {
        // Only upload if it's a new local image
        finalImageUri = await fetchAndUploadImage(image);
    }
    const newPost = {
        title: title,
        keywords: keywords,
        date: inputDate,
        time: inputTime,
        description: description,
        address: address,
        coordinates: coordinates,
        city: city,
        image: finalImageUri,
        limit: parseInt(limit),
        owner: auth.currentUser.uid,
    };
    if (!isEditing) {
      newPost.attendee = []; // Only include attendee list when creating a new post
    }
    try {
      if (isEditing) {
        await updatePost(postId, newPost);
        Alert.alert('Post updated successfully');
        navigation.goBack();
      } else {
        const docRef = await writeToDB(newPost, 'posts');
        const postId = docRef.id;
        await updateArrayField('users', auth.currentUser.uid, 'posts', postId);
        Alert.alert('Post created successfully');
        
      }
      // Reset the state variables
      handleCancel();

      
    } catch (error) {
      console.error('Error saving post:', error);
      Alert.alert('Error saving post', error.message);
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
      }}
    >
    {/* image feature to be improved */}
      <ImageManager 
        receiveImageUri={setImage}
        initialImage={isEditing ? image : null} 
      />


    <TextInput
      placeholder="Title"
      value={title}
      onChangeText={setTitle}
      style={styles.input}
      // onSubmitEditing={Keyboard.dismiss}
    />

    
    
    {/* <TouchableWithoutFeedback onPress={toggleDatePicker}>
      
      <TextInput
          // style={styles.input}
          placeholder="Date"
          value={inputDate}
          onPressIn={toggleDatePicker}
          editable={false} 
      />
      
    </TouchableWithoutFeedback> */}
    {Platform.OS === 'ios'?(
      // <View style={{flexDirection: 'row',
      //   justifyContent: 'space-between',
      //   alignItems: 'center'}}>
      <View>
      <Text>{"Start Time"}</Text>
      <TextInput 
        style={styles.input}
        value={inputDate + '  ' + inputTime}
        editable={false}
        onPress={() => setShowDatePicker(!showDatePicker)}
        />
      {showDatePicker && <DateTimePicker
        value={date}
        mode="datetime"
        display="default" // Use inline display for the date picker
        onChange={onChangeDateTime}
      />}
      </View>
    ) : (
      <>
        <TouchableOpacity onPress={toggleDatePicker} style={styles.input}>
            <Text>{inputDate || "Select Date"}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            // display="inline" // Use inline display for the date picker
            display="default"
            onChange={onChangeDate}
            
          />
        )}
        <TouchableOpacity onPress={toggleTimePicker} style={styles.input}>
            <Text>{inputTime || "Select Time"}</Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={onChangeTime}
            />
          )}
        </>
    )}
  
    {/* <TextInput
      placeholder="Description"
      value={description}
      onChangeText={setDescription}
      style={styles.descriptionInput}
      multiline
    /> */}

  <View style={styles.descriptionContainer}>
    <TextInput
      placeholder="Description"
      value={description}
      onChangeText={setDescription}
      style={[styles.input, styles.descriptionInput]}
      multiline
    />
    <TouchableOpacity 
      style={styles.aiButton}
      onPress={generateAIDescription}
    >
      <FontAwesome5 
        name="magic" 
        size={20} 
        color={'#363678'} 
      />
    </TouchableOpacity>
  </View>
    <TextInput
      placeholder="Max Capacity"
      value={limit}
      onChangeText={setLimit}
      style={styles.input}
    />
    <CusPressable
      pressedHandler={() => navigation.navigate('ChangeLocation', { 
        onReturn: (selectedLocation) => {
          // Store coordinates
          setCoordinates({
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude
          });
          // Convert the coordinates to an address string
          Location.reverseGeocodeAsync({
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude
          }).then(addresses => {
            if (addresses.length > 0) {
              const address = addresses[0];
              //console.log('address', address);
              const locationString = `${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim();
              setAddress(locationString);
              setCity(address.city || '');
              //console.log('city', address.city);
              //console.log(locationString);
            }
          });
        }
      })}
      componentStyle={styles.locationButton}
    >
      <View style={styles.locationButtonContent}>
        <FontAwesome6 name="location-dot" size={24} color="black" />
        <Text style={styles.locationText}>{address || "Select Location"}</Text>
      </View>
    </CusPressable>
    <View style={styles.buttonContainer}>
      <Button title="Cancel" onPress={handleCancel} />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
    // backgroundColor: colors.textBackground,
    padding: 5,
    fontSize: 16,
    marginBottom: 10,
},
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  descriptionInput: {
    flex: 1,
    height: 150,
    textAlignVertical: 'top',
  },
  aiButton: {
    padding: 10,
    marginLeft: 10,
    alignSelf: 'flex-start',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 20,
    marginHorizontal: 30,
  },
  mapView: {
    // marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '90%',
    height: 150,
    borderRadius: 10,
    // marginBottom: 100,
  },
  locationButton: {
    backgroundColor: 'lightblue',
    height: "10%",
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 25,
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 10,
    minWidth: '45%', 
    maxWidth: '90%',
    alignSelf: 'flex-start'
  },
  locationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    gap: 5,
  },
  locationText: {
    fontSize: 16,
    flexShrink: 1, 
    numberOfLines: 1, 
    ellipsizeMode: 'tail',
    paddingTop: 3,
  },
})