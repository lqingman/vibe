import { View, StyleSheet, FlatList, Pressable, Modal, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SearchBar } from 'react-native-elements';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import CusPressable from '../Components/CusPressable';
import ActivityCard from '../Components/ActivityCard';
import { fetchAllPosts, getAllDocuments, searchByTitleKeyword } from '../Firebase/firestoreHelper';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { database } from '../Firebase/firebaseSetup';
import { auth } from '../Firebase/firebaseSetup';

// Explore screen to search for activities
export default function Explore({ navigation }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);

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

  // Fetch search results when the search state changes
  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    async function fetchResults(keyword) {
      try {
        let searchQuery;

        if (keyword.trim() === '') {
          // Fetch all posts in real-time when search is empty
          searchQuery = collection(database, 'posts');
        } else {
          // Fetch results based on keyword in real-time
          const activitiesRef = collection(database, 'posts');
          searchQuery = query(activitiesRef, where('keywords', 'array-contains', keyword))
        }

        const unsubscribe = onSnapshot(searchQuery, (querySnapshot) => {
          const searchResults = [];
          querySnapshot.forEach((docSnapshot) => {
            searchResults.push({
              id: docSnapshot.id,
              ...docSnapshot.data(),
            });
          });

          setResults(searchResults);
        }, (err) => console.error("Explore results:", err
        ));

        // Clean up the listener when the component unmounts or search changes
        return () => unsubscribe();
      } catch (error) {
        console.error("Error retrieving results:", error);
      }
    }

    fetchResults(search.toLowerCase());

  }, []);

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
        />

        {/* Filter button */}
        <CusPressable
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
        </CusPressable>
      </View>
      {/* A list of activity cards as search results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          <ActivityCard
            data={item}
            onPress={() => { navigation.navigate('Details', { activity: item }) }}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
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
    //alignItems: 'center',
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