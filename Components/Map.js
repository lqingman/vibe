import { Button } from 'react-native'
import React, { useState } from 'react'
import MapView, { Marker } from "react-native-maps";

export default function Map({navigation}) {
  const [selectedLocation, setSelectedLocation] = useState();

  return (
    <>
    {console.log("map")}
    <MapView
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      style={{ flex: 1 }}
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
    </>
  )
}