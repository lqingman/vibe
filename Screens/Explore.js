import { View, StyleSheet, FlatList, Pressable, Modal, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { SearchBar } from 'react-native-elements';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import CusPressable from '../Components/CusPressable';
import ActivityCard from '../Components/ActivityCard';
import { fetchAllPosts, getAllDocuments, getAllPosts, searchByTitleKeyword } from '../Firebase/firestoreHelper';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { database } from '../Firebase/firebaseSetup';
import { auth } from '../Firebase/firebaseSetup';
import { onAuthStateChanged } from 'firebase/auth';
import DropDown from '../Components/DropDown';


// Explore screen to search for activities
export default function Explore({ navigation }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [loading, setLoading] = useState(true); 


  // Update the search state when the user types in the search bar
  const updateSearch = (search) => {
    setSearch(search);
  };

  // Handle the filter button press
  function handleFilterPress() {
    setModalVisible(true);
  }

  // Handle the filter selection
  function handleFilteSelect(filter) {
    setSelectedFilter(filter);
    setModalVisible(false);
    console.log(`Filter set for ${filter}`);
  }

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

        {/* Filter button */}
        {/* <CusPressable
          pressedHandler={handleFilterPress}
          componentStyle={{
            height: 60,
            width: "10%",
            //borderRadius: 25,
            backgroundColor: 'white',
            //position: 'end',
            //bottom: 20,
            //right: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          pressedStyle={{
            backgroundColor: 'lightgrey',
          }}
          childrenStyle={{
            paddingRight: 10,
          }}
        >
          <FontAwesome5 name="filter" size={22} color="lightgrey" />
        </CusPressable> */}
        <DropDown />
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
      {/* Notification Modal */}
      {modalVisible &&
        <View style={styles.modalContainer}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Choose a filter</Text>
                <Pressable onPress={() => handleFilteSelect('All')}>
                  <Text style={styles.modalOption}>All</Text>
                </Pressable>
                <Pressable onPress={() => handleFilteSelect('Nearest')}>
                  <Text style={styles.modalOption}>Nearest</Text>
                </Pressable>
                <Pressable onPress={() => handleFilteSelect('Latest')}>
                  <Text style={styles.modalOption}>Latest</Text>
                </Pressable>
                <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      }
    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
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