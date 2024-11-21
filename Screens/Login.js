import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react';
import { auth } from '../Firebase/firebaseSetup'; // Import the Auth service instance
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; // Import the signInWithEmailAndPassword function

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
      <Text style={styles.header}>Login</Text>
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
      <Button title="Login" onPress={handleLogin} />
      <Text 
        style={styles.forgotPassword}
        onPress={handleForgotPassword}
      >
        Forgot Password?
      </Text>
      <Button title="Go to Signup" onPress={signupHandler} />
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
  forgotPassword: {
    color: '#1DA1F2',
    textAlign: 'center',
    marginVertical: 15,
    textDecorationLine: 'underline',
  },
});