import { View, Button, Alert, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getUserData, updateDB } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import Map from './Map';
import MapView, { Marker } from "react-native-maps";


export default function LocationManager() {
  const mapsApiKey = process.env.EXPO_PUBLIC_mapsApiKey;

  const [response, requestPermission] = Location.useForegroundPermissions();
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState();
  //console.log(mapsApiKey)
  const route = useRoute();
  const navigation = useNavigation();

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

  //if (location)console.log(`https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=14&size=400x200&maptype=roadmap&markers=color:red%7Clabel:L%7C${location.latitude},${location.longitude}&key=${mapsApiKey}` )
  return (
    <View style={styles.container}>
      <MapView
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        style={styles.map}
        onPress={(e) => {
          //console.log(e.nativeEvent)}
          setSelectedLocation({
            latitude: e.nativeEvent.coordinate.latitude,
            longitude: e.nativeEvent.coordinate.longitude,
          });
          } 
        }
      >
        {selectedLocation && (
          <Marker coordinate={selectedLocation} />
        )}
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
})