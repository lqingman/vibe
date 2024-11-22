import { View, StyleSheet, FlatList, Pressable, Modal, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { SearchBar } from 'react-native-elements';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import CusPressable from '../Components/CusPressable';
import ActivityCard from '../Components/ActivityCard';
import { fetchAllPosts, getAllDocuments, getAllPosts, getUserData, searchByTitleKeyword } from '../Firebase/firestoreHelper';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { database } from '../Firebase/firebaseSetup';
import { auth } from '../Firebase/firebaseSetup';
import { onAuthStateChanged } from 'firebase/auth';
import FilterMenu from '../Components/FilterMenu';


// Explore screen to search for activities
export default function Explore({ navigation }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [filter, setFilter] = useState('All');
  const [userLocation, setUserLocation] = useState(null); 
  const [filteredResults, setFilteredResults] = useState([]);

  // Update the search state when the user types in the search bar
  const updateSearch = (search) => {
    setSearch(search);
  };

  useEffect(() => {
    // Define an async function to fetch user data
    const fetchUserData = async () => {
      try {
        // Fetch user data
        const userData = await getUserData(auth.currentUser.uid);
        
        // Check if userData and location exist
        if (userData && userData.location) {
          const { latitude, longitude } = userData.location;
          setUserLocation({ latitude, longitude }); // Update state with location
        } else {
          console.log('User data or location not found.');
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } 
    };

    fetchUserData(); // Call the fetch function on component mount
  }, []);

  useEffect(() => {
    let unsubscribe;
  
    const authListener = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, set up the snapshot listener
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
            setLoading(false);
          },
          (err) => console.error("Explore results:", err)
        );
      } else {
        // User is signed out, clear results
        setResults([]);
        setLoading(false);
        //console.log("User signed out, listener removed.");
      }
    });

    //Clean up both listeners on unmount
    return () => {
      if (unsubscribe) unsubscribe();
      if (authListener) authListener();
    };
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      if (search.trim() !== '') {
        fetchResults(search.toLowerCase());
      } else {
        fetchResults(''); // Load all posts
      }
    }, [search]) // Dependency array ensures it re-fetches if `search` changes
  );

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
    } catch (error) {
      console.error("Error retrieving results:", error);
    } finally {
      setLoading(false); // Stop loading
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
async function sortResultsByDistance(results, userLat, userLon) {
  return results
    .map(result => ({
      ...result,
      distance: haversine(userLat, userLon, result.latitude, result.longitude),
    }))
    .sort((a, b) => a.distance - b.distance); // Sort by distance (ascending)
}

function sortResultsByDate(results) {
  return results.sort((a, b) => {
    // Combine the date and time fields
    const dateTimeA = new Date(`${a.date} ${a.time}`);
    const dateTimeB = new Date(`${b.date} ${b.time}`);

    // Compare the datetime objects
    return dateTimeA - dateTimeB; // Ascending order
    // For descending order, use: return dateTimeB - dateTimeA;
  });
}

// Handle the filter button press
function handleFilterSelection(filter) {
  setFilter(filter);
  let newResult = [];
  if (filter === 'Nearest') {
    newResult = sortResultsByDistance(results, userLocation.latitude, userLocation.longitude);
    setFilteredResults(newResult);
  }
  else if (filter === 'Date'){
    newResult = sortResultsByDate(results);
    setFilteredResults(newResult);
  }
  else {
    setFilteredResults(results);
  }
}

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
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
            backgroundColor: 'lightgrey',
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
      <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>
    ) : results.length === 0 ? (
      <Text style={{ textAlign: 'center', marginTop: 20 }}>No results found.</Text>
    ) : (
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityCard
            data={item}
            onPress={() => navigation.navigate('Details', { activity: item })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    height: 60,
    flexDirection: 'row',
    //justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: 'black',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOption: {
    fontSize: 18,
    paddingVertical: 10,
    color: 'purple',
  },
  closeButton: {
    marginTop: 20,
  },
  closeButtonText: {
    color: 'red',
    fontSize: 16,
  },
})