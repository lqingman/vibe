import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import the createUserWithEmailAndPassword function
import { auth } from '../Firebase/firebaseSetup'; // Import the auth object
import { writeToDB, deleteFromDB, deleteAllFromDB } from '../Firebase/firestoreHelper';
import CusPressable from '../Components/CusPressable';

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
        console.error('Error creating user:', error);
        Alert.alert('Signup failed', error.message);
      }

  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome!</Text>
      <Text style={styles.slogan}>Start a new local adventure!</Text>
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
        style={[styles.input, {marginBottom: 10}]}
        placeholder="Password"
        value={password}
        onChangeText={onChangePassword}
        secureTextEntry
      />
      <View style={styles.strengthIndicator}>
        {passwordStrength.label && (
          <>
            <View style={styles.strengthBars}>
              <View style={[
                styles.strengthBar,
                { backgroundColor: passwordStrength.strength >= 1 ? passwordStrength.color : '#e0e0e0' }
              ]} />
              <View style={[
                styles.strengthBar,
                { backgroundColor: passwordStrength.strength >= 2 ? passwordStrength.color : '#e0e0e0' }
              ]} />
              <View style={[
                styles.strengthBar,
                { backgroundColor: passwordStrength.strength >= 3 ? passwordStrength.color : '#e0e0e0' }
              ]} />
            </View>
            <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
              {passwordStrength.label}
            </Text>
          </>
        )}
      </View>
      <TextInput
        style={[styles.input, { marginBottom: confirmPasswordError ? 5 : 20 }]}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={onChangeConfirmPassword}
        secureTextEntry
      />
      {confirmPasswordError ? (
        <Text style={styles.confirmText}>{confirmPasswordError}</Text>
      ) : null}
      <CusPressable
          componentStyle={styles.button}
          pressedStyle={styles.buttonPressed}
          pressedHandler={handleSignup}
      >
          <Text style={styles.buttonText}>Sign up</Text>
      </CusPressable>
      <Text 
        style={[styles.underline, { marginTop: 30 }]}
        onPress={loginHandler}
      >
        Already have an account? Login
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
  strengthIndicator: {
    marginBottom: 10,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 10,
    // width: '90%',
    // marginTop: 5,
  },
  strengthBar: {
    flex: 1,
    height: 5,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
  },
  strengthText: {
    fontSize: 12,
    marginTop: 5,
    // marginBottom: 10,
    color:'red'
  },
  confirmText: {
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
    color:'red'
  },
  button: {
    backgroundColor: '#363678',
    paddingVertical: 10,
    // paddingHorizontal: 30,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  underline: {
    color: 'gray',
    textAlign: 'center',
    // marginVertical: 15,
    textDecorationLine: 'underline',
  },
});