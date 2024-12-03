import React, { useEffect, useState } from 'react';
import {Image, Text, View} from 'react-native';
import CusPressable from './CusPressable';
import FavoriteButton from './FavoriteButton';
import { auth } from '../Firebase/firebaseSetup';
import { deleteArrayField, getUserData, updateArrayField } from '../Firebase/firestoreHelper';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import Style from '../Styles/Style';

// Activity card component
export default function ActivityCard ({data, cardStyle, contentStyle, onPress, favButtonStyle}) {
  // Only render if data exists
  if (!data) return null; 

  // State for favorited  
  const [favorited, setFavorited] = useState(false);
  // State for image url
  const [imageUrl, setImageUrl] = useState(null);

  // Check if the activity is already favorited when the component mounts
  useEffect(() => {
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
      if (data?.image && data.image.length > 0) {
        const storage = getStorage();
        const postImageRef = ref(storage, data.image[0]);
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
      componentStyle={[Style.activityCard, cardStyle]}
      childrenStyle={Style.activityCardInner}>
        <View
        style={Style.activityCardMedia}>
          <Image style={Style.activityCardImage} source={{uri: imageUrl}} />
        </View>
        <Text style={Style.activityCardTitleText}>{data.title}</Text>
        <View style={[Style.activityCardContent, contentStyle]}>
          <Text style={Style.activityCardText}>{data.date}</Text>
          <Text style={Style.activityCardText}>{data.city}</Text>
        </View>
        <FavoriteButton
          componentStyle={[{
            position: 'absolute',
            top: 260,
            right: 10,
          }, favButtonStyle]}
          childrenStyle={{
            paddingRight: 10,
          }}
          onPress={handleFavoritePress}
          favorited={favorited}
        />
    </CusPressable>
  );
};
