import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, database } from '../Firebase/firebaseSetup';
import { updateUserProfile } from '../Firebase/firestoreHelper';
import { doc, getDoc } from 'firebase/firestore';
import ImageManager from '../Components/ImageManager';
import { isFirebaseStorageUri, fetchAndUploadImage } from '../Firebase/firestoreHelper';
import CusPressable from '../Components/CusPressable';

// Setting screen
export default function Setting({ navigation }) {
  // States for name, bio, age, gender, and picture
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [picture, setPicture] = useState([]);
  const [email, setEmail] = useState('');

  // Effect to fetch the user profile
  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    const fetchUserProfile = async () => {
      const userDocRef = doc(database, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setName(userData.name);
        setBio(userData.bio);
        setAge(userData.age);
        setGender(userData.gender);
        setPicture(userData.picture);
        setEmail(userData.email);
      }
    };

    fetchUserProfile();
  }, [auth.currentUser]);

  // Function to handle updating the profile
  const handleUpdateProfile = async () => {
    const finalImageUris = await Promise.all(picture.map(async (image) => {
      if (!isFirebaseStorageUri(image)) {
        // Only upload if it's a new local image
        return await fetchAndUploadImage(image);
      }
      return image;
    }));
    const updatedData = {
      name: name,
      bio: bio,
      age: age,
      gender: gender,
      picture: finalImageUris,
    };

    try {
      await updateUserProfile(auth.currentUser.uid, updatedData);
      Alert.alert('Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error updating profile', error.message);
    }
  };
  
  // If the user is not logged in, show a message
  if (!auth.currentUser) {
    return (
      <View style={styles.container}>
        <Text>Please log in to update your profile.</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>Update Profile</Text> */}
      <View style={styles.imagePicker}>
        <ImageManager 
        receiveImageUris={setPicture} 
        initialImages={picture} 
        imageStyle={{borderRadius: 50}} 
        singleImageMode={true}/>
      </View>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        // placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, {color: 'gray'}]}
        // placeholder="Email"
        value={email}
        editable={false}
      />
      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={styles.input}
        // placeholder="Bio"
        value={bio}
        onChangeText={setBio}
      />
      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        // placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Pronoun</Text>
      <TextInput
        style={styles.input}
        // placeholder="Pronoun"
        value={gender}
        onChangeText={setGender}
      />
      
      {/* <Button title="Update Profile" onPress={handleUpdateProfile} /> */}
      <CusPressable
          componentStyle={styles.button}
          pressedStyle={styles.buttonPressed}
          pressedHandler={handleUpdateProfile}
      >
          <Text style={styles.buttonText}>Update Profile</Text>
      </CusPressable>
      {/* <Button title="Sign out" onPress={() => signOut(auth)} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: 'gray',
    marginStart: 5,
  },
  input: {
    height: 40,
    borderColor: 'lightgray',
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',

  },
  image: {
    width: 100,
    height: 100,
  },
  button: {
    backgroundColor: '#363678',
    paddingVertical: 10,
    // paddingHorizontal: 30,
    marginTop: 20,
    borderRadius: 5,
    width: '100%', 
    alignItems: 'center', 
  },
  buttonPressed: {
    backgroundColor: '#1884c7', 
    transform: [{ scale: 0.98 }], 
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
