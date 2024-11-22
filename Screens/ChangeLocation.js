import { View, StyleSheet, Alert } from 'react-native'
import React, { useState } from 'react'
import { Button, SearchBar } from 'react-native-elements';
import LocationManager from '../Components/LocationManager';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getUserData, updateDB } from '../Firebase/firestoreHelper';
import { auth } from '../Firebase/firebaseSetup';
import CusPressable from '../Components/CusPressable';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';



//change location screen
export default function ChangeLocation() {
  const [search, setSearch] = useState('');  
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState();
  //console.log(mapsApiKey)
  const route = useRoute();
  const navigation = useNavigation();
  const [response, requestPermission] = Location.useForegroundPermissions();


  const updateSearch = (search) => {
    setSearch(search);
    //console.log(search)
  };

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
      // console.log(locationResponse);
      // console.log(hasPermission);
      setLocation({latitude: locationResponse.coords.latitude, longitude: locationResponse.coords.longitude});
      // console.log(location);
      updateDB(auth.currentUser.uid, {location}, 'users');
      navigation.navigate('Tab');
    }
    catch (err) {
      console.log("Location error", err);
    }
  };

  function saveLocationHandler() {
    updateDB(auth.currentUser.uid, {location: selectedLocation}, 'users');
    navigation.navigate('Tab');
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <SearchBar
          placeholder="Enter a location"
          onChangeText={updateSearch}
          value={search}
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
        />
      </View>
      <View style={styles.mapView}>
        <LocationManager />
      </View>

      <CusPressable
        componentStyle={styles.locateButton}
        childrenStyle={styles.locateIcon}
        pressedHandler={locateUserHandler}
      >
        <FontAwesome6 name="location-crosshairs" size={32} color="black" />
      </CusPressable>
      <View style={styles.confirmButton}>
        <Button disabled={!location} title="Confirm" onPress={saveLocationHandler} />
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
    // flex: 1,
    flexDirection: 'row',
    //justifyContent: 'center',
    //alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: 'black',
  },
  mapView: {
    height: '85%',
    width: '100%',
  },
  locateButton: {
    position: 'absolute',
    bottom: 70,
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
    height: '10%',
    backgroundColor: 'white',
  }
})
