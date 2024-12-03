import { View, Text, Alert, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useCallback } from 'react';
import { SearchBar } from 'react-native-elements';
import { getAllPosts, getUserData, searchByTitleKeyword, updateDB } from '../Firebase/firestoreHelper';
import { collection, onSnapshot } from 'firebase/firestore';
import { database } from '../Firebase/firebaseSetup';
import { auth } from '../Firebase/firebaseSetup';
import FilterMenu from '../Components/FilterMenu';
import * as Location from 'expo-location';
import ExploreList from '../Components/ExploreList';
import LottieView from "lottie-react-native";
import Color from '../Styles/Color';

// Explore screen to search for activities
export default function Explore({ navigation }) {
  // State for search
  const [search, setSearch] = useState('');
  // State for results
  const [results, setResults] = useState([]);
  // State for loading
  const [loading, setLoading] = useState(true); 
  // State for filter
  const [filter, setFilter] = useState('All');
  // State for user location
  const [userLocation, setUserLocation] = useState(null); 
  // State for filtered results
  const [filteredResults, setFilteredResults] = useState([]);
  const isFocused = useIsFocused();

  // Update the search state when the user types in the search bar
  const updateSearch = (search) => {
    setSearch(search);
  };

  // function to verify location permissions
  async function verifyPermissions() {
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Location permission is needed to show nearby activities.',
        [
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings(),
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return false;
    }
    return true;
  }

  // useEffect to get user location
  useEffect(() => {
    if (isFocused) {
      (async () => {
        try {
          const hasPermission = await verifyPermissions();
          if (hasPermission) {
            const locationResponse = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            
            const newLocation = {
              latitude: locationResponse.coords.latitude,
              longitude: locationResponse.coords.longitude
            };
            
            setUserLocation(newLocation);

            //get user location from database
            const userData = await getUserData(auth.currentUser.uid);
            const userLocation = userData.location;
            setUserLocation(userLocation);
            
            // Update user's location in Firestore
            if (auth.currentUser && userLocation) {
              await updateDB(auth.currentUser.uid, { location: userLocation }, 'users');
            }
          }
        } catch (err) {
          console.log("Location error", err);
        }
      })();
    }
  }, [isFocused]);

  // Effect to fetch results when the search changes
  useFocusEffect(
    useCallback(() => {
      let unsubscribe;
      
      const setupSnapshotListener = () => {
        if (auth.currentUser) {
          // If there's a search term, use the search query
          if (search.trim() !== '') {
            const searchTerm = search.toLowerCase();
            searchByTitleKeyword(searchTerm)
              .then(searchResults => {
                setResults(searchResults);
                setFilteredResults(searchResults);
                setLoading(false);
              })
              .catch(error => {
                console.error("Error searching:", error);
                setLoading(false);
              });
          } else {
            // Otherwise, listen to all posts
            unsubscribe = onSnapshot(
              collection(database, 'posts'),
              (querySnapshot) => {
                const allPosts = [];
                querySnapshot.forEach((docSnapshot) => {
                  allPosts.push({
                    id: docSnapshot.id,
                    ...docSnapshot.data(),
                  });
                });
                setResults(allPosts);
                setFilteredResults(allPosts);
                setLoading(false);
              },
              (err) => {
                console.error("Explore results:", err);
                setLoading(false);
              }
            );
          }
        } else {
          setResults([]);
          setFilteredResults([]);
          setLoading(false);
        }
      };

      setupSnapshotListener();

      // Cleanup function
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }, [search]) 
  );

  // Function to fetch results
  async function fetchResults(keyword) {
    try {
      setLoading(true); // Start loading
      let searchResults = [];
      if (keyword.trim() === '') {
        searchResults = await getAllPosts();
      } else {
        searchResults = await searchByTitleKeyword(keyword);
      }
      setResults(searchResults);
      setFilteredResults(searchResults);
    } catch (error) {
      console.error("Error retrieving results:", error);
    } finally {
      setLoading(false);
    }
  }

  // Function to calculate distance using the Haversine formula
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

// Helper function to convert degrees to radians
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Function to sort search results by distance
function sortResultsByDistance(results, userLat, userLon) {
  return results
    .map(result => ({
      ...result,
      distance: haversine(userLat, userLon, result.coordinates.latitude, result.coordinates.longitude),
    }))
    .sort((a, b) => a.distance - b.distance); // Sort by distance (ascending)
}

// Function to sort results by date
function sortResultsByDate(results) {
  return [...results].sort((a, b) => {
    // Convert time from "2:37:00 PM" format to 24-hour format
    const convertTo24Hour = (timeStr) => {
      const [time, meridiem] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      
      if (meridiem === 'PM' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    };

    // Create date objects with both date and time
    const dateA = new Date(`${a.date}T${convertTo24Hour(a.time)}`);
    const dateB = new Date(`${b.date}T${convertTo24Hour(b.time)}`);
    
    // Sort in descending order (latest first)
    return dateB - dateA;
  });
}

// Function to handle the filter button press
function handleFilterSelection(filter) {
  setFilter(filter);
  let newResult = [];
  if (filter === 'Nearest' && userLocation && userLocation.latitude && userLocation.longitude) {
    newResult = sortResultsByDistance(results, userLocation.latitude, userLocation.longitude);
    //console.log("Nearest results:", newResult);
    setFilteredResults(newResult);
  }
  else if (filter === 'Latest'){
    newResult = sortResultsByDate(results);
    //console.log("Latest results:", newResult);
    setFilteredResults(newResult);
  }
  else {
    setFilteredResults(results);
  }
}

  return (
    <View style={{ flex: 1, backgroundColor: Color.white }}>
      <View style={{ height: 60, flexDirection: 'row', alignItems: 'center' }}>
        {/* Search bar */}
        <SearchBar
          placeholder="Search"
          onChangeText={updateSearch}
          value={search}
          containerStyle={{
            height: 60,
            width: '90%',
            backgroundColor: 'white',
            borderBottomColor: 'transparent',
            borderTopColor: 'transparent',
          }}
          inputContainerStyle={{
            backgroundColor: '#f0f0f0',
            borderRadius: 20,
            height: 40,
          }}
          platform='default'
          round={true}
          onSubmitEditing={() => fetchResults(search.toLowerCase())}
        />
        <FilterMenu handleFilterSelection={handleFilterSelection}/>
      </View>
      {/* A list of activity cards as search results */}
      {loading ? (
      <Text style={Style.noResultsText}>Loading...</Text>
    ) : results.length === 0 ? (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={Style.noResultsText}>No results found.</Text>
        <LottieView 
            source={require('../assets/Animation - no results.json')} 
            style={{
              width: 200,
              height: 200,
            }}
            autoPlay 
            loop
          />
      </View>
    ) : (
      <ExploreList list={filteredResults} />
    )}
    </View>
  )
}