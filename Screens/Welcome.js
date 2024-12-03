import { View, Text, ImageBackground } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import CusPressable from '../Components/CusPressable';
import Style from '../Styles/Style';
import Color from '../Styles/Color';

// Welcome screen
const Welcome = () => {
  // Navigation
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1531686264889-56fdcabd163f?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
      style={Style.background}
    >
      <View style={Style.overlay}>
        <Text style={Style.appName}>Vibe</Text>
        <Text style={Style.welcomeSlogan}>Find Your Tribe, Feel the Vibe!</Text>
        
        <Text style={Style.welcomeDescription}>Discover and join exciting local events with like-minded people!</Text>
        <View style={Style.welcomeButtonContainer}>
            <CusPressable
                componentStyle={Style.button}
                pressedStyle={Style.buttonPressed}
                pressedHandler={() => navigation.navigate('Signup')}
            >
                <Text style={[Style.buttonText, {fontSize: 18}]}>Sign up</Text>
            </CusPressable>
            
            <CusPressable
                componentStyle={[Style.button, {backgroundColor: Color.lightgray}]}
                pressedStyle={[Style.buttonPressed, {backgroundColor: Color.gray}]}
                pressedHandler={() => navigation.navigate('Login')}
            >
                <Text style={[Style.buttonText, {color:'black', fontSize: 18}]}>Log in</Text>
            </CusPressable>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Welcome;