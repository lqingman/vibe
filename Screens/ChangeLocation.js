import 'react-native-get-random-values';  
import { View, StyleSheet, Alert, Button, Text } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SearchBar } from 'react-native-elements';
import LocationManager from '../Components/LocationManager';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { getUserData, updateDB } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import CusPressable from '../Components/CusPressable';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';



export default function ChangeLocation() {
  const mapRef = useRef(null);

  const [search, setSearch] = useState('');  
  const [searchResults, setSearchResults] = useState([]);

  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const navigation = useNavigation();
  const [response, requestPermission] = Location.useForegroundPermissions();

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

  const updateSearch = async (search) => {
    setSearch(search);
    
    if (search.length > 2) { // Only search if input is longer than 2 characters
      try {
        const results = await Location.geocodeAsync(search);
        if (results.length > 0) {
          const newLocation = {
            latitude: results[0].latitude,
            longitude: results[0].longitude,
          };
          setSelectedLocation(newLocation);
          // Optionally update map region to show the searched location
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              ...newLocation,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          }
        }
      } catch (error) {
        console.error('Error searching location:', error);
      }
    }
  };

  async function verifyPermissions() {
    if (response?.granted) {
      return true;
    }
    const permissionResponse = await requestPermission();
    return permissionResponse.granted;
  }

  const locateUserHandler = async () => {
    try {
      const hasPermission = await verifyPermissions();
      if (!hasPermission) {
        Alert.alert('You need to grant location permissions to use this app.');
        return;
      }
      const locationResponse = await Location.getCurrentPositionAsync();
      const newLocation = {
        latitude: locationResponse.coords.latitude,
        longitude: locationResponse.coords.longitude
      };
      setLocation(newLocation);
      setSelectedLocation(newLocation);
      updateDB(auth.currentUser.uid, { location: newLocation }, 'users');
    } catch (err) {
      console.log("Location error", err);
      Alert.alert('Error', 'Could not fetch location.');
    }
  };

  function saveLocationHandler() {
    if (!selectedLocation) return;
    updateDB(auth.currentUser.uid, { location: selectedLocation }, 'users');
    navigation.navigate('Tab');
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        {/* <SearchBar
          placeholder="Search location"
          onChangeText={updateSearch}
          value={search}
          onSubmitEditing={() => updateSearch(search)}
          containerStyle={{
            height: 60,
            width: '100%',
            backgroundColor: 'white',
            borderBottomColor: 'transparent',
            borderTopColor: 'transparent',
          }}
          inputContainerStyle={{
            backgroundColor: 'lightgrey',
            borderRadius: 20,
            height: 40,
          }}
          platform='default'
          round={true}
        /> */}
        <GooglePlacesAutocomplete
    placeholder='Search location'
    fetchDetails={true}  // Add this line
    onPress={(data, details = null) => {
      if (details) {  // Add this check
        const location = {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
        };
        setSelectedLocation(location);
        mapRef.current?.animateToRegion({
          ...location,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    }}
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
        backgroundColor: 'lightgrey',
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
      
      {/* <View style={styles.confirmButton}>
        <Button 
          disabled={!selectedLocation} 
          title="Confirm" 
          onPress={saveLocationHandler} 
        />
      </View> */}
      <View style={styles.confirmButton}>
  <CusPressable
    componentStyle={{
      width: '100%',
      alignSelf: 'center',
    }}
    childrenStyle={{
      padding: 10,
      backgroundColor: selectedLocation ? 'purple' : 'grey',
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
  )
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
