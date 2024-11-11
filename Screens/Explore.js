import { View, StyleSheet } from 'react-native'
import React from 'react'
import { SearchBar } from 'react-native-elements';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import CusPressable from '../Components/CusPressable';
import ActivityCard from '../Components/ActivityCard';
import { auth, database } from '../Firebase/firebaseSetup';
import { writeToDB } from '../Firebase/firestoreHelper';
import { ACTIVITIES } from '../data';



export default function Explore({ navigation }) {
  //const navigation = useNavigation();

  //fakedata
  // const data = {
  //   image: 'https://www.kentchiromed.com/wp-content/uploads/2024/02/Top-Basketball-Courts-Ottawa-Summer.webp',
  //   date: '2021-08-31',
  //   location: 'Toronto',
  // }
//   async function writeAllActivities() {
//     for (const a of ACTIVITIES) {
//         await writeToDB(a, 'posts'); 
//     }
//   }

// writeAllActivities().catch(error => {
//     console.error("Error writing activities:", error);
// });

  //search bar
  const [search, setSearch] = React.useState('');

  const updateSearch = (search) => {
    setSearch(search);
  };

  //const result = 

  return (
    <View style={{flex:1}}>
      <View style={styles.container}>
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
        
        <CusPressable
          pressedHandler={() => console.log('Pressed')}
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

      <ActivityCard
        data={data}
        onPress={() => { console.log('pressed'); navigation.navigate('Details')}}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    flexDirection: 'row',
    //justifyContent: 'center',
    //alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: 'black',
  },
})