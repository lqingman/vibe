import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import the createUserWithEmailAndPassword function
import { auth } from '../Firebase/firebaseSetup'; // Import the auth object
import { writeToDB, deleteFromDB, deleteAllFromDB } from '../Firebase/firestoreHelper';


export default function Signup({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const loginHandler = () => {
    //take user to login
    navigation.replace("Login");
  };

  const handleSignup = async () => {
    // Handle signup logic here
    // console.log('Signup:', name, email, password);
    // do validation
    
    

    // Create a new user with email and password
    try {
        // email, password and confirm password should not be empty
        if (!email || !password || !confirmPassword) {
            Alert.alert('Please fill in all fields');
            return;
        }
        // password and confirm password should match
        if (password !== confirmPassword) {
            Alert.alert('Passwords do not match');
            return;
        }
        // email should be valid
        if (!email.includes('@')) {
            Alert.alert('Please enter a valid email');
            return;
        }
        // password should be at least 6 characters long
        if (password.length < 6) {
            Alert.alert('Password should be at least 6 characters long');
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User created:', user);
        Alert.alert('Signup successful', `Welcome, ${user.email}`);
        const newUser = {
          name: name,
          email: email,
          uid: user.uid,
          picture: '',
          bio: '',
          age: '',
          gender: '',
          posts: [],
          favorites: [],
          joined: []
        }
        writeToDB(newUser, 'users');
        // Navigate to the Login screen or Home screen after successful signup
        // navigation.navigate('Home');
      } catch (error) {
        console.error('Error creating user:', error);
        Alert.alert('Signup failed', error.message);
      }

  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Signup</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <Button title="Signup" onPress={handleSignup} />
      <Button title="Go to Login" onPress={loginHandler} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
});