import { View, Text, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import the createUserWithEmailAndPassword function
import { auth } from '../Firebase/firebaseSetup'; // Import the auth object
import { writeToDB} from '../Firebase/firestoreHelper';
import CusPressable from '../Components/CusPressable';
import Style from '../Styles/Style';

// Signup screen
export default function Signup({ navigation }) {
  // States for name, email, password, confirm password, password strength, and confirm password error
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '' });
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Function to get password strength
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
  
    if (score === 0) return { strength: 0, label: '' };
    if (score <= 2) return { strength: 1, label: 'Weak', color: '#ff4444' };
    if (score <= 4) return { strength: 2, label: 'Medium', color: '#ffbb33' };
    return { strength: 3, label: 'Strong', color: '#00C851' };
  };

  // Function to handle password change
  function onChangePassword(password) {
    setPassword(password);
    if (!password || password.trim() === '') {
      setPasswordStrength({ strength: 0, label: '' });
    } else {
      setPasswordStrength(getPasswordStrength(password));
    }
  }
  const onChangeConfirmPassword = (text) => {
    setConfirmPassword(text);
    if (text && text !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  // Function to handle login
  const loginHandler = () => {
    //take user to login
    navigation.replace("Login");
  };

  // Function to handle signup  
  const handleSignup = async () => {
    // console.log('Signup:', name, email, password);
    // Create a new user with email and password
    try {
        // email, password and confirm password should not be empty
        if (!email || !password || !confirmPassword) {
            Alert.alert('Please fill in all fields');
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
        if (passwordStrength.strength < 2) {
          Alert.alert('Password is too weak', 'Please make it stronger by including at least 8 characters, a mix of uppercase and lowercase letters, numbers, and special symbols.');
          return;
        }
        // password and confirm password should match
        if (password !== confirmPassword) {
          Alert.alert('Passwords do not match');
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
          picture: [],
          bio: '',
          age: '',
          gender: '',
          posts: [],
          favorites: [],
          joined: []
        }
        await writeToDB(newUser, 'users', user.uid); // Use user.uid as the document ID
        // Navigate to the Login screen or Home screen after successful signup
        // navigation.navigate('Home');
      } catch (error) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            Alert.alert('Email Already Exists', 'This email is already registered. Please use a different email or login.');
            break;
          case 'auth/invalid-email':
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            break;
          case 'auth/weak-password':
            Alert.alert('Weak Password', 'Password should be at least 6 characters long.');
            break;
          case 'auth/network-request-failed':
            Alert.alert('Network Error', 'Please check your internet connection.');
            break;
          case 'auth/operation-not-allowed':
            Alert.alert('Signup Error', 'Email/password accounts are not enabled. Please contact support.');
            break;
          default:
            Alert.alert('Signup Error', 'An error occurred while creating your account.');
        }
      }

  };

  return (
    <View style={[Style.container, {justifyContent: 'center', padding: 20,}]}>
      <Text style={Style.header}>Welcome!</Text>
      <Text style={Style.slogan}>Start a new local adventure!</Text>
      <TextInput
        style={Style.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={Style.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[Style.input, {marginBottom: 10}]}
        placeholder="Password"
        value={password}
        onChangeText={onChangePassword}
        secureTextEntry
      />
      <View style={Style.strengthIndicator}>
        {passwordStrength.label && (
          <>
            <View style={Style.strengthBars}>
              <View style={[
                Style.strengthBar,
                { backgroundColor: passwordStrength.strength >= 1 ? passwordStrength.color : '#e0e0e0' }
              ]} />
              <View style={[
                Style.strengthBar,
                { backgroundColor: passwordStrength.strength >= 2 ? passwordStrength.color : '#e0e0e0' }
              ]} />
              <View style={[
                Style.strengthBar,
                { backgroundColor: passwordStrength.strength >= 3 ? passwordStrength.color : '#e0e0e0' }
              ]} />
            </View>
            <Text style={[Style.strengthText, { color: passwordStrength.color }]}>
              {passwordStrength.label}
            </Text>
          </>
        )}
      </View>
      <TextInput
        style={[Style.input, { marginBottom: confirmPasswordError ? 5 : 20 }]}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={onChangeConfirmPassword}
        secureTextEntry
      />
      {confirmPasswordError ? (
        <Text style={Style.confirmText}>{confirmPasswordError}</Text>
      ) : null}
      <CusPressable
          componentStyle={Style.button}
          pressedStyle={Style.buttonPressed}
          pressedHandler={handleSignup}
      >
          <Text style={[Style.buttonText, {fontSize: 18}]}>Sign up</Text>
      </CusPressable>
      <Text 
        style={[Style.underline, { marginTop: 30 }]}
        onPress={loginHandler}
      >
        Already have an account? Login
      </Text>
    </View>
  );
}

