import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, database } from '../Firebase/firebaseSetup';
import { updateUserProfile } from '../Firebase/firestoreHelper';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc } from 'firebase/firestore';

export default function Setting({ navigation }) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [picture, setPicture] = useState(null);

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
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setPicture(result.uri);
    }
  };

  const handleUpdateProfile = async () => {
    const updatedData = {
      name,
      bio,
      age,
      gender,
      picture,
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Update Profile</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {picture ? (
          <Image source={{ uri: picture }} style={styles.image} />
        ) : (
          <Text>Select Picture</Text>
        )}
      </TouchableOpacity>
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
    height: 100,
    width: 100,
    backgroundColor: '#ccc',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
  },
});
