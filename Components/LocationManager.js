import { View, Button, Alert, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getUserData, updateDB } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import Map from './Map';


export default function LocationManager() {
  const [response, requestPermission] = Location.useForegroundPermissions();
  const [location, setLocation] = useState(null);
  const mapsApiKey = process.env.EXPO_PUBLIC_mapsApiKey;
  //console.log(mapsApiKey)
  const route = useRoute();

  useEffect(() => {
    async function getLocation() {
      const userData = await getUserData(auth.currentUser.uid, 'users');
      console.log(userData);
      if (userData && userData.location) {
        setLocation(userData.location);
      }
  }
  getLocation();
  }, []);

  useEffect(() => {
    //console.log(route.params);
    if (route.params){
      setLocation(route.params.selectedLocation);
    }
  }, [route]);

  const navigation = useNavigation();

  async function verifyPermissions() {
    try {
      if (response.granted) {
        return true;
      }
      const permissionResponse = await requestPermission();
      return permissionResponse.granted;
    }
    catch (err) {
      console.log("verify permissions", err);
    }
  }

  const locateUserHandler = async () => {
    try {
      const hasPermission = await verifyPermissions();
      if (!hasPermission) {
        Alert.alert('You need to grant location permissions to use this app.');
        return;
      }
      const locationResponse = await Location.getCurrentPositionAsync();
      console.log(locationResponse);
      console.log(hasPermission);
      setLocation({latitude: locationResponse.coords.latitude, longitude: locationResponse.coords.longitude});
      console.log(location);
    }
    catch (err) {
      console.log("Location error", err);
    }
  };

  function saveLocationHandler() {
    updateDB(auth.currentUser.uid, {location}, 'users');
    navigation.navigate('Home');
  }

  if (location)console.log(`https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=14&size=400x200&maptype=roadmap&markers=color:red%7Clabel:L%7C${location.latitude},${location.longitude}&key=${mapsApiKey}` )
  return (
    <View style={{flex:1}}>
      <Map/>
      {location &&
        <Image 
          source={{ uri: `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=14&size=400x200&maptype=roadmap&markers=color:red%7Clabel:L%7C${location.latitude},${location.longitude}&key=${mapsApiKey}` }} 
          style={{ width: "100%", height: 200 }} />
      }
      <Button title="Use Current Location" onPress={locateUserHandler}/>
      <Button disabled={!location} title="Confirm" onPress={saveLocationHandler} />
    </View>
  )
}