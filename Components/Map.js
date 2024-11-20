import { Button, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import MapView, { Marker } from "react-native-maps";

export default function Map({navigation}) {
  const [selectedLocation, setSelectedLocation] = useState();

  return (
    <View style={styles.container}>
    <MapView
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      style={styles.map}
      onPress={(e) => {
        //console.log(e.nativeEvent)}
        setSelectedLocation({
          latitude: e.nativeEvent.coordinate.latitude,
          longitude: e.nativeEvent.coordinate.longitude,
        });
        } 
      }
    >
      {selectedLocation && (
        <Marker coordinate={selectedLocation} />
      )}
    </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '90%',
    height: '80%',
  },
})