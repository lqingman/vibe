import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react';
import { auth } from '../Firebase/firebaseSetup'; // Import the Auth service instance
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; // Import the signInWithEmailAndPassword function
import CusPressable from '../Components/CusPressable';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  const signupHandler = () => {
    //take user to sign up
    navigation.replace("Signup");
  };
  const handleLogin = async () => {
    // Handle login logic here
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
        console.error('Error logging in:', error);
        Alert.alert('Login failed', error.message);
      }

  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome Back!</Text>
      <Text style={styles.slogan}>Continue your adventure!</Text>
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
      {/* <Button title="Login" onPress={handleLogin} /> */}
      <CusPressable
          componentStyle={styles.button}
          pressedStyle={styles.buttonPressed}
          pressedHandler={handleLogin}
      >
          <Text style={styles.buttonText}>Log in</Text>
      </CusPressable>
      <Text 
        style={styles.forgotPassword}
        onPress={handleForgotPassword}
      >
        Forgot Password?
      </Text>
      <Text 
        style={styles.underline}
        onPress={signupHandler}
      >
        Don't have an account? Signup
      </Text>
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
    fontSize: 30,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  slogan: {
    fontSize: 16,
    color: 'black',
    marginBottom: 100,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'lightgray',
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  forgotPassword: {
    color: '#1DA1F2',
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 16,
    marginTop: 30,
    // textDecorationLine: 'underline',
  },
  underline: {
    color: 'gray',
    textAlign: 'center',
    // marginVertical: 15,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#363678',
    paddingVertical: 10,
    // paddingHorizontal: 30,
    borderRadius: 5,
    width: '100%', // Make buttons full width
    alignItems: 'center', // Center button text
  },
  buttonPressed: {
    backgroundColor: '#1884c7', // Slightly darker when pressed
    transform: [{ scale: 0.98 }], // Slight scale effect when pressed
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});