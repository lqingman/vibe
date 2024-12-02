import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import CusPressable from '../Components/CusPressable';

// Welcome screen
const Welcome = () => {
  // Navigation
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1531686264889-56fdcabd163f?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.appName}>Vibe</Text>
        <Text style={styles.slogan}>Find Your Tribe, Feel the Vibe!</Text>
        
        <Text style={styles.description}>Discover and join exciting local events with like-minded people!</Text>
        <View style={styles.buttonContainer}>
            <CusPressable
                componentStyle={styles.button}
                pressedStyle={styles.buttonPressed}
                pressedHandler={() => navigation.navigate('Signup')}
            >
                <Text style={styles.buttonText}>Sign up</Text>
            </CusPressable>
            
            <CusPressable
                componentStyle={[styles.button, {backgroundColor: '#f0f0f0'}]}
                pressedStyle={[styles.buttonPressed, {backgroundColor: 'gray'}]}
                pressedHandler={() => navigation.navigate('Login')}
            >
                <Text style={[styles.buttonText, {color:'black'}]}>Log in</Text>
            </CusPressable>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    width: '100%',
    padding: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,

  },
  slogan: {
    fontSize: 20,
    color: 'white',
    marginBottom: 30,
    // textAlign: 'left',
    fontWeight: 'bold',

  },
  description: {
    fontSize: 16,
    color: 'white',
    marginBottom: 200,
    textAlign: 'left',
  },
  buttonContainer: {
    flexDirection: 'column', 
    alignItems: 'center',
    width: '80%',
    gap: 20, 
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
});

export default Welcome;