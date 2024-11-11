import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { SearchBar } from 'react-native-elements';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import CusPressable from '../Components/CusPressable';


export default function Explore() {
  //search bar
  const [search, setSearch] = React.useState('');

  const updateSearch = (search) => {
    setSearch(search);
  };

  return (
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    //justifyContent: 'center',
    //alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: 'black',
  },
})