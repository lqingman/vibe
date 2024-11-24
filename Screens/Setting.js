import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, database } from '../Firebase/firebaseSetup';
import { updateUserProfile } from '../Firebase/firestoreHelper';
import { doc, getDoc } from 'firebase/firestore';
import ImageManager from '../Components/ImageManager';
import { isFirebaseStorageUri, fetchAndUploadImage } from '../Firebase/firestoreHelper';

// Setting screen
export default function Setting({ navigation }) {
  // States for name, bio, age, gender, and picture
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [picture, setPicture] = useState('');

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
      }
    };

    fetchUserProfile();
  }, [auth.currentUser]);

  // Function to handle updating the profile
  const handleUpdateProfile = async () => {
    let finalImageUri = picture;
    if (!isFirebaseStorageUri(picture)) {
        // Only upload if it's a new local image
        finalImageUri = await fetchAndUploadImage(picture);
    }
    const updatedData = {
      name: name,
      bio: bio,
      age: age,
      gender: gender,
      picture: finalImageUri,
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
        <ImageManager receiveImageUri={setPicture} initialImage={picture} imageStyle={{borderRadius: 50,}}/>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
      />
      
      <Button title="Update Profile" onPress={handleUpdateProfile} />
      <Button title="Sign out" onPress={() => signOut(auth)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
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
});
