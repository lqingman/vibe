import React, { useState } from 'react';
import { View, Text, TextInput,TouchableWithoutFeedback, Button, Image, TouchableOpacity, Alert, StyleSheet, Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, database } from '../Firebase/firebaseSetup';
import { writeToDB, deleteFromDB, deleteAllFromDB } from '../Firebase/firestoreHelper';

export default function CreatePost() {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [inputDate, setInputDate] = useState('');
  const [inputTime, setInputTime] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);

  

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShowDatePicker(false); // Hide the date picker on both platforms
    setDate(currentDate);
    setInputDate(currentDate.toLocaleDateString());
  };
  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime;
    setShowTimePicker(false); 
    setDate(currentTime);
    setInputTime(currentTime.toLocaleTimeString());
  };
  const onChangeDateTime = (event, selectedDateTime) => {
    const currentDateTime = selectedDateTime;
    // setShowDatePicker(false); // Hide the date picker on both platforms
    setDate(currentDateTime);
    setInputDate(currentDateTime.toLocaleDateString());
    setInputTime(currentDateTime.toLocaleTimeString());
  }
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);

  };
  const toggleTimePicker = () => {
    setShowTimePicker(!showTimePicker);
  };
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
    if (!location) {
      Alert.alert('Location is required');
      return false;
    }
    if (!image) {
      Alert.alert('Image is required');
      return false;
    }
    return true;
  };
  const handleSubmit = () => {
    if (!validateInputs()) return;
    // confirm before submitting
    

    const newPost = {
        title: title,
        date: inputDate,
        description: description,
        location: location,
        // image: image,
        owner: auth.currentUser.uid

    };
    // addDiet(newDiet); // Update the data array using context
    writeToDB(newPost, 'post');
    Alert.alert('Post created successfully');


};
  return (
    <View
      style={{
        flex: 1,
        padding: 20,
      }}
    >
    {/* image feature to be improved */}
    <TouchableOpacity onPress={pickImage} style={{ marginBottom: 20 }}>
      {image ? (
        <Image source={{ uri: image }} style={{ width: 100, height: 100 }} />
      ) : (
        <View style={{ width: 100, height: 100, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', borderRadius: 5, }}>
          <Text>Add Photo</Text>
        </View>
      )}
    </TouchableOpacity>

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
      <View style={{flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'}}>
      <Text>{"Start Time"}</Text>
      <DateTimePicker
        value={date}
        mode="datetime"
        display="default" // Use inline display for the date picker
        onChange={onChangeDateTime}
      />
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
  
  <TextInput
      placeholder="Description"
      value={description}
      onChangeText={setDescription}
      style={styles.descriptionInput}
      multiline
    />

    <TextInput
      placeholder="Location"
      value={location}
      onChangeText={setLocation}

    />
    <View style={styles.buttonContainer}>
      <Button title="Cancel" onPress={() => { /* Handle cancel */ }} />
      <Button title="Create Post" onPress={handleSubmit} />
    </View>
  </View>
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
  descriptionInput: {
    height: 150,
    textAlignVertical: 'top', 
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginHorizontal: 30,
  },
})