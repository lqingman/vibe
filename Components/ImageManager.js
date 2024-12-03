import { View, Alert, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React, {useState, useEffect} from 'react'
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5} from '@expo/vector-icons';
import {fetchImageUrlFromDB} from '../Firebase/firestoreHelper';
import Feather from '@expo/vector-icons/Feather';

// Custom image manager component
const ImageManager = ({receiveImageUris, initialImages = [], imageStyle, singleImageMode = false}) => {
    // State for image picker permissions
    const [response, requestPermission] = ImagePicker.useCameraPermissions();
    // State for image
    const [images, setImages] = useState([]);
    const [displayUrls, setDisplayUrls] = useState([]);

    //useEffect to handle initialImage
    useEffect(() => {
        async function fetchImageUrls() {
            if (initialImages && initialImages.length > 0) {
                // Set the images state with initial images
                setImages(initialImages); 
                // Fetch the image urls from the database
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
            // ask for permission
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
            //console.log(result);
            // If the user did not cancel, set the image and send the uri back to the parent component
            if (!result.canceled) {
                const newImage = result.assets[0].uri;
                setImages((prevImages) => [...prevImages, newImage]);
                receiveImageUris([...images, newImage]);
            }
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
                // allowsEditing: true,
                aspect: [4, 3],
                allowsMultipleSelection: !singleImageMode, 
                // quality: 1,
            });
            if (!result.canceled) {
                const newImages = result.assets.map(asset => asset.uri);
                setImages((prevImages) => [...prevImages, ...newImages]);
                receiveImageUris([...images, ...newImages]);
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
            {singleImageMode ? (
                <View>
                    {images.map((image, index) => {
                        const uri = image.startsWith('https://') ? image :
                            image.startsWith('images/') ? displayUrls[index] :
                                image;
                        if (!uri) return null; // Skip rendering if uri is empty
                        return (
                            <View key={index} style={styles.imageWrapper}>
                                <Image
                                    source={{ uri }}
                                    style={[styles.image, imageStyle]}
                                />
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => deleteImageHandler(index)}
                                >
                                    <Feather name="x" size={18} color="gray" />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                    {images.length === 0 && (
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
                            <View style={[styles.placeholder, imageStyle]}>
                                <FontAwesome5 name="camera" size={24} color="gray" />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <ScrollView horizontal>
                    {images.map((image, index) => {
                        const uri = image.startsWith('https://') ? image :
                            image.startsWith('images/') ? displayUrls[index] :
                                image;
                        if (!uri) return null; // Skip rendering if uri is empty
                        return (
                            <View key={index} style={styles.imageWrapper}>
                                <Image
                                    source={{ uri }}
                                    style={[styles.image, imageStyle]}
                                />
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => deleteImageHandler(index)}
                                >
                                    <Feather name="x" size={18} color="gray" />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
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
            )}
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
        backgroundColor: '#f0f0f0',
    },
  })