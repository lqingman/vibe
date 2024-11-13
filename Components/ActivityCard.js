import React, { useEffect } from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import CusPressable from './CusPressable';
import FavoriteButton from './FavoriteButton';
import { auth } from '../Firebase/firebaseSetup';
import { deleteArrayField, getUserData, updateArrayField } from '../Firebase/firestoreHelper';


export default function ActivityCard ({data, cardStyle, imageStyle, contentStyle, onPress}) {
  if (!data) return null; // Only render if data exists
  const [favorited, setFavorited] = React.useState(false);

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
          <Image style={styles.image} source={{uri: data.image}} />
        </View>
        <Text style={styles.titleText}>{data.title}</Text>
        <View style={[styles.content, contentStyle]}>
          <Text style={styles.text}>{data.date}</Text>
          <Text style={styles.text}>{data.location}</Text>
        </View>
        <FavoriteButton
          componentStyle={{
            position: 'absolute',
            top: 260,
            right: 10,
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
    marginLeft: 20,
    width: "90%",
    height: 300,
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
    flexDirection: 'row',
    height: '10%',
  },
  text: {
    paddingLeft: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingLeft: 15,
    paddingTop: 5,
    paddingBottom: 5,
    color: 'purple',
  },
});