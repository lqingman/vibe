import 'react-native-get-random-values';  
import { View, Alert, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import LocationManager from '../Components/LocationManager';
import CusPressable from '../Components/CusPressable';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAllPosts, getUserData, updateDB } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Callout, Marker } from 'react-native-maps';
import Color from '../Styles/Color';
import ActivityCard from '../Components/ActivityCard';
import Style from '../Styles/Style';

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

  //activities state
  const [activities, setActivities] = useState([]);

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

  //useEffect to fetch activities
  useEffect(() => {
    async function loadActivities() {
      try {
        const posts = await getAllPosts();
        console.log("Activities:", posts);
        setActivities(posts);
      } catch (error) {
        console.error("Error loading activities:", error);
      }
    }
    loadActivities();
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
    updateDB(auth.currentUser.uid, { location: selectedLocation }, 'users');
    if (route.params?.onReturn) {
      route.params.onReturn(selectedLocation);
    }
    navigation.goBack();
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: Color.white,
    }}>
      <View style={Style.searchBar}>
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
              borderColor: Color.lightgrey,
              marginHorizontal: 10,
              marginTop: 10,
            },
            listView: {
              position: 'absolute',
              top: 45,
              left: 10,
              right: 10,
              backgroundColor: Color.white,
              borderRadius: 5,
              zIndex: 1000,
            },
            row: {
              backgroundColor: Color.white,
            }
          }}
          enablePoweredByContainer={false}
          debounce={300} // Add debounce to reduce API calls
          minLength={2} // Only start searching after 2 characters
        />
      </View>
      
      <View style={{height: '90%', width: '100%'}}>
      <LocationManager 
          ref={mapRef}
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
        >
          {/* Add markers for each activity */}
          {activities.map((activity) => (
            activity?.coordinates && (
              <Marker
                key={activity.id}
                coordinate={{
                  latitude: activity.coordinates.latitude,
                  longitude: activity.coordinates.longitude
                }}
                pinColor={Color.cornflowerblue}
              >
                <Callout
                  tooltip
                  onPress={() => navigation.navigate('Details', { activity: activity })}
                >
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Details', { activity: activity })}
                    activeOpacity={0.9}
                  >
                    <View style={Style.calloutContainer}>
                      <ActivityCard 
                        data={activity}
                        cardStyle={Style.calloutCard}
                        favButtonStyle={{
                          position: 'absolute',
                          top: 130,
                          right: 10,
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </Callout>
              </Marker>
            )
          ))}
        </LocationManager>
      </View>

      <CusPressable
        componentStyle={Style.locateButton}
        childrenStyle={Style.locateIcon}
        pressedHandler={locateUserHandler}
      >
        <FontAwesome6 name="location-crosshairs" size={32} color="black" />
      </CusPressable>
      
      <View style={Style.confirmButton}>
        <CusPressable
          componentStyle={{
            width: '100%',
            alignSelf: 'center',
          }}
          childrenStyle={{
            padding: 10,
            backgroundColor: selectedLocation ? Color.navigatorBg : Color.gray,
            borderRadius: 10,
            alignItems: 'center',
            
          }}
          pressedHandler={saveLocationHandler}
          disabled={!selectedLocation}
        >
          <Text style={Style.confirmButtonText}>Confirm</Text>
        </CusPressable>
      </View>
    </View>
  );
}