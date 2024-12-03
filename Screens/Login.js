import { View, Text, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { auth } from '../Firebase/firebaseSetup'; 
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; 
import CusPressable from '../Components/CusPressable';
import Style from '../Styles/Style';

// Login screen
export default function Login({ navigation }) {
  // States for email and password        
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle forgot password
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Please enter your email address first');
      return;
    }
  
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email to reset your password'
      );
    } catch (error) {
      console.error('Error sending reset email:', error);
      Alert.alert('Error', error.message);
    }
  };

  // Function to handle signup
  const signupHandler = () => {
    //take user to sign up
    navigation.replace("Signup");
  };

  // Function to handle login
  const handleLogin = async () => {
    // console.log('Login:', email, password);
    // Validate input fields
    if (!email || !password) {
        Alert.alert('Please fill in all fields');
        return;
      }
  
      // Log in the user with email and password
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User logged in:', user);
        Alert.alert('Login successful', `Welcome back, ${user.email}`);
        // Navigate to the Home screen or another screen after successful login
        // navigation.navigate('Home');
      } catch (error) {
        // console.error('Error logging in:', error);
        switch (error.code) {
          case 'auth/invalid-credential':
            Alert.alert('Invalid Credential', 'Please check your email and password.');
            break;
          case 'auth/invalid-email':
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            break;
          case 'auth/user-not-found':
            Alert.alert('Account Not Found', 'No account exists with this email.');
            break;
          case 'auth/wrong-password':
            Alert.alert('Wrong Password', 'The password you entered is incorrect.');
            break;
          case 'auth/too-many-requests':
            Alert.alert('Too Many Attempts', 'Please try again later or reset your password.');
            break;
          case 'auth/network-request-failed':
            Alert.alert('Network Error', 'Please check your internet connection.');
            break;
          default:
            Alert.alert('Login Error', 'An error occurred. Please try again.');
        }
      }

  };

  return (
    <View style={[Style.container, {justifyContent: 'center', padding: 20,}]}>
      <Text style={Style.header}>Welcome Back!</Text>
      <Text style={Style.slogan}>Continue your adventure!</Text>
      <TextInput
        style={Style.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={Style.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {/* <Button title="Login" onPress={handleLogin} /> */}
      <CusPressable
          componentStyle={Style.button}
          pressedStyle={Style.buttonPressed}
          pressedHandler={handleLogin}
      >
          <Text style={[Style.buttonText, {fontSize: 18}]}>Log in</Text>
      </CusPressable>
      <Text 
        style={Style.forgotPassword}
        onPress={handleForgotPassword}
      >
        Forgot Password?
      </Text>
      <Text 
        style={Style.underline}
        onPress={signupHandler}
      >
        Don't have an account? Signup
      </Text>
    </View>
  );
}

