import { View } from 'react-native'
import React, { forwardRef, useEffect, useState, useImperativeHandle } from 'react'
import MapView, { Marker } from "react-native-maps";
import { getUserData } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';

const LocationManager = forwardRef(({ selectedLocation, onLocationSelect, children }, ref) => {
  // State for user location
  const [userLocation, setUserLocation] = useState(null);
  // State for map reference
  const [mapRef, setMapRef] = useState(null);

  // Default region
  const defaultRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Expose the animateToRegion method to parent
  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration) => {
      mapRef?.animateToRegion(region, duration);
    }
  }));

  // Fetch user location
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const userData = await getUserData(auth.currentUser.uid);
        if (userData?.location) {
          setUserLocation(userData.location);
          // Animate to user location when it's available
          mapRef?.animateToRegion({
            latitude: userData.location.latitude,
            longitude: userData.location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 1000);
        }
      } catch (error) {
        console.error("Error fetching user location:", error);
      }
    };
    getUserLocation();
  }, [mapRef]); 

  // Update map when selectedLocation changes
  useEffect(() => {
    if (selectedLocation && mapRef) {
      // Check if selectedLocation has valid coordinates
      if (selectedLocation.latitude !== undefined && selectedLocation.longitude !== undefined) {
        mapRef.animateToRegion({
          ...selectedLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      }
    }
  }, [selectedLocation, mapRef]);

  return (
    <View style={{flex: 1, alignItems: 'center'}}>
      <MapView
        ref={setMapRef}
        initialRegion={defaultRegion}
        style={{width: '100%', height: '100%'}}
        onPress={(e) => {
          if (e.nativeEvent.action !== 'marker-press' && e.nativeEvent.action !== 'callout-press') {
            onLocationSelect({
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude,
            });
          }
        }}
      >
        {selectedLocation && selectedLocation.latitude && selectedLocation.longitude && (
          <Marker coordinate={selectedLocation} />
        )}
        {children}
      </MapView>
    </View>
  )
});

export default LocationManager;