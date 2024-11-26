import React, { useEffect, useState } from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import CusPressable from './CusPressable';
import FavoriteButton from './FavoriteButton';
import { auth } from '../Firebase/firebaseSetup';
import { deleteArrayField, getUserData, updateArrayField } from '../Firebase/firestoreHelper';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';


export default function ExploreCard ({data, cardStyle, contentStyle, onPress}) {
  // Only render if data exists
  if (!data) return null; 
  //console.log('data', data);
  // State for favorited  
  const [favorited, setFavorited] = useState(false);
  // State for image url
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    // Check if the activity is already favorited when the component mounts
    async function checkFavorited() {
      try {
        const user = await getUserData(auth.currentUser.uid);
        if (user && user.favorites && user.favorites.includes(data.id)) {
          setFavorited(true);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    }
    checkFavorited();
  }, [data.id]);
  
  //fetch image from firebase storage
  useEffect(() => {
    const fetchImage = async () => {
      // Get download URL for the post image
      if (data?.image) {
        const storage = getStorage();
        const postImageRef = ref(storage, data.image);
        try {
          const url = await getDownloadURL(postImageRef);
          setImageUrl(url);
        } catch (error) {
          console.error("Error getting post image URL:", error);
        }
      }
    };
    fetchImage();
  }, [data.image]);

  // Handle the favorite button press
  const handleFavoritePress = async () => {
    try {
      if (favorited) {
        await deleteArrayField('users', auth.currentUser.uid, 'favorites', data.id);
      } else {
        await updateArrayField('users', auth.currentUser.uid, 'favorites', data.id);
      }
      setFavorited(!favorited);
    } catch (error) {
      console.log("Error updating favorites:", error);
    }
  };

  return (
    <CusPressable
      pressedHandler={onPress}
      componentStyle={[styles.card, cardStyle]}
      childrenStyle={styles.inner}>
        <View
        style={[styles.media]}>
          <Image style={styles.image} source={{uri: imageUrl}} />
        </View>
        <Text style={styles.titleText}>{data.title}</Text>
        <View style={[styles.content, contentStyle]}>
          <Text style={styles.text}>{data.date}</Text>
          <Text style={styles.text}>{data.city}</Text>
        </View>
        <FavoriteButton
          componentStyle={{
            position: 'absolute',
            top: cardStyle?.height ? cardStyle.height - 50 : 250,
            right: 5,
          }}
          childrenStyle={{
            paddingRight: 10,
          }}
          onPress={handleFavoritePress}
          favorited={favorited}
        />
    </CusPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 10,
  },
  inner: {
    width: '100%',
    height: '100%',
  },
  media: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    height: '90%',
    width: '100%',
    resizeMode: 'cover',
    marginBottom: 10,
  },
  content: {
    flexDirection: 'column',
  },
  text: {
    paddingLeft: 15,
    fontSize: 16,
    //fontWeight: 'bold',
    paddingBottom: 5,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingLeft: 15,
    //paddingTop: 5,
    paddingBottom: 5,
    color: 'purple',
  },
});