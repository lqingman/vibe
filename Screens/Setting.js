import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { auth, database } from '../Firebase/firebaseSetup';
import { updateUserProfile } from '../Firebase/firestoreHelper';
import { doc, getDoc } from 'firebase/firestore';
import ImageManager from '../Components/ImageManager';
import { isFirebaseStorageUri, fetchAndUploadImage } from '../Firebase/firestoreHelper';
import CusPressable from '../Components/CusPressable';
import Style from '../Styles/Style';
import Color from '../Styles/Color';

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
      <View style={[Style.container, {padding:20}]}>
        <Text>Please log in to update your profile.</Text>
      </View>
    );
  }

  return (
    <View style={[Style.container, {padding:20}]}>
      {/* <Text style={styles.header}>Update Profile</Text> */}
      <View style={Style.settingImagePicker}>
        <ImageManager 
        receiveImageUris={setPicture} 
        initialImages={picture} 
        imageStyle={{borderRadius: 50}} 
        singleImageMode={true}/>
      </View>
      <Text style={Style.label}>Name</Text>
      <TextInput
        style={Style.input}
        // placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <Text style={Style.label}>Email</Text>
      <TextInput
        style={[Style.input, {color: Color.gray}]}
        // placeholder="Email"
        value={email}
        editable={false}
      />
      <Text style={Style.label}>Bio</Text>
      <TextInput
        style={Style.input}
        // placeholder="Bio"
        value={bio}
        onChangeText={setBio}
      />
      <Text style={Style.label}>Age</Text>
      <TextInput
        style={Style.input}
        // placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <Text style={Style.label}>Pronoun</Text>
      <TextInput
        style={Style.input}
        // placeholder="Pronoun"
        value={gender}
        onChangeText={setGender}
      />
      
      {/* <Button title="Update Profile" onPress={handleUpdateProfile} /> */}
      <CusPressable
          componentStyle={[Style.button, {marginTop: 10}]}
          pressedStyle={Style.buttonPressed}
          pressedHandler={handleUpdateProfile}
      >
          <Text style={Style.buttonText}>Update Profile</Text>
      </CusPressable>
      {/* <Button title="Sign out" onPress={() => signOut(auth)} /> */}
    </View>
  );
}
