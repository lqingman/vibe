import 'react-native-get-random-values';  
import { View, StyleSheet, Alert, Text } from 'react-native'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import LocationManager from '../Components/LocationManager';
import CusPressable from '../Components/CusPressable';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getUserData, updateDB } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// Change location screen
export default function ChangeLocation() {
  // Refs
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  //route and navigation
  const route = useRoute();
  const navigation = useNavigation();
  
  //location states
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [response, requestPermission] = Location.useForegroundPermissions();

  //useEffect to get user location
  useEffect(() => {
    async function getLocation() {
      const userData = await getUserData(auth.currentUser.uid, 'users');
      if (userData?.location) {
        setLocation(userData.location);
        setSelectedLocation(userData.location);
      }
    }
    getLocation();
  }, []);

  // Memoize the location selection handler
  const handleLocationSelect = useCallback((data, details) => {
    if (details) {
      const newLocation = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };
      setSelectedLocation(newLocation);
      
      // Only animate map if we have a valid ref
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...newLocation,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }, 1000); 
      }
    }
  }, []);

  //function to verify permissions
  async function verifyPermissions() {
    if (response?.granted) {
      return true;
    }
    const permissionResponse = await requestPermission();
    return permissionResponse.granted;
  }

  //function to locate user
  const locateUserHandler = async () => {
    try {
      const hasPermission = await verifyPermissions();
      if (!hasPermission) {
        Alert.alert('You need to grant location permissions to use this app.');
        return;
      }
      //get current location
      const locationResponse = await Location.getCurrentPositionAsync();
      const newLocation = {
        latitude: locationResponse.coords.latitude,
        longitude: locationResponse.coords.longitude
      };
      setLocation(newLocation);
      setSelectedLocation(newLocation);
      //updateDB(auth.currentUser.uid, { location: newLocation }, 'users');
      
      // Clear the search input when using current location
      if (autocompleteRef.current) {
        autocompleteRef.current.clear();
      }
    } catch (err) {
      console.log("Location error", err);
      Alert.alert('Error', 'Could not fetch location.');
    }
  };

  //function to save location
  function saveLocationHandler() {
    if (!selectedLocation) return;
    //console.log("Selected Location:", selectedLocation);
    updateDB(auth.currentUser.uid, { location: selectedLocation }, 'users');
    if (route.params?.onReturn) {
      route.params.onReturn(selectedLocation);
    }
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <GooglePlacesAutocomplete
          ref={autocompleteRef}
          placeholder='Search location'
          fetchDetails={true}
          onPress={handleLocationSelect}
          query={{
            key: process.env.EXPO_PUBLIC_mapsApiKey,
            language: 'en',
          }}
          styles={{
            container: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
            },
            textInput: {
              height: 40,
              borderRadius: 20,
              backgroundColor: '#f0f0f0',
              borderWidth: 1,
              borderColor: 'lightgrey',
              marginHorizontal: 10,
              marginTop: 10,
            },
            listView: {
              position: 'absolute',
              top: 45,
              left: 10,
              right: 10,
              backgroundColor: 'white',
              borderRadius: 5,
              zIndex: 1000,
            },
            row: {
              backgroundColor: 'white',
            }
          }}
          enablePoweredByContainer={false}
          debounce={300} // Add debounce to reduce API calls
          minLength={2} // Only start searching after 2 characters
        />
      </View>
      
      <View style={styles.mapView}>
        <LocationManager 
          ref={mapRef}
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
        />
      </View>

      <CusPressable
        componentStyle={styles.locateButton}
        childrenStyle={styles.locateIcon}
        pressedHandler={locateUserHandler}
      >
        <FontAwesome6 name="location-crosshairs" size={32} color="black" />
      </CusPressable>
      
      <View style={styles.confirmButton}>
        <CusPressable
          componentStyle={{
            width: '100%',
            alignSelf: 'center',
          }}
          childrenStyle={{
            padding: 10,
            backgroundColor: selectedLocation ? '#363678' : 'grey',
            borderRadius: 10,
            alignItems: 'center',
            
          }}
          pressedHandler={saveLocationHandler}
          disabled={!selectedLocation}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </CusPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: 'white',
  },
  searchBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 1,
  },
  text: {
    fontSize: 20,
    color: 'black',
  },
  mapView: {
    height: '90%',
    width: '100%',
  },
  locateButton: {
    position: 'absolute',
    bottom: 75,
    right: 10,
  },
  locateIcon:{
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 10,
    borderRadius: 25,
  },
  confirmButton: {
    width: '30%',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
