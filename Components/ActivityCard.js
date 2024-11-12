import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import CusPressable from './CusPressable';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FavoriteButton from './FavoriteButton';
import { app, auth, database } from '../Firebase/firebaseSetup';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { getUserData, updateArrayField } from '../Firebase/firestoreHelper';


export default function ActivityCard ({data, cardStyle, imageStyle, contentStyle, onPress}) {
  if (!data) return null; // Only render if data exists
  let favorited = false;

  function checkFavorited() {
    let favs = [];
    getUserData(auth.currentUser.uid)
    .then(user => {
        if (user) {
            favs = user.favorites;  // Assuming "favs" is the name of the array field
            //console.log("User Data:", user);
            //console.log("Favorited:", favs);
        } else {
            console.log("User data not found");
        }
    })
    .catch(error => {
        console.log("Error fetching user data:", error);
    });

    if (favs.includes(data.id)) {
      favorited = true;
    }
    favorited = false;
  }
  //console.log(data)
  return (
    <CusPressable
      pressedHandler={onPress}
      componentStyle={[styles.card, cardStyle]}
      childrenStyle={styles.inner}>
        <View
        style={[styles.media]}>
          <Image style={styles.image} source={{uri: data.image}} />
        </View>
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
          onPress={() => updateArrayField(auth.currentUser.uid, 'favorites', data.id)}
          favorited={checkFavorited()}
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
    height: '15%',
  },
  text: {
    paddingLeft: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
});