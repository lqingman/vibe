import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput,Pressable, TouchableOpacity, Alert, Modal, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth } from '../Firebase/firebaseSetup';
import { writeToDB, updateArrayField, updatePost, deletePost, deleteArrayField } from '../Firebase/firestoreHelper';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import ImageManager from '../Components/ImageManager';
import { isFirebaseStorageUri, fetchAndUploadImage } from '../Firebase/firestoreHelper';
import { GoogleGenerativeAI } from '@google/generative-ai';
import CusPressable from '../Components/CusPressable';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import * as Location from 'expo-location';
import Color from '../Styles/Color';
import Style from '../Styles/Style';

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

  const [images, setImages] = useState([]);
  const [limit, setLimit] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [postId, setPostId] = useState('');

  const [modalInput, setModalInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Function to generate description
  const handleGenerateDescription = async (input) => {
    try {
          if (!input) return;
          
          const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          
          const prompt = `Generate an engaging description for an event with the following details:
                          - Event Title: ${title}
                          - Date: ${inputDate}
                          - Time: ${inputTime}
                          - Location: ${address}
                          - Maximum Capacity: ${limit} people
                          - Additional Info: ${input}

                          Create a compelling description that:
                          1. Introduces the event and its purpose
                          2. Describes what attendees can expect
                          3. Highlights why people should join
                          4. Includes practical details like time and location
                          
                          Keep it concise but informative and engaging.`;
          
          const result = await model.generateContent(prompt);
          const generatedText = result.response.text();
          setDescription(generatedText);
    } catch (error) {
      console.error('Error generating description:', error);
      Alert.alert('Error', 'Failed to generate description');
    } 
  };

  // Function to open the input prompt
  const openInputPrompt = () => {
    // if (Platform.OS === 'ios') {
    //   Alert.prompt(
    //     "Generate Description",
    //     "Provide more details for the event!",
    //     async (input) => await handleGenerateDescription(input)
    //   );
    // } else {
      setModalVisible(true); // Show modal for Android
    // }
  };

  // Effect to set the post data if editing
  useEffect(() => {
    if (route.params?.post) {
      const post = route.params.post;
      setTitle(post.title);
      setDescription(post.description);
      // setDate(new Date(post.date));
      // Parse the date and time strings and combine them
      const [year, month, day] = post.date.split('-');
      const timeMatch = post.time.match(/(\d+):(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        const [_, hours, minutes, seconds, period] = timeMatch;
        
        // Create new date object
        const dateObj = new Date(year, month - 1, day);
        
        // Convert to 24-hour format
        let hour = parseInt(hours);
        if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
        if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
        
        dateObj.setHours(hour, parseInt(minutes), parseInt(seconds));
        setDate(dateObj);
      }

      setInputDate(post.date);
      setInputTime(post.time);
      setAddress(post.address);
      setImages(post.image);
      setLimit(post.limit.toString());
      setIsEditing(true);
      setPostId(post.id);
      setCoordinates(post.coordinates);
      setAddress(post.address);
      setCity(post.city);
      
    }
  }, [route.params?.post]);

  // Effect to set the header right button if editing
  useLayoutEffect(() => {
    if (isEditing) {
      navigation.setOptions({
        headerRight: () => (
          <Pressable onPress={confirmDelete}>
            <FontAwesome5 name="trash" size={24} color={Color.navigatorBg} />
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

  // Function to format the date
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to handle date change
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShowDatePicker(false);

    setDate(currentDate);
    setInputDate(formatDate(currentDate));
  };

  // Function to handle time change
  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime;
    setShowTimePicker(false); 
    setDate(currentTime);
    setInputTime(currentTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }));
  };

  // Function to handle date and time change
  const onChangeDateTime = (event, selectedDateTime) => {
    const currentDateTime = selectedDateTime;
    // setShowDatePicker(false);
    setDate(currentDateTime);
    setInputDate(formatDate(currentDateTime));
    setInputTime(currentDateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }));
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
    if (!images || images.length === 0) {
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
    setImages([]);
    setIsEditing(false);
    setPostId('');
    setLimit(0);
    setShowDatePicker(false);
    setShowTimePicker(false);
    // navigation.goBack();
    // Reset navigation stack and go to Home/Explore
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tab', params: { screen: 'Home', params: { screen: 'Explore' } } }],
  });
  }

  // Function to handle submit
  const handleSubmit = async () => {
    if (!validateInputs()) return;
    // confirm before submitting
    
    const keywords = generateKeywords(title);
    
    const finalImageUris = await Promise.all(images.map(async (image) => {
      if (!isFirebaseStorageUri(image)) {
        // Only upload if it's a new local image
        return await fetchAndUploadImage(image);
      }
      return image;
    }));
    const newPost = {
        title: title,
        keywords: keywords,
        date: inputDate,
        time: inputTime,
        description: description,
        address: address,
        coordinates: coordinates,
        city: city,
        image: finalImageUris,
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
        // navigation.goBack();
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
      style={[Style.container, {padding: 20,}]}
    >
      {/* image feature to be improved */}
      <ImageManager 
        receiveImageUris={setImages}
        initialImages={isEditing ? images : []} 
      />

      <Text style={Style.label}>Title</Text>
      <TextInput
        // placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={Style.input}
        // onSubmitEditing={Keyboard.dismiss}
      />

    {Platform.OS === 'ios'?(
      // <View style={{flexDirection: 'row',
      //   justifyContent: 'space-between',
      //   alignItems: 'center'}}>
      <View>
      <Text style={Style.label}>Start Time</Text>
      <TextInput 
        // placeholder="Start Time"
        style={Style.input}
        value={inputDate?inputDate + '  ' + inputTime:''}
        editable={false}
        onPress={() => setShowDatePicker(!showDatePicker)}
        />
      {showDatePicker && (
        <View style={{ alignItems: 'flex-start', marginBottom:15, paddingLeft:0}}>
      <DateTimePicker
        value={date}
        mode="datetime"
        display="default" // Use inline display for the date picker
        onChange={onChangeDateTime}
      />
      </View>
    )}
      </View>
    ) : (
      <>
      <Text style={Style.label}>Start Date</Text>
      <TouchableOpacity onPress={toggleDatePicker}>
      <TextInput 
        // placeholder="Start Time"
        style={Style.input}
        value={inputDate}
        editable={false}
        // onPress={toggleDatePicker}
        />
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
        <Text style={Style.label}>Start Time</Text>
        <TouchableOpacity onPress={toggleTimePicker}>
        <TextInput 
        // placeholder="Start Time"
        style={Style.input}
        value={inputTime}
        editable={false}
        // onPress={toggleTimePicker}
        />
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

    <Text style={Style.label}>Max Capacity</Text>
    <TextInput
      // placeholder="Max Capacity"
      value={limit}
      onChangeText={setLimit}
      style={Style.input}
    />
    <Text style={Style.label}>Location</Text>
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
      componentStyle={Style.locationButton}
    >
      <View style={Style.locationButtonContent}>
        <FontAwesome6 name="location-dot" size={20} color={Color.navigatorBg} />
        <Text style={Style.locationText}>{address || "Select Location"}</Text>
      </View>
    </CusPressable>
    
    <View style={Style.descriptionContainer}>
      <Text style={Style.label}>Description</Text>
      <CusPressable
        componentStyle={Style.AIbutton}
        // pressedStyle={Style.AIbuttonPressed}
        pressedHandler={openInputPrompt}
      >
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 5}}>
          <FontAwesome5 
            name="magic" 
            size={18} 
            color={Color.navigatorBg} 
          />
          <Text style={{color: 'black'}}>Ai-generate</Text>
        </View>
      </CusPressable>
  </View>

  <TextInput
      // placeholder="Description"
      value={description}
      onChangeText={setDescription}
      style={[Style.input, Style.descriptionInput]}
      multiline
    />
    <View style={Style.buttonContainer}>
    <CusPressable
          componentStyle={[Style.createButton, {backgroundColor: Color.lightgray}]}
          pressedStyle={[Style.buttonPressed, {backgroundColor: Color.gray}]}
          pressedHandler={handleCancel}
      >
          <Text style={[Style.buttonText, {color: Color.black}]}>Cancel</Text>
      </CusPressable>
      <CusPressable
          componentStyle={Style.createButton}
          pressedStyle={Style.buttonPressed}
          pressedHandler={handleSubmit}
      >
          <Text style={Style.buttonText}>Submit</Text>
      </CusPressable>
    </View>
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType='fade'
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={Style.modalOverlay}>
        <View style={Style.AImodalContent}>
          <Text style={Style.modalTitle}>AI Auto Generate Description</Text>
          <TextInput
            style={Style.modalInput}
            placeholder="Provide more details for the event!"
            value={modalInput}
            onChangeText={setModalInput}
            multiline
          />
              <View style={Style.buttonContainer}>
              <CusPressable
                    componentStyle={[Style.modalButton, {backgroundColor: Color.lightgray}]}
                    pressedStyle={[Style.buttonPressed, {backgroundColor: Color.gray}]}
                    pressedHandler={() => {
                      setModalVisible(false);
                      setModalInput('');
                    }}
                >
                    <Text style={[Style.buttonText, {color: Color.black}]}>Cancel</Text>
                </CusPressable>
                <CusPressable
                    componentStyle={Style.modalButton}
                    pressedStyle={Style.buttonPressed}
                    pressedHandler={async () => {
                      setModalVisible(false);
                      await handleGenerateDescription(modalInput);
                      setModalInput('');
                    }}
                >
                    <Text style={Style.buttonText}>Generate</Text>
                </CusPressable>
              </View>
        </View>
      </View>
    </Modal>
  </ScrollView>
  );
}
