import React, { useEffect, useState } from 'react';
import {Image, Text, View} from 'react-native';
import CusPressable from './CusPressable';
import FavoriteButton from './FavoriteButton';
import { auth } from '../Firebase/firebaseSetup';
import { deleteArrayField, fetchImageUrlFromDB, getUserData, updateArrayField } from '../Firebase/firestoreHelper';
import { FontAwesome } from '@expo/vector-icons';
import Style from '../Styles/Style';

// Explore card component
export default function ExploreCard ({data, cardStyle, contentStyle, onPress}) {
  // Only render if data exists
  if (!data) return null; 

  // State for favorited  
  const [favorited, setFavorited] = useState(false);
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
      const url = await fetchImageUrlFromDB(data.image[0]);
      setImageUrl(url);
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
      componentStyle={[Style.exploreCard, cardStyle]}
      childrenStyle={Style.exploreCardInner}>
        <View style={[Style.exploreCardMedia]}>
          <Image style={Style.exploreCardImage} source={{uri: imageUrl}} />
        </View>
        <Text style={Style.exploreCardTitle}>{data.title}</Text>
        <View style={[Style.exploreCardContent, contentStyle]}>
          <View style={Style.exploreCardDateView}>
            <FontAwesome name="calendar" size={16} color="gray" />
            <Text style={Style.exploreCardText}>{data.date}</Text>
          </View>
          <View style={Style.exploreCardLocationView}>
            <FontAwesome name="map-marker" size={16} color="gray" />
            <Text style={[Style.exploreCardText, {marginBottom:5}]}>{data.city}</Text>
          </View>
        </View>
        <FavoriteButton
          componentStyle={{
            position: 'absolute',
            top: cardStyle?.height ? cardStyle.height - 70 : 250,
            right: 5,
          }}
          childrenStyle={{
            paddingRight: 0,
          }}
          onPress={handleFavoritePress}
          favorited={favorited}
        />
    </CusPressable>
  );
};