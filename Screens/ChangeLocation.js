import { View, StyleSheet, Image } from 'react-native'
import React, { useState } from 'react'
import { SearchBar } from 'react-native-elements';
import LocationManager from '../Components/LocationManager';

//change location screen
export default function ChangeLocation() {
  const [search, setSearch] = useState('');  

  const updateSearch = (search) => {
    setSearch(search);
    //console.log(search)
  };

  return (
    <View style={{flex:1}}>
      <View style={styles.container}>
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
      <LocationManager />
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
  mapView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
})