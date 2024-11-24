import { View, StyleSheet } from 'react-native'
import React, { forwardRef } from 'react'
import MapView, { Marker } from "react-native-maps";

// Custom location manager component
const LocationManager = forwardRef(({ selectedLocation, onLocationSelect }, ref) => {
  return (
    <View style={styles.container}>
      <MapView
        ref={ref}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        style={styles.map}
        onPress={(e) => {
          onLocationSelect({
            latitude: e.nativeEvent.coordinate.latitude,
            longitude: e.nativeEvent.coordinate.longitude,
          });
        }}
      >
        {selectedLocation && (
          <Marker coordinate={selectedLocation} />
        )}
      </MapView>
    </View>
  )
});

export default LocationManager;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
})