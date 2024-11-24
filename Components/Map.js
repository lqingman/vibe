import { Linking, Platform, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

// Custom map component
export default function Map({ latitude, longitude }) {
  // Function to open maps
  const openMaps = () => {
    if (Platform.OS === 'ios') {
      Alert.alert(
        "Open Maps",
        "Choose your preferred maps application",
        [
          {
            text: "Apple Maps",
            onPress: () => {
              const url = `maps:0,0?q=Event+Location@${latitude},${longitude}`;
              Linking.openURL(url).catch((err) => console.error('An error occurred', err));
            }
          },
          {
            text: "Google Maps",
            onPress: () => {
              const url = `comgooglemaps://?q=${latitude},${longitude}&center=${latitude},${longitude}`;
              Linking.canOpenURL(url)
                .then((supported) => {
                  if (supported) {
                    Linking.openURL(url);
                  } else {
                    // If Google Maps is not installed, open in browser
                    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
                  }
                })
                .catch((err) => console.error('An error occurred', err));
            }
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    } else {
      // Android - open Google Maps directly
      const url = `geo:0,0?q=${latitude},${longitude}`;
      Linking.openURL(url).catch((err) => console.error('An error occurred', err));
    }
  };

  return (
    <MapView
      style={styles.mapStyle}
      initialRegion={{
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      onPress={openMaps}
    >
      <Marker
        coordinate={{
          latitude: latitude,
          longitude: longitude,
        }}
      />
    </MapView>
  );
}

const styles = {
  mapStyle: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',    
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  }
};
