import { View, Text, Button, Alert, Image, StyleSheet, TouchableOpacity } from 'react-native'
import React, {useState, useEffect} from 'react'
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from '@expo/vector-icons';


const ImageManager = ({receiveImageUri, initialImage}) => {
    const [response, requestPermission] = ImagePicker.useCameraPermissions();
    const [image, setImage] = useState(initialImage || null);
    // console.log(response);
    useEffect(() => {
      if (initialImage) {
          setImage(initialImage);
          receiveImageUri(initialImage);
      }
  }, [initialImage]);
    async function verifyPermissions() {
        try {
            // check if user has given permission
            if (response.granted) {
                return true;
            }
            // if so return true
            // else ask for permission and return what user has selected
            
            const permissionResponse = await requestPermission();
            return permissionResponse.granted;
        }
        catch (err) {
            console.log(err);
        }
    
    }
    const takeImageHandler = async () => {
        try {
            // only launch the camera if the user has granted permission
            const hasPermission = await verifyPermissions();
            console.log(hasPermission);
            if (!hasPermission) {
                Alert.alert('You need to grant camera permission to use this feature');
                return;
            }
            const result = await ImagePicker.launchCameraAsync(
            {
              
              allowsEditing: true,
            }
          );
            console.log(result);
            if (!result.canceled) {
                setImage(result.assets[0].uri);
                receiveImageUri(result.assets[0].uri);
            }
            console.log(image);
            // send uri back to the parent component
            

        }
        catch (err) {
            console.log(err);
        }
      };
      const pickImageHandler = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                // quality: 1,
            });
            if (!result.canceled) {
                setImage(result.assets[0].uri);
                receiveImageUri(result.assets[0].uri);
                console.log(image);
            }
        } catch (err) {
            console.log(err);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

  return (
    <View style={styles.container}>
            <TouchableOpacity 
                style={styles.imageContainer}
                onPress={() => {
                    Alert.alert(
                        "Select Image",
                        "Choose an option",
                        [
                            {
                                text: "Camera",
                                onPress: takeImageHandler
                            },
                            {
                                text: "Gallery",
                                onPress: pickImageHandler
                            },
                            {
                                text: "Cancel",
                                style: "cancel"
                            }
                        ]
                    );
                }}
            >
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                    
                ) : (
                    <View style={styles.placeholder}>
                        <FontAwesome5 name="camera" size={24} color="gray" />
                        {/* <Text style={styles.placeholderText}>Add Photo</Text> */}
                    </View>
                )}
            </TouchableOpacity>
        </View>
  )
}

export default ImageManager

const styles = StyleSheet.create({

  container: {
    // alignItems: 'center',
    marginBottom: 20,
},
imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
},
image: {
    width: '100%',
    height: '100%',
},
placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e1e1e1',
},
placeholderText: {
    marginTop: 10,
    color: 'gray',
    fontSize: 16,
}
  })