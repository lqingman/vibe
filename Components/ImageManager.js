import { View, Alert, Image, StyleSheet, TouchableOpacity, ScrollView, Text } from 'react-native'
import React, {useState, useEffect} from 'react'
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5, FontAwesome} from '@expo/vector-icons';
import {fetchImageUrlFromDB} from '../Firebase/firestoreHelper';
import Feather from '@expo/vector-icons/Feather';

// Custom image manager component
const ImageManager = ({receiveImageUris, initialImages = [], imageStyle}) => {
    // State for image picker permissions
    const [response, requestPermission] = ImagePicker.useCameraPermissions();
    // State for image
    const [images, setImages] = useState(initialImages);
    const [displayUrls, setDisplayUrls] = useState([]);

    // Add useEffect to handle initialImage
    useEffect(() => {
        async function fetchImageUrls() {
            const urls = await Promise.all(
                initialImages.map(async (image) => {
                    if (image.startsWith('images/')) {
                        return await fetchImageUrlFromDB(image);
                    }
                    return image;
                })
            );
            setDisplayUrls(urls);
        }
        fetchImageUrls();
    }, [initialImages]);
    
    // Function to verify permissions
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

    // Function to take image
    const takeImageHandler = async () => {
        try {
            // only launch the camera if the user has granted permission
            const hasPermission = await verifyPermissions();
            console.log(hasPermission);
            if (!hasPermission) {
                Alert.alert('You need to grant camera permission to use this feature');
                return;
            }
            // Launch the camera
            const result = await ImagePicker.launchCameraAsync(
            {
              
              allowsEditing: true,
            }
          );
            console.log(result);
            // If the user did not cancel, set the image and send the uri back to the parent component
            if (!result.canceled) {
                const newImage = result.assets[0].uri;
                setImages((prevImages) => [...prevImages, newImage]);
                receiveImageUris([...images, newImage]);
            }

            // send uri back to the parent component
            

        }
        catch (err) {
            console.log(err);
        }
      };

      // Function to pick image from gallery
      const pickImageHandler = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                // quality: 1,
            });
            if (!result.canceled) {
                const newImage = result.assets[0].uri;
                setImages((prevImages) => [...prevImages, newImage]);
                receiveImageUris([...images, newImage]);
            }
        } catch (err) {
            console.log(err);
            Alert.alert('Error', 'Failed to pick image');
        }
    };
    // Function to delete image
    const deleteImageHandler = (index) => {
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
        receiveImageUris(updatedImages);
    };
  return (
    <View style={styles.container}>
            
                <ScrollView horizontal>
                    {images.map((image, index) => (
                        <View key={index} style={styles.imageWrapper}>
                        <Image
                            source={{ uri: image.startsWith('images/') ? displayUrls[index] : image }}
                            style={styles.image}
                        />
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => deleteImageHandler(index)}
                        >
                            <Feather name="x" size={18} color="gray" />
                        </TouchableOpacity>
                    </View>
                    ))}
                    <TouchableOpacity 
                        style={imageStyle}
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
                    <View style={styles.placeholder}>
                        <FontAwesome5 name="camera" size={24} color="gray" />
                    </View>
                    </TouchableOpacity>
                </ScrollView>

        </View>
  )
}

export default ImageManager

const styles = StyleSheet.create({

    container: {
        marginBottom: 20,
    },
    imageContainer: {
        width: '100%',
        height: 100,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    image: {
        width: 100,
        height: 100,
        marginRight: 10,
        borderRadius: 5,
    },
    deleteButton: {
        position: 'absolute',
        // top: 5,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 3,
        opacity: 0.9,
    },
    placeholder: {
        width: 100,
        height: 100,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e1e1e1',
    },
  })